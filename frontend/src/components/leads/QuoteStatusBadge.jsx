import React from 'react';

const statusColors = {
  Draft: 'bg-gray-100 text-gray-800',
  Sent: 'bg-blue-100 text-blue-800',
  Viewed: 'bg-cyan-100 text-cyan-800',
  Negotiation: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Converted: 'bg-purple-100 text-purple-800',
};

export default function QuoteStatusBadge({ status, className = '' }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'} ${className}`}>
      {status}
    </span>
  );
}
