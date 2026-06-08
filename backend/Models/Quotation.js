const mongoose = require('mongoose');

// ─── Line Item Sub-schema ────────────────────────────────────────────────────
const lineItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'quantity is required'],
      min: [0.001, 'quantity must be > 0'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'unitPrice is required'],
      min: [0, 'unitPrice cannot be negative'],
    },
    gstPercent: {
      type: Number,
      default: 18,
      min: 0,
      max: 100,
    },
    lineTotal:        { type: Number, default: 0 },
    lineTotalWithGst: { type: Number, default: 0 },
  },
  { _id: true }
);

// ─── Customer Snapshot ────────────────────────────────────────────────────────
const customerSnapshotSchema = new mongoose.Schema(
  {
    name:    { type: String, default: '' },
    company: { type: String, default: '' },
    phone:   { type: String, default: '' },
    email:   { type: String, default: '' },
    city:    { type: String, default: '' },
  },
  { _id: false }
);

// ─── Quotation Schema ─────────────────────────────────────────────────────────
const quotationSchema = new mongoose.Schema(
  {
    quoteNumber: { type: String, unique: true },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'lead is required'],
    },

    customer: {
      type: customerSnapshotSchema,
      default: () => ({}),
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: {
      type: [lineItemSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one line item is required',
      },
    },

    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
      default: 'Draft',
    },

    validUntil: {
      type: Date,
      default: () => { const d = new Date(); d.setDate(d.getDate() + 30); return d; },
    },

    notes:      { type: String, trim: true, default: '' },
    subtotal:   { type: Number, default: 0 },
    totalGst:   { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

quotationSchema.index({ lead: 1 });
quotationSchema.index({ createdBy: 1 });
quotationSchema.index({ status: 1 });
quotationSchema.index({ createdAt: -1 });

// ─── Pre-save: recalculate totals + assign quoteNumber ───────────────────────
quotationSchema.pre('save', async function (next) {
  let subtotal = 0;
  let totalGst = 0;

  for (const item of this.items) {
    const lineTotal        = parseFloat((item.quantity * item.unitPrice).toFixed(2));
    const gstAmount        = parseFloat(((lineTotal * item.gstPercent) / 100).toFixed(2));
    const lineTotalWithGst = parseFloat((lineTotal + gstAmount).toFixed(2));
    item.lineTotal        = lineTotal;
    item.lineTotalWithGst = lineTotalWithGst;
    subtotal += lineTotal;
    totalGst += gstAmount;
  }

  this.subtotal   = parseFloat(subtotal.toFixed(2));
  this.totalGst   = parseFloat(totalGst.toFixed(2));
  this.grandTotal = parseFloat((subtotal + totalGst).toFixed(2));

  if (!this.quoteNumber) {
    const now    = new Date();
    const prefix = `Q-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-`;
    const last   = await this.constructor
      .findOne({ quoteNumber: { $regex: `^${prefix}` } })
      .sort({ quoteNumber: -1 })
      .select('quoteNumber')
      .lean();
    const seq = last?.quoteNumber
      ? parseInt(last.quoteNumber.split('-').pop(), 10) + 1
      : 1;
    this.quoteNumber = `${prefix}${String(seq).padStart(4, '0')}`;
  }

  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);
