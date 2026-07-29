import React, { useState } from 'react';
import { Settings, Save, AlertTriangle, ShieldAlert, CheckCircle2, RotateCcw, Trash2, Heart, Upload, Image } from 'lucide-react';
import { Brand } from '../types';
import { getBrand, saveBrand, resetToSampleData, clearStorage } from '../lib/storage';
import ProBadge from './ProBadge';
import { PaystackCheckoutModal } from './PaystackCheckoutModal';

const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
  <button
    type="button"
    onClick={onChange}
    className="flex items-center gap-2.5 cursor-pointer select-none group text-left self-start"
  >
    <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${checked ? 'bg-[#0F5132]' : 'bg-gray-200'}`}>
      <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transform duration-200 ease-in-out ${checked ? 'translate-x-3.5' : 'translate-x-0'}`} />
    </div>
    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors leading-none">{label}</span>
  </button>
);

interface BrandSettingsProps {
  onRefresh: () => void;
}

export default function BrandSettings({ onRefresh }: BrandSettingsProps) {
  const brand = getBrand();

  const [name, setName] = useState(brand.name);
  const [slogan, setSlogan] = useState(brand.slogan || '');
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl);
  const [coverUrl, setCoverUrl] = useState(brand.coverUrl);
  const [primaryColor, setPrimaryColor] = useState(brand.primaryColor || '#0F5132');
  const [secondaryColor, setSecondaryColor] = useState(brand.secondaryColor || '#145A32');
  const [description, setDescription] = useState(brand.description || '');
  const [supportEmail, setSupportEmail] = useState(brand.supportEmail || 'info@atelier.com');
  const [plan, setPlan] = useState<'starter' | 'professional' | 'enterprise'>(brand.plan || 'starter');

  const [defaultWarranty, setDefaultWarranty] = useState(12);
  const [buyNowType, setBuyNowType] = useState(brand.defaultBuyNowType || 'whatsapp');
  const [buyNowUrl, setBuyNowUrl] = useState(brand.defaultBuyNowUrl || '+2348123456789');
  
  const [showDesignerNote, setShowDesignerNote] = useState(true);
  const [showOrigin, setShowOrigin] = useState(true);
  const [showSerial, setShowSerial] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
