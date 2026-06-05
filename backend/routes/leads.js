const express = require("express");
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  syncTradeIndiaLeads,
  addNote,
  setFollowUp,
  completeFollowUp,
} = require("../controllers/leadsController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", getLeads);
router.post("/sync-tradeindia", syncTradeIndiaLeads);
router.post("/", createLead);
router.get("/:id", getLeadById);
router.post("/:id/notes", addNote);
router.patch("/:id/follow-up", setFollowUp);
router.post("/:id/follow-up/complete", completeFollowUp);
router.patch("/:id/status", updateLeadStatus);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

module.exports = router;
