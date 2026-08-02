import React, { useState } from 'react';
import { 
  X, Sparkles, Check, ShieldCheck, Building2, Copy, Send, CheckCircle2 
} from 'lucide-react';
import { getBrand } from '../lib/storage';
import { createInvoice, updateInvoiceStatus } from '../lib/invoices';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgraded?: () => void;
}

export function PlanUpgradeModal({ isOpen, onClose, onUpgraded }: PlanUpgradeModalProps) {
  const [brand] = useState(() => getBrand());
  
  // Bank transfer / invoice state
  const [bankRefInput, setBankRefInput] = useState('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [transferSubmittedSuccess, setTransferSubmittedSuccess] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle manual bank transfer invoice creation & confirmation
  const handleConfirmBankTransfer = (e?: React.FormEvent | React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setIsSubmittingTransfer(true);

    setTimeout(() => {
      // Create pending invoice
      const inv = createInvoice(
        brand.id,
        brand.name,
        brand.supportEmail || 'billing@verithread.com',
        'Professional',
        25000,
        'Professional Monthly Subscription Pass'
      );

      const ref = bankRefInput.trim() || `TRF-${Math.floor(100000 + Math.random() * 900000)}`;
      updateInvoiceStatus(inv.id, 'Pending', ref, 'Bank Transfer');

      setIsSubmittingTransfer(false);
      setTransferSubmittedSuccess(`Invoice ${inv.invoiceNumber} created! Admin has been notified to verify your payment of ₦25,000.`);
      
      if (onUpgraded) onUpgraded();
      window.dispatchEvent(new Event('storage'));
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden relative flex flex-col my-8 max-h-[90vh]">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0F5132] to-[#145A32] text-white p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="absolute right-4 top-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer touch-manipulation z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400/20 text-amber-300 text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full border border-amber-400/30 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Professional Tier
            </span>
          </div>

          <h3 className="font-display font-extrabold text-2xl text-white">
            Upgrade Your Brand Plan
          </h3>
          <p className="text-white/80 text-xs mt-1 leading-relaxed max-w-sm">
            Unlock 250 monthly QR generations, advanced analytics, AI copywriter, and digital passports.
          </p>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          
          {/* Features List */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Included in Professional Plan:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                '250 Monthly QR Generations',
                'AI Product Copy Generator',
                'Full Customer Analytics',
                'Custom QR Styles & Logo',
                'Digital Passport Customization',
                'Priority Support & Invoicing'
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Transfer / Manual Invoice Flow */}
          <div className="flex flex-col gap-4">
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex flex-col gap-3 text-xs text-amber-950">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase text-[10px] text-amber-800 tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Official Bank Transfer Details
                </span>
                <span className="font-extrabold font-mono text-sm text-[#0F5132]">
                  ₦25,000 / month
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold block uppercase">Bank Name</span>
                  <span className="font-bold text-gray-900 block mt-0.5">GTBank</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] font-bold block uppercase">Account Number</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-mono font-bold text-gray-900">0123456789</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('0123456789', 'acc')}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        copyToClipboard('0123456789', 'acc');
                      }}
                      className="text-gray-400 hover:text-gray-700 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer touch-manipulation"
                      aria-label="Copy account number"
                    >
                      {copiedField === 'acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] font-bold block uppercase">Account Name</span>
                  <span className="font-bold text-gray-900 block mt-0.5">VeriThread Tech Ltd</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-900 leading-relaxed">
                Please transfer ₦25,000 to the GTBank account above and enter your payment reference or sender name below. An official invoice will be generated and verified by admin.
              </p>
            </div>

            {transferSubmittedSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 font-medium flex flex-col gap-2 animate-fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Payment Confirmation Sent!</span>
                </div>
                <p className="text-emerald-800 text-[11px]">
                  {transferSubmittedSuccess}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onClose();
                  }}
                  className="mt-2 w-full py-3 bg-[#0F5132] text-white rounded-xl font-bold cursor-pointer hover:bg-[#145A32] text-center min-h-[44px] touch-manipulation flex items-center justify-center"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBankTransfer} className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Transaction Reference / Sender Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GTB Transfer Ref 884920 or Sender Name"
                    value={bankRefInput}
                    onChange={(e) => setBankRefInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs font-mono focus:outline-none min-h-[44px]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmBankTransfer}
                  onTouchEnd={(e) => {
                    if (!isSubmittingTransfer) {
                      e.preventDefault();
                      handleConfirmBankTransfer(e);
                    }
                  }}
                  disabled={isSubmittingTransfer}
                  className="w-full bg-[#0F5132] hover:bg-[#145A32] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px] touch-manipulation"
                >
                  {isSubmittingTransfer ? (
                    <span>Generating Invoice & Confirming...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm I Have Made Payment</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Manual Bank Transfer & Printable Invoice Receipt
          </p>

        </div>
      </div>
    </div>
  );
}
