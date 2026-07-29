import React from 'react';
import { ShieldCheck, Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Product, Ownership, Brand } from '../types';

interface WarrantyTrackerProps {
  product: Product;
  ownership?: Ownership | null;
  brand?: Brand;
  className?: string;
}

export function WarrantyTracker({ product, ownership, brand, className = '' }: WarrantyTrackerProps) {
  const warrantyPeriodMonths = product.warrantyPeriod || 12;

  // Calculate dates and remaining time
  const registrationDate = ownership?.registrationDate ? new Date(ownership.registrationDate) : null;
  
  let expiryDate: Date;
  if (ownership?.warrantyExpiresAt) {
    expiryDate = new Date(ownership.warrantyExpiresAt);
  } else if (registrationDate) {
    expiryDate = new Date(registrationDate);
    expiryDate.setMonth(expiryDate.getMonth() + warrantyPeriodMonths);
  } else {
    // Default estimated expiry from today if registering now
    expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + warrantyPeriodMonths);
  }

  const now = new Date();
  const isExpired = ownership ? now > expiryDate : false;

  // Calculate remaining months and days
  const timeDiffMs = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(0, Math.floor(daysRemaining / 30));

  return (
    <div className={`bg-[#0F5132]/5 border border-[#0F5132]/15 p-5 rounded-2xl flex flex-col gap-4 ${className}`}>
      
      {/* Header Status Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#0F5132]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0F5132] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#0F5132] uppercase tracking-wider">
              {ownership ? (isExpired ? 'Warranty Expired' : 'Active Ledger Warranty') : 'Standard Manufacturer Warranty'}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium">
              {brand?.name || 'VeriThread Brand'} Protection Policy
            </p>
          </div>
        </div>

        {ownership ? (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
            isExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {isExpired ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3 text-[#0F5132]" />}
            {isExpired ? 'Expired' : 'Verified Active'}
          </span>
        ) : (
          <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Unregistered
          </span>
        )}
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        
        {/* Coverage Duration */}
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#0F5132]" /> Duration
          </span>
          <span className="font-bold text-gray-900 font-mono text-sm">
            {warrantyPeriodMonths} Months
          </span>
        </div>

        {/* Expiration Date */}
        <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#0F5132]" /> Expiration Date
          </span>
          <span className="font-bold text-gray-900 font-mono text-xs truncate">
            {expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>

      </div>

      {/* Countdown / Remaining Time Banner */}
      <div className="bg-white border border-[#0F5132]/10 p-3 rounded-xl flex items-center justify-between text-xs">
        <span className="text-gray-600 font-medium text-[11px]">Remaining Coverage:</span>
        <span className="font-bold font-mono text-[#0F5132] bg-emerald-50 px-2.5 py-1 rounded-lg">
          {ownership ? (
            isExpired ? '0 days remaining' : `${monthsRemaining > 0 ? `${monthsRemaining}m ` : ''}${daysRemaining % 30}d remaining`
          ) : (
            `${warrantyPeriodMonths} months upon registration`
          )}
        </span>
      </div>

    </div>
  );
}

export default WarrantyTracker;
