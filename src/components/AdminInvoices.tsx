import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Clock, AlertCircle, Search, 
  Filter, Plus, RefreshCw, Check, X, ShieldCheck, DollarSign,
  Building2, ArrowRight
} from 'lucide-react';
import { Invoice, Brand } from '../types';
import { getInvoices, markInvoiceAsPaid, updateInvoiceStatus, createInvoice } from '../lib/invoices';
import { getBrandSignups, getBrand } from '../lib/storage';

interface AdminInvoicesProps {
  onRefresh?: () => void;
}

export function AdminInvoices({ onRefresh }: AdminInvoicesProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Create manual invoice modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandEmail, setNewBrandEmail] = useState('');
  const [newAmount, setNewAmount] = useState('25000');
  const [newNotes, setNewNotes] = useState('Professional Monthly License');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const invList = getInvoices();
    setInvoices(invList);
    if (invList.length > 0 && !selectedInvoice) {
      setSelectedInvoice(invList[0]);
    }
  };

  const handleMarkPaid = (inv: Invoice) => {
    const proofRef = `ADM-CONFIRM-${Date.now().toString().slice(-6)}`;
    const result = markInvoiceAsPaid(inv.id, proofRef, 'Manual Admin Verification');
    if (result) {
      setActionSuccess(`Invoice ${inv.invoiceNumber} marked as Paid! Brand "${inv.brandName}" upgraded to Professional.`);
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
      if (onRefresh) onRefresh();
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim() || !newBrandEmail.trim()) {
      alert('Please fill brand name and email.');
      return;
    }

    const amt = parseFloat(newAmount) || 25000;
    const inv = createInvoice(
      `brand-${Date.now()}`,
      newBrandName.trim(),
      newBrandEmail.trim(),
      'Professional',
      amt,
      newNotes.trim()
    );

    setActionSuccess(`Manual Invoice ${inv.invoiceNumber} created for ${newBrandName}!`);
    setTimeout(() => setActionSuccess(''), 4000);
    setShowCreateModal(false);
    setNewBrandName('');
    setNewBrandEmail('');
    loadData();
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || 
      inv.invoiceNumber.toLowerCase().includes(q) || 
      inv.brandName.toLowerCase().includes(q) || 
      inv.brandEmail.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  // Calculate Metrics
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0);
  const pendingCount = invoices.filter(i => i.status === 'Pending').length;
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Platform Admin
            </span>
          </div>
          <h2 className="text-xl font-display font-extrabold text-gray-900 mt-1">
            Invoice & Revenue Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit manual bank payments, verify pending transactions, and issue custom billing invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#0F5132] hover:bg-[#145A32] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Issue Manual Invoice
          </button>
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all cursor-pointer"
            title="Refresh Invoices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Admin Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">Total Collected Revenue</span>
          <span className="text-xl font-extrabold text-emerald-700 font-mono block mt-1">
            ₦{totalRevenue.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">{invoices.filter(i => i.status === 'Paid').length} verified payments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">Pending Transfers</span>
          <span className="text-xl font-extrabold text-amber-600 font-mono block mt-1">
            ₦{pendingAmount.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">{pendingCount} invoices awaiting verification</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">Overdue Invoices</span>
          <span className="text-xl font-extrabold text-rose-600 font-mono block mt-1">
            {overdueCount} Overdue
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Payment date elapsed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">Total Invoices</span>
          <span className="text-xl font-extrabold text-gray-900 font-mono block mt-1">
            {invoices.length} Issued
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Across all brand accounts</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice #, brand name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl font-bold text-xs w-full sm:w-auto justify-center">
          {(['All', 'Pending', 'Paid', 'Overdue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === st ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Master Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Brand / Client</th>
                <th className="p-4">Plan / Notes</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Issued / Due</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-all">
                    <td className="p-4 font-mono font-bold text-gray-900">{inv.invoiceNumber}</td>
                    <td className="p-4">
                      <span className="font-bold text-gray-900 block">{inv.brandName}</span>
                      <span className="text-gray-400 text-[11px] block">{inv.brandEmail}</span>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      <span className="font-bold text-gray-900">{inv.planName}</span>
                      {inv.notes && <span className="text-[10px] text-gray-400 block">{inv.notes}</span>}
                    </td>
                    <td className="p-4 font-mono font-bold text-gray-900">₦{inv.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-[11px]">
                      <div>Issued: {inv.invoiceDate}</div>
                      <div>Due: {inv.dueDate}</div>
                    </td>
                    <td className="p-4 text-right">
                      {inv.status !== 'Paid' ? (
                        <button
                          onClick={() => handleMarkPaid(inv)}
                          className="px-3 py-1.5 bg-[#0F5132] hover:bg-[#145A32] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Paid
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 justify-end">
                          <Check className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Manual Invoice */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-lg text-gray-900 mb-1">
              Issue Manual Brand Invoice
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Generate a pending invoice for bank transfer payments.
            </p>

            <form onSubmit={handleCreateInvoice} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Luxe Threads"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Brand Contact Email</label>
                <input
                  type="email"
                  placeholder="e.g. billing@luxethreads.com"
                  value={newBrandEmail}
                  onChange={(e) => setNewBrandEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Invoice Amount (₦)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#0F5132] hover:bg-[#145A32] text-white py-3 rounded-xl font-bold transition-all cursor-pointer"
              >
                Create Invoice
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
