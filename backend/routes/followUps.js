const express = require("express");
const {
  getFollowUps,
  getFollowUpSummary,
  addFollowUpNote,
  completeFollowUp,
  rescheduleFollowUp,
} = require("../controllers/followUpsController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", getFollowUps);
router.get("/summary", getFollowUpSummary);
router.post("/:leadId/notes", addFollowUpNote);
router.post("/:leadId/complete", completeFollowUp);
router.patch("/:leadId/reschedule", rescheduleFollowUp);

module.exports = router;
