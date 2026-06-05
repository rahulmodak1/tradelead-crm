import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useQuotes } from '../../hooks/useQuotes';
import { useLeads } from '../../hooks/useLeads';

const PRODUCT_CATEGORIES = [
  'Paper Bags',
  'Shipping Bags',
  'Ecommerce Packaging',
  'Jute Bags',
  'Cotton Bags',
  'Diaries',
  'MDF Products',
  'Fridge Magnets',
  'Wall Hangings',
  'Custom Product',
];

export default function QuoteForm({ quote, onClose, initialLeadId }) {
  const { addQuotation, updateQuotation, showToast } = useQuotes();
  const { leads } = useLeads();

  const [formData, setFormData] = useState({
    lead: quote?.lead?._id || initialLeadId || '',
    title: quote?.title || '',
    description: quote?.description || '',
    items: quote?.items || [
      {
        productName: '',
        category: '',
        material: '',
        size: '',
        gsmThickness: '',
        printType: '',
        quantity: 1,
        unitPrice: 0,
        gstPercent: 18,
        discount: 0,
      },
    ],
    deliveryLocation: quote?.deliveryLocation || '',
    deliveryDate: quote?.deliveryDate ? quote.deliveryDate.split('T')[0] : '',
    sampleRequired: quote?.sampleRequired || false,
    artworkAvailable: quote?.artworkAvailable || false,
    remarks: quote?.remarks || '',
    validUntil: quote?.validUntil ? quote.validUntil.split('T')[0] : '',
  });

  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(
    leads?.find((l) => l._id === formData.lead) || null
  );

  // Compute totals
  const totals = React.useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    formData.items.forEach((item) => {
      const lineSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
      const gst = (lineSubtotal * (item.gstPercent || 0)) / 100;
      const discount = item.discount || 0;

      subtotal += lineSubtotal;
      taxTotal += gst;
      discountTotal += discount;
    });

    const total = subtotal + taxTotal - discountTotal;
    return { subtotal, taxTotal, discountTotal, total };
  }, [formData.items]);

  const handleLeadChange = (leadId) => {
    const lead = leads.find((l) => l._id === leadId);
    setSelectedLead(lead);
    setFormData((prev) => ({
      ...prev,
      lead: leadId,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: field === 'quantity' || field === 'unitPrice' || field === 'gstPercent' || field === 'discount'
          ? parseFloat(value) || 0
          : value,
      };
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productName: '',
          category: '',
          material: '',
          size: '',
          gsmThickness: '',
          printType: '',
          quantity: 1,
          unitPrice: 0,
          gstPercent: 18,
          discount: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      showToast('At least one item is required', 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lead) {
      showToast('Please select a lead', 'error');
      return;
    }

    if (formData.items.length === 0 || formData.items.some((i) => !i.productName)) {
      showToast('Please fill all required item fields', 'error');
      return;
    }

    setLoading(true);
    try {
      if (quote) {
        await updateQuotation(quote._id, {
          title: formData.title,
          description: formData.description,
          items: formData.items,
          deliveryLocation: formData.deliveryLocation,
          deliveryDate: formData.deliveryDate,
          sampleRequired: formData.sampleRequired,
          artworkAvailable: formData.artworkAvailable,
          remarks: formData.remarks,
          validUntil: formData.validUntil,
        });
      } else {
        console.log("FULL FORM DATA", formData);
console.log("ITEMS", formData.items);

        await addQuotation({
          lead: formData.lead,
          title: formData.title,
          description: formData.description,
          items: formData.items,
          deliveryLocation: formData.deliveryLocation,
          deliveryDate: formData.deliveryDate,
          sampleRequired: formData.sampleRequired,
          artworkAvailable: formData.artworkAvailable,
          remarks: formData.remarks,
          validUntil: formData.validUntil,
          customer: selectedLead && {
            name: selectedLead.customerName,
            companyName: selectedLead.companyName,
            phone: selectedLead.phone,
            email: selectedLead.email,
            city: selectedLead.city,
          },
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving quotation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide">Basic Information</h3>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
            Lead <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.lead}
            onChange={(e) => handleLeadChange(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select a lead...</option>
            {leads?.map((lead) => (
              <option key={lead._id} value={lead._id}>
                {lead.customerName} - {lead.city}
              </option>
            ))}
          </select>
        </div>

        {selectedLead && (
          <div className="bg-surface-hover border border-surface-border p-4 rounded-xl">
            <p className="text-xs text-gray-300 mb-2"><span className="text-gray-500">Customer:</span> <span className="text-gray-100 font-medium">{selectedLead.customerName}</span></p>
            <p className="text-xs text-gray-300 mb-2"><span className="text-gray-500">Company:</span> <span className="text-gray-100 font-medium">{selectedLead.companyName}</span></p>
            <p className="text-xs text-gray-300 mb-2"><span className="text-gray-500">Phone:</span> <span className="text-gray-100 font-medium">{selectedLead.phone}</span></p>
            <p className="text-xs text-gray-300 mb-2"><span className="text-gray-500">Email:</span> <span className="text-gray-100 font-medium">{selectedLead.email}</span></p>
            <p className="text-xs text-gray-300"><span className="text-gray-500">City:</span> <span className="text-gray-100 font-medium">{selectedLead.city}</span></p>
          </div>
        )}

        <input
          type="text"
          placeholder="Quotation Title (Optional)"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input-field"
        />

        <textarea
          placeholder="Description (Optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="2"
          className="input-field resize-none"
        />
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide">Line Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="btn-primary"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="overflow-x-auto border border-surface-border rounded-xl">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-border bg-surface-hover">
                <th className="px-3 py-3 text-left text-gray-400 font-semibold">Product Name</th>
                <th className="px-3 py-3 text-left text-gray-400 font-semibold">Category</th>
                <th className="px-3 py-3 text-left text-gray-400 font-semibold">Material</th>
                <th className="px-3 py-3 text-left text-gray-400 font-semibold">Size</th>
                <th className="px-3 py-3 text-left text-gray-400 font-semibold">GSM</th>
                <th className="px-3 py-3 text-left text-gray-400 font-semibold">Print Type</th>
                <th className="px-3 py-3 text-right text-gray-400 font-semibold">Qty</th>
                <th className="px-3 py-3 text-right text-gray-400 font-semibold">Unit Price</th>
                <th className="px-3 py-3 text-right text-gray-400 font-semibold">GST %</th>
                <th className="px-3 py-3 text-right text-gray-400 font-semibold">Discount</th>
                <th className="px-3 py-3 text-right text-gray-400 font-semibold">Total</th>
                <th className="px-3 py-3 text-center text-gray-400 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, idx) => {
                const lineSubtotal = item.quantity * item.unitPrice;
                const gst = (lineSubtotal * item.gstPercent) / 100;
                const lineTotal = lineSubtotal + gst - item.discount;

                return (
                  <tr key={idx} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                        className="input-field text-xs py-1.5"
                        placeholder="Product name"
                        required
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.category}
                        onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                        className="input-field text-xs py-1.5"
                      >
                        <option value="">Select</option>
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.material}
                        onChange={(e) => handleItemChange(idx, 'material', e.target.value)}
                        className="input-field text-xs py-1.5"
                        placeholder="Material"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.size}
                        onChange={(e) => handleItemChange(idx, 'size', e.target.value)}
                        className="input-field text-xs py-1.5"
                        placeholder="Size"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.gsmThickness}
                        onChange={(e) => handleItemChange(idx, 'gsmThickness', e.target.value)}
                        className="input-field text-xs py-1.5"
                        placeholder="GSM"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.printType}
                        onChange={(e) => handleItemChange(idx, 'printType', e.target.value)}
                        className="input-field text-xs py-1.5"
                        placeholder="Print type"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="input-field text-xs py-1.5 text-right"
                        min="1"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="input-field text-xs py-1.5 text-right"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        value={item.gstPercent}
                        onChange={(e) => handleItemChange(idx, 'gstPercent', e.target.value)}
                        className="input-field text-xs py-1.5 text-right"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                        className="input-field text-xs py-1.5 text-right"
                        min="0"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-brand-400">
                      ₹{lineTotal.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1.5 hover:bg-surface-hover rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-72 space-y-2 bg-surface-hover border border-surface-border p-4 rounded-xl">
          <div className="flex justify-between text-sm text-gray-300">
            <span className="text-gray-400">Subtotal:</span>
            <span className="text-gray-100 font-medium">₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-300">
            <span className="text-gray-400">GST:</span>
            <span className="text-gray-100 font-medium">₹{totals.taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-300">
            <span className="text-gray-400">Discount:</span>
            <span className="text-gray-100 font-medium">₹{totals.discountTotal.toFixed(2)}</span>
          </div>
          <div className="border-t border-surface-border pt-2 flex justify-between font-bold text-brand-400">
            <span>Total:</span>
            <span>₹{totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Customer Requirements */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wide">Customer Requirements</h3>

        <input
          type="text"
          placeholder="Delivery Location"
          value={formData.deliveryLocation}
          onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
          className="input-field"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Delivery Date</label>
            <input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Valid Until</label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.sampleRequired}
              onChange={(e) => setFormData({ ...formData, sampleRequired: e.target.checked })}
              className="w-4 h-4 accent-brand-500 cursor-pointer"
            />
            <span className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors">Sample Required</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.artworkAvailable}
              onChange={(e) => setFormData({ ...formData, artworkAvailable: e.target.checked })}
              className="w-4 h-4 accent-brand-500 cursor-pointer"
            />
            <span className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors">Artwork Available</span>
          </label>
        </div>

        <textarea
          placeholder="Remarks (Optional)"
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          rows="3"
          className="input-field resize-none"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-surface-border">
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : quote ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
