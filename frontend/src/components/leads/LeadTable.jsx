/**
 * LeadTable.jsx — updated for Parts 3, 4, 5
 *
 * Changes from original:
 *  - WhatsApp href now uses leadWhatsAppURL() from phoneUtils
 *    which: strips HTML, removes country code duplication,
 *    and injects the personalized TradeIndia message template
 *  - Call button kept as-is (href="tel:...")
 *  - All other columns, sort, action menu: unchanged
 */
import React, { useState } from 'react';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Pencil, Trash2, MoreVertical,
  Calendar, Eye, Copy, PhoneCall,
} from 'lucide-react';
import StatusBadge, { STATUS_OPTIONS } from "../ui/StatusBadge";
import { format } from 'date-fns';
// PART 3+4: import the utility — one import, used everywhere
import { leadWhatsAppURL, cleanPhone } from "../../utils/phoneUtils";
import { useNavigate } from "react-router-dom";

// ─── Sort icon ─────────────────────────────────────────────────────────────────

const SortIcon = ({ columnKey, sortConfig }) => {
  if (sortConfig.key !== columnKey) return <ChevronsUpDown size={12} className="text-gray-600" />;
  return sortConfig.direction === 'asc'
    ? <ChevronUp   size={12} className="text-brand-400" />
    : <ChevronDown size={12} className="text-brand-400" />;
};

// ─── Action menu ───────────────────────────────────────────────────────────────
const ActionMenu = ({ lead, onEdit, onDelete, onStatusChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg hover:bg-surface-hover text-gray-500 hover:text-white transition-colors"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-surface-card border border-surface-border rounded-xl shadow-card p-1.5 w-52 animate-fade-in">
            <button
              onClick={() => { onEdit(lead); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
            >
              <Pencil size={13} /> Edit Lead
            </button>
            {/* PART 3: copy the cleaned number, not the raw one */}
            <button
              onClick={() => { navigator.clipboard.writeText(cleanPhone(lead.phone)); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
            >
              <Copy size={13} /> Copy Phone
            </button>

            <div className="my-1 border-t border-surface-border" />

            <p className="px-3 py-1 text-[10px] text-gray-600 uppercase font-semibold tracking-wide">
              Change Status
            </p>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { onStatusChange(lead._id, s); setOpen(false); }}
                disabled={lead.status === s}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-lg transition-colors
                  ${lead.status === s
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white hover:bg-surface-hover'
                  }`}
              >
                <StatusBadge status={s} showIcon={false} />
                {s === lead.status && (
                  <span className="ml-auto text-[9px] text-gray-500">current</span>
                )}
              </button>
            ))}

            <div className="my-1 border-t border-surface-border" />

            <button
              onClick={() => { onDelete(lead._id); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={13} /> Delete Lead
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Column definitions ────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'customerName', label: 'Customer',   sortable: true  },
  { key: 'phone',        label: 'Phone',      sortable: false },
  { key: 'company',      label: 'Company',    sortable: true  },
  { key: 'city',         label: 'City',       sortable: true  },
  { key: 'inquiry',      label: 'Inquiry',    sortable: false },
  { key: 'status',       label: 'Status',     sortable: true  },
  { key: 'followUpDate', label: 'Follow-up',  sortable: true  },
  { key: 'actions',      label: '',           sortable: false },
];

// ─── LeadTable ─────────────────────────────────────────────────────────────────
const LeadTable = ({
  
  leads,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onStatusChange,
  loading,
  
  // PART 4: current user name for WhatsApp message signature
  currentUserName = 'Sales Team',
}) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d    = new Date(dateStr);
      const today = new Date();
      const diff  = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
      const fmt   = format(d, 'dd MMM yy');
      if (diff === 0)  return <span className="text-amber-400 font-semibold">{fmt} (Today)</span>;
      if (diff === 1)  return <span className="text-amber-400">{fmt} (Tomorrow)</span>;
      if (diff < 0)    return <span className="text-red-400">{fmt} (Overdue)</span>;
      return <span className="text-gray-400">{fmt}</span>;
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-2 border-surface-border border-t-brand-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading leads…</p>
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center">
          <Eye size={28} className="text-gray-600" />
        </div>
        <p className="text-gray-400 font-semibold">No leads found</p>
        <p className="text-gray-600 text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b border-surface-border">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`
                  px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500
                  ${col.sortable ? 'cursor-pointer hover:text-gray-300 select-none' : ''}
                  ${col.key === 'actions' ? 'w-10' : ''}
                `}
                onClick={() => col.sortable && onSort(col.key)}
              >
                <span className="flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && <SortIcon columnKey={col.key} sortConfig={sortConfig} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-surface-border/50">
          {leads.map((lead) => {
            /**
             * PART 3 + 4 + 5:
             * leadWhatsAppURL does all heavy lifting:
             *   1. cleanPhone strips HTML, removes +91/91/0 prefix
             *   2. buildWhatsAppMessage fills the template with lead data
             *   3. Returns https://wa.me/91{number}?text={encoded}
             */
            const waURL = leadWhatsAppURL(lead, currentUserName);

            return (
             <tr
  key={lead._id}
  onClick={() => navigate(`/leads/${lead._id}`)}
  className="hover:bg-surface-hover transition-colors duration-150 group animate-row cursor-pointer"
>

                {/* Customer */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600/40 to-brand-800/40 border border-brand-500/20 flex items-center justify-center shrink-0">
                      <span className="text-brand-400 font-bold text-xs">
                        {lead.customerName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-200 leading-tight">{lead.customerName}</p>
                      {lead.email && (
                        <p className="text-xs text-gray-600 leading-tight truncate max-w-[140px]">
                          {lead.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Phone — show cleaned number visually */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-mono text-xs">
                      {cleanPhone(lead.phone) || lead.phone}
                    </span>
                    <a
                      href={`tel:${cleanPhone(lead.phone) || lead.phone}`}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-surface-hover text-gray-500 hover:text-blue-400 transition-all"
                      title="Call"
                    >
                      <PhoneCall size={12} />
                    </a>
                  </div>
                </td>

                {/* Company */}
                <td className="px-4 py-3.5">
                  <p className="text-gray-300 font-medium max-w-[160px] truncate" title={lead.company}>
                    {lead.company}
                  </p>
                </td>

                {/* City */}
                <td className="px-4 py-3.5">
                  <span className="text-gray-400 text-xs bg-surface-hover px-2 py-1 rounded-lg border border-surface-border">
                    {lead.city || '—'}
                  </span>
                </td>

                {/* Inquiry */}
                <td className="px-4 py-3.5">
                  <p className="text-gray-400 max-w-[180px] truncate text-xs" title={lead.inquiry}>
                    {lead.inquiry || '—'}
                  </p>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                  <StatusBadge status={lead.status} />
                </td>

                {/* Follow-up */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-gray-600 shrink-0" />
                    <span className="text-xs">{formatDate(lead.followUpDate)}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    {/* PART 5: WhatsApp — cleaned number + personalized message */}
                    <a
                       href={waURL}
  onClick={(e) => e.stopPropagation()}
  target="_blank"
  rel="noopener noreferrer"
                      title="Send WhatsApp"
                      className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/20"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>

                    {/* More actions menu */}
                 <div onClick={(e) => e.stopPropagation()}>
  <ActionMenu
    lead={lead}
    onEdit={onEdit}
    onDelete={onDelete}
    onStatusChange={onStatusChange}
  />
</div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
