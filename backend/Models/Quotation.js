const mongoose = require("mongoose");

const PRODUCT_CATEGORIES = [
  "Paper Bags",
  "Shipping Bags",
  "Ecommerce Packaging",
  "Jute Bags",
  "Cotton Bags",
  "Diaries",
  "MDF Products",
  "Fridge Magnets",
  "Wall Hangings",
  "Custom Product",
];

const QUOTATION_STATUSES = [
  "Draft",
  "Sent",
  "Viewed",
  "Negotiation",
  "Approved",
  "Rejected",
  "Converted",
];

const QuotationItemSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      required: true,
    },
    material: { type: String },
    size: { type: String },
    gsmThickness: { type: String },
    printType: { type: String },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    gstPercent: { type: Number, required: true, default: 18, min: 0, max: 100 },
    discount: { type: Number, default: 0, min: 0 }, // absolute discount per line
    notes: { type: String },
    total: { type: Number }, // computed on save
  },
  { _id: true }
);

const HistoryEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["created", "sent", "viewed", "negotiation", "approved", "rejected", "converted", "updated", "duplicate"],
      required: true,
    },
    by: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      userName: String,
      userRole: String,
    },
    meta: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const AttachmentSchema = new mongoose.Schema(
  {
    filename: String,
    url: String,
    mimeType: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const NoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const QuotationSchema = new mongoose.Schema(
  {
    // Quote identification
    quoteNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    title: { type: String },
    description: { type: String },

    // Linked lead (required)
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    // Customer info (denormalized from lead at creation)
    customer: {
      name: String,
      companyName: String,
      phone: String,
      email: String,
      city: String,
    },

    // Line items
    items: [QuotationItemSchema],

    // Customer requirements
    deliveryLocation: String,
    deliveryDate: Date,
    sampleRequired: { type: Boolean, default: false },
    artworkAvailable: { type: Boolean, default: false },
    remarks: String,

    // Financial
    currency: { type: String, default: "INR" },
    subtotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    // Status and lifecycle
    status: {
      type: String,
      enum: QUOTATION_STATUSES,
      default: "Draft",
      index: true,
    },
    validUntil: Date,

    // Audit trail
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Relations
    attachments: [AttachmentSchema],
    notes: [NoteSchema],
    history: [HistoryEntrySchema],
    convertedToLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },

    // Soft delete
    deleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Pre-save hook: compute line totals and aggregates
QuotationSchema.pre("save", async function (next) {
  try {
    // Compute line totals and aggregates
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    if (this.items && this.items.length > 0) {
      this.items.forEach((item) => {
        const lineSubtotal = item.quantity * item.unitPrice;
        const gstAmount = (lineSubtotal * item.gstPercent) / 100;
        const lineDiscount = item.discount || 0;
        const lineTotal = lineSubtotal + gstAmount - lineDiscount;

        item.total = Math.round(lineTotal * 100) / 100;
        subtotal += lineSubtotal;
        taxTotal += gstAmount;
        discountTotal += lineDiscount;
      });
    }

    this.subtotal = Math.round(subtotal * 100) / 100;
    this.taxTotal = Math.round(taxTotal * 100) / 100;
    this.discountTotal = Math.round(discountTotal * 100) / 100;
    this.total = Math.round((subtotal + taxTotal - discountTotal) * 100) / 100;

    // Generate quote number if not already set
    if (!this.quoteNumber) {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      // Find the last quote number for this month
      const lastQuote = await mongoose
        .model("Quotation")
        .findOne(
          { quoteNumber: new RegExp(`^Q-${yearMonth}`) },
          { quoteNumber: 1 }
        )
        .sort({ quoteNumber: -1 })
        .limit(1);

      let sequence = 1;
      if (lastQuote && lastQuote.quoteNumber) {
        const lastSequence = parseInt(lastQuote.quoteNumber.split("-")[2]);
        sequence = lastSequence + 1;
      }

      this.quoteNumber = `Q-${yearMonth}-${String(sequence).padStart(4, "0")}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Validation: ensure lead exists and items are present
QuotationSchema.pre("save", async function (next) {
  try {
    if (!this.lead) {
      throw new Error("Quotation must be linked to a lead");
    }

    if (!this.items || this.items.length === 0) {
      throw new Error("Quotation must have at least one item");
    }

    // Validate delivery date
    if (this.deliveryDate && this.deliveryDate < new Date()) {
      throw new Error("Delivery date must be in the future");
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Index for soft delete queries
QuotationSchema.index({ deleted: 1, createdAt: -1 });

module.exports = mongoose.model("Quotation", QuotationSchema);
