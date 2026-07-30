import React, { useState } from 'react';
import { Plus, QrCode, Globe, ArrowUpRight, ShieldCheck, UserCheck, Smartphone, Eye, RefreshCw, AlertCircle, Calendar, Sparkles, CheckCircle, Heart } from 'lucide-react';
import { Product, Collection, QRCode, Ownership, AnalyticsEvent } from '../types';
import { getProducts, getQRCodes, getOwnerships, getAnalyticsEvents, getBrand } from '../lib/storage';
import ProBadge from './ProBadge';

interface DashboardOverviewProps {
  brandName: string;
  onNavigate: (route: string) => void;
  isDemo: boolean;
}

export default function DashboardOverview({ brandName, onNavigate, isDemo }: DashboardOverviewProps) {
  const brand = getBrand();
  const products = getProducts();
  const qrcodes = getQRCodes();
  const ownerships = getOwnerships();
  const activities = getAnalyticsEvents();
  const [opportunityNotice, setOpportunityNotice] = useState<string | null>(null);

  // Compute metrics dynamically
  const totalProducts = products.length;
  const totalScans = qrcodes.reduce((acc, q) => acc + q.scanCount, 0);
  const totalOwners = ownerships.length;
  const totalLikes = products.reduce((acc, p) => acc + (p.likeCount || 0), 0);
  const regRate = totalScans > 0 ? Math.round((totalOwners / totalScans) * 100) : 0;

  // Filter out recent activities to show on the dashboard (first 5)
  const recentActivities = activities.slice(0, 5);

  const isEmpty = totalProducts === 0;

  const userObj = (() => {
    try {
      const stored = localStorage.getItem('vt_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const fullName = userObj?.fullName || userObj?.name || brand.name || '';
  const displayBrandName = brand.name || userObj?.brandName || '';
  const displayBrandType = brand.type || userObj?.brandType || '';
  const displayBrandDesc = brand.description || userObj?.brandDescription || '';
  const displayBrandLocation = brand.location || userObj?.brandLocation || '';
  const displayPlan = (brand.plan || userObj?.plan || 'Starter').charAt(0).toUpperCase() + (brand.plan || userObj?.plan || 'Starter').slice(1);

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
              Welcome to VeriThread{fullName ? `, ${fullName}` : ''}!
            </h2>
            <ProBadge plan={brand.plan} size="md" />
          </div>
          <p className="text-sm text-gray-500">
            Monitor product provenance, QR scan lifecycles, and warranty registrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('products/new')}
            className="bg-[#0F5132] hover:bg-[#145A32] text-white px-4 h-9 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Your First Product
          </button>
        </div>
      </div>

      {/* Brand Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Registered Brand Profile</h3>
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-[#0F5132] border border-emerald-100 rounded-full">
            Plan: {displayPlan}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-400 font-medium block">Brand Name</span>
            <span className="text-gray-900 font-bold text-sm block mt-0.5">{displayBrandName}</span>
          </div>

          <div>
            <span className="text-gray-400 font-medium block">Brand Type</span>
            <span className="text-gray-900 font-bold text-sm block mt-0.5">{displayBrandType}</span>
          </div>

          <div>
            <span className="text-gray-400 font-medium block">Location</span>
            <span className="text-gray-900 font-bold text-sm block mt-0.5">{displayBrandLocation}</span>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <span className="text-gray-400 font-medium block">Brand Description</span>
            <p className="text-gray-700 font-medium mt-0.5 leading-relaxed line-clamp-2">{displayBrandDesc}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Products */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-w-0">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 truncate">Total Products</p>
          <div className="flex items-center justify-between gap-1 mt-1">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{totalProducts}</h3>
            <span className="text-[9px] sm:text-xs text-gray-500 font-medium bg-gray-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded border border-gray-100 flex items-center gap-1 shrink-0">
              <Smartphone className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" /> <span className="hidden xs:inline">Active</span>
            </span>
          </div>
        </div>

        {/* Total Scans */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-w-0">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 truncate">QR Tag Scans</p>
          <div className="flex items-center justify-between gap-1 mt-1">
            <h3 className="text-lg sm:text-2xl font-bold text-[#0F5132] tracking-tight truncate">{totalScans.toLocaleString()}</h3>
            <span className="text-[9px] sm:text-xs text-green-600 font-semibold bg-green-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded border border-green-100 flex items-center gap-0.5 sm:gap-1 shrink-0">
              <QrCode className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span>0</span>
            </span>
          </div>
        </div>

        {/* Registered Owners */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-w-0">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 truncate">Verified Owners</p>
          <div className="flex items-center justify-between gap-1 mt-1">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{totalOwners}</h3>
            <span className="text-[9px] sm:text-xs text-green-600 font-semibold bg-green-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded border border-green-100 flex items-center gap-1 shrink-0">
              <UserCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xs:inline">Owners</span>
            </span>
          </div>
        </div>

        {/* Total Passport Likes */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-w-0">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 truncate">Passport Likes</p>
          <div className="flex items-center justify-between gap-1 mt-1">
            <h3 className="text-lg sm:text-2xl font-bold text-red-600 tracking-tight truncate">{totalLikes.toLocaleString()}</h3>
            <span className="text-[9px] sm:text-xs text-red-600 font-semibold bg-red-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded border border-red-100 flex items-center gap-1 shrink-0">
              <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" /> <span className="hidden xs:inline">Likes</span>
            </span>
          </div>
        </div>

        {/* Registration Rate */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between min-w-0">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 truncate">Conversion Rate</p>
          <div className="flex items-center justify-between gap-1 mt-1">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">{regRate}%</h3>
            <span className="text-[9px] sm:text-xs text-amber-600 font-semibold bg-amber-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded border border-amber-100 flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden xs:inline">Rate</span>
            </span>
          </div>
        </div>

      </div>

      {isEmpty && (
        /* Empty State Guidance Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F5132]/10 text-[#0F5132] flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Digital Passports</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  You haven't created your first Digital Product Passport yet.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('products/new')}
              className="w-full bg-[#0F5132] hover:bg-[#145A32] text-white py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Your First Product
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Verified Customers</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  No customers have registered yet. Share your QR codes.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('qr-codes')}
              className="w-full border border-gray-300 hover:border-[#0F5132] text-gray-700 hover:text-[#0F5132] py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" /> View QR Codes
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">CRM Campaigns</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  No campaigns created yet. Start connecting with your customers.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('campaigns')}
              className="w-full border border-gray-300 hover:border-[#0F5132] text-gray-700 hover:text-[#0F5132] py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Open Campaign Studio
            </button>
          </div>

        </div>
      )}

          {/* Quick Actions Grid */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigate('products/new')}
                className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 hover:bg-[#0F5132]/5 hover:text-[#0F5132] border border-gray-100 hover:border-[#0F5132]/20 rounded-xl cursor-pointer transition-all group min-h-[44px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-[#0F5132] flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </span>
                  <div className="text-left min-w-0">
                    <span className="font-semibold text-xs text-gray-900 block group-hover:text-[#0F5132] truncate">Create New Product</span>
                    <span className="text-[10px] text-gray-400 block truncate">Launch a 5-step passport wizard</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
              </button>

              <button
                onClick={() => onNavigate('products')}
                className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 hover:bg-[#0F5132]/5 hover:text-[#0F5132] border border-gray-100 hover:border-[#0F5132]/20 rounded-xl cursor-pointer transition-all group min-h-[44px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-[#0F5132] flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </span>
                  <div className="text-left min-w-0">
                    <span className="font-semibold text-xs text-gray-900 block group-hover:text-[#0F5132] truncate">Download QR Codes</span>
                    <span className="text-[10px] text-gray-400 block truncate">Branded high-res digital tags</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
              </button>

              <button
                onClick={() => {
                  const firstProd = products[0];
                  if (firstProd) {
                    onNavigate(`passport/${firstProd.id}`);
                  } else {
                    onNavigate('products');
                  }
                }}
                className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 hover:bg-[#0F5132]/5 hover:text-[#0F5132] border border-gray-100 hover:border-[#0F5132]/20 rounded-xl cursor-pointer transition-all group min-h-[44px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-[#0F5132] flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </span>
                  <div className="text-left min-w-0">
                    <span className="font-semibold text-xs text-gray-900 block group-hover:text-[#0F5132] truncate">View Active Passport</span>
                    <span className="text-[10px] text-gray-400 block truncate">Preview live customer screens</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
              </button>
            </div>
          </div>

          {/* Today's Growth Opportunities */}
          {opportunityNotice && (
            <div className="bg-emerald-50 border border-emerald-100 text-[#0F5132] text-xs p-4 rounded-xl flex items-center justify-between gap-3 animate-slide-in shadow shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#0F5132]" />
                <div>
                  <span className="font-bold block">Campaign Transmitted</span>
                  <span className="text-gray-500 text-[10px]">{opportunityNotice} automated trigger successfully deployed to segment.</span>
                </div>
              </div>
              <button onClick={() => setOpportunityNotice(null)} className="text-[10px] font-bold text-gray-400 hover:text-gray-900 cursor-pointer">
                DISMISS
              </button>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-display text-sm font-semibold text-[#0F5132] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Today's Growth Opportunities
              </h3>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">Action Suggested</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                <span className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">18 Scanned Visitors Unregistered</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                    18 shoppers inspected digital passports today but haven't registered their garment warranties.
                  </p>
                  <button
                    onClick={() => setOpportunityNotice("WhatsApp Retargeting Reminder")}
                    className="mt-3 bg-[#0F5132] hover:bg-[#145A32] text-white px-3.5 h-7 rounded-full text-[10px] font-bold cursor-pointer transition-all self-start"
                  >
                    Ping WhatsApp Reminder
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                <span className="p-2 rounded-lg bg-emerald-50 text-[#0F5132] shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">3 Registered Birthdays This Week</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                    3 registered brand owners are celebrating this week. Delight them with a custom brand token.
                  </p>
                  <button
                    onClick={() => setOpportunityNotice("Birthday Congratulatory Gift Coupon")}
                    className="mt-3 bg-[#0F5132] hover:bg-[#145A32] text-white px-3.5 h-7 rounded-full text-[10px] font-bold cursor-pointer transition-all self-start"
                  >
                    Dispatch Gift Coupon
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main layout (Split activity & metrics details) */}
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Recent Activity Feed */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-sm font-semibold text-gray-900 uppercase tracking-wider">Recent Activity Feed</h3>
                <span className="text-[10px] bg-emerald-50 text-[#0F5132] px-2 py-0.5 rounded-full font-semibold animate-pulse">Live Tracking</span>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {recentActivities.map((act, idx) => {
                  const prod = products.find(p => p.id === act.productId);
                  const isRegister = act.eventType === 'register';
                  const isScan = act.eventType === 'scan';
                  const isShare = act.eventType === 'share';
                  
                  return (
                    <div key={act.id || idx} className="py-3.5 flex items-start gap-3 first:pt-0 last:pb-0">
                      <div className={`p-2 rounded-xl text-xs shrink-0 ${
                        isRegister ? 'bg-emerald-100 text-emerald-800' :
                        isScan ? 'bg-[#0F5132]/10 text-[#0F5132]' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isRegister ? <UserCheck className="w-4 h-4" /> :
                         isScan ? <QrCode className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 leading-normal">
                          {isRegister ? (
                            <span>
                              <strong>{act.metadata?.ownerName || 'A customer'}</strong> registered warranty for{' '}
                              <strong className="text-gray-900 font-medium">{prod ? prod.name : 'Unknown Product'}</strong>.
                            </span>
                          ) : isScan ? (
                            <span>
                              Product <strong>{prod ? prod.name : 'Unknown Product'}</strong> was scanned in{' '}
                              <strong className="text-gray-900 font-medium">{act.metadata?.location || 'Nigeria'}</strong> via {act.metadata?.referrer || 'WhatsApp'}.
                            </span>
                          ) : (
                            <span>
                              Provenance certificate of <strong>{prod ? prod.name : 'Unknown Product'}</strong> was shared from{' '}
                              <strong className="text-gray-900 font-medium">{act.metadata?.location || 'Nigeria'}</strong>.
                            </span>
                          )}
                        </p>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.metadata?.location || 'Lagos, NG'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Micro details panel */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
              <h3 className="font-display text-sm font-semibold text-gray-900 uppercase tracking-wider">Top Performing Products</h3>
              
              <div className="flex flex-col gap-3">
                {products.slice(0, 3).map((p, idx) => {
                  const qr = qrcodes.find(q => q.productId === p.id);
                  const scans = qr ? qr.scanCount : 0;
                  const owns = ownerships.filter(o => o.productId === p.id).length;
                  
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all cursor-pointer" onClick={() => onNavigate(`passport/${p.id}`)}>
                      <img className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" src={p.heroImage} alt={p.name} />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-gray-900 block truncate">{p.name}</span>
                        <span className="text-[10px] text-gray-400 block truncate">{p.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900 block">{scans} scans</span>
                        <span className="text-[9px] text-gray-400 block">{owns} owners</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => onNavigate('analytics')}
                className="w-full text-center border border-gray-200 hover:border-[#0F5132] hover:text-[#0F5132] hover:bg-[#0F5132]/5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all mt-2"
              >
                View Full Analytics Reporting
              </button>
            </div>

          </div>
    </div>
  );
}
