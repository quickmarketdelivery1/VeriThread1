import React, { useState } from 'react';
import { 
  ArrowLeft, Sparkles, Check, ArrowRight, ShieldCheck, 
  Layers, Lock, Smartphone, Zap, Building2, HelpCircle 
} from 'lucide-react';
import StarterDemo from './StarterDemo';
import ProfessionalDemo from './ProfessionalDemo';
import EnterpriseDemo from './EnterpriseDemo';
import EnterpriseModal from './EnterpriseModal';

interface DemoDashboardProps {
  onNavigate?: (route: string) => void;
  initialPlan?: 'starter' | 'professional' | 'enterprise';
}

export function DemoDashboard({ onNavigate, initialPlan = 'professional' }: DemoDashboardProps) {
  const [activeTab, setActiveTab] = useState<'starter' | 'professional' | 'enterprise'>(initialPlan);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState<string | null>(null);

  const handleUpgradeClick = (feature: string) => {
    setLockedFeatureName(feature);
    if (activeTab === 'starter') {
      setActiveTab('professional');
    } else {
      setIsEnterpriseModalOpen(true);
    }
  };

  const handleGetStarted = (plan: string) => {
    if (plan === 'enterprise') {
      setIsEnterpriseModalOpen(true);
    } else if (onNavigate) {
      onNavigate(`signup?plan=${plan}`);
    } else {
      window.location.hash = `/signup?plan=${plan}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1C1C1C] flex flex-col font-sans pb-16">
      
      {/* Top Demo Header Navigation */}
      <header className="bg-[#0F5132] text-white border-b border-emerald-900 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Home
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg text-white tracking-tight">
                VeriThread
              </span>
              <span className="hidden sm:inline-block bg-emerald-800/80 border border-emerald-400/30 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Live Interactive Demo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleGetStarted(activeTab)}
              className="bg-white hover:bg-gray-100 text-[#0F5132] px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        
        {/* Interactive Banner Intro */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0F5132] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full mb-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Compare VeriThread Tier Architecture
            </div>
            <h1 className="font-display font-extrabold text-2xl text-gray-900 tracking-tight">
              Explore Live Brand Dashboards
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Switch between Starter, Professional, and Enterprise tabs below to see how limits, trust badges, AI generators, and white-labeling adapt dynamically for brand accounts.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleGetStarted(activeTab)}
              className="bg-[#0F5132] hover:bg-[#145A32] text-white py-2.5 px-5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              Launch {activeTab.toUpperCase()} Workspace <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Plan Selector Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-2">
          
          {/* Starter Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('starter')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 border ${
              activeTab === 'starter'
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'starter' ? 'bg-amber-500' : 'bg-gray-300'}`} />
              <div className="text-left">
                <span className="block font-bold">Starter Plan</span>
                <span className="text-[10px] text-gray-500 font-normal">Free Forever</span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              25 QRs/mo
            </span>
          </button>

          {/* Professional Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('professional')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 border ${
              activeTab === 'professional'
                ? 'bg-blue-50 text-blue-900 border-blue-300 shadow-xs'
                : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'professional' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className="text-left">
                <span className="block font-bold">Professional Plan</span>
                <span className="text-[10px] text-gray-500 font-normal">$35 / mo (₦25,000)</span>
              </div>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              250 QRs + Blue Badge
            </span>
          </button>

          {/* Enterprise Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('enterprise')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 border ${
              activeTab === 'enterprise'
                ? 'bg-emerald-50 text-[#0F5132] border-emerald-300 shadow-xs'
                : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'enterprise' ? 'bg-[#0F5132]' : 'bg-gray-300'}`} />
              <div className="text-left">
                <span className="block font-bold">Enterprise Plan</span>
                <span className="text-[10px] text-gray-500 font-normal">Custom White-Label</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
              Unlimited QRs + Green Badge
            </span>
          </button>

        </div>

        {/* Active Plan Content View */}
        <div className="mt-2">
          {activeTab === 'starter' && <StarterDemo onUpgradeClick={handleUpgradeClick} />}
          {activeTab === 'professional' && <ProfessionalDemo onUpgradeClick={handleUpgradeClick} />}
          {activeTab === 'enterprise' && <EnterpriseDemo onUpgradeClick={handleUpgradeClick} />}
        </div>

        {/* Upgrade / Enterprise Modal */}
        <EnterpriseModal
          isOpen={isEnterpriseModalOpen}
          onClose={() => setIsEnterpriseModalOpen(false)}
        />

      </main>

    </div>
  );
}

export default DemoDashboard;
