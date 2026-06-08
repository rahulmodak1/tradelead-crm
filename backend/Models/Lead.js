const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const FollowUpSchema = new mongoose.Schema(
  {
    scheduledDate: { type: Date, required: true },
    note: String,
    status: {
      type: String,
      enum: ["Pending", "Completed", "Rescheduled", "Cancelled"],
      default: "Pending",
    },
    rescheduledFrom: Date,
    reminderAt: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "created",
        "status_changed",
        "note_added",
        "follow_up_set",
        "follow_up_completed",
        "follow_up_rescheduled",
        "assigned",
        "reassigned",
        "updated",
      ],
      required: true,
    },
    message: String,
    meta: mongoose.Schema.Types.Mixed,
    performedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      userName: String,
      userRole: String,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LeadSchema = new mongoose.Schema({
  customerName: { type: String },
  phone: { type: String },
  email: { type: String },
  company: { type: String },
  city: { type: String },
  product: { type: String },
  inquiry: { type: String },
  status: {
    type: String,
    enum: ["New", "Hot", "Follow Up", "Closed"],
    default: "New",
  },
  followUpDate: { type: Date },
  notes: { type: String },
  noteHistory: [NoteSchema],
  followUpHistory: [FollowUpSchema],
  activities: [ActivitySchema],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  assignedToName: { type: String, default: null },
  source: { type: String, default: "TradeIndia" },
  createdAt: { type: Date, default: Date.now },
});

LeadSchema.index({ followUpDate: 1, status: 1 });
LeadSchema.index({ assignedTo: 1, followUpDate: 1 });
LeadSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.Lead ||
  mongoose.model("Lead", LeadSchema);