const [inviteEmail, setInviteEmail] = useState('');
const [inviteRole, setInviteRole] = useState('Editor');
const [teamMembers, setTeamMembers] = useState<{ name: string; role: string; permission: string }[]>([]);

  const handlePlanSelectChange = (newPlan: 'starter' | 'professional' | 'enterprise') => {
    if (newPlan === 'professional' && brand.plan !== 'professional' && brand.plan !== 'enterprise') {
      // Trigger Paystack payment flow for upgrading to Professional plan
      setShowPaystackModal(true);
    } else {
      setPlan(newPlan);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo image is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Banner image is too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Brand name is required');

    const updatedBrand: Brand = {
      ...brand,
      name,
      slogan: slogan || undefined,
      logoUrl,
      coverUrl,
      primaryColor,
      secondaryColor,
      description: description || undefined,
      supportEmail,
      plan,
      defaultBuyNowType: buyNowType,
      defaultBuyNowUrl: buyNowUrl,
      updatedAt: new Date().toISOString()
    };

    saveBrand(updatedBrand);
    setSavedSuccess(true);
    onRefresh();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleWipeData = () => {
    if (confirm('WARNING: Are you sure you want to wipe all records from local storage? This will clear all products, collections, and registered warranty claims. This is irreversible.')) {
      clearStorage();
      onRefresh();
      alert('Local storage completely cleared.');
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans w-full max-w-full overflow-hidden">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Brand Settings</h2>
          <ProBadge plan={brand.plan} size="md" />
        </div>
        <p className="text-sm text-gray-500">Configure your global fashion brand identity, palette signatures, and administrative resets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
        
        {/* Main Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-5 w-full min-w-0">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Luxury Brand Coordinates</h3>
            {savedSuccess && (
              <span className="text-xs text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Identity Saved
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand / Atelier Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none min-h-[44px]"
              />
            </div>

            {/* Slogan */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Heritage Slogan</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="e.g. Bespoke Nigerian Heritage"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none min-h-[44px]"
              />
            </div>

            {/* Support Email */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client Support Email *</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none min-h-[44px]"
              />
            </div>

            {/* Brand Logo Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logo Image</label>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 min-h-[76px] w-full">
                {logoUrl ? (
                  <div className="relative group shrink-0">
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-white" />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-600 rounded-full p-0.5 hover:bg-red-200 transition-colors shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                    <Image className="w-5 h-5 opacity-60" />
                  </div>
                )}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <label className="bg-[#0F5132] hover:bg-[#145A32] text-white py-1 px-3 rounded-full text-[10px] font-bold cursor-pointer transition-all inline-flex items-center justify-center gap-1 w-fit h-7 shadow-sm select-none">
                    <Upload className="w-2.5 h-2.5" /> Upload Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-gray-400 truncate">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Brand Cover Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cover Banner</label>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 min-h-[76px] w-full">
                {coverUrl ? (
                  <div className="relative group shrink-0">
                    <img src={coverUrl} alt="Cover" className="w-16 h-12 rounded-lg object-cover border border-gray-200 bg-white" />
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-600 rounded-full p-0.5 hover:bg-red-200 transition-colors shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                    <Image className="w-5 h-5 opacity-60" />
                  </div>
                )}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <label className="bg-[#0F5132] hover:bg-[#145A32] text-white py-1 px-3 rounded-full text-[10px] font-bold cursor-pointer transition-all inline-flex items-center justify-center gap-1 w-fit h-7 shadow-sm select-none">
                    <Upload className="w-2.5 h-2.5" /> Upload Banner
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-gray-400 truncate">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Brand Colors */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Signature Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-full border border-gray-200 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none font-mono uppercase min-h-[40px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Signature Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-9 h-9 rounded-full border border-gray-200 cursor-pointer overflow-hidden p-0 shrink-0"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none font-mono uppercase min-h-[40px]"
                />
              </div>
            </div>

            {/* Story/Description */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Origin Story</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
              />
            </div>

            {/* Active Subscription Tier */}
            <div className="flex flex-col gap-1.5 sm:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Subscription Plan Tier</span>
                </label>
                <ProBadge plan={plan} size="sm" showLabel />
              </div>
              <select
                value={plan}
                onChange={(e) => handlePlanSelectChange(e.target.value as 'starter' | 'professional' | 'enterprise')}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 focus:border-[#2563EB] rounded-xl text-sm focus:outline-none min-h-[44px]"
              >
                <option value="starter">Starter Plan (Free - No Badge)</option>
                <option value="professional">Professional Plan (Verified - Blue Badge ✓ Enabled)</option>
                <option value="enterprise">Enterprise Plan (Enterprise - Blue Badge ✓ Enabled)</option>
              </select>
              <p className="text-[10px] text-gray-500 leading-normal">
                Brands on the Professional or Enterprise Plan dynamically show the blue verified badge across the platform header, products list, digital passports, and brand settings.
              </p>
            </div>

            {/* SECTION: Label Defaults */}
            <div className="border-t border-gray-100 pt-5 sm:col-span-2">
              <h4 className="font-display font-semibold text-xs text-[#0F5132] uppercase tracking-wider mb-3">Label Defaults</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Warranty Term</label>
                  <select
                    value={defaultWarranty}
                    onChange={(e) => setDefaultWarranty(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none h-11"
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months (Default)</option>
                    <option value={24}>24 Months</option>
                    <option value={36}>36 Months</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Default Buy Now Channel</label>
                  <select
                    value={buyNowType}
                    onChange={(e) => setBuyNowType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none h-11 font-medium"
                  >
                    <option value="whatsapp">WhatsApp Business</option>
                    <option value="instagram">Instagram Direct</option>
                    <option value="website">Brand Website Storefront (Optional URL)</option>
                    <option value="custom">Custom Link</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {buyNowType === 'whatsapp' 
                      ? 'Default WhatsApp Number' 
                      : buyNowType === 'instagram' 
                      ? 'Default Instagram Handle' 
                      : buyNowType === 'website'
                      ? 'Default Storefront URL (Optional)'
                      : 'Default Channel Handle / URL'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      buyNowType === 'website'
                        ? 'e.g. https://yourbrand.com (Optional)'
                        : buyNowType === 'whatsapp'
                        ? 'e.g. +2348123456789'
                        : 'e.g. @yourbrand'
                    }
                    value={buyNowUrl}
                    onChange={(e) => setBuyNowUrl(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none h-11 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION: Passport Customization Toggles */}
            <div className="border-t border-gray-100 pt-5 sm:col-span-2">
              <h4 className="font-display font-semibold text-xs text-[#0F5132] uppercase tracking-wider mb-3.5">Passport Customizations</h4>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
                <ToggleSwitch
                  checked={showDesignerNote}
                  onChange={() => setShowDesignerNote(!showDesignerNote)}
                  label="Show Designer Note"
                />
                <ToggleSwitch
                  checked={showOrigin}
                  onChange={() => setShowOrigin(!showOrigin)}
                  label="Show Origin Badge"
                />
                <ToggleSwitch
                  checked={showSerial}
                  onChange={() => setShowSerial(!showSerial)}
                  label="Display Serial Numbers"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="bg-[#0F5132] hover:bg-[#145A32] text-white h-8 rounded-full text-[11px] font-bold transition-all mt-4 cursor-pointer flex items-center justify-center gap-1.5 self-start px-4"
          >
            <Save className="w-3 h-3" /> Save Brand Profile
          </button>
        </form>

        {/* Right Column: Danger Zone / Playground Control */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full min-w-0">
          
          {/* Brand Identity Card preview */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col relative shrink-0">
            <div className="h-24 bg-gray-100 relative shrink-0">
              {coverUrl ? (
                <img src={coverUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-emerald-800 to-emerald-950" />
              )}
              <div className="absolute inset-0 bg-black/30" />
            </div>
            
            {/* Brand Logo Overlap */}
            <div className="px-6 pb-6 relative flex flex-col items-center text-center -mt-8">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  className="w-16 h-16 rounded-full object-cover bg-white border-4 border-white shadow-md shrink-0" 
                  alt="" 
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-white shadow-md shrink-0 flex items-center justify-center font-display font-black text-xl text-[#0F5132]">
                  {name ? name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <h4 className="font-display font-bold text-base text-gray-900">{name}</h4>
                <ProBadge plan={plan} size="sm" />
              </div>
              <p className="text-[10px] text-[#0F5132] font-semibold uppercase tracking-wider mt-0.5">{slogan || 'Bespoke Label'}</p>
              
              <div className="flex gap-1.5 mt-4">
                <span className="w-4 h-4 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: primaryColor }} />
                <span className="w-4 h-4 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: secondaryColor }} />
              </div>
            </div>
          </div>

          {/* Sandbox developer tools block */}
          <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 text-red-600">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider">Playground Controls</h3>
            </div>

            <p className="text-xs text-gray-500 leading-normal">
              Reset values or empty state data cache for client evaluations inside Google AI Studio.
            </p>

            <div className="flex flex-col gap-2.5">

              <button
                type="button"
                onClick={handleWipeData}
                className="bg-transparent border border-red-200 hover:bg-red-50 text-red-600 h-8 rounded-full text-[11px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" /> Wipe Clean Slate
              </button>
            </div>
          </div>

        </div>

        {/* SECTION: Team Crew Management */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 w-full min-w-0">
          <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Atelier Crew & Tailors</h3>
                <span className="text-[10px] font-extrabold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  Limit: {brand.plan === 'starter' ? '1 Member' : brand.plan === 'professional' ? '3 Members' : 'Unlimited'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Manage permissions and craft assignments for your bespoke boutique team.</p>
            </div>
            <button
  type="button"
  onClick={() => setShowInviteModal(true)}
  className="bg-[#0F5132] hover:bg-[#145A32] text-white px-4 h-7 rounded-full text-[10px] font-bold cursor-pointer shrink-0 self-start sm:self-auto transition-all"
>
  + Invite Crew
</button>
{/* Invite Crew Modal */}
{showInviteModal && (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
      <h3 className="font-display font-bold text-lg text-gray-900 mb-2">Invite Crew Member</h3>
      <p className="text-xs text-gray-500 mb-4">Send an invitation to join your atelier team.</p>
      
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
          <input
            type="email"
            placeholder="team@brand.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Role</label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
          >
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
        
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => {
              if (inviteEmail.trim()) {
                const newMember = {
                  name: inviteEmail.split('@')[0],
                  role: 'Craft Role',
                  permission: inviteRole
                };
                setTeamMembers([...teamMembers, newMember]);
                setInviteEmail('');
                setShowInviteModal(false);
                alert(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
              } else {
                alert('Please enter an email address');
              }
            }}
            className="flex-1 bg-[#0F5132] hover:bg-[#145A32] text-white py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Send Invite
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInviteModal(false);
              setInviteEmail('');
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center text-xs text-gray-400 font-medium">
  No team members added yet. Invite your first team member.
</div>
        </div>

      </div>

      {showPaystackModal && (
        <PaystackCheckoutModal
          email={supportEmail || brand.supportEmail || 'billing@verithread.com'}
          amount={25000}
          planName="Professional Plan"
          onSuccess={(ref, amt) => {
            const updated = {
              ...brand,
              plan: 'professional' as const,
              paystackReference: ref,
              paidAmount: amt,
              updatedAt: new Date().toISOString()
            };
            saveBrand(updated);
            setPlan('professional');
            setShowPaystackModal(false);
            onRefresh();
            alert(`Payment verified! Reference: ${ref}. Brand successfully upgraded to Professional Plan.`);
          }}
          onCancel={() => {
            setShowPaystackModal(false);
            setPlan(brand.plan || 'starter');
          }}
        />
      )}

    </div>
  );
}
