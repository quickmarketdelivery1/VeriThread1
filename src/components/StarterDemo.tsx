import React, { useState } from 'react';
import { 
  Lock, AlertTriangle, QrCode, Sparkles, BarChart3, 
  Eye, Users, Heart, Layers, ArrowUpRight, ShieldCheck, Info 
} from 'lucide-react';

interface StarterDemoProps {
  onUpgradeClick: (feature: string) => void;
}

export function StarterDemo({ onUpgradeClick }: StarterDemoProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-[#1C1C1C]">
      
      {/* Starter Encouragement Message */}
      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#0F5132] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-[#0F5132] text-sm">
              Your brand deserves to look professional from day one.
            </h4>
            <p className="text-gray-600 text-xs mt-1 leading-relaxed">
              VeriThread helps emerging designers build trust, showcase their story, and create digital product passports that make every garment feel like part of a real fashion brand.
            </p>
          </div>
        </div>
      </div>

      {/* Starter Plan Banner */}
      <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 block">Starter Plan Mode Active</span>
            <p className="text-amber-800 text-[11px]">
              You are viewing the Starter dashboard. Features like AI Story Generation, Custom QR Colors, and Advanced Analytics are locked.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onUpgradeClick('Professional')}
          className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-xs"
        >
          Upgrade to Professional
        </button>
      </div>

      {/* Brand Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150&h=150"
            alt="Adeleke Atelier"
            className="w-12 h-12 rounded-2xl object-cover border border-gray-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-lg text-gray-900 uppercase tracking-tight">
                Adeleke Atelier
              </h2>
              {/* Starter Has NO Trust Badge */}
              <span className="text-[10px] text-gray-400 italic bg-gray-100 px-2 py-0.5 rounded-full font-sans">
                Unverified (Starter)
              </span>
            </div>
            <p className="text-xs text-gray-500 font-sans">Lagos, Nigeria • Haute Couture & Aso-Oke</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-gray-200">
            Starter Plan
          </span>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Powered by VeriThread
          </span>
        </div>
      </div>

      {/* Usage Meter Card */}
      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#0F5132]" />
            <h3 className="font-bold text-sm text-gray-900">Monthly QR Code Generation Limit</h3>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            12 of 25 Used (48%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '48%' }} />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>13 QRs remaining for current cycle</span>
          <button
            type="button"
            onClick={() => onUpgradeClick('Professional')}
            className="text-[#0F5132] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Increase Limit to 250 QRs <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#0F5132]" /> Active Products
          </span>
          <span className="text-2xl font-black text-gray-900 font-mono">12</span>
          <span className="text-[10px] text-gray-400">Basic catalog limit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-600" /> Total QR Scans
          </span>
          <span className="text-2xl font-black text-gray-900 font-mono">2,847</span>
          <span className="text-[10px] text-emerald-600 font-bold">+14% this month</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-purple-600" /> Registered Owners
          </span>
          <span className="text-2xl font-black text-gray-900 font-mono">1,203</span>
          <span className="text-[10px] text-gray-400">Garment claims</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> Passport Likes
          </span>
          <span className="text-2xl font-black text-gray-900 font-mono">1,177</span>
          <span className="text-[10px] text-gray-400">Customer engagement</span>
        </div>
      </div>

      {/* Feature Locked Section 1: AI Story Generator */}
      <div className="bg-gray-50 border border-dashed border-gray-300 p-6 rounded-3xl relative overflow-hidden flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-sm text-gray-500">AI Garment Story & Craftsmanship Writer</h3>
          </div>
          <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3 h-3 text-gray-600" /> Locked on Starter
          </span>
        </div>

        <div className="bg-white/60 p-4 rounded-2xl border border-gray-200 backdrop-blur-xs text-xs text-gray-400 italic">
          "Sample output: Handcrafted in Lagos using traditional Yoruba weaving techniques passed down through generations..."
        </div>

        <button
          type="button"
          onClick={() => onUpgradeClick('AI Story Generator')}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 border border-gray-300"
        >
          <Lock className="w-4 h-4 text-gray-600" /> Upgrade to Professional to Unlock AI Copywriting
        </button>

        {showTooltip && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-xl z-20">
            AI features require a Professional or Enterprise plan.
          </div>
        )}
      </div>

      {/* Feature Locked Section 2: Advanced Analytics & Heatmaps */}
      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs relative overflow-hidden flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0F5132]" />
            <h3 className="font-bold text-sm text-gray-900">Geographic Scans & Conversion Heatmaps</h3>
          </div>
          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Basic Overview Only
          </span>
        </div>

        {/* Grayed out Mock Chart Overlay */}
        <div className="relative h-44 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4 gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-gray-900">Geographic Breakdown Locked</h4>
            <p className="text-[11px] text-gray-500 max-w-sm">
              Upgrade to Professional to see cities, countries, and live customer scan maps in real-time.
            </p>
            <button
              type="button"
              onClick={() => onUpgradeClick('Advanced Analytics')}
              className="bg-[#0F5132] hover:bg-[#145A32] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer mt-1"
            >
              Unlock Heatmaps ($35/mo)
            </button>
          </div>

          {/* Fake Background Blur Lines */}
          <div className="w-full h-full opacity-30 flex items-end justify-between px-8 pb-4">
            <div className="w-12 bg-emerald-500 h-16 rounded-t-lg" />
            <div className="w-12 bg-emerald-600 h-32 rounded-t-lg" />
            <div className="w-12 bg-emerald-700 h-24 rounded-t-lg" />
            <div className="w-12 bg-emerald-800 h-36 rounded-t-lg" />
          </div>
        </div>
      </div>

    </div>
  );
}

export default StarterDemo;
