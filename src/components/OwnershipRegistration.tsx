import React, { useState } from 'react';
import { ShieldCheck, User, Mail, Phone, ArrowRight, CheckCircle2, Sparkles, MessageCircle, Instagram, ShoppingBag, Calendar } from 'lucide-react';
import { Product, Brand, Ownership, Customer } from '../types';
import { registerWarranty } from '../lib/storage';

interface OwnershipRegistrationProps {
  product: Product;
  brand: Brand;
  existingOwnership?: Ownership | null;
  existingCustomer?: Customer | null;
  onRegisterSuccess?: (res: { customer: Customer; ownership: Ownership }) => void;
  onNavigate?: (route: string) => void;
  className?: string;
}

export function OwnershipRegistration({
  product,
  brand,
  existingOwnership,
  existingCustomer,
  onRegisterSuccess,
  onNavigate,
  className = ''
}: OwnershipRegistrationProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredData, setRegisteredData] = useState<{ customer: Customer; ownership: Ownership } | null>(
    existingOwnership && existingCustomer ? { customer: existingCustomer, ownership: existingOwnership } : null
  );

  const activeOwnership = registeredData?.ownership || existingOwnership;
  const activeCustomer = registeredData?.customer || existingCustomer;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      alert('Please fill out your Full Name and Email Address.');
      return;
    }

    setIsSubmitting(true);

    const parts = fullName.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || 'Owner';

    setTimeout(() => {
      const res = registerWarranty(product.id, {
        email: email.trim(),
        firstName,
        lastName,
        phone: phone.trim() || undefined
      });

      if (res.success && res.customer && res.ownership) {
        const payload = { customer: res.customer, ownership: res.ownership };
        setRegisteredData(payload);
        if (onRegisterSuccess) {
          onRegisterSuccess(payload);
        }
      }
      setIsSubmitting(false);
    }, 1000);
  };

  const getWhatsAppUrl = () => {
    const text = `Hello ${brand.name}, I just registered ownership for my "${product.name}" (SKU: ${product.sku})!`;
    const num = product.buyNowValue ? product.buyNowValue.replace(/[^0-9+]/g, '') : '2348123456789';
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  const getInstagramUrl = () => {
    const handle = brand.name ? brand.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'verithread';
    return `https://instagram.com/${handle}`;
  };

  // Format expiration date
  const expDateStr = activeOwnership?.warrantyExpiresAt
    ? new Date(activeOwnership.warrantyExpiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  return (
    <div className={`bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col gap-5 ${className}`}>
      
      {/* Registered Celebration View */}
      {activeOwnership ? (
        <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
          
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#0F5132] flex items-center justify-center shadow-md animate-bounce">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block mx-auto">
              Verified Owner
            </span>
            <h3 className="text-xl font-display font-extrabold text-gray-900 mt-1">
              🎉 Welcome to the {brand.name} Family!
            </h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              You are now the officially verified owner of <strong className="text-gray-900 font-bold">{product.name}</strong> on the cryptographically secured VeriThread Ledger.
            </p>
          </div>

          {/* Warranty Info Card */}
          <div className="w-full bg-[#0F5132] text-white p-4 rounded-2xl flex flex-col gap-2 text-left shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Active Warranty Certificate
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>

            <div className="mt-1 pt-2 border-t border-white/10 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-emerald-200 block">Owner Name</span>
                <span className="font-bold text-sm text-white">{activeCustomer?.firstName} {activeCustomer?.lastName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-200 block flex items-center gap-1 justify-end">
                  <Calendar className="w-3 h-3" /> Expires On
                </span>
                <span className="font-bold text-xs text-emerald-100 font-mono">{expDateStr}</span>
              </div>
            </div>
          </div>

          {/* Next Steps / Actions */}
          <div className="w-full pt-2 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Next Actions</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0F5132] text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-emerald-200/60"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#0F5132]" /> Chat WhatsApp
              </a>
              <a
                href={getInstagramUrl()}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-pink-200/60"
              >
                <Instagram className="w-3.5 h-3.5" /> Instagram
              </a>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('')}
                  className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Browse Products
                </button>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Registration Form */
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0F5132]" />
              <h3 className="font-display font-bold text-lg text-gray-900">Register Garment Ownership</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Claim official ownership on the VeriThread ledger to activate your {product.warrantyPeriod || 12}-month manufacturer warranty and prove authenticity.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-1">
            
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1 block">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Adewale Adeleke"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1 block">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. adewale@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1 block">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="e.g. +234 812 345 6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0F5132] hover:bg-[#145A32] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <span>Registering Ownership...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Register Ownership & Activate Warranty <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            By registering, your ownership record will be stored on the VeriThread ledger. We respect your privacy.
          </p>

        </form>
      )}

    </div>
  );
}

export default OwnershipRegistration;
