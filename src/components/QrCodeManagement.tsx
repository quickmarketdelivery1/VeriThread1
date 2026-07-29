import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Share2, Globe, Palette, Settings2, CheckCircle2, Plus } from 'lucide-react';
import { Product } from '../types';
import { getProducts, getQRCodes, getBrand } from '../lib/storage';

interface QrCodeManagementProps {
  onNavigate?: (route: string) => void;
}

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

export default function QrCodeManagement({ onNavigate }: QrCodeManagementProps) {
  const products = getProducts();
  const qrcodes = getQRCodes();
  const brand = getBrand();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [qrColor, setQrColor] = useState(brand.primaryColor || '#0F5132');
  const [qrSize, setQrSize] = useState(400);
  const [showLogo, setShowLogo] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [showBrandingPrompt, setShowBrandingPrompt] = useState(false);

  const activeProduct = products.find(p => p.id === selectedProductId);

  const qrLimit = brand.plan === 'starter' ? 25 : brand.plan === 'professional' ? 250 : Infinity;
  const qrUsed = brand.qrUsedThisMonth || products.length;

  const handleColorChange = (newColor: string) => {
    if (brand.plan === 'starter') {
      setShowBrandingPrompt(true);
      return;
    }
    setQrColor(newColor);
  };

  const handleLogoToggle = () => {
    if (brand.plan === 'starter') {
      setShowBrandingPrompt(true);
      return;
    }
    setShowLogo(!showLogo);
  };

  // Generate public deep link URL for passport in preview environment
  const getPassportUrl = (prodId: string) => {
    return `${window.location.origin}/#/passport/${prodId}`;
  };

  const handleShare = (prodId: string) => {
    const url = getPassportUrl(prodId);
    navigator.clipboard.writeText(url);
    setCopiedIndex(prodId);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadSVG = (prodId: string, name: string) => {
    // Basic SVG download function of the rendered svg
    const svgEl = document.getElementById(`qr-svg-${prodId}`);
    if (!svgEl) return;

    const svgString = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `VT-QR-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">QR Code Hub</h2>
          <p className="text-sm text-gray-500">Customize, preview, and download branded QR codes for woven apparel tags.</p>
        </div>

        {/* Plan QR Limit Meter */}
        <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {brand.plan.toUpperCase()} PLAN USAGE
            </span>
            <span className="text-xs font-extrabold text-[#0F5132]">
              {qrUsed} / {qrLimit === Infinity ? 'Unlimited' : qrLimit} QRs Created This Month
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 text-[#0F5132] flex items-center justify-center font-bold text-xs">
            {qrLimit === Infinity ? '∞' : `${Math.min(100, Math.round((qrUsed / (qrLimit || 1)) * 100))}%`}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Customize QR design */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[#0F5132]" />
              <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Tag Customization</h3>
            </div>
            {brand.plan === 'starter' && (
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                Pro Feature
              </span>
            )}
          </div>

          {products.length === 0 ? (
            <p className="text-gray-500 text-xs italic">Create a product first to customize its tag.</p>
          ) : (
            <>
              {/* Product selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs sm:text-sm focus:outline-none min-h-[40px]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              {/* Color picker */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Matrix Color</label>
                  {brand.plan === 'starter' && <span className="text-[10px] font-bold text-amber-700">Locked on Starter</span>}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer overflow-hidden p-0 shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full shadow-sm"
                  />
                  <input
                    type="text"
                    value={qrColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none font-mono uppercase font-semibold min-h-[36px]"
                  />
                </div>
              </div>

              {/* Tag Sizes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Download Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {[200, 400, 600].map(sz => (
                    <button
                      key={sz}
                      onClick={() => setQrSize(sz)}
                      className={`py-1 rounded-full text-xs font-medium cursor-pointer border transition-all text-center min-h-[32px] flex items-center justify-center ${
                        qrSize === sz 
                          ? 'bg-[#0F5132] text-white border-transparent shadow-sm' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200/80'
                      }`}
                    >
                      <span>{sz}px</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo option */}
              <div className="py-1">
                <ToggleSwitch
                  checked={showLogo}
                  onChange={handleLogoToggle}
                  label="Embed brand verification logo in center of QR"
                />
              </div>

              {/* QR Preview Block */}
              {activeProduct && (
                <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-3 w-full">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-sm relative max-w-full flex justify-center">
                    <QRCodeSVG
                      id={`qr-svg-${activeProduct.id}`}
                      value={getPassportUrl(activeProduct.id)}
                      size={150}
                      fgColor={qrColor}
                      bgColor="#FFFFFF"
                      level="H"
                      includeMargin={true}
                      imageSettings={
                        showLogo 
                          ? {
                              src: brand.logoUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150&h=150",
                              x: undefined,
                              y: undefined,
                              height: 32,
                              width: 32,
                              excavate: true,
                            }
                          : undefined
                      }
                    />
                  </div>
                  <div className="text-center w-full min-w-0">
                    <strong className="text-xs text-gray-800 font-bold block leading-tight truncate">{activeProduct.name}</strong>
                    <span className="text-[10px] text-gray-400 font-mono block mt-1 break-all px-1 leading-normal">{getPassportUrl(activeProduct.id)}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadSVG(activeProduct.id, activeProduct.name)}
                    className="mt-1 bg-[#0F5132] hover:bg-[#145A32] text-white text-xs font-semibold px-5 py-2 rounded-full cursor-pointer flex items-center justify-center gap-1.5 shadow transition-all min-h-[34px] w-auto inline-flex self-center"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Tag SVG
                  </button>
                </div>
              )}
            </>
          )}

        </div>

        {/* Right Column: Grid of all generated QR codes */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Product QR Registry</h3>
            <span className="text-xs text-gray-400 font-semibold">{products.length} Active Codes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1">
            {products.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-4 sm:col-span-2">
                <div className="w-12 h-12 rounded-full bg-[#0F5132]/10 flex items-center justify-center text-[#0F5132]">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-gray-900">No Product QR Tags Created Yet</h3>
                  <p className="text-gray-500 text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
                    Create your first Digital Product Passport to automatically generate customizable physical QR tags and NFC profiles.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate?.('products/new')}
                  className="bg-[#0F5132] hover:bg-[#145A32] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Digital Product Passport
                </button>
              </div>
            ) : products.map(p => {
              const qr = qrcodes.find(q => q.productId === p.id);
              const scans = qr ? qr.scanCount : 0;
              const hasCopied = copiedIndex === p.id;

              return (
                <div key={p.id} className="p-4 border border-gray-100 bg-gray-50/50 hover:bg-gray-100/50 rounded-2xl transition-all flex flex-col justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg border border-gray-100 shrink-0 shadow-sm">
                      {/* Micro QR preview */}
                      <QRCodeSVG
                        value={getPassportUrl(p.id)}
                        size={48}
                        fgColor={qrColor}
                        bgColor="#FFFFFF"
                        level="L"
                        includeMargin={false}
                      />
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs font-bold text-gray-900 block truncate">{p.name}</strong>
                      <span className="text-[10px] font-mono text-gray-400 truncate block mt-0.5">{p.sku}</span>
                      <span className="text-[10px] font-semibold text-[#0F5132] block mt-0.5">{scans} global scans</span>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleDownloadSVG(p.id, p.name)}
                      className="text-[10px] font-bold text-[#0F5132] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> SVG
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShare(p.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-0.5 transition-all cursor-pointer ${
                          hasCopied ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200/60 hover:bg-gray-200 text-gray-500'
                        }`}
                      >
                        {hasCopied ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Copied Link
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3 h-3" /> Share
                          </>
                        )}
                      </button>

                      <a
                        href={getPassportUrl(p.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0F5132] text-white p-1.5 rounded-lg hover:bg-[#145A32] shadow-sm flex items-center justify-center"
                        title="Open live passport page"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Upgrade Prompt Modal */}
      {showBrandingPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-5 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto shrink-0 shadow-xs">
              <Palette className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full tracking-wider">
                Professional Feature
              </span>
              <h3 className="font-display font-bold text-xl text-gray-900 mt-3">Custom QR Tag Branding</h3>
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                Custom matrix colors, high-contrast brand palettes, and embedded center logo watermarks are available exclusively on the <strong>Professional</strong> and <strong>Enterprise</strong> plans.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left text-xs text-gray-600 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-[#0F5132]" /> Custom Color Palettes
              </div>
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-[#0F5132]" /> Center Logo Embedding
              </div>
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-[#0F5132]" /> 250 QR Codes / Month
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 mt-1">
              <button
                onClick={() => {
                  setShowBrandingPrompt(false);
                  if (onNavigate) onNavigate('settings');
                }}
                className="w-full bg-[#0F5132] hover:bg-[#145A32] text-white py-3 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Upgrade to Professional (₦25,000/mo)
              </button>
              <button
                onClick={() => setShowBrandingPrompt(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                Keep Default Styling
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
