import React, { useState } from 'react';
import { Mail, User, Lock, Building2, MapPin, Tag, ShieldCheck, CheckCircle, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { registerUser } from '../lib/firebase';
import { validateCouponCode, CouponValidationResult } from '../lib/coupons';
import { PaystackCheckoutModal } from './PaystackCheckoutModal';

interface SignupPageProps {
  onNavigate: (route: string) => void;
  onSignupSuccess?: (name: string, email: string, plan: any) => void;
}

const BRAND_TYPES = [
  'Native Wear',
  'Streetwear',
  'Luxury Fashion',
  'Ready-to-Wear',
  'Bespoke Tailoring',
  'Accessories',
  'Other'
];

const PLAN_OPTIONS = [
  { value: 'Starter', label: 'Starter (Free)' },
  { value: 'Professional', label: 'Professional (₦25,000/mo)' },
  { value: 'Enterprise', label: 'Enterprise (Contact Sales)' }
];

export default function SignupPage({ onNavigate }: SignupPageProps) {
  const [fullName, setFullName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandType, setBrandType] = useState('Native Wear');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandLocation, setBrandLocation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [plan, setPlan] = useState('Starter');
  const [showEnterpriseConfirmation, setShowEnterpriseConfirmation] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [paystackAmount, setPaystackAmount] = useState(25000);
  const [pendingSignupPayload, setPendingSignupPayload] = useState<any>(null);

  const executeFinalSignup = async (payload: any) => {
  // 🔥 FIRST: Check if Enterprise plan
  if (payload.plan?.toLowerCase() === 'enterprise') {
    localStorage.setItem('vt_signup_metadata', JSON.stringify({
      fullName: payload.fullName,
      brandName: payload.brandName,
      brandType: payload.brandType,
      brandDescription: payload.brandDescription,
      brandLocation: payload.brandLocation,
      email: payload.email,
      plan: payload.plan,
      couponCode: payload.couponCode || null,
      hasDevAccess: payload.hasDevAccess,
      paystackReference: payload.paystackReference || null,
      paidAmount: payload.paidAmount || null
    }));
    setShowEnterpriseConfirmation(true);
    return;
  }

  // ✅ THEN: Continue with loading state for Starter/Professional
  setIsLoading(true);
  try {
    localStorage.setItem('vt_signup_metadata', JSON.stringify({
      fullName: payload.fullName,
      brandName: payload.brandName,
      brandType: payload.brandType,
      brandDescription: payload.brandDescription,
      brandLocation: payload.brandLocation,
      email: payload.email,
      plan: payload.plan,
      couponCode: payload.couponCode || null,
      hasDevAccess: payload.hasDevAccess,
      paystackReference: payload.paystackReference || null,
      paidAmount: payload.paidAmount || null
    }));

    await registerUser(payload);

    setIsLoading(false);
    setIsSubmitted(true);

    if (onSignupSuccess) {
      onSignupSuccess(
        payload.fullName,
        payload.email,
        payload.plan,
        payload.hasDevAccess,
        payload.brandName,
        payload.brandType,
        payload.brandDescription,
        payload.brandLocation
      );
    }
  } catch (err: any) {
    setIsLoading(false);
    setGeneralError(err?.message || 'Failed to create account. Please try again.');
  }
};

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      setAppliedCoupon(null);
      return;
    }

    const result = validateCouponCode(couponInput, plan);
    if (!result.isValid) {
      setCouponError(result.error || 'Invalid coupon code');
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(result);
      setCouponError('');
    }
  };

  const handlePlanChange = (newPlan: string) => {
    setPlan(newPlan);
    setCouponError('');
    if (couponInput.trim()) {
      const result = validateCouponCode(couponInput, newPlan);
      if (result.isValid) {
        setAppliedCoupon(result);
      } else {
        setAppliedCoupon(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setCouponError('');

    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!brandName.trim()) newErrors.brandName = 'Brand Name is required';
    if (!brandType) newErrors.brandType = 'Brand Type is required';
    if (!brandDescription.trim()) newErrors.brandDescription = 'Brand Description is required';
    if (!brandLocation.trim()) newErrors.brandLocation = 'Brand Location is required';
    if (!email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Valid Email Address is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate coupon code if entered
    let couponCode = '';
    let hasDevAccess = false;

    if (couponInput.trim()) {
      const couponResult = validateCouponCode(couponInput, plan);
      if (!couponResult.isValid) {
        setCouponError(couponResult.error || 'Invalid coupon code');
        setGeneralError('Invalid coupon code');
        return;
      }
      couponCode = couponResult.code;
      hasDevAccess = couponResult.grantsDevAccess;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check plan price
    const isProPlan = plan.toLowerCase() === 'professional' || plan.toLowerCase() === 'pro';
    let finalPrice = isProPlan ? 25000 : 0;

    if (isProPlan && couponInput.trim()) {
      const couponResult = validateCouponCode(couponInput, plan);
      if (couponResult.isValid) {
        finalPrice = couponResult.discountedPrice;
      }
    }

    const signupPayload = {
      fullName: fullName.trim(),
      brandName: brandName.trim(),
      brandType,
      brandDescription: brandDescription.trim(),
      brandLocation: brandLocation.trim(),
      email: email.trim(),
      password,
      plan,
      couponCode: couponCode || undefined,
      hasDevAccess: hasDevAccess || undefined
    };

    if (isProPlan && finalPrice > 0) {
      setPendingSignupPayload(signupPayload);
      setPaystackAmount(finalPrice);
      setShowPaystackModal(true);
    } else {
      await executeFinalSignup(signupPayload);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 bg-emerald-100 text-[#0F5132] rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Account Created!</h2>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              We have sent a verification email to <strong className="text-gray-900">{email}</strong>. Please check your inbox and click the verification link before logging in.
            </p>
          </div>
          <div className="flex justify-center w-full mt-2">
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto min-w-[160px] max-w-xs bg-[#0F5132] hover:bg-[#145A32] text-white py-2.5 px-6 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Go to Login <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (showEnterpriseConfirmation) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center flex flex-col items-center gap-5">
        <div className="w-16 h-16 bg-[#0F5132] text-white rounded-full flex items-center justify-center text-3xl">
          <Mail className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">🎉 Thank You!</h2>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            Your Enterprise plan request has been received.
          </p>
          <p className="text-gray-500 text-xs mt-3 leading-relaxed">
            Our team will review your application and contact you within 24-48 hours.
          </p>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            We'll be in touch soon!
          </p>
        </div>
        <button
          onClick={() => onNavigate('landing')}
          className="w-full sm:w-auto min-w-[160px] max-w-xs bg-[#0F5132] hover:bg-[#145A32] text-white py-2.5 px-6 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center py-12 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-6 sm:p-10 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div 
            onClick={() => onNavigate('')}
            className="w-12 h-12 rounded-xl bg-[#0F5132] flex items-center justify-center text-white font-display font-bold text-2xl shadow-md cursor-pointer"
          >
            V
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 tracking-tight mt-1">Create Your Brand Account</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Join VeriThread to publish Digital Product Passports for your products.</p>
        </div>

        {generalError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>{generalError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Section: User Information */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Owner Credentials</h3>
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Adeleke Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900`}
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="founder@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Plan Selection</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <select
  value={plan}
  onChange={(e) => handlePlanChange(e.target.value)}
  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900 cursor-pointer font-medium"
>
  <option value="Starter">Starter (Free)</option>
  <option value="Professional">Professional (₦25,000/mo)</option>
  <option value="Enterprise" disabled className="text-gray-400">
    Enterprise (Contact Sales)
  </option>
</select>
                </div>
              </div>
            </div>

            {/* Plan Onboarding Encouragement Panel */}
            <div className="p-4 rounded-xl border text-xs leading-relaxed transition-all animate-fade-in shadow-2xs">
              {plan === 'Starter' && (
                <div className="bg-emerald-50/80 border-emerald-200 text-emerald-900 p-3 rounded-lg space-y-1">
                  <p className="font-bold text-[#0F5132] text-xs">
                    Your brand deserves to look professional from day one.
                  </p>
                  <p className="text-gray-600 text-[11px] leading-normal">
                    VeriThread helps emerging designers build trust, showcase their story, and create digital product passports that make every garment feel like part of a real fashion brand.
                  </p>
                </div>
              )}

              {plan === 'Professional' && (
                <div className="bg-blue-50/80 border-blue-200 text-blue-900 p-3 rounded-lg space-y-1">
                  <p className="font-bold text-blue-900 text-xs">
                    You’re no longer just starting—you’re building a brand that people can return to.
                  </p>
                  <p className="text-gray-600 text-[11px] leading-normal">
                    Use VeriThread to connect products, customers, scans, and post-purchase experiences into one growing ecosystem.
                  </p>
                </div>
              )}

              {plan === 'Enterprise' && (
                <div className="bg-amber-50/80 border-amber-200 text-amber-950 p-3 rounded-lg space-y-1">
                  <p className="font-bold text-amber-900 text-xs">
                    Built for brands where authenticity, ownership, and reputation must scale together.
                  </p>
                  <p className="text-gray-600 text-[11px] leading-normal">
                    Enterprise is built for established fashion houses requiring advanced authenticity, ownership tracking, compliance support, and connected customer experiences across every product.
                  </p>
                </div>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#0F5132]" /> Have a Coupon Code?
                </label>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Professional Plan Offer
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your coupon code (optional)"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError('');
                  }}
                  className="flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-[#0F5132] hover:bg-[#145A32] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <div className="text-red-600 text-xs font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{couponError}</span>
                </div>
              )}

              {appliedCoupon && appliedCoupon.isValid && (
                <div className="bg-white border border-emerald-200 p-3 rounded-lg text-xs text-emerald-900 flex flex-col gap-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1 text-[#0F5132]">
                      <CheckCircle className="w-4 h-4 text-[#0F5132]" /> Coupon {appliedCoupon.code} Applied!
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
                      {appliedCoupon.formattedDiscount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 text-[11px] mt-1">
                    <span>Professional Plan Price:</span>
                    <span className="font-bold text-gray-900">
                      {appliedCoupon.isFree ? 'FREE (₦0/month)' : `₦${appliedCoupon.discountedPrice.toLocaleString()}/month`}
                    </span>
                  </div>
                  {appliedCoupon.grantsDevAccess && (
                    <div className="mt-1 pt-1.5 border-t border-emerald-100 font-bold text-emerald-800 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0F5132]" />
                      <span>Developer Admin Access Granted</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900`}
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <hr className="border-gray-100 my-1" />

          {/* Section: Brand Profile */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Brand Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Brand Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adeleke Atelier"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.brandName ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900`}
                  />
                </div>
                {errors.brandName && <p className="text-red-500 text-xs mt-1">{errors.brandName}</p>}
              </div>

              {/* Brand Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Brand Type</label>
                <select
                  value={brandType}
                  onChange={(e) => setBrandType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900 cursor-pointer"
                >
                  {BRAND_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand Location */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Brand Location (City, State)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Lagos, Nigeria"
                  value={brandLocation}
                  onChange={(e) => setBrandLocation(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${errors.brandLocation ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900`}
                />
              </div>
              {errors.brandLocation && <p className="text-red-500 text-xs mt-1">{errors.brandLocation}</p>}
            </div>

            {/* Brand Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Brand Description</label>
              <textarea
                rows={3}
                required
                placeholder="Brief description of your brand's craft, vision, or products..."
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                className={`w-full p-3 bg-gray-50 border ${errors.brandDescription ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900`}
              />
              {errors.brandDescription && <p className="text-red-500 text-xs mt-1">{errors.brandDescription}</p>}
            </div>
          </div>

          <div className="flex justify-center mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[160px] max-w-xs bg-[#0F5132] hover:bg-[#145A32] text-white py-2.5 px-6 rounded-xl font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#0F5132] font-bold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>

        {showPaystackModal && pendingSignupPayload && (
          <PaystackCheckoutModal
            email={pendingSignupPayload.email}
            amount={paystackAmount}
            planName={pendingSignupPayload.plan}
            couponCode={pendingSignupPayload.couponCode}
            onSuccess={async (ref, amt) => {
              setShowPaystackModal(false);
              await executeFinalSignup({
                ...pendingSignupPayload,
                paystackReference: ref,
                paidAmount: amt
              });
            }}
            onCancel={() => {
              setShowPaystackModal(false);
            }}
          />
        )}

      </div>
    </div>
  );
}
