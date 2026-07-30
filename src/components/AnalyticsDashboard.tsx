import React, { useState } from 'react';
import { 
  BarChart3, Users, RefreshCw, ShoppingBag, ArrowUpRight, CheckCircle2, 
  Crown, Sparkles, AlertCircle, Play, Send, Percent, Calendar, Heart, ArrowRight,
  QrCode
} from 'lucide-react';
import { getCustomers, getOwnerships, getProducts, getCampaigns, getAnalyticsEvents, getQRCodes, recordAnalyticsEvent } from '../lib/storage';
import LockedFeatureGate from './LockedFeatureGate';

export default function AnalyticsDashboard() {
  const customers = getCustomers();
  const ownerships = getOwnerships();
  const products = getProducts();
  const campaigns = getCampaigns();
  const analyticsEvents = getAnalyticsEvents();
  const qrCodes = getQRCodes();

  // Simulated live notification when launching opportunities
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Compute real metrics
  const totalQRScans = qrCodes.reduce((sum, q) => sum + (q.scanCount || 0), 0);
  const scanEventsCount = analyticsEvents.filter(e => e.eventType === 'scan').length;
  const totalScans = Math.max(totalQRScans, scanEventsCount);

  const totalCustomers = customers.length;
  const totalOwnerships = ownerships.length;

  const loopRate = totalScans > 0 ? Math.min(100, Math.round((totalCustomers / totalScans) * 100)) : 0;

  // Repeat customers logic
  const customerOwnershipCounts = customers.map(c => ownerships.filter(o => o.customerId === c.id).length);
  const repeatCustomersCount = customerOwnershipCounts.filter(count => count > 1).length;
  const repeatScanRate = totalCustomers > 0 ? ((repeatCustomersCount / totalCustomers) * 100).toFixed(1) : '0';

  const repeatBuys = totalOwnerships > totalCustomers ? totalOwnerships - totalCustomers : repeatCustomersCount;

  // Revenue calculations
  const totalRevenue = ownerships.reduce((sum, o) => {
    const prod = products.find(p => p.id === o.productId);
    return sum + (prod?.priceMin || prod?.priceMax || 0);
  }, 0);

  const avgLTV = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

  // Opportunities calculation
  const unregisteredVisitors = Math.max(0, totalScans - totalCustomers);
  const dormantVIPs = customers.filter(c => c.isVIP).length;

  // Top performing products calculation
  const productPerformance = products.map(p => {
    const pOwnerships = ownerships.filter(o => o.productId === p.id).length;
    const pScans = analyticsEvents.filter(e => e.productId === p.id && e.eventType === 'scan').length;
    return {
      product: p,
      ownerships: pOwnerships,
      scans: pScans,
      score: pOwnerships * 2 + pScans
    };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

  const maxScore = productPerformance.length > 0 ? Math.max(...productPerformance.map(p => p.score)) : 1;

  const triggerOpportunityAction = (title: string, msg: string) => {
    setSuccessNotice(title);
    setTimeout(() => setSuccessNotice(null), 3000);

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
          
          {/* Metric 1 */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 truncate">Database</p>
            <div className="flex items-baseline justify-between mt-1 gap-1">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{totalCustomers}</h3>
              <span className="text-[9px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100/60 font-semibold shrink-0">
                {loopRate}% Loop
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-normal leading-normal">
              {totalCustomers} of {totalScans} scanned users registered.
            </p>
          </div>

          {/* Metric 2 */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 truncate">Customers</p>
            <div className="flex items-baseline justify-between mt-1 gap-1">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{totalCustomers}</h3>
              <span className="text-[9px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100/60 font-semibold shrink-0">
                {repeatScanRate}% Rate
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-normal leading-normal">
              {repeatCustomersCount} customers with multiple passports.
            </p>
          </div>

          {/* Metric 3 */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 truncate">Influenced Repeat Buys</p>
            <div className="flex items-baseline justify-between mt-1 gap-1">
              <h3 className="text-lg sm:text-2xl font-bold text-[#0F5132] tracking-tight truncate">{repeatBuys}</h3>
              <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100/60 font-semibold shrink-0">
                {repeatBuys > 0 ? `+${repeatBuys}` : '0'} Buys
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-normal leading-normal">Purchased garment after follow-ups.</p>
          </div>

          {/* Metric 4 */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 truncate">Customer LTV (Avg)</p>
            <div className="flex items-baseline justify-between mt-1 gap-1">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                ₦{avgLTV.toLocaleString()}
              </h3>
              <span className="text-[9px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100/60 font-semibold shrink-0">
                {avgLTV > 0 ? 'Active' : '₦0'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-normal leading-normal">Avg direct spend of registered holders.</p>
          </div>

        </div>

        {/* Grid: Opportunities & Performance highlights */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Left Col: Today's Growth Opportunities (Actionable Cards) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Today's Growth Opportunities</h3>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-bold">Action Required</span>
            </div>

            <div className="flex flex-col gap-3.5">
              {unregisteredVisitors > 0 && (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/85 shadow-sm flex items-start gap-3.5 hover:border-[#0F5132]/30 transition-all">
                  <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">{unregisteredVisitors} Scanned Visitors Left Without Registering</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-normal">
                      Visitors accessed a garment passport but haven't claimed the product warranty yet.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3.5">
                      <button 
                        onClick={() => triggerOpportunityAction('Retargeting Reminder', 'Sent automated WhatsApp notification to scanned contacts.')}
                        className="bg-[#0F5132] hover:bg-[#145A32] text-white px-3.5 h-7 rounded-full text-[10px] font-bold cursor-pointer transition-all inline-flex items-center justify-center self-start"
                      >
                        Send WhatsApp Reminder
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {dormantVIPs > 0 && (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/85 shadow-sm flex items-start gap-3.5 hover:border-[#0F5132]/30 transition-all">
                  <span className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">{dormantVIPs} Registered VIP Collectors</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-normal">
                      Verified VIP brand owners with registered digital passports.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3.5">
                      <button 
                        onClick={() => triggerOpportunityAction('VIP Early Access Invite', 'Sent automated VIP capsule early access invitations.')}
                        className="bg-[#0F5132] hover:bg-[#145A32] text-white px-3.5 h-7 rounded-full text-[10px] font-bold cursor-pointer transition-all inline-flex items-center justify-center self-start"
                      >
                        Invite to Private Capsule Drop
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {unregisteredVisitors === 0 && dormantVIPs === 0 && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200/85 shadow-sm text-center flex flex-col items-center justify-center gap-2 py-10">
                  <QrCode className="w-8 h-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">
                    No data yet. Start sharing your QR codes to see insights here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Performance highlights */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Top Performing Assets</h3>
            </div>

            {productPerformance.length > 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-5">
                {productPerformance.slice(0, 3).map((item) => (
                  <div key={item.product.id}>
                    <div className="flex justify-between text-xs font-bold text-gray-900 mb-1">
                      <span className="truncate pr-2">{item.product.name}</span>
                      <span className="text-[#0F5132] shrink-0">{item.ownerships} Owner{item.ownerships !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {item.scans} scan{item.scans !== 1 ? 's' : ''} recorded on digital passport.
                    </p>
                    <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-[#0F5132] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.max(15, Math.round((item.score / maxScore) * 100)))}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center py-10 flex flex-col items-center justify-center gap-2">
                <BarChart3 className="w-8 h-8 text-gray-300" />
                <p className="text-xs font-medium text-gray-500">
                  No data yet. Start sharing your QR codes to see insights here.
                </p>
              </div>
            )}

            {/* Core business insights banner */}
            <div className="bg-emerald-950 p-5 rounded-2xl border border-[#0F5132] text-white flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Brand Recommendation</span>
              </div>
              <h4 className="font-bold text-xs">Drive Passport Registrations</h4>
              <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                Attach digital QR passport labels to every bespoke garment to capture customer contact details, verify authenticity, and enable automated follow-ups.
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
                    <th className="pb-3 pr-4">Campaign Pipeline</th>
                    <th className="pb-3 pr-4">Trigger Event</th>
                    <th className="pb-3 pr-4 text-center">Open Rate</th>
                    <th className="pb-3 pr-4 text-center">Click Rate</th>
                    <th className="pb-3 pr-4 text-center">Repeat Conversion</th>
                    <th className="pb-3 text-right">Revenue Influenced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {campaigns.map((camp) => (
                    <tr key={camp.id}>
                      <td className="py-3.5 pr-4 font-semibold text-gray-900">{camp.name}</td>
                      <td className="py-3.5 pr-4 text-gray-500 font-mono">{camp.timing || 'Custom Trigger'}</td>
                      <td className="py-3.5 pr-4 text-center font-bold text-emerald-800">{camp.openRate || 0}%</td>
                      <td className="py-3.5 pr-4 text-center font-bold text-gray-700">{camp.clickRate || 0}%</td>
                      <td className="py-3.5 pr-4 text-center font-bold text-gray-700">{camp.conversionRate || 0}%</td>
                      <td className="py-3.5 text-right font-bold text-gray-900">₦{(camp.revenueInfluenced || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
              <Send className="w-8 h-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                No data yet. Start sharing your QR codes to see insights here.
              </p>
            </div>
          )}
        </div>

      </div>
    </LockedFeatureGate>
  );
}
