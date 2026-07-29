import React, { useState } from 'react';
import { Mail, Calendar, Users, BarChart3, ToggleLeft, ToggleRight, Play, Pause, Plus, Trash2, CheckCircle2, ChevronRight, HelpCircle, ArrowLeft, Send, Sparkles, RefreshCw } from 'lucide-react';
import { getCampaigns, saveCampaign, deleteCampaign, getProducts, getBrand, incrementAICount } from '../lib/storage';
import { generateCampaignCopy } from '../lib/ai';
import { Campaign } from '../types';
import LockedFeatureGate from './LockedFeatureGate';

export default function CampaignCenterPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => getCampaigns());
  const products = getProducts();

  // Create campaign form states
  const [isCreating, setIsCreating] = useState(false);
  const [campName, setCampName] = useState('');
  const [campType, setCampType] = useState<Campaign['type']>('welcome');
  const [campTiming, setCampTiming] = useState('Same Day');
  const [campAudience, setCampAudience] = useState('All Customers');
  const [campSubject, setCampSubject] = useState('');
  const [campBody, setCampBody] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [isGeneratingAICampaign, setIsGeneratingAICampaign] = useState(false);

  const handleAICampaignCopy = async () => {
    const brand = getBrand();
    const limitResult = incrementAICount();
    if (!limitResult.allowed) {
      alert(limitResult.message || "Monthly AI limit reached.");
      return;
    }

    setIsGeneratingAICampaign(true);
    try {
      const generated = await generateCampaignCopy(campType, brand.name || 'Your Brand');
      if (generated.subject) setCampSubject(generated.subject);
      if (generated.body) setCampBody(generated.body);
    } catch (err) {
      console.warn("Campaign AI copy error:", err);
    } finally {
      setIsGeneratingAICampaign(false);
    }
  };

  // Template Library
  const templates: Record<Campaign['type'], { subject: string; body: string }> = {
    welcome: {
      subject: "Welcome to the [Brand] Family",
      body: "Thank you for becoming a verified owner of your hand-crafted [Product Name]. Your ownership is officially registered on the VeriThread cryptographic ledger. Welcome to our luxury community."
    },
    product_care: {
      subject: "Preserving Your [Product Name] Masterpiece",
      body: "We hope you are loving your new [Product Name]. To keep its silhouette, colors, and premium fibers looking pristine for decades, we recommend: professional dry cleaning only, cool reversed steam-ironing, and breathable flat hanger storage."
    },
    new_collection: {
      subject: "Exclusive Preview: Our Next Atelier Drop",
      body: "Because you are a registered owner of [Brand], you have been selected for exclusive early access to our brand new capsule collection before the public launch. Pre-orders are open for 48 hours."
    },
    birthday: {
      subject: "A Special Birthday Gift from [Brand]",
      body: "Happy Birthday! Today, we celebrate your presence in our story. As a special token, enjoy a complimentary custom sizing adjustment or priority delivery on your next bespoke order."
    },
    vip_drop: {
      subject: "VIP Access: Limited Run Ancestral Silks",
      body: "We have loomed exactly 50 pieces of our royal silk kaftans. As a VIP verified customer, your private reservation link is active now. No public retail release will take place."
    },
    review_request: {
      subject: "How is your [Product Name] performing?",
      body: "We constantly refine our hand-embroidery and tailoring. Now that you have worn your [Product Name], we would love to hear your feedback on the fit and drape. Click here to leave a private review."
    },
    referral: {
      subject: "Share the [Brand] Heritage with a Friend",
      body: "A heritage grows when it is shared. Invite an esteemed friend to become a verified owner. If they complete an order, both of you will receive a complimentary hand-woven silk cap with your next order."
    }
  };

  // Load template values on type change
  React.useEffect(() => {
    const t = templates[campType];
    setCampSubject(t.subject);
    setCampBody(t.body);
  }, [campType]);

  const handleToggleStatus = (id: string) => {
    const updated = campaigns.map(c => {
      if (c.id === id) {
        const nextStatus: Campaign['status'] = c.status === 'Active' ? 'Paused' : 'Active';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    setCampaigns(updated);
    // Write each back to localStorage
    const match = updated.find(u => u.id === id);
    if (match) saveCampaign(match);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this automated campaign campaign?')) {
      deleteCampaign(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim() || !campSubject.trim() || !campBody.trim()) {
      alert('Please fill out all required campaign fields.');
      return;
    }

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: campName.trim(),
      type: campType,
      status: 'Active',
      timing: campTiming,
      audience: campAudience,
      subject: campSubject.trim(),
      body: campBody.trim(),
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      revenueInfluenced: 0,
      sentCount: 0,
      createdAt: new Date().toISOString()
    };

    saveCampaign(newCamp);
    setCampaigns([newCamp, ...campaigns]);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setIsCreating(false);
      // Reset form fields
      setCampName('');
      setCampType('welcome');
    }, 1200);
  };

  // Compute aggregate totals
  const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const avgOpen = campaigns.length > 0 ? Math.round(campaigns.reduce((acc, c) => acc + c.openRate, 0) / campaigns.length) : 0;
  const avgClick = campaigns.length > 0 ? Math.round(campaigns.reduce((acc, c) => acc + c.clickRate, 0) / campaigns.length) : 0;
  const totalRev = campaigns.reduce((acc, c) => acc + c.revenueInfluenced, 0);

  return (
    <LockedFeatureGate
      featureName="Campaign Center"
      description="Automate customer care cycles, pre-orders, and repeat purchase loyalty drivers."
      benefits={[
        "Pre-built automated trigger-based campaigns",
        "Welcome emails on ownership registrations",
        "Luxury garment care instruction automations",
        "New collection early-access VIP campaigns",
        "Detailed click, open, and conversion statistics"
      ]}
    >
      <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Upper Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Customer Campaigns</h2>
          <p className="text-sm text-gray-500">Automate customer care cycles, pre-orders, and repeat purchase loyalty drivers.</p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-[#0F5132] hover:bg-[#145A32] text-white px-4 h-8 rounded-full text-[11px] font-bold shadow-sm cursor-pointer flex items-center gap-1.5 self-start"
          >
            <Plus className="w-3.5 h-3.5" /> Create Customer Campaign
          </button>
        )}
      </div>

      {isCreating ? (
        /* Create campaign flow container */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-2xl mx-auto w-full">
          <button 
            onClick={() => setIsCreating(false)}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 font-bold mb-6 cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </button>

          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-5">
            <h3 className="font-display font-semibold text-sm text-gray-900 border-b border-gray-100 pb-3 uppercase tracking-wider">
              Configure Automation Trigger
            </h3>

            {/* Campaign Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Campaign Admin Name *</label>
              <input
                type="text"
                placeholder="e.g. Traditional Wear Follow-up Care"
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none"
              />
              <p className="text-[9px] text-gray-400">This is an internal identifier for tracking and analytics.</p>
            </div>

            {/* Grid Select parameters */}
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Campaign Type</label>
                <select
                  value={campType}
                  onChange={(e) => setCampType(e.target.value as Campaign['type'])}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="welcome">Welcome</option>
                  <option value="product_care">Product Care</option>
                  <option value="new_collection">New Collection</option>
                  <option value="birthday">Birthday Message</option>
                  <option value="vip_drop">VIP Private Drop</option>
                  <option value="review_request">Review Request</option>
                  <option value="referral">Referral Program</option>
                </select>
              </div>

              {/* Timing */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Delivery Delay</label>
                <select
                  value={campTiming}
                  onChange={(e) => setCampTiming(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="Same Day">Same Day</option>
                  <option value="2-3 Days">2-3 Days</option>
                  <option value="After 7 Days">After 7 Days</option>
                  <option value="After 30 Days">After 30 Days</option>
                  <option value="After 60 Days">After 60 Days</option>
                  <option value="After 90 Days">After 90 Days</option>
                </select>
              </div>

              {/* Audience */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Target Segment</label>
                <select
                  value={campAudience}
                  onChange={(e) => setCampAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="All Customers">All Verified Buyers</option>
                  <option value="VIP Customers">VIP Segments</option>
                  <option value="Traditional Wear Buyers">Traditional Category</option>
                  <option value="Streetwear Buyers">Streetwear Category</option>
                </select>
              </div>
            </div>

            {/* Luxury Template Library Alert */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs text-[#0F5132] leading-relaxed flex items-center justify-between flex-wrap gap-2">
              <div>
                <strong>Luxury Template Loaded:</strong> Based on your campaign type, we pre-filled verified fashion copywriting.
              </div>
              <button
                type="button"
                onClick={handleAICampaignCopy}
                disabled={isGeneratingAICampaign}
                className="bg-[#0F5132] hover:bg-[#145A32] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAICampaign ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Generating Copy...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                    AI Generate Custom Copy
                  </>
                )}
              </button>
            </div>

            {/* Email/Campaign Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Message Header / Subject Line *</label>
              <input
                type="text"
                value={campSubject}
                onChange={(e) => setCampSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none"
              />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Campaign Body Copy *</label>
              <textarea
                value={campBody}
                onChange={(e) => setCampBody(e.target.value)}
                rows={6}
                placeholder="Feel free to write or edit your copy here. E.g.: Thank you for becoming a verified owner of your hand-crafted garment. Your ownership is officially registered."
                className="w-full p-4 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none leading-relaxed"
              />
            </div>

            {successMsg ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center justify-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 animate-bounce" /> Automation Rule Live! Seeding campaign analytics...
              </div>
            ) : (
              <button
                type="submit"
                className="bg-[#0F5132] hover:bg-[#145A32] text-white h-8 px-5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow cursor-pointer text-center flex items-center justify-center gap-1 self-start"
              >
                <Send className="w-3.5 h-3.5" /> Deploy Automated Campaign
              </button>
            )}
          </form>
        </div>
      ) : (
        /* Campaign Performance Stats & List */
        <>
          {/* Performance Dashboard summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 truncate">Total Deliveries</p>
              <div className="flex items-center justify-between gap-1 mt-1">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{totalSent.toLocaleString()}</h3>
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold bg-gray-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded border border-gray-100 flex items-center gap-0.5 shrink-0">
                  <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" /> <span className="hidden xs:inline">Active</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 truncate">Avg Open Rate</p>
              <div className="flex items-center justify-between gap-1 mt-1">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{avgOpen}%</h3>
                <span className="text-[9px] sm:text-[10px] text-green-600 font-semibold bg-green-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded border border-green-100 shrink-0">
                  92% benchmark
                </span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 truncate">Avg Click Rate</p>
              <div className="flex items-center justify-between gap-1 mt-1">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{avgClick}%</h3>
                <span className="text-[9px] sm:text-[10px] text-green-600 font-semibold bg-green-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded border border-green-100 shrink-0">
                  High Intent
                </span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-w-0">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 truncate">Influenced Rev</p>
              <div className="flex items-center justify-between gap-1 mt-1">
                <h3 className="text-lg sm:text-2xl font-bold text-[#0F5132] tracking-tight truncate">₦{totalRev.toLocaleString()}</h3>
                <span className="text-[9px] sm:text-[10px] text-amber-600 font-semibold bg-amber-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded border border-amber-100 shrink-0">
                  +18% YoY
                </span>
              </div>
            </div>

          </div>

          {/* List of campaigns */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Automated Workflows</h3>

            {campaigns.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center max-w-md mx-auto gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0F5132]/10 flex items-center justify-center text-[#0F5132]">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-gray-900">No Customer Campaigns Configured</h3>
                  <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                    Automate welcome sequences, garment care guides, and VIP launch invites for your fashion clients.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreating(true)}
                  className="bg-[#0F5132] hover:bg-[#145A32] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Customer Campaign
                </button>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-100">
                {campaigns.map((camp) => {
                const isActive = camp.status === 'Active';
                return (
                  <div key={camp.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        camp.type === 'welcome' ? 'bg-emerald-50 text-[#0F5132]' :
                        camp.type === 'product_care' ? 'bg-blue-50 text-blue-700' :
                        camp.type === 'new_collection' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-bold text-xs text-gray-900 truncate">{camp.name}</h4>
                          <span className={`text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                          }`}>
                            {camp.status}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-0.5 font-mono truncate uppercase tracking-tight">
                          TRIGGER: {camp.timing} • AUDIENCE: {camp.audience}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate max-w-full lg:max-w-md mt-1 italic font-sans">
                          "{camp.subject}"
                        </p>
                      </div>
                    </div>

                    {/* Stats columns */}
                    <div className="grid grid-cols-4 gap-2 text-center shrink-0 border-t border-gray-50 lg:border-t-0 pt-3 lg:pt-0">
                      <div className="min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase block truncate">Sent</span>
                        <strong className="text-[10px] sm:text-xs text-gray-900 font-bold block mt-0.5">{camp.sentCount}</strong>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase block truncate">Open</span>
                        <strong className="text-[10px] sm:text-xs text-gray-900 font-bold block mt-0.5">{camp.openRate}%</strong>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase block truncate">Click</span>
                        <strong className="text-[10px] sm:text-xs text-gray-900 font-bold block mt-0.5">{camp.clickRate}%</strong>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase block truncate">Revenue</span>
                        <strong className="text-[10px] sm:text-xs text-emerald-800 font-bold block mt-0.5 truncate">₦{camp.revenueInfluenced ? (camp.revenueInfluenced / 1000) + 'k' : '0'}</strong>
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="flex items-center gap-2 self-end lg:self-auto shrink-0 mt-2 lg:mt-0">
                      <button
                        onClick={() => handleToggleStatus(camp.id)}
                        className={`p-1.5 sm:p-2 rounded-lg border cursor-pointer transition-colors ${
                          isActive 
                            ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' 
                            : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        }`}
                        title={isActive ? 'Pause Automation' : 'Resume Automation'}
                      >
                        {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(camp.id)}
                        className="p-1.5 sm:p-2 rounded-lg border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 cursor-pointer transition-colors"
                        title="Delete Automated Workflow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
            )}
          </div>
        </>
      )}

      </div>
    </LockedFeatureGate>
  );
}
