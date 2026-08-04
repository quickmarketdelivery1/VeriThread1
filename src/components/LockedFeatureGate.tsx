import React, { useState } from 'react';
import { Lock, Sparkles, Check } from 'lucide-react';
import { getBrand } from '../lib/storage';
import { PlanUpgradeModal } from './PlanUpgradeModal';

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

  const handleRefresh = () => {
    const freshBrand = getBrand();
    setBrand(freshBrand);
    if (onPlanUpgraded) onPlanUpgraded();
  };

  const isLocked = brand.plan === 'starter';

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-white border border-gray-100 rounded-3xl overflow-hidden p-8 flex flex-col items-center justify-center text-center font-sans">
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
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
            What's Unlocked in Professional:
          </span>
          <ul className="space-y-2.5">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-[#0F5132] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
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

      {/* Clean Manual Bank Transfer / Invoice Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgraded={() => {
          setShowUpgradeModal(false);
          handleRefresh();
        }}
      />
    </div>
  );
}
