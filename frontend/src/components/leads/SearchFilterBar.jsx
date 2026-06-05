import React from 'react';
import { Search, SlidersHorizontal, MapPin, X, UserCheck } from 'lucide-react';
import { STATUS_OPTIONS } from '../ui/StatusBadge';

const STATUS_COLORS = {
  All: 'text-gray-400 border-gray-600',
  New: 'text-blue-400 border-blue-500/40',
  Hot: 'text-red-400 border-red-500/40',
  'Follow Up': 'text-amber-400 border-amber-500/40',
  Closed: 'text-emerald-400 border-emerald-500/40',
};

const STATUS_BG_ACTIVE = {
  All: 'bg-gray-700',
  New: 'bg-blue-500/20',
  Hot: 'bg-red-500/20',
  'Follow Up': 'bg-amber-500/20',
  Closed: 'bg-emerald-500/20',
};

const SearchFilterBar = ({
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  cityFilter, setCityFilter,
  assigneeFilter, setAssigneeFilter,
  assigneeOptions,
  uniqueCities,
  totalShown, totalLeads,
}) => {
  const hasFilters = searchQuery || statusFilter !== 'All' || cityFilter !== 'All'
    || (assigneeFilter && assigneeFilter !== 'All');

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCityFilter('All');
    if (setAssigneeFilter) setAssigneeFilter('All');
  };

  return (
    <div className="space-y-3">
      {/* Search + City filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, city, inquiry..."
            className="input-field pl-9 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* City filter */}
        <div className="relative sm:w-48">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="input-field pl-8 appearance-none pr-8"
          >
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {assigneeOptions && setAssigneeFilter && (
          <div className="relative sm:w-48">
            <UserCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <select
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="input-field pl-8 appearance-none pr-8"
            >
              {assigneeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Status filter pills + result count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} className="text-gray-500 shrink-0" />
          {['All', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`
                px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-200
                ${STATUS_COLORS[s]}
                ${statusFilter === s
                  ? `${STATUS_BG_ACTIVE[s]} border-opacity-60 shadow-sm`
                  : 'bg-transparent border-surface-border hover:border-opacity-60'
                }
              `}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Result count + clear */}
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500">
            Showing <span className="text-gray-300 font-semibold">{totalShown}</span> of{' '}
            <span className="text-gray-300 font-semibold">{totalLeads}</span> leads
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
