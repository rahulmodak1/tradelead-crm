const Lead = require("../Models/Lead");
const User = require("../Models/User");
const { actorFromUser } = require("../utils/permissions");

function addActivity(lead, type, message, meta = {}, user = null) {
  lead.activities.push({
    type,
    message,
    meta,
    performedBy: actorFromUser(user),
    createdAt: new Date(),
  });
}

exports.getTeamStats = async (req, res) => {
  try {
    const users = await User.find({ status: "Active", role: { $ne: "Admin" } }).sort({ name: 1 });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Promise.all(
      users.map(async (user) => {
        const assignedLeads = await Lead.find({ assignedTo: user._id });
        const hotLeads = assignedLeads.filter((l) => l.status === "Hot").length;
        const followUpsPending = assignedLeads.filter((l) => {
          if (l.status === "Follow Up") return true;
          if (!l.followUpDate || l.status === "Closed") return false;
          const pending = (l.followUpHistory || []).some((f) => !f.completed);
          return pending || new Date(l.followUpDate) >= today;
        }).length;
        const closedDeals = assignedLeads.filter((l) => l.status === "Closed").length;

        return {
          userId: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
          totalAssigned: assignedLeads.length,
          hotLeads,
          followUpsPending,
          closedDeals,
        };
      })
    );

    if (req.user.role === "Sales Executive") {
      const mine = stats.find((s) => String(s.userId) === String(req.user._id));
      return res.json(mine ? [mine] : []);
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignLead = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const assignee = await User.findById(userId);
    if (!assignee || assignee.status !== "Active") {
      return res.status(400).json({ message: "Invalid or inactive user" });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const previousName = lead.assignedToName;
    const previousId = lead.assignedTo;
    const isReassign = Boolean(previousId);
    lead.assignedTo = assignee._id;
    lead.assignedToName = assignee.name;

    const activityType = isReassign ? "reassigned" : "assigned";
    const message = isReassign
      ? `Lead reassigned from ${previousName || "Unassigned"} to ${assignee.name}`
      : `Lead assigned to ${assignee.name}`;

    addActivity(
      lead,
      activityType,
      message,
      {
        fromUserId: previousId,
        fromUserName: previousName,
        toUserId: assignee._id,
        toUserName: assignee.name,
      },
      req.user
    );

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.bulkAssignLeads = async (req, res) => {
  try {
    const { leadIds, userId } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "leadIds array is required" });
    }
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const assignee = await User.findById(userId);
    if (!assignee || assignee.status !== "Active") {
      return res.status(400).json({ message: "Invalid or inactive user" });
    }

    const leads = await Lead.find({ _id: { $in: leadIds } });
    let updated = 0;

    for (const lead of leads) {
      const previousName = lead.assignedToName;
      const isReassign = Boolean(lead.assignedTo);
      lead.assignedTo = assignee._id;
      lead.assignedToName = assignee.name;

      addActivity(
        lead,
        isReassign ? "reassigned" : "assigned",
        isReassign
          ? `Lead reassigned from ${previousName || "Unassigned"} to ${assignee.name}`
          : `Lead assigned to ${assignee.name}`,
        { toUserId: assignee._id, toUserName: assignee.name },
        req.user
      );
      await lead.save();
      updated += 1;
    }

    res.json({
      message: `${updated} lead(s) assigned to ${assignee.name}`,
      updated,
      assignee: assignee.toPublicJSON(),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.addActivity = addActivity;
