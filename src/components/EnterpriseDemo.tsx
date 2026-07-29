import React, { useState } from 'react';
import { 
  ShieldCheck, Infinity, Globe, Sparkles, Headphones, 
  Code, CheckCircle2, Building2, Lock, ArrowUpRight, Award, Server
} from 'lucide-react';
import EnterpriseBadge from './EnterpriseBadge';

interface EnterpriseDemoProps {
  onUpgradeClick?: (feature: string) => void;
}

export function EnterpriseDemo({ onUpgradeClick }: EnterpriseDemoProps) {
  const [copiedDomain, setCopiedDomain] = useState(false);

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-[#1C1C1C]">
      
      {/* Enterprise Encouragement Message */}
      <div className="bg-emerald-900 text-white border border-emerald-700 p-5 rounded-2xl flex items-start gap-3 text-xs shadow-md">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-emerald-200 text-sm">
            Built for brands where authenticity, ownership, and reputation must scale together.
          </h4>
          <p className="text-emerald-100/80 text-xs mt-1 leading-relaxed">
            Enterprise provides advanced authenticity, ownership tracking, compliance support, and connected customer experiences across every product you release.
          </p>
        </div>
      </div>
      
      {/* Brand Header */}
      <div className="bg-[#0F5132] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        {/* Background Subtle Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150&h=150"
            alt="Adeleke Atelier"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                Adeleke Atelier
              </h2>
              {/* Rugged Green Enterprise Badge */}
              <EnterpriseBadge size={24} />
            </div>
            <p className="text-xs text-emerald-200 font-sans mt-0.5">
              Lagos • Paris • London | Enterprise Fashion House
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <span className="px-3.5 py-1 bg-emerald-800/80 text-amber-300 text-xs font-bold rounded-full border border-amber-400/30 flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Enterprise Plan
          </span>
          <span className="text-[10px] font-bold text-white bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
            100% White-Labeled
          </span>
        </div>
      </div>

      {/* Usage Meter Card - Unlimited */}
      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Infinity className="w-6 h-6 text-[#0F5132]" />
            <h3 className="font-bold text-sm text-gray-900">QR Code Generation Limit</h3>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <Infinity className="w-3.5 h-3.5 text-[#0F5132]" /> Unlimited QRs Active
          </span>
        </div>

        {/* Progress Bar - Full & Active */}
        <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden border border-emerald-200">
          <div className="bg-[#0F5132] h-full rounded-full transition-all duration-500 w-full" />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span className="font-semibold text-gray-700">0 restrictions. Generate millions of garment passports.</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132]" /> Enterprise Infrastructure SLA: 99.99%
          </span>
        </div>
      </div>

      {/* Enterprise Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Custom Domain */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#0F5132]" /> Custom Domain
            </span>
            <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
              SSL Active
            </span>
          </div>
          <p className="font-mono text-xs font-bold text-gray-900 truncate">
            passport.adelekeatelier.com
          </p>
          <p className="text-[10px] text-gray-500">Fully white-labeled URL on your domain</p>
        </div>

        {/* Dedicated Account Support */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5 text-blue-600" /> Dedicated Manager
            </span>
            <span className="bg-blue-50 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
              24/7 Priority
            </span>
          </div>
          <p className="font-bold text-xs text-gray-900">
            Chisom N. (Lead Solutions Engineer)
          </p>
          <p className="text-[10px] text-gray-500">Direct WhatsApp & VIP Hotline support</p>
        </div>

        {/* Custom API & ERP Access */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-purple-600" /> Custom API Access
            </span>
            <span className="bg-purple-50 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded-md border border-purple-200">
              REST & Webhooks
            </span>
          </div>
          <p className="font-mono text-xs font-bold text-gray-900">
            vt_live_9f823a...4b7e
          </p>
          <p className="text-[10px] text-gray-500">Integrated with Shopify & SAP ERP</p>
        </div>

      </div>

      {/* Fine-Tuned AI Feature */}
      <div className="bg-emerald-50/50 border border-emerald-200 p-6 rounded-3xl shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0F5132]" />
            <h3 className="font-bold text-sm text-gray-900">Fine-Tuned AI Brand Voice Engine</h3>
          </div>
          <span className="bg-[#0F5132] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Custom Model Active
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed font-sans">
          Your AI Copywriter is custom-trained on Adeleke Atelier's brand handbook, history, and archival collection catalogues to generate authentic luxury narratives automatically.
        </p>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 text-xs text-gray-800 leading-relaxed font-sans shadow-xs">
          <p className="italic">
            "Piece No. 042/100 from the Royal Owo Collection. Hand-spun silk organza with custom brass filigree work. Each thread carries a verified cryptographic provenance token."
          </p>
        </div>
      </div>

      {/* Enterprise Security & Compliance Card */}
      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F5132]" />
            <h3 className="font-bold text-sm text-gray-900">Enterprise Security & Compliance</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase border border-emerald-200">
            SOC-2 Type II Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-gray-600">
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <CheckCircle2 className="w-4 h-4 text-[#0F5132]" />
            <span>Dedicated Database Isolation</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <CheckCircle2 className="w-4 h-4 text-[#0F5132]" />
            <span>Custom Export & Data Residency</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <CheckCircle2 className="w-4 h-4 text-[#0F5132]" />
            <span>Zero Third-Party Branding Exposure</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <CheckCircle2 className="w-4 h-4 text-[#0F5132]" />
            <span>99.99% Guaranteed SLA Uptime</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default EnterpriseDemo;
