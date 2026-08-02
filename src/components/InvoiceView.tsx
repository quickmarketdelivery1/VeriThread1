import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Clock, AlertTriangle, Download, 
  Building2, CreditCard, Copy, Check, ExternalLink, ShieldCheck, 
  Filter, ArrowLeft, RefreshCw, Send, Plus
} from 'lucide-react';
import { Invoice, Brand } from '../types';
import { getInvoices, updateInvoiceStatus, createInvoice } from '../lib/invoices';
import { getBrand, checkSubscriptionExpiry } from '../lib/storage';

interface InvoiceViewProps {
  onNavigate?: (route: string) => void;
}

export function InvoiceView({ onNavigate }: InvoiceViewProps) {
  const [brand, setBrand] = useState<Brand>(() => getBrand());
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid' | 'Overdue'>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [proofInput, setProofInput] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofSubmittedSuccess, setProofSubmittedSuccess] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [brand.id]);

  const loadInvoices = () => {
    const b = getBrand();
    setBrand(b);
    let invList = getInvoices(b.id);

    // If brand is on Professional or Starter and has 0 invoices, auto-create one
    if (invList.length === 0) {
      const newInv = createInvoice(
        b.id,
        b.name,
        b.supportEmail || 'billing@verithread.com',
        b.plan === 'professional' ? 'Professional' : 'Starter',
        b.plan === 'professional' ? 25000 : 0,
        b.plan === 'professional' ? 'Professional Monthly Subscription Pass' : 'Free Starter Tier'
      );
      invList = [newInv];
    }

    setInvoices(invList);
    if (!selectedInvoice && invList.length > 0) {
      setSelectedInvoice(invList[0]);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setIsSubmittingProof(true);

    setTimeout(() => {
      const proofRef = proofInput.trim() || `TRF-${Math.floor(100000 + Math.random() * 900000)}`;
      updateInvoiceStatus(selectedInvoice.id, 'Pending', proofRef, 'Bank Transfer');
      setIsSubmittingProof(false);
      setProofSubmittedSuccess('Payment confirmation received! Admin is verifying your transfer.');
      setProofInput('');
      loadInvoices();
    }, 1000);
  };

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter === 'All') return true;
    return inv.status === statusFilter;
  });

  const expiryInfo = checkSubscriptionExpiry(brand);

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans pb-12 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0F5132] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
              Billing & Accounting
            </span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-gray-900 mt-1">
            Invoices & Subscription History
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage payments, download official invoices, and confirm manual bank transfers for <strong className="text-gray-800">{brand.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('overview')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
          )}
          <button
            onClick={loadInvoices}
            className="p-2 text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all cursor-pointer"
            title="Refresh Invoices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#0F5132] to-[#145A32] text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 block">
              Active Plan
            </span>
            <h3 className="text-xl font-extrabold mt-1 uppercase tracking-wide">
              {brand.plan} Plan
            </h3>
            <p className="text-xs text-emerald-100/80 mt-1">
              {brand.plan === 'professional' ? '₦25,000 / month · 250 Monthly QRs' : 'Free Starter Tier · 5 Total QRs'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
            <span>Status: <strong className="text-white">Active</strong></span>
            {brand.subscriptionExpiry && (
              <span>Expires: <strong className="text-white">{new Date(brand.subscriptionExpiry).toLocaleDateString()}</strong></span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
              Next Billing Date
            </span>
            <h3 className="text-xl font-extrabold text-gray-900 mt-1 font-mono">
              {brand.plan === 'starter' ? 'N/A (Free Plan)' : (brand.subscriptionExpiry ? new Date(brand.subscriptionExpiry).toLocaleDateString() : '30 days from payment')}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {expiryInfo.isExpired ? (
                <span className="text-rose-600 font-bold">Subscription Expired</span>
              ) : (
                <span>{expiryInfo.daysRemaining === Infinity ? 'Lifetime Starter' : `${expiryInfo.daysRemaining} days remaining`}</span>
              )}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Auto-Renewal: <strong className="text-gray-800">Manual Transfer / Invoice</strong></span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
              Total Invoices Issued
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
              {invoices.length} Invoice{invoices.length === 1 ? '' : 's'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.filter(i => i.status === 'Paid').length} Paid · {invoices.filter(i => i.status === 'Pending').length} Pending
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => {
                const inv = createInvoice(
                  brand.id,
                  brand.name,
                  brand.supportEmail || 'billing@verithread.com',
                  'Professional',
                  25000,
                  'Professional Monthly Subscription'
                );
                loadInvoices();
                setSelectedInvoice(inv);
              }}
              className="text-xs font-bold text-[#0F5132] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Generate New Renewal Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Invoice List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Invoice List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display font-bold text-sm text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F5132]" /> Invoice Records
            </h3>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-[11px] font-bold">
              {(['All', 'Pending', 'Paid'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    statusFilter === st ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No invoices found under "{statusFilter}".
              </div>
            ) : (
              filteredInvoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#0F5132] bg-emerald-50/40 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-gray-900">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Issued: {inv.invoiceDate} · Due: {inv.dueDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-gray-900 font-mono">
                        ₦{inv.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-medium">
                        {inv.planName}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Invoice Inspector & Bank Details (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-6">
          {selectedInvoice ? (
            <>
              {/* Invoice Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-400">INVOICE</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedInvoice.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedInvoice.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 font-mono mt-1">
                    {selectedInvoice.invoiceNumber}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Print / PDF
                  </button>
                </div>
              </div>

              {/* Invoice Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 font-medium block">Brand Billed</span>
                  <span className="font-bold text-gray-900 block mt-0.5">{selectedInvoice.brandName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Billed Email</span>
                  <span className="font-bold text-gray-900 block mt-0.5 truncate">{selectedInvoice.brandEmail}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Invoice Date</span>
                  <span className="font-bold text-gray-900 block mt-0.5">{selectedInvoice.invoiceDate}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Payment Due</span>
                  <span className="font-bold text-gray-900 block mt-0.5">{selectedInvoice.dueDate}</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Plan</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-3">
                        <span className="font-bold text-gray-900 block">{selectedInvoice.notes || 'VeriThread Professional License'}</span>
                        <span className="text-gray-500 text-[11px]">250 Monthly QRs, AI copy, analytics & white-label passport</span>
                      </td>
                      <td className="p-3 text-center font-bold text-gray-700">{selectedInvoice.planName}</td>
                      <td className="p-3 text-right font-bold font-mono text-gray-900">₦{selectedInvoice.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-emerald-50/50 font-bold border-t border-gray-200 text-xs">
                    <tr>
                      <td colSpan={2} className="p-3 text-right text-gray-700">Total Payable:</td>
                      <td className="p-3 text-right font-mono text-[#0F5132] text-sm">₦{selectedInvoice.amount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Section based on status */}
              {selectedInvoice.status === 'Paid' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-900 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-950">Invoice Paid & Verified</h4>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      Paid via {selectedInvoice.paymentMethod || 'Bank Transfer'} on {selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleDateString() : selectedInvoice.invoiceDate}. Ref: {selectedInvoice.paymentProofRef || 'CONFIRMED'}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 bg-amber-50/60 border border-amber-200 p-5 rounded-2xl">
                  
                  {/* Bank Transfer Details Header */}
                  <div>
                    <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-700" /> Manual Bank Transfer Instructions
                    </h4>
                    <p className="text-xs text-amber-900/80 mt-1">
                      Please make bank transfer of <strong>₦{selectedInvoice.amount.toLocaleString()}</strong> to our official account below and input your reference number.
                    </p>
                  </div>

                  {/* Bank Account Info Box */}
                  <div className="bg-white p-4 rounded-xl border border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">Bank Name</span>
                      <span className="font-bold text-gray-900 block mt-0.5">GTBank / VeriThread</span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">Account Number</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-mono font-bold text-gray-900">0123456789</span>
                        <button
                          onClick={() => copyToClipboard('0123456789', 'acc')}
                          className="text-gray-400 hover:text-gray-700 p-0.5"
                          title="Copy Account Number"
                        >
                          {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">Account Name</span>
                      <span className="font-bold text-gray-900 block mt-0.5">VeriThread Tech Ltd</span>
                    </div>
                  </div>

                  {/* Reference Instruction */}
                  <div className="text-[11px] text-amber-900 bg-amber-100/60 p-2.5 rounded-lg border border-amber-200/60">
                    <strong>Payment Reference:</strong> Please use <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 font-bold">{selectedInvoice.invoiceNumber}</code> as transfer description.
                  </div>

                  {/* Proof Confirmation Form */}
                  <form onSubmit={handleConfirmPayment} className="flex flex-col gap-2 pt-2 border-t border-amber-200/60">
                    <label className="text-[11px] font-bold text-gray-700">
                      Confirm Payment Transfer
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Transfer Reference / Bank Ref No."
                        value={proofInput}
                        onChange={(e) => setProofInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 focus:border-[#0F5132] rounded-xl text-xs font-mono focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingProof}
                        className="px-4 py-2 bg-[#0F5132] text-white hover:bg-[#145A32] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        {isSubmittingProof ? (
                          <span>Submitting...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Confirm Payment</span>
                          </>
                        )}
                      </button>
                    </div>

                    {proofSubmittedSuccess && (
                      <p className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {proofSubmittedSuccess}
                      </p>
                    )}
                  </form>

                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs">
              Select an invoice from the left panel to inspect details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
