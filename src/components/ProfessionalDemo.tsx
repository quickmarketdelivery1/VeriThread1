import React, { useState } from 'react';
import { 
  Sparkles, QrCode, BarChart3, Eye, Users, Heart, 
  Layers, CheckCircle2, Globe, Palette, Sliders, RefreshCw, ArrowUpRight
} from 'lucide-react';
import ProfessionalBadge from './ProfessionalBadge';

interface ProfessionalDemoProps {
  onUpgradeClick?: (feature: string) => void;
}

export function ProfessionalDemo({ onUpgradeClick }: ProfessionalDemoProps) {
  const [aiStory, setAiStory] = useState(
    "Hand-woven Aso-Oke jacket featuring 100% organic cotton threads sourced from Oyo State artisans. Designed with reinforced seams, luxury brass buttons, and a unique cryptographic thread matrix."
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#2563EB');

  const handleGenerateAi = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const variations = [
        "Crafted in Adeleke Atelier's Lagos workshop. Each garment requires 48 hours of meticulous hand-stitching with certified organic dye techniques.",
        "An embodiment of modern African luxury. Combining heritage weaving patterns with modern silhouette architecture for the global connoisseur.",
        "Limited edition capsule piece. Integrated with a VeriThread digital passport verifying artisan origin, GSM fabric density, and lifetime warranty."
      ];
      setAiStory(variations[Math.floor(Math.random() * variations.length)]);
      setIsGeneratingAi(false);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-[#1C1C1C]">
      
      {/* Professional Encouragement Message */}
      <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex items-start gap-3 text-xs shadow-2xs">
        <Sparkles className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-950 text-sm">
            You’re no longer just starting—you’re building a brand that people can return to.
          </h4>
          <p className="text-gray-600 text-xs mt-1 leading-relaxed">
            Use VeriThread to connect products, customers, scans, and post-purchase experiences into one growing ecosystem.
          </p>
        </div>
      </div>
      
      {/* Brand Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150&h=150"
            alt="Adeleke Atelier"
            className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-lg text-gray-900 uppercase tracking-tight">
                Adeleke Atelier
              </h2>
              {/* Blue Circular Professional Trust Badge */}
              <ProfessionalBadge size={22} />
            </div>
            <p className="text-xs text-gray-500 font-sans">Lagos, Nigeria • Verified Professional Brand</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Professional Plan
          </span>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50/50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Verified Passport Active
          </span>
        </div>
      </div>

      {/* Usage Meter Card */}
      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-gray-900">Monthly QR Code Generation Limit</h3>
          </div>
          <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            12 of 250 Used (5%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: '5%' }} />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>238 QRs remaining for current cycle</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Volume Capacity Active
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Active Products
          </span>
          <span className="text-2xl font-black text-gray-900 font-mono">12</span>
          <span className="text-[10px] text-blue-600 font-bold">250 Max Passports</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-600" /> Total Scans
          </span>
          <span className="text-2xl font-black text-gray-900 font-mono">2,847</span>
          <span className="text-[10px] text-emerald-600 font-bold">+28% growth</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-purple-600" /> Registered Owners
          </span>
          <span className="text-2xl font-black text-gray-900 font-mono">1,203</span>
          <span className="text-[10px] text-purple-600 font-bold">82% conversion</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> Passport Likes
          </span>
          <span className="text-2xl font-black text-gray-900 font-mono">1,177</span>
          <span className="text-[10px] text-rose-600 font-bold">High Loyalty</span>
        </div>
      </div>

      {/* Unlocked AI Feature: AI Garment Story Writer */}
      <div className="bg-blue-50/50 border border-blue-200 p-6 rounded-3xl shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-gray-900">AI Garment Story & Marketing Generator</h3>
          </div>
          <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Unlocked & Active
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs text-xs text-gray-800 leading-relaxed font-sans">
          <p className="font-medium">{aiStory}</p>
        </div>

        <button
          type="button"
          onClick={handleGenerateAi}
          disabled={isGeneratingAi}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
          {isGeneratingAi ? 'Generating Craftsmanship Copy...' : 'Generate New AI Copy Variation'}
        </button>
      </div>

      {/* Advanced Analytics & Geo Breakdown */}
      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-gray-900">Geographic Scans & Live Heatmap</h3>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Real-Time Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-600" /> Lagos, Nigeria
            </span>
            <span className="text-lg font-bold text-gray-900 font-mono">1,765 Scans (62%)</span>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '62%' }} />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-600" /> London, UK
            </span>
            <span className="text-lg font-bold text-gray-900 font-mono">626 Scans (22%)</span>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '22%' }} />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-600" /> New York, USA
            </span>
            <span className="text-lg font-bold text-gray-900 font-mono">456 Scans (16%)</span>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div className="bg-blue-400 h-full rounded-full" style={{ width: '16%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Custom QR Branding Options */}
      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-gray-900">Custom QR Code Branding</h3>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
            Custom Colors Unlocked
          </span>
        </div>

        <p className="text-xs text-gray-500">
          Tailor QR code colors and embedded logos to match Adeleke Atelier's brand guidelines.
        </p>

        <div className="flex items-center gap-3 pt-1">
          {['#2563EB', '#0F5132', '#1C1C1C', '#C5A059'].map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                selectedColor === color ? 'scale-110 border-gray-900 ring-2 ring-blue-400' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-xs font-mono font-bold text-gray-600 ml-2">{selectedColor}</span>
        </div>
      </div>

    </div>
  );
}

export default ProfessionalDemo;
