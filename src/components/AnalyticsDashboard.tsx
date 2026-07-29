import React, { useState } from 'react';
import { 
  BarChart3, Users, RefreshCw, ShoppingBag, ArrowUpRight, CheckCircle2, 
  Crown, Sparkles, AlertCircle, Play, Send, Percent, Calendar, Heart, ArrowRight 
} from 'lucide-react';
import { getCustomers, getOwnerships, getProducts, getCampaigns, recordAnalyticsEvent } from '../lib/storage';
import LockedFeatureGate from './LockedFeatureGate';

export default function AnalyticsDashboard() {
  const customers = getCustomers();
  const ownerships = getOwnerships();
  const products = getProducts();
  const campaigns = getCampaigns();

  // Calculate real metrics
  const totalCustomers = customers.length;
  const totalOwnerships = ownerships.length;
  const totalProducts = products.length;
  const totalCampaigns = campaigns.length;

  // Simulated live notification when launching opportunities
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const triggerOpportunityAction = (title: string, msg: string) => {
    setSuccessNotice(title);
    setTimeout(() => setSuccessNotice(null), 3000);

    // Record action event in analytics log
    recordAnalyticsEvent({
      id: `evt-insight-${Date.now()}`,
      productId: products[0]?.id || 'general',
      eventType: 'share',
      timestamp: new Date().toISOString(),
      metadata: {
        location: 'Lagos Headquarters',
        ownerName: `Action Taken: ${title}`
      }
    });
  };

  // Check if there's any real data to show
  const hasData = totalCustomers > 0 || totalOwnerships > 0 || totalProducts > 0;

  return (
    <LockedFeatureGate
      featureName="Advanced Analytics"
      description="Access geo-location, customer conversion metrics, and visual trend reports."
      benefits={[
        "Geo-location scanning coordinates",
        "Scan-to-purchase lifecycle conversion rates",
        "Daily campaign open and click metrics",
        "Visual growth charts & trending products",
        "CSV/PNG spreadsheet report exports"
      ]}
    >
      <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Header and Sync indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Growth Insights</h2>
          <p className="text-sm text-gray-500">Trace your repeat buying loops, campaign conversion metrics, and today's business opportunities.</p>
        </div>

        <span className="text-[10px] text-[#0F5132] font-mono bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Live Syncing
        </span>
      </div>

      {/* Success notification overlay */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-100 text-[#0F5132] text-xs p-4 rounded-xl flex items-center justify-between gap-3 animate-slide-in shadow">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#0F5132]" />
            <div>
              <span className="font-bold block">Automation Dispatch Successful</span>
              <span className="text-gray-500 text-[10px]">{successNotice} triggered for matching segment of customers.</span>
            </div>
          </div>
          <button 
            onClick={() => setSuccessNotice(null)} 
            className="text-[10px] font-bold text-gray-400 hover:text-gray-900 cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Total Customers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 truncate">Total Customers</p>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{totalCustomers}</h3>
            {totalCustomers > 0 && (
              <span className="text-[9px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100/60 font-semibold shrink-0">
                Active
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-normal leading-normal">
            {totalCustomers > 0 ? `${totalCustomers} customers registered` : 'No customers registered yet'}
          </p>
        </div>

        {/* Metric 2: Total Ownerships */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 truncate">Total Ownerships</p>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{totalOwnerships}</h3>
            {totalOwnerships > 0 && (
              <span className="text-[9px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100/60 font-semibold shrink-0">
                Registered
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-normal leading-normal">
            {totalOwnerships > 0 ? `${totalOwnerships} product ownerships registered` : 'No ownerships registered yet'}
          </p>
        </div>

        {/* Metric 3: Total Products */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 truncate">Total Products</p>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <h3 className="text-lg sm:text-2xl font-bold text-[#0F5132] tracking-tight truncate">{totalProducts}</h3>
            {totalProducts > 0 && (
              <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100/60 font-semibold shrink-0">
                Active
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-normal leading-normal">
            {totalProducts > 0 ? `${totalProducts} products in catalog` : 'No products created yet'}
          </p>
        </div>

        {/* Metric 4: Total Campaigns */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 truncate">Total Campaigns</p>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{totalCampaigns}</h3>
            {totalCampaigns > 0 && (
              <span className="text-[9px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100/60 font-semibold shrink-0">
                Active
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-normal leading-normal">
            {totalCampaigns > 0 ? `${totalCampaigns} campaigns created` : 'No campaigns created yet'}
          </p>
        </div>

      </div>

      {/* Grid: Opportunities & Performance highlights */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Col: Today's Growth Opportunities */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Today's Growth Opportunities</h3>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-bold">Action Required</span>
          </div>

          {hasData ? (
            <div className="flex flex-col gap-3.5">
              {/* Only show opportunities if there is data */}
              {totalCustomers > 0 && (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/85 shadow-sm flex items-start gap-3.5 hover:border-[#0F5132]/30 transition-all">
                  <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">Customers Registered</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-normal">
                      {totalCustomers} customers have registered their products. Keep them engaged with follow-up campaigns.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3.5">
                      <button 
                        onClick={() => triggerOpportunityAction('Customer Engagement', 'Sent automated engagement notification.')}
                        className="bg-[#0F5132] hover:bg-[#145A32] text-white px-3.5 h-7 rounded-full text-[10px] font-bold cursor-pointer transition-all inline-flex items-center justify-center self-start"
                      >
                        Send Engagement Campaign
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {totalProducts > 0 && (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/85 shadow-sm flex items-start gap-3.5 hover:border-[#0F5132]/30 transition-all">
                  <span className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">Products Available</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-normal">
                      You have {totalProducts} products. Share your QR codes to start collecting customer data.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3.5">
                      <button 
                        onClick={() => triggerOpportunityAction('Product Share', 'Sent automated QR code sharing reminder.')}
                        className="bg-[#0F5132] hover:bg-[#145A32] text-white px-3.5 h-7 rounded-full text-[10px] font-bold cursor-pointer transition-all inline-flex items-center justify-center self-start"
                      >
                        Share QR Codes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-gray-200/85 shadow-sm text-center">
              <p className="text-sm text-gray-500">No data yet. Start creating products and sharing QR codes to see opportunities here.</p>
            </div>
          )}

        </div>

        {/* Right Col: Performance highlights */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Top Performing Assets</h3>
          </div>

          {hasData ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-5">
              {products.slice(0, 3).map((product, idx) => (
                <div key={product.id}>
                  <div className="flex justify-between text-xs font-bold text-gray-900 mb-1">
                    <span>{product.name}</span>
                    <span className="text-[#0F5132]">{product.likeCount || 0} likes</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{product.sku || 'No SKU'}</p>
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#0F5132] h-full rounded-full" style={{ width: `${Math.min((product.likeCount || 0) * 5 + 10, 100)}%` }} />
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No products created yet</p>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
              <p className="text-sm text-gray-500">No assets yet. Create your first product to see performance here.</p>
            </div>
          )}

          {/* Core business insights banner */}
          <div className="bg-emerald-950 p-5 rounded-2xl border border-[#0F5132] text-white flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Brand Recommendation</span>
            </div>
            <h4 className="font-bold text-xs">Start Sharing Your QR Codes</h4>
            <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
              {hasData 
                ? "You have data. Keep building your customer relationships by creating campaigns and tracking engagement."
                : "Create your first Digital Product Passport and start sharing your QR codes with customers to begin collecting data."}
            </p>
          </div>

        </div>

      </div>

      {/* Campaigns performance table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Automated Campaign Conversions</h3>
          <span className="text-[10px] text-gray-400">Interactive Summary</span>
        </div>

        {campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase font-bold">
                  <th className="pb-3 pr-4">Campaign Name</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4 text-center">Status</th>
                  <th className="pb-3 pr-4 text-center">Sent</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="py-3.5 pr-4 font-semibold text-gray-900">{campaign.name}</td>
                    <td className="py-3.5 pr-4 text-gray-500 font-mono">{campaign.type}</td>
                    <td className="py-3.5 pr-4 text-center">
                      <span className={`text-[10px] font-bold ${campaign.status === 'Active' ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-center font-bold text-gray-700">{campaign.sentCount || 0}</td>
                    <td className="py-3.5 text-right font-bold text-gray-900">₦{(campaign.revenueInfluenced || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No campaigns created yet. Start connecting with your customers.</p>
          </div>
        )}
      </div>

      </div>
    </LockedFeatureGate>
  );
}