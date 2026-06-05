const Quotation = require("../Models/Quotation");
const Lead = require("../Models/Lead");
const User = require("../Models/User");
const {
  canViewAllLeads,
  actorFromUser,
} = require("../utils/permissions");

// Helper: Check if user can access quotation
function canAccessQuotation(user, quotation) {
  if (canViewAllLeads(user)) return true; // Admin/Manager
  if (quotation.createdBy.toString() === user._id.toString()) return true; // Creator
  if (quotation.assignedTo && quotation.assignedTo.toString() === user._id.toString()) return true; // Assigned
  return false;
}

// Create Quotation
exports.createQuotation = async (req, res) => {
  try {
    const { lead, items, customer, deliveryLocation, deliveryDate, sampleRequired, artworkAvailable, remarks, validUntil, assignedTo, title, description, currency } = req.body;

    // Validate lead exists
    if (!lead) {
      return res.status(400).json({ message: "Lead ID is required" });
    }

    const existingLead = await Lead.findById(lead);
    if (!existingLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    // Create quotation with customer info auto-filled from lead if not provided
    const quotationData = {
      lead,
      items,
      deliveryLocation,
      deliveryDate,
      sampleRequired: sampleRequired || false,
      artworkAvailable: artworkAvailable || false,
      remarks,
      validUntil,
      assignedTo,
      title,
      description,
      currency: currency || "INR",
      createdBy: req.user._id,
      customer: customer || {
        name: existingLead.customerName,
        companyName: existingLead.companyName,
        phone: existingLead.phone,
        email: existingLead.email,
        city: existingLead.city,
      },
    };

    const quotation = new Quotation(quotationData);

    // Add history entry
    quotation.history.push({
      action: "created",
      by: actorFromUser(req.user),
      meta: { version: 1 },
    });

    await quotation.save();

    // Populate references
    await quotation.populate([
      { path: "lead", select: "customerName" },
      { path: "createdBy", select: "name" },
      { path: "assignedTo", select: "name" },
    ]);

    res.status(201).json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// List Quotations with filters
exports.listQuotations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, leadId, assignedTo, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { deleted: false };

    if (status) query.status = status;
    if (leadId) query.lead = leadId;
    if (assignedTo) query.assignedTo = assignedTo;

    // Permission: Sales can only see their own + assigned
    if (!canViewAllLeads(req.user)) {
      query.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user._id },
      ];
    }

    // Search in quoteNumber or customer name
    if (search) {
      query.$or = (query.$or || []).length > 0
        ? [
          ...query.$or,
          { quoteNumber: new RegExp(search, "i") },
          { "customer.name": new RegExp(search, "i") },
        ]
        : [
          { quoteNumber: new RegExp(search, "i") },
          { "customer.name": new RegExp(search, "i") },
        ];
    }

    const total = await Quotation.countDocuments(query);
    const quotations = await Quotation.find(query)
      .populate([
        { path: "lead", select: "customerName" },
        { path: "createdBy", select: "name" },
        { path: "assignedTo", select: "name" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      data: quotations,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Single Quotation
exports.getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate([
      { path: "lead" },
      { path: "createdBy", select: "name email" },
      { path: "assignedTo", select: "name email" },
      { path: "attachments.uploadedBy", select: "name" },
      { path: "notes.author", select: "name" },
      { path: "history.by.userId", select: "name" },
    ]);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessQuotation(req.user, quotation)) {
      return res.status(403).json({ message: "You do not have access to this quotation" });
    }

    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Quotation
exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessQuotation(req.user, quotation)) {
      return res.status(403).json({ message: "You do not have access to this quotation" });
    }

    // Only allow edit if status is Draft or Negotiation
    if (!["Draft", "Negotiation"].includes(quotation.status)) {
      return res.status(400).json({ message: `Cannot edit quotation with status: ${quotation.status}` });
    }

    // Update allowed fields
    const allowedFields = [
      "title",
      "description",
      "items",
      "deliveryLocation",
      "deliveryDate",
      "sampleRequired",
      "artworkAvailable",
      "remarks",
      "validUntil",
      "assignedTo",
    ];

    allowedFields.forEach((field) => {
      if (field in req.body) {
        quotation[field] = req.body[field];
      }
    });

    // Add to history
    quotation.history.push({
      action: "updated",
      by: actorFromUser(req.user),
      meta: { fields: Object.keys(req.body) },
    });

    await quotation.save();

    await quotation.populate([
      { path: "lead", select: "customerName" },
      { path: "createdBy", select: "name" },
      { path: "assignedTo", select: "name" },
    ]);

    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Quotation (soft delete)
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessQuotation(req.user, quotation)) {
      return res.status(403).json({ message: "You do not have access to this quotation" });
    }

    quotation.deleted = true;
    quotation.history.push({
      action: "updated",
      by: actorFromUser(req.user),
      meta: { deleted: true },
    });

    await quotation.save();
    res.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Change Status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const VALID_STATUSES = ["Draft", "Sent", "Viewed", "Negotiation", "Approved", "Rejected", "Converted"];

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessQuotation(req.user, quotation)) {
      return res.status(403).json({ message: "You do not have access to this quotation" });
    }

    const oldStatus = quotation.status;
    quotation.status = status;

    // Add to history
    quotation.history.push({
      action: status.toLowerCase(),
      by: actorFromUser(req.user),
      meta: { fromStatus: oldStatus },
    });

    await quotation.save();

    await quotation.populate([
      { path: "lead", select: "customerName" },
      { path: "createdBy", select: "name" },
      { path: "assignedTo", select: "name" },
    ]);

    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Duplicate Quotation
