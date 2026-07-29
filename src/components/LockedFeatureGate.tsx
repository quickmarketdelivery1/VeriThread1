import React, { useState } from 'react';
import { Lock, Sparkles, Check, CreditCard, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { getBrand, saveBrand, isValidCoupon, checkCoupon, CouponItem } from '../lib/storage';

interface LockedFeatureGateProps {
  featureName: string;
  description: string;
  benefits: string[];
  children: React.ReactNode;
  onPlanUpgraded?: () => void;
}

export default function LockedFeatureGate({
  featureName,
  description,
  benefits,
  children,
  onPlanUpgraded
}: LockedFeatureGateProps) {
  const [brand, setBrand] = useState(() => getBrand());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('4012 8855 9321 0048');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('382');
  const [isLoading, setIsLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);

  const handleApplyCoupon = () => {
    const cp = checkCoupon(coupon);
    if (cp) {
      setAppliedCoupon(cp);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  const handleRefresh = () => {
    const freshBrand = getBrand();
    setBrand(freshBrand);
    if (onPlanUpgraded) onPlanUpgraded();
  };

  const handleUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appliedCoupon || appliedCoupon.type !== 'bypass') {
      if (cardNumber.length < 15 || expiry.length < 4 || cvv.length < 3) {
        alert('Please enter valid credit card details.');
        return;
      }
    }
    setIsLoading(true);

    setTimeout(() => {
      const discountVal = appliedCoupon ? appliedCoupon.discount : 0;
      const amountPaid = 25000 * (1 - discountVal / 100);
      const invoiceStatus = appliedCoupon 
        ? (appliedCoupon.type === 'bypass' ? 'Bypass' : 'Discount Code')
        : 'Paid';

      const updatedBrand = {
        ...brand,
        plan: 'professional' as const,
        billingHistory: [
          ...(brand.billingHistory || []),
          {
            id: `inv-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            amount: amountPaid,
            planName: 'Professional',
            status: invoiceStatus
          }
        ]
      };
      saveBrand(updatedBrand);
      setIsLoading(false);
      setShowUpgradeModal(false);
      handleRefresh();
      // Reload page or trigger reactive change
      window.dispatchEvent(new Event('storage'));
      window.location.reload();
    }, 1800);
  };

  const isLocked = brand.plan === 'starter';

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-white border border-gray-100 rounded-3xl overflow-hidden p-8 flex flex-col items-center justify-center text-center">
      {/* Absolute blur background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/10 via-white to-white pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-lg flex flex-col items-center gap-4">
        {/* Lock Indicator */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0F5132] flex items-center justify-center shadow-inner border border-emerald-100 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>

        {/* Feature Lock Title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-extrabold uppercase bg-[#0F5132]/10 text-[#0F5132] px-3 py-1 rounded-full tracking-wider">
              Professional Feature
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-gray-900 mt-1">
            Unlock {featureName}
          </h2>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed mt-1">
            {description}
          </p>
        </div>

        {/* Benefits Card */}
        <div className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl p-5 text-left mt-2 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            What you're currently missing:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-4">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full sm:flex-1 bg-[#0F5132] hover:bg-[#145A32] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            Upgrade to Professional
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          </button>
        </div>
      </div>

      {/* SECURE PAYSTACK/STRIPE PAYMENT SIMULATOR MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden p-6 relative flex flex-col gap-5 text-left">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full tracking-wider mb-2 inline-block">
                🛡️ Secure Payment Gateway
              </span>
              <h4 className="font-display font-extrabold text-xl text-gray-900">Upgrade to Professional</h4>
              <p className="text-gray-500 text-xs mt-1">Unlock AI tools, advanced analytics, custom QR styles, and remove branding.</p>
            </div>

            <form onSubmit={handleUpgradeSubmit} className="flex flex-col gap-4">
              {/* Payment details banner */}
              <div className="bg-[#0F5132]/5 p-4 rounded-xl border border-[#0F5132]/10 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-[#0F5132]">VeriThread Pro Plan</p>
                  <p className="text-[10px] text-gray-500">250 QRs, AI Tools, White-label</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-[#0F5132]">
                    {appliedCoupon 
                      ? (appliedCoupon.type === 'bypass' ? 'FREE' : `₦${(25000 * (1 - appliedCoupon.discount / 100)).toLocaleString()}`)
                      : '₦25,000'}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    {appliedCoupon ? `${appliedCoupon.discount}% Applied` : 'Per Month'}
                  </p>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="flex flex-col gap-1.5 border-b border-gray-100 pb-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (e.g. FOUNDER15)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    disabled={isLoading || appliedCoupon !== null}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none font-mono uppercase tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isLoading || appliedCoupon !== null || !coupon.trim()}
                    className="px-4 py-2 bg-[#0F5132]/15 text-[#0F5132] hover:bg-[#0F5132]/25 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap"
                  >
                    {appliedCoupon ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-600 font-medium">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-[10px] text-[#0F5132] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#0F5132]" /> 
                    {appliedCoupon.type === 'bypass' 
                      ? '100% discount coupon applied successfully!' 
                      : `Promo coupon applied! ${appliedCoupon.discount}% recurring discount.`}
                  </p>
                )}
              </div>

              {(!appliedCoupon || appliedCoupon.type !== 'bypass') ? (
                <>
                  {/* Card input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Credit Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        placeholder="4012 8855 9321 0048"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none font-mono"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Expiry / CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none font-mono text-center"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none font-mono text-center"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-center text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1 animate-fade-in">
                  💳 Payment checkout bypassed via 100% VIP coupon
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0F5132] hover:bg-[#145A32] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    {appliedCoupon?.type === 'bypass' 
                      ? 'Upgrade Now for Free' 
                      : `Authorize & Pay ₦${appliedCoupon ? (25000 * (1 - appliedCoupon.discount / 100)).toLocaleString() : '25,000'} & Upgrade`}
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
