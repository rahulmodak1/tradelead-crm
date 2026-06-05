import React from 'react';
import { Search, Filter } from 'lucide-react';
import { QUOTATION_STATUSES } from '../../hooks/useQuotes';

export default function QuoteFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statuses = QUOTATION_STATUSES,
}) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4 space-y-4">
      <div className="flex gap-4 items-end flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Quote # or Customer name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="input-field"
          >
            <option value="All">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
