const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createQuotation,
  listQuotations,
  getQuotation,
  updateQuotation,
  deleteQuotation,
  updateStatus,
  duplicateQuotation,
  convertQuotation,
  sendQuotation,
  addNote,
  getQuotationPDF,
} = require("../controllers/quotationsController");

// All routes require authentication
router.use(authenticate);

// List and Create
router.get("/", listQuotations);
router.post("/", createQuotation);

// Detail, Update, Delete
router.get("/:id", getQuotation);
router.put("/:id", updateQuotation);
router.delete("/:id", deleteQuotation);

// Status Change
router.patch("/:id/status", updateStatus);

// Actions
router.post("/:id/duplicate", duplicateQuotation);
router.post("/:id/convert", convertQuotation);
router.post("/:id/send", sendQuotation);

// Notes
router.post("/:id/notes", addNote);

// PDF
router.get("/:id/pdf", getQuotationPDF);

module.exports = router;
