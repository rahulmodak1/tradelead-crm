import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import QuoteTable from '../components/leads/QuoteTable';
import QuoteFilters from '../components/leads/QuoteFilters';
import QuoteModal from '../components/leads/QuoteModal';
import QuoteSendModal from '../components/leads/QuoteSendModal';
import { useQuotes, QUOTATION_STATUSES } from '../hooks/useQuotes';
import { useAuth } from '../hooks/useAuth';
import { canCreateQuotation } from '../utils/permissions';

const QuotesPage = () => {
  const { user } = useAuth();
  const {
    filteredQuotations,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    limit,
    total,
    deleteQuotation,
    duplicateQuotation,
    convertQuotation,
    updateQuotationStatus,
  } = useQuotes();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedForSend, setSelectedForSend] = useState(null);
  const [selectedForEdit, setSelectedForEdit] = useState(null);

  const canCreate = canCreateQuotation(user);

  const handleCreate = () => {
    setSelectedForEdit(null);
    setShowCreateModal(true);
  };

  const handleEdit = (quote) => {
    setSelectedForEdit(quote);
    setShowCreateModal(true);
  };

  const handleSend = (quote) => {
    setSelectedForSend(quote);
    setShowSendModal(true);
  };

  const handleDuplicate = async (quote) => {
    if (window.confirm(`Duplicate quotation ${quote.quoteNumber}?`)) {
      try {
        await duplicateQuotation(quote._id);
      } catch (err) {
        console.error('Failed to duplicate:', err);
      }
    }
  };

  const handleConvert = async (quote) => {
    if (window.confirm(`Convert ${quote.quoteNumber} to order?`)) {
      try {
        await convertQuotation(quote._id);
      } catch (err) {
        console.error('Failed to convert:', err);
      }
    }
  };

  const handleDelete = async (quote) => {
    if (window.confirm(`Delete quotation ${quote.quoteNumber}?`)) {
      try {
        await deleteQuotation(quote._id);
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Quotations</h1>
          <p className="text-gray-400 mt-1">Manage and track your quotations</p>
        </div>
        {canCreate && (
          <button
            onClick={handleCreate}
            className="btn-primary"
          >
            <Plus size={18} />
            Create Quotation
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <QuoteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statuses={QUOTATION_STATUSES}
      />

      {/* Table */}
      <QuoteTable
        quotations={filteredQuotations}
        loading={loading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onSend={handleSend}
        onConvert={handleConvert}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pages, page + 1))}
            disabled={page === pages}
            className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <QuoteModal
          quote={selectedForEdit}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Send Modal */}
      {showSendModal && selectedForSend && (
        <QuoteSendModal
          quote={selectedForSend}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </div>
  );
};

export default QuotesPage;