exports.duplicateQuotation = async (req, res) => {
  try {
    const original = await Quotation.findById(req.params.id);

    if (!original) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessQuotation(req.user, original)) {
      return res.status(403).json({ message: "You do not have access to this quotation" });
    }

    // Create new quotation as draft
    const duplicate = new Quotation({
      lead: original.lead,
      customer: original.customer,
      items: original.items.map((item) => ({ ...item.toObject(), _id: undefined })),
      title: `${original.title} (Copy)`,
      description: original.description,
      deliveryLocation: original.deliveryLocation,
      deliveryDate: original.deliveryDate,
      sampleRequired: original.sampleRequired,
      artworkAvailable: original.artworkAvailable,
      remarks: original.remarks,
      currency: original.currency,
      createdBy: req.user._id,
      assignedTo: original.assignedTo,
      status: "Draft",
    });

    duplicate.history.push({
      action: "duplicate",
      by: actorFromUser(req.user),
      meta: { duplicatedFrom: original._id },
    });

    await duplicate.save();

    await duplicate.populate([
      { path: "lead", select: "customerName" },
      { path: "createdBy", select: "name" },
      { path: "assignedTo", select: "name" },
    ]);

    res.status(201).json(duplicate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Convert Quotation to Lead
exports.convertQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessQuotation(req.user, quotation)) {
      return res.status(403).json({ message: "You do not have access to this quotation" });
    }

    quotation.status = "Converted";
    quotation.history.push({
      action: "converted",
      by: actorFromUser(req.user),
      meta: { timestamp: new Date() },
    });

    await quotation.save();

    await quotation.populate([
      { path: "lead", select: "customerName" },
      { path: "createdBy", select: "name" },
      { path: "assignedTo", select: "name" },
    ]);

    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Send Quotation (stub for now)
exports.sendQuotation = async (req, res) => {
  try {
    const { toEmail, message, sendAsPdf } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessQuotation(req.user, quotation)) {
      return res.status(403).json({ message: "You do not have access to this quotation" });
    }

    quotation.status = "Sent";
    quotation.history.push({
      action: "sent",
      by: actorFromUser(req.user),
      meta: {
        toEmail: toEmail || quotation.customer.email,
        sendAsPdf: sendAsPdf || false,
      },
    });

    await quotation.save();

    // TODO: Integrate with email service
    // if (sendAsPdf) {
    //   // Generate PDF and send
    // }

    await quotation.populate([
      { path: "lead", select: "customerName" },
      { path: "createdBy", select: "name" },
      { path: "assignedTo", select: "name" },
    ]);

    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add Note to Quotation
exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessQuotation(req.user, quotation)) {
      return res.status(403).json({ message: "You do not have access to this quotation" });
    }

    quotation.notes.push({
      text,
      author: req.user._id,
    });

    await quotation.save();

    await quotation.populate([
      { path: "notes.author", select: "name" },
    ]);

    res.json(quotation.notes[quotation.notes.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get PDF (returns HTML for printing/PDF generation)
exports.getQuotationPDF = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate([
      { path: "lead" },
      { path: "createdBy", select: "name email" },
    ]);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!canAccessQuotation(req.user, quotation)) {
      return res.status(403).json({ message: "You do not have access to this quotation" });
    }

    // Generate HTML for PDF
    const itemsHTML = quotation.items
      .map(
        (item, idx) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.productName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.category || ''}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.material || ''}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.size || ''}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.gstPercent}%</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.total?.toFixed(2) || '0.00'}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Quotation ${quotation.quoteNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 900px; margin: 0 auto; padding: 20px; }
            header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px; }
            h1 { color: #0066cc; margin: 0; }
            .quote-number { font-size: 12px; color: #666; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; background: #f0f0f0; padding: 8px; }
            .row { display: flex; gap: 40px; margin-bottom: 10px; }
            .field { flex: 1; }
            .field-label { font-weight: bold; font-size: 12px; color: #666; }
            .field-value { font-size: 13px; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #0066cc; color: white; padding: 10px; text-align: left; font-weight: bold; font-size: 12px; }
            td { padding: 8px; border: 1px solid #ddd; }
            .totals { float: right; width: 300px; margin: 20px 0; }
            .total-row { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #ddd; }
            .total-row.grand { background: #f0f0f0; font-weight: bold; font-size: 16px; border-top: 2px solid #0066cc; }
            .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
            @media print { body { margin: 0; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <h1>Quotation</h1>
              <p class="quote-number">${quotation.quoteNumber}</p>
            </header>

            <div class="section">
              <div class="section-title">Bill To</div>
              <div class="row">
                <div class="field">
                  <div class="field-label">Customer Name</div>
                  <div class="field-value">${quotation.customer?.name || ''}</div>
                </div>
                <div class="field">
                  <div class="field-label">Company</div>
                  <div class="field-value">${quotation.customer?.companyName || ''}</div>
                </div>
              </div>
              <div class="row">
                <div class="field">
                  <div class="field-label">Phone</div>
                  <div class="field-value">${quotation.customer?.phone || ''}</div>
                </div>
                <div class="field">
                  <div class="field-label">Email</div>
                  <div class="field-value">${quotation.customer?.email || ''}</div>
                </div>
              </div>
              <div class="row">
                <div class="field">
                  <div class="field-label">City</div>
                  <div class="field-value">${quotation.customer?.city || ''}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Quotation Details</div>
              <div class="row">
                <div class="field">
                  <div class="field-label">Quote Date</div>
                  <div class="field-value">${new Date(quotation.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div class="field">
                  <div class="field-label">Valid Until</div>
                  <div class="field-value">${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-IN') : 'N/A'}</div>
                </div>
              </div>
              ${quotation.deliveryLocation ? `
              <div class="row">
                <div class="field">
                  <div class="field-label">Delivery Location</div>
                  <div class="field-value">${quotation.deliveryLocation}</div>
                </div>
                <div class="field">
                  <div class="field-label">Delivery Date</div>
                  <div class="field-value">${quotation.deliveryDate ? new Date(quotation.deliveryDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                </div>
              </div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">Line Items</div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Material</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>GST %</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </div>

            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${(quotation.subtotal || 0).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>GST Total:</span>
                <span>₹${(quotation.taxTotal || 0).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Discount:</span>
                <span>₹${(quotation.discountTotal || 0).toFixed(2)}</span>
              </div>
              <div class="total-row grand">
                <span>Grand Total:</span>
                <span>₹${(quotation.total || 0).toFixed(2)}</span>
              </div>
            </div>

            <div style="clear: both;"></div>

            ${quotation.remarks ? `
            <div class="section">
              <div class="section-title">Remarks</div>
              <div class="field-value">${quotation.remarks}</div>
            </div>
            ` : ''}

            <div class="footer">
              <p>This is a computer-generated quotation. No signature required.</p>
              <p>For queries, please contact us.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="quotation-${quotation.quoteNumber}.html"`);
    res.send(html);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
