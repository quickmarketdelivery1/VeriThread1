import React, { useState } from 'react';
import { Flag, X, Upload, CheckCircle2, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Report } from '../types';
import { saveReport } from '../lib/storage';
import { saveReportFirestore } from '../lib/firebase';

interface ReportBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  brandName: string;
  productId: string;
  productName: string;
}

const REPORT_REASONS = [
  "Product doesn't match description",
  "Fake product / counterfeit",
  "Wrong fabric or material",
  "Wrong size or fit",
  "Brand not responding to messages",
  "Suspicious or fraudulent activity",
  "Other"
];

export default function ReportBrandModal({
  isOpen,
  onClose,
  brandId,
  brandName,
  productId,
  productName
}: ReportBrandModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [imageEvidence, setImageEvidence] = useState<string | undefined>(undefined);
  const [imageName, setImageName] = useState<string>('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    setError(null);
    setImageName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageEvidence(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!details.trim() || details.trim().length < 10) {
      setError('Please provide at least 10 characters describing the issue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newReport: Report = {
        id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        brandId: brandId || 'unknown_brand',
        brandName: brandName || 'VeriThread Brand',
        productId: productId || 'unknown_product',
        productName: productName || 'Garment',
        reason,
        details: details.trim(),
        email: email.trim() || undefined,
        imageEvidence,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // 1. Save locally
      saveReport(newReport);

      // 2. Save to Firestore in background
      await saveReportFirestore(newReport);

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting report:', err);
      setIsSubmitting(false);
      // Even if Firestore fails, local report is saved
      setIsSubmitted(true);
    }
  };

  const handleResetAndClose = () => {
    setReason(REPORT_REASONS[0]);
    setDetails('');
    setEmail('');
    setImageEvidence(undefined);
    setImageName('');
    setError(null);
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative overflow-hidden border border-gray-150 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-gray-900">
                  Report {brandName || 'Brand'}
                </h3>
                <p className="text-xs text-gray-500">
                  Product: <span className="font-semibold text-gray-700">{productName}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              We take authenticity and consumer trust seriously. Reports are investigated by our security team to ensure provenance standard compliance.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Reason Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Reason for Report <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#0F5132] focus:bg-white transition-all cursor-pointer font-sans"
                >
                  {REPORT_REASONS.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Additional Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Please describe the discrepancy or issue in detail..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#0F5132] focus:bg-white transition-all resize-none font-sans"
                  required
                />
                <span className="text-[10px] text-gray-400 block mt-1">Minimum 10 characters</span>
              </div>

              {/* Upload Image Evidence (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Upload Evidence (Optional)
                </label>
                
                {imageEvidence ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 flex items-center gap-3">
                    <img 
                      src={imageEvidence} 
                      alt="Evidence preview" 
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{imageName || 'evidence.jpg'}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Image uploaded</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setImageEvidence(undefined); setImageName(''); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl bg-gray-50 hover:bg-emerald-50/50 cursor-pointer transition-all text-xs font-medium text-gray-600">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span>Upload photo proof (JPG/PNG max 5MB)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Optional Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Your Email Address (Optional for status updates)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#0F5132] focus:bg-white transition-all font-sans"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#0F5132] hover:bg-[#145A32] text-white rounded-full text-xs font-semibold cursor-pointer shadow-md transition-all flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Flag className="w-3.5 h-3.5" /> Submit Report
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Confirmation Success State */
          <div className="py-6 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0F5132] flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-gray-900">
                Report Submitted
              </h3>
              <p className="text-xs text-gray-600 mt-2 max-w-xs leading-relaxed">
                Thank you for your report. We will investigate this claim thoroughly to uphold VeriThread ledger standards.
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="mt-4 px-6 py-2.5 bg-[#0F5132] hover:bg-[#145A32] text-white rounded-full text-xs font-semibold cursor-pointer shadow-md transition-all active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
