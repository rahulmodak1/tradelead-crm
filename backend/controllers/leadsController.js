const Lead = require("../Models/Lead");
const {
  fetchTradeIndiaLeadsFromAPI,
  normalizePhone,
} = require("../services/tradeindiaService");
const { addActivity } = require("./teamController");
const {
  buildLeadQuery,
  canAccessLead,
  canDeleteLeads,
  canSyncTradeIndia,
  actorFromUser,
} = require("../utils/permissions");

const ALLOWED_STATUSES = ["New", "Hot", "Follow Up", "Closed"];

function denyLeadAccess(res) {
  return res.status(403).json({ message: "You do not have access to this lead" });
}

exports.getLeads = async (req, res) => {
  try {
    const query = buildLeadQuery(req.user);
    const leads = await Lead.find(query).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (!canAccessLead(req.user, lead)) {
      return denyLeadAccess(res);
    }
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    addActivity(lead, "created", "Lead created", {}, req.user);
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (!canAccessLead(req.user, lead)) {
      return denyLeadAccess(res);
    }

    const oldStatus = lead.status;
    const oldFollowUp = lead.followUpDate?.toISOString?.() ?? null;

    Object.assign(lead, req.body);

    if (req.body.status && req.body.status !== oldStatus) {
      addActivity(
        lead,
        "status_changed",
        `Status changed from "${oldStatus}" to "${req.body.status}"`,
        { from: oldStatus, to: req.body.status },
        req.user
      );
    } else if (Object.keys(req.body).some((k) => !["status", "followUpDate"].includes(k))) {
      addActivity(lead, "updated", "Lead details updated", {}, req.user);
    }

    const newFollowUp = lead.followUpDate?.toISOString?.() ?? null;
    if (req.body.followUpDate !== undefined && newFollowUp !== oldFollowUp) {
      addActivity(
        lead,
        "follow_up_set",
        `Follow-up scheduled for ${new Date(lead.followUpDate).toLocaleDateString("en-IN")}`,
        { followUpDate: lead.followUpDate },
        req.user
      );
      if (lead.followUpDate) {
        lead.followUpHistory.push({
          scheduledDate: lead.followUpDate,
          note: req.body.notes || "",
          status: "Pending",
          completed: false,
        });
      }
    }

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (!canAccessLead(req.user, lead)) {
      return denyLeadAccess(res);
    }

    const oldStatus = lead.status;
    if (oldStatus !== status) {
      lead.status = status;
      addActivity(
        lead,
        "status_changed",
        `Status changed from "${oldStatus}" to "${status}"`,
        { from: oldStatus, to: status },
        req.user
      );
      await lead.save();
    }

    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (!canAccessLead(req.user, lead)) {
      return denyLeadAccess(res);
    }

    const trimmed = text.trim();
    lead.noteHistory.push({ text: trimmed, createdAt: new Date() });
    lead.notes = lead.notes ? `${lead.notes}\n${trimmed}` : trimmed;
    addActivity(lead, "note_added", "Note added", { text: trimmed }, req.user);
    await lead.save();

    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.setFollowUp = async (req, res) => {
  try {
    const { followUpDate, note } = req.body;
    if (!followUpDate) {
      return res.status(400).json({ message: "Follow-up date is required" });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (!canAccessLead(req.user, lead)) {
      return denyLeadAccess(res);
    }

    const date = new Date(followUpDate);
    lead.followUpDate = date;
    lead.followUpHistory.push({
      scheduledDate: date,
      note: note?.trim() || "",
      status: "Pending",
      completed: false,
    });
    addActivity(
      lead,
      "follow_up_set",
      `Follow-up scheduled for ${date.toLocaleDateString("en-IN")}`,
      { followUpDate: date, note: note?.trim() || "" },
      req.user
    );
    await lead.save();

    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.completeFollowUp = async (req, res) => {
  try {
    const { note } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (!canAccessLead(req.user, lead)) {
      return denyLeadAccess(res);
    }

    const pending = [...lead.followUpHistory]
      .reverse()
      .find((f) => !f.completed);

    if (pending) {
      pending.completed = true;
      pending.status = "Completed";
      pending.completedAt = new Date();
      if (note?.trim()) {
        pending.note = pending.note
          ? `${pending.note}\n${note.trim()}`
          : note.trim();
      }
    }

    lead.followUpDate = null;

    addActivity(
      lead,
      "follow_up_completed",
      "Follow-up completed",
      { note: note?.trim() || "" },
      req.user
    );
    await lead.save();

    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.syncTradeIndiaLeads = async (req, res) => {
  try {
    if (!canSyncTradeIndia(req.user)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const fetchedLeads = await fetchTradeIndiaLeadsFromAPI();

    const existingLeads = await Lead.find({}, "phone");
    const existingPhones = new Set(
      existingLeads.map((lead) => normalizePhone(lead.phone)).filter(Boolean)
    );

    const leadsToInsert = [];
    const actor = actorFromUser(req.user);

    for (const leadData of fetchedLeads) {
      const phoneKey = normalizePhone(leadData.phone);
      if (!phoneKey || existingPhones.has(phoneKey)) continue;

      existingPhones.add(phoneKey);
      leadsToInsert.push({
        ...leadData,
        activities: [{
          type: "created",
          message: "Lead created via TradeIndia sync",
          performedBy: actor,
          createdAt: new Date(),
        }],
      });
    }

    if (leadsToInsert.length > 0) {
      await Lead.insertMany(leadsToInsert);
    }

    res.json({
      message: `${leadsToInsert.length} new leads imported`,
      imported: leadsToInsert.length,
      totalFetched: fetchedLeads.length,
      skipped: fetchedLeads.length - leadsToInsert.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    if (!canDeleteLeads(req.user)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
