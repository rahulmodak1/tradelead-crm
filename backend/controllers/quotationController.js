const Quotation = require('../Models/Quotation');
const Lead      = require('../Models/Lead'); // adjust path if yours differs

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Safely pull customer fields from a Lead document
const snapshotFromLead = (lead) => ({
  name:    lead.customerName || lead.name || '',
  company: lead.company      || '',
  phone:   lead.phone        || '',
  email:   lead.email        || '',
  city:    lead.city         || '',
});

// Strip any computed fields the frontend might accidentally send
// so the pre-save hook is the single source of truth for totals.
const sanitizeItems = (rawItems = []) =>
  rawItems.map((item) => ({
    category:    (item.category    || '').trim(),
    description: (item.description || '').trim(),
    quantity:    Number(item.quantity)  || 0,
    unitPrice:   Number(item.unitPrice) || 0,
    gstPercent:  item.gstPercent !== undefined ? Number(item.gstPercent) : 18,
    // lineTotal / lineTotalWithGst intentionally omitted — hook recalculates
  }));

// ─── CREATE  POST /api/quotations ────────────────────────────────────────────
exports.createQuotation = async (req, res) => {
  try {
    const { lead: leadId, items, notes, validUntil, status } = req.body;

    if (!leadId) {
      return res.status(400).json({ message: 'lead is required' });
    }

    // 1. Fetch lead — auto-fill customer snapshot
    const lead = await Lead.findById(leadId).lean();
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // 2. Sanitize items (fixes field-name mismatches from frontend)
    const cleanItems = sanitizeItems(items);
    if (!cleanItems.length) {
      return res.status(400).json({ message: 'At least one line item is required' });
    }

    // 3. Validate required item fields early → readable error messages
    for (let i = 0; i < cleanItems.length; i++) {
      const it = cleanItems[i];
      if (!it.category)    return res.status(400).json({ message: `items[${i}].category is required` });
      if (!it.description) return res.status(400).json({ message: `items[${i}].description is required` });
      if (it.quantity <= 0)  return res.status(400).json({ message: `items[${i}].quantity must be > 0` });
      if (it.unitPrice < 0)  return res.status(400).json({ message: `items[${i}].unitPrice cannot be negative` });
    }

    // 4. Build and save — pre-save hook assigns quoteNumber + totals
    const quotation = new Quotation({
      lead:      leadId,
      customer:  snapshotFromLead(lead),
      createdBy: req.user._id,
      items:     cleanItems,
      notes:     notes || '',
      status:    status || 'Draft',
      ...(validUntil ? { validUntil: new Date(validUntil) } : {}),
    });

    await quotation.save();
    await quotation.populate('lead', 'customerName company phone city');

    res.status(201).json(quotation);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('[Quotation] createQuotation error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── LIST  GET /api/quotations ────────────────────────────────────────────────
// Query params: status, lead, page, limit
exports.getQuotations = async (req, res) => {
  try {
    const { status, lead, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (lead)   filter.lead   = lead;

    // Non-admins see only their own quotes
    if (req.user.role !== 'admin') {
      filter.createdBy = req.user._id;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [quotations, total] = await Promise.all([
      Quotation.find(filter)
        .populate('lead', 'customerName company phone city')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Quotation.countDocuments(filter),
    ]);

    res.json({
      quotations,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SINGLE  GET /api/quotations/:id ─────────────────────────────────────────
exports.getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('lead', 'customerName company phone city email')
      .populate('createdBy', 'name email');

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── UPDATE  PUT /api/quotations/:id ─────────────────────────────────────────
exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const { items, notes, status, validUntil } = req.body;

    if (items !== undefined) {
      const cleanItems = sanitizeItems(items);
      if (!cleanItems.length) {
        return res.status(400).json({ message: 'At least one line item is required' });
      }
      for (let i = 0; i < cleanItems.length; i++) {
        const it = cleanItems[i];
        if (!it.category)   return res.status(400).json({ message: `items[${i}].category is required` });
        if (!it.description) return res.status(400).json({ message: `items[${i}].description is required` });
        if (it.quantity <= 0) return res.status(400).json({ message: `items[${i}].quantity must be > 0` });
      }
      quotation.items = cleanItems;
    }

    if (notes      !== undefined) quotation.notes      = notes;
    if (status     !== undefined) quotation.status     = status;
    if (validUntil !== undefined) quotation.validUntil = new Date(validUntil);

    await quotation.save(); // pre-save hook recalculates totals
    await quotation.populate('lead', 'customerName company phone city');

    res.json(quotation);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};

// ─── STATUS PATCH  PATCH /api/quotations/:id/status ──────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }

    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('lead', 'customerName company');

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE  DELETE /api/quotations/:id ──────────────────────────────────────
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
