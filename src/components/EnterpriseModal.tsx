import React, { useState } from 'react';
import { 
  X, Check, Shield, Globe, Headphones, Code, Lock, 
  GraduationCap, Plug, BarChart2, PhoneCall, CheckCircle2, 
  ArrowRight, Clock, Building2, Users, Zap, Send, Sparkles, FileText
} from 'lucide-react';

interface EnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnterpriseModal({ isOpen, onClose }: EnterpriseModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    brandName: '',
    fullName: '',
    email: '',
    phone: '',
    monthlyVolume: '2,000 - 10,000 pieces',
    needsWhiteLabel: true,
    needsCustomDomain: true,
    needsApiAccess: false,
    needsErpIntegration: false,
    additionalNotes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0F5132] text-white p-6 sm:p-8 relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-400/30 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Enterprise Plan — Custom Solutions
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Tailored for Enterprise Fashion Houses
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-xl">
              Get unlimited passports, dedicated white-label setup, custom domain routing, and 24/7 VIP support.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8">
          
          {submitted ? (
            <div className="py-8 text-center space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 bg-emerald-100 text-[#0F5132] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-gray-900">Request Received!</h3>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  Thank you, <strong className="text-gray-900">{formData.fullName}</strong>. Our Enterprise Account Manager will reach out to <strong className="text-gray-900">{formData.email}</strong> within 24 hours with a custom proposal tailored for <strong className="text-gray-900">{formData.brandName || 'your brand'}</strong>.
                </p>
              </div>

              {/* Summary of Request */}
              <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-200 text-left space-y-3 text-xs">
                <p className="font-bold text-[#0F5132] uppercase tracking-wider text-[10px]">Requested Configuration Summary</p>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div><span className="text-gray-400">Monthly Volume:</span> {formData.monthlyVolume}</div>
                  <div><span className="text-gray-400">White Labeling:</span> {formData.needsWhiteLabel ? 'Yes' : 'No'}</div>
                  <div><span className="text-gray-400">Custom Domain:</span> {formData.needsCustomDomain ? 'Yes' : 'No'}</div>
                  <div><span className="text-gray-400">API Access:</span> {formData.needsApiAccess ? 'Yes' : 'No'}</div>
                  <div><span className="text-gray-400">ERP Sync:</span> {formData.needsErpIntegration ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="bg-[#0F5132] hover:bg-[#145A32] text-white px-8 py-3 rounded-full font-semibold text-sm shadow-md transition-all cursor-pointer"
              >
                Back to Site
              </button>
            </div>
          ) : (
            <>
              {/* How To Get Enterprise Timeline */}
              <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
                <h4 className="font-display font-bold text-[#0F5132] text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" /> How To Get Started With Enterprise
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Step 1</span>
                    <span className="font-semibold text-gray-900 block mt-0.5">Submit Form</span>
                    <span className="text-gray-500 text-[11px]">Fill in your brand requirements below</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Step 2</span>
                    <span className="font-semibold text-gray-900 block mt-0.5">24h Outreach</span>
                    <span className="text-gray-500 text-[11px]">Dedicated manager contacts you</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Step 3</span>
                    <span className="font-semibold text-gray-900 block mt-0.5">Custom Quote</span>
                    <span className="text-gray-500 text-[11px]">Tailored contract & SLA proposal</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Step 4</span>
                    <span className="font-semibold text-gray-900 block mt-0.5">VIP Launch</span>
                    <span className="text-gray-500 text-[11px]">Onboarding, training & domain setup</span>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-display text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Contact Sales for Enterprise Custom Quote
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Brand Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Adeleke Atelier"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full bg-[#F8F9FA] border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Person *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Your Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-[#F8F9FA] border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Business Email *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@yourbrand.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#F8F9FA] border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone / WhatsApp *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#F8F9FA] border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Monthly Garment / Product Output</label>
                  <select 
                    value={formData.monthlyVolume}
                    onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all"
                  >
                    <option value="500 - 2,000 pieces">500 - 2,000 pieces / month</option>
                    <option value="2,000 - 10,000 pieces">2,000 - 10,000 pieces / month</option>
                    <option value="10,000+ pieces">10,000+ pieces / month</option>
                  </select>
                </div>

                {/* Capability Checkboxes */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">Enterprise Capabilities Needed:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 bg-[#F8F9FA] p-2.5 rounded-xl border border-gray-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.needsWhiteLabel} 
                        onChange={(e) => setFormData({ ...formData, needsWhiteLabel: e.target.checked })}
                        className="accent-[#0F5132]"
                      />
                      <span>White-Labeling (No VeriThread badge)</span>
                    </label>

                    <label className="flex items-center gap-2 bg-[#F8F9FA] p-2.5 rounded-xl border border-gray-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.needsCustomDomain} 
                        onChange={(e) => setFormData({ ...formData, needsCustomDomain: e.target.checked })}
                        className="accent-[#0F5132]"
                      />
                      <span>Custom Domain (passport.yourbrand.com)</span>
                    </label>

                    <label className="flex items-center gap-2 bg-[#F8F9FA] p-2.5 rounded-xl border border-gray-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.needsApiAccess} 
                        onChange={(e) => setFormData({ ...formData, needsApiAccess: e.target.checked })}
                        className="accent-[#0F5132]"
                      />
                      <span>REST API & Webhook Access</span>
                    </label>

                    <label className="flex items-center gap-2 bg-[#F8F9FA] p-2.5 rounded-xl border border-gray-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.needsErpIntegration} 
                        onChange={(e) => setFormData({ ...formData, needsErpIntegration: e.target.checked })}
                        className="accent-[#0F5132]"
                      />
                      <span>ERP / Shopify / POS Sync</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Additional Notes or Custom Requirements</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe any specific needs, custom integrations, or security requirements..."
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl p-3 text-xs outline-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0F5132] hover:bg-[#145A32] text-white px-7 py-2.5 rounded-full font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Sales Request
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
