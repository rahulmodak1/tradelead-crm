const express = require("express");
const {
  getTeamStats,
  assignLead,
  bulkAssignLeads,
} = require("../controllers/teamController");
const { authenticate, requireRoles } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/stats", getTeamStats);
router.patch("/leads/:id/assign", requireRoles("Admin", "Manager"), assignLead);
router.post("/leads/bulk-assign", requireRoles("Admin", "Manager"), bulkAssignLeads);

module.exports = router;
