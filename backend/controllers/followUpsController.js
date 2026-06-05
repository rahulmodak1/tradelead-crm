const Lead = require("../Models/Lead");
const {
  buildLeadQuery,
  canAccessLead,
} = require("../utils/permissions");
const { addActivity } = require("./teamController");

function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function basePendingQuery(user) {
  return {
    ...buildLeadQuery(user),
    followUpDate: { $ne: null },
    status: { $ne: "Closed" },
  };
}

function queryForType(user, type) {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const base = basePendingQuery(user);

  if (type === "today") {
    return {
      ...base,
      followUpDate: { $gte: todayStart, $lte: todayEnd },
    };
  }

  if (type === "overdue") {
    return {
      ...base,
      followUpDate: { $lt: todayStart },
    };
  }

  if (type === "upcoming") {
    return {
      ...base,
      followUpDate: { $gt: todayEnd },
    };
  }

  return base;
}

function findLatestPendingFollowUp(lead) {
  return [...(lead.followUpHistory || [])]
    .reverse()
    .find((followUp) => {
      if (followUp.completed) return false;
      return !followUp.status || followUp.status === "Pending";
    });
}

function buildPackagingNote({
  discussionSummary,
  requirementUpdate,
  nextAction,
  quotationSent,
  sampleRequired,
}) {
  const parts = [];

  if (discussionSummary?.trim()) {
    parts.push(`Discussion Summary: ${discussionSummary.trim()}`);
  }
  if (requirementUpdate?.trim()) {
    parts.push(`Requirement Update: ${requirementUpdate.trim()}`);
  }
  if (nextAction?.trim()) {
    parts.push(`Next Action: ${nextAction.trim()}`);
  }
  if (quotationSent !== undefined) {
    parts.push(`Quotation Sent: ${quotationSent ? "Yes" : "No"}`);
  }
  if (sampleRequired !== undefined) {
    parts.push(`Sample Required: ${sampleRequired ? "Yes" : "No"}`);
  }

  return parts.join("\n");
}

async function loadAccessibleLead(req, res) {
  const lead = await Lead.findById(req.params.leadId);
  if (!lead) {
    res.status(404).json({ message: "Lead not found" });
    return null;
  }
  if (!canAccessLead(req.user, lead)) {
    res.status(403).json({ message: "You do not have access to this lead" });
    return null;
  }
  return lead;
}

exports.getFollowUpSummary = async (req, res) => {
  try {
    const [dueToday, overdue, upcoming] = await Promise.all([
      Lead.countDocuments(queryForType(req.user, "today")),
      Lead.countDocuments(queryForType(req.user, "overdue")),
      Lead.countDocuments(queryForType(req.user, "upcoming")),
    ]);

    res.json({
      dueToday,
      overdue,
      upcoming,
      activePending: dueToday + overdue + upcoming,
      reminderCount: dueToday + overdue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFollowUps = async (req, res) => {
  try {
    const type = req.query.type || "all";
    const allowed = ["all", "today", "overdue", "upcoming"];
    if (!allowed.includes(type)) {
      return res.status(400).json({ message: "Invalid follow-up type" });
    }

    const leads = await Lead.find(queryForType(req.user, type))
      .sort({ followUpDate: type === "overdue" ? 1 : 1, createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addFollowUpNote = async (req, res) => {
  try {
    const lead = await loadAccessibleLead(req, res);
    if (!lead) return;

    const note = buildPackagingNote(req.body);
    if (!note.trim()) {
      return res.status(400).json({ message: "At least one note field is required" });
    }

    lead.noteHistory.push({ text: note, createdAt: new Date() });
    lead.notes = lead.notes ? `${lead.notes}\n${note}` : note;
    addActivity(lead, "note_added", "Follow-up note added", { text: note }, req.user);

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.completeFollowUp = async (req, res) => {
  try {
    const lead = await loadAccessibleLead(req, res);
    if (!lead) return;

    const note = buildPackagingNote(req.body);
    const pending = findLatestPendingFollowUp(lead);

    if (pending) {
      pending.completed = true;
      pending.status = "Completed";
      pending.completedAt = new Date();
      if (note) {
        pending.note = pending.note ? `${pending.note}\n${note}` : note;
      }
    }

    if (note) {
      lead.noteHistory.push({ text: note, createdAt: new Date() });
      lead.notes = lead.notes ? `${lead.notes}\n${note}` : note;
    }

    lead.followUpDate = null;
    addActivity(
      lead,
      "follow_up_completed",
      "Follow-up completed",
      { note },
      req.user
    );

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.rescheduleFollowUp = async (req, res) => {
  try {
    const { followUpDate, reminderAt } = req.body;
    if (!followUpDate) {
      return res.status(400).json({ message: "followUpDate is required" });
    }

    const lead = await loadAccessibleLead(req, res);
    if (!lead) return;

    const nextDate = new Date(followUpDate);
    const previousDate = lead.followUpDate || null;
    const note = buildPackagingNote(req.body);
    const pending = findLatestPendingFollowUp(lead);

    if (pending) {
      pending.status = "Rescheduled";
      pending.rescheduledFrom = pending.scheduledDate;
    }

    lead.followUpDate = nextDate;
    lead.followUpHistory.push({
      scheduledDate: nextDate,
      note,
      status: "Pending",
      reminderAt: reminderAt ? new Date(reminderAt) : undefined,
      completed: false,
      rescheduledFrom: previousDate,
    });

    if (note) {
      lead.noteHistory.push({ text: note, createdAt: new Date() });
      lead.notes = lead.notes ? `${lead.notes}\n${note}` : note;
    }

    addActivity(
      lead,
      "follow_up_rescheduled",
      `Follow-up rescheduled for ${nextDate.toLocaleDateString("en-IN")}`,
      { from: previousDate, to: nextDate, note },
      req.user
    );

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
