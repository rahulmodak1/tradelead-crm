import React from 'react';
import { Printer, Download, X } from 'lucide-react';

export default function QuotePrint({ quote, onClose }) {
  if (!quote) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/quotations/${quote._id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const html = await response.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-${quote.quoteNumber}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  const itemsTotal = quote.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex justify-between items-center p-4 border-b shadow-sm">
          <h2 className="text-lg font-bold">Print Quotation</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 bg-white print:p-0">
          {/* Header */}
          <div className="text-center mb-8 pb-8 border-b-2 border-blue-600">
            <h1 className="text-4xl font-bold text-blue-600">Quotation</h1>
            <p className="text-sm text-gray-600 mt-2">{quote.quoteNumber}</p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Bill To */}
            <div>
              <h3 className="font-bold text-sm uppercase text-gray-700 mb-4">Bill To</h3>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{quote.customer?.name}</p>
                <p className="text-gray-600">{quote.customer?.companyName}</p>
                <p className="text-gray-600">{quote.customer?.phone}</p>
                <p className="text-gray-600">{quote.customer?.email}</p>
                <p className="text-gray-600">{quote.customer?.city}</p>
              </div>
            </div>

            {/* Quote Details */}
            <div>
              <h3 className="font-bold text-sm uppercase text-gray-700 mb-4">Details</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quote Date:</span>
                  <span className="font-semibold">
                    {new Date(quote.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-semibold">
                    {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
                {quote.deliveryLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Location:</span>
                    <span className="font-semibold">{quote.deliveryLocation}</span>
                  </div>
                )}
                {quote.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Date:</span>
                    <span className="font-semibold">
                      {new Date(quote.deliveryDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-y-2 border-gray-300">
                  <th className="p-3 text-left text-xs font-bold uppercase">Product</th>
                  <th className="p-3 text-left text-xs font-bold uppercase">Category</th>
                  <th className="p-3 text-left text-xs font-bold uppercase">Material</th>
                  <th className="p-3 text-right text-xs font-bold uppercase">Qty</th>
                  <th className="p-3 text-right text-xs font-bold uppercase">Unit Price</th>
                  <th className="p-3 text-right text-xs font-bold uppercase">GST %</th>
                  <th className="p-3 text-right text-xs font-bold uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items?.map((item, idx) => {
                  const lineSubtotal = item.quantity * item.unitPrice;
                  const gst = (lineSubtotal * item.gstPercent) / 100;
                  const lineTotal = lineSubtotal + gst - item.discount;

                  return (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3">{item.productName}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3">{item.material}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="p-3 text-right">{item.gstPercent}%</td>
                      <td className="p-3 text-right font-semibold">₹{lineTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-300 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{(quote.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-300 text-sm">
                <span className="text-gray-600">GST:</span>
                <span>₹{(quote.taxTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-300 text-sm">
                <span className="text-gray-600">Discount:</span>
                <span>₹{(quote.discountTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 bg-gray-100 px-3 font-bold text-lg border-t-2 border-gray-400">
                <span>Grand Total:</span>
                <span>₹{(quote.total || itemsTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {quote.remarks && (
            <div className="mb-8 p-4 bg-gray-50 rounded">
              <h4 className="font-bold text-sm mb-2">Remarks</h4>
              <p className="text-sm text-gray-700">{quote.remarks}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-8 border-t border-gray-300">
            <p>This is a computer-generated quotation. No signature required.</p>
            <p>For queries, please contact us.</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .fixed { position: static !important; }
          .inset-0 { all: unset; }
          .bg-black { background: none !important; }
          .rounded-lg { border-radius: 0 !important; }
          .max-w-4xl { max-width: 100% !important; }
          .sticky { position: static !important; }
          .border-b { border-bottom: 1px solid #ddd !important; }
          button { display: none !important; }
          .p-8 { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
