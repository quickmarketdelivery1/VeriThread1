import React, { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, Building2, RefreshCw, AlertCircle, ArrowRight, X } from 'lucide-react';
import { generatePaystackReference, verifyPaystackPayment, initializePaystackCheckout } from '../lib/paystack';

interface PaystackCheckoutModalProps {
  email: string;
  amount: number; // in NGN
  planName: string;
  couponCode?: string;
  onSuccess: (reference: string, amount: number) => void;
  onCancel: () => void;
}

export function PaystackCheckoutModal({
  email,
  amount,
  planName,
  couponCode,
  onSuccess,
  onCancel
}: PaystackCheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'ussd'>('card');
  const [errorMsg, setErrorMsg] = useState('');
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const reference = React.useMemo(() => generatePaystackReference(), []);

  const handlePaystackPayment = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    // Try opening official PaystackPop inline popup first
    const opened = await initializePaystackCheckout({
      key: 'pk_test_verithread_09812347128937129841',
      email,
      amount,
      ref: reference,
      currency: 'NGN',
      metadata: {
        plan: planName,
        couponCode: couponCode || null
      },
      onSuccess: async (res) => {
        const verified = await verifyPaystackPayment(res.reference, email, amount, planName, couponCode);
        if (verified.success) {
          setSuccessRef(res.reference);
          setTimeout(() => {
            onSuccess(res.reference, amount);
          }, 1200);
        } else {
          setErrorMsg(verified.error || 'Payment verification failed');
          setIsProcessing(false);
        }
      },
      onClose: () => {
        setIsProcessing(false);
      }
    });

    // If script popup fails or blocked in sandbox iframe, fallback to instant inline Paystack simulation
    if (!opened) {
      setTimeout(async () => {
        const verified = await verifyPaystackPayment(reference, email, amount, planName, couponCode);
        if (verified.success) {
          setSuccessRef(reference);
          setTimeout(() => {
            onSuccess(reference, amount);
          }, 1000);
        } else {
          setErrorMsg('Payment verification failed');
          setIsProcessing(false);
        }
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col relative">
        
        {/* Header Banner */}
        <div className="bg-[#0F5132] text-white p-6 relative flex flex-col gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold text-xs">
              VT
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
              Paystack Gateway
            </span>
          </div>

          <div>
            <h3 className="text-xl font-display font-bold text-white">Complete Subscription</h3>
            <p className="text-xs text-emerald-100/80 mt-1">
              Official payment channel for VeriThread {planName}
            </p>
          </div>

          <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-emerald-200">Total Due Today:</span>
            <span className="text-2xl font-black text-white font-mono">
              ₦{amount.toLocaleString()}.00 <span className="text-xs font-normal text-emerald-200">NGN</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5">

          {/* Payment Details Box */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex flex-col gap-2 text-xs text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold">Account Email:</span>
              <span className="font-bold text-gray-900">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold">Plan Selected:</span>
              <span className="font-bold text-[#0F5132] uppercase">{planName}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Applied Coupon:</span>
                <span className="font-mono uppercase font-bold">{couponCode}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-500 font-semibold">Payment Reference:</span>
              <span className="font-mono text-[10px] text-gray-600 font-bold">{reference}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Paystack Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#0F5132] bg-emerald-50 text-[#0F5132]'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'bank'
                    ? 'border-[#0F5132] bg-emerald-50 text-[#0F5132]'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Building2 className="w-4 h-4" /> Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('ussd')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'ussd'
                    ? 'border-[#0F5132] bg-emerald-50 text-[#0F5132]'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-4 h-4" /> USSD / QR
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {successRef ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center flex flex-col items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-10 h-10 text-[#0F5132]" />
              <h4 className="font-bold text-emerald-950 text-sm">Payment Verified Successfully!</h4>
              <p className="text-xs text-emerald-800">
                Upgrading your account to Professional Plan...
              </p>
            </div>
          ) : (
            <button
              onClick={handlePaystackPayment}
              disabled={isProcessing}
              className="w-full bg-[#0F5132] hover:bg-[#145A32] text-white py-3.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Paystack Transaction...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay ₦{amount.toLocaleString()} with Paystack <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
            <span>256-bit SSL Encrypted • Powered by Paystack Nigeria</span>
          </div>

        </div>

      </div>
    </div>
  );
}
