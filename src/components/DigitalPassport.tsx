import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, MessageSquare, Award, Clock, FileText, ChevronRight, ChevronLeft, Share2, 
  CheckCircle, ExternalLink, X, Globe, Heart, ArrowLeft, Thermometer, Sparkles, 
  Compass, Droplets, Waves, Clipboard, Calendar, Tag, MapPin, Users, HelpCircle, Flag
} from 'lucide-react';
import { Product, Brand, Ownership, Customer } from '../types';
import { getProductById, getBrand, registerWarranty, getOwnerships, recordQRCodeScan, getProducts, getProductsByBrand, isProductLiked, toggleProductLike, getCustomers, isPreviewModeReadOnly } from '../lib/storage';
import { fetchProductByIdFirestore, fetchBrandByIdFirestore } from '../lib/firebase';
import ProBadge from './ProBadge';
import WarrantyTracker from './WarrantyTracker';
import OwnershipRegistration from './OwnershipRegistration';
import ReportBrandModal from './ReportBrandModal';

interface DigitalPassportProps {
  productId: string;
  onNavigate?: (route: string) => void;
}

export default function DigitalPassport({ productId, onNavigate }: DigitalPassportProps) {
  const cleanProductId = productId ? productId.replace(/^#\/?/, '').replace(/^passport\//, '').trim() : '';

  const [product, setProduct] = useState<Product | null>(() => {
    return getProductById(cleanProductId) || null;
  });
  const [productBrand, setProductBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !getProductById(cleanProductId);
  });

  const localBrand = getBrand();
  const effectiveBrand: Brand = productBrand || {
    ...localBrand,
    name: localBrand.name || '',
    location: localBrand.location || ''
  };

  const brandName = effectiveBrand.name?.trim() || '';
  const brandLocation = effectiveBrand.location?.trim() || '';

  useEffect(() => {
    let isMounted = true;
    const local = getProductById(cleanProductId);

    if (local) {
      setProduct(local);
      setIsLoading(false);
      if (local.brandId) {
        if (localBrand && localBrand.id === local.brandId && localBrand.name) {
          setProductBrand(localBrand);
        } else {
          fetchBrandByIdFirestore(local.brandId).then(b => {
            if (b && isMounted) setProductBrand(b);
          }).catch(err => console.warn('[DigitalPassport] Brand fetch notice:', err));
        }
      }
    } else {
      setIsLoading(true);
    }

    if (cleanProductId) {
      fetchProductByIdFirestore(cleanProductId)
        .then(p => {
          if (!isMounted) return;
          if (p) {
            setProduct(p);
            // Also fetch brand info for this product
            if (p.brandId) {
              if (localBrand && localBrand.id === p.brandId && localBrand.name) {
                setProductBrand(localBrand);
              } else {
                fetchBrandByIdFirestore(p.brandId).then(b => {
                  if (b && isMounted) setProductBrand(b);
                }).catch(err => console.warn('[DigitalPassport] Brand fetch notice:', err));
              }
            }
            try {
              const list = getProducts();
              const existingIndex = list.findIndex(item => item.id === p.id);
              if (existingIndex >= 0) {
                list[existingIndex] = p;
              } else {
                list.push(p);
              }
              localStorage.setItem('vt_products', JSON.stringify(list));
            } catch (e) {}
          }
        })
        .catch(err => {
          console.warn('[DigitalPassport] Remote fetch notice:', err);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [cleanProductId]);

  const [activeTab, setActiveTab] = useState<'story' | 'details' | 'authenticity' | 'warranty'>('story');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() => product ? isProductLiked(product.id) : false);
  const [likeCount, setLikeCount] = useState(() => product?.likeCount || 0);
  const [viewerRole, setViewerRole] = useState<'owner' | 'guest'>('owner');

  const handleToggleLike = () => {
    if (!product) return;
    const res = toggleProductLike(product.id);
    setIsFavorite(res.isLiked);
    setLikeCount(res.likeCount);
  };
  
  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [optIn, setOptIn] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regResult, setRegResult] = useState<{ success: boolean; customer?: Customer; ownership?: Ownership } | null>(null);

  // Load existing registrations
  const ownerships = getOwnerships();
  const existingOwnership = product 
    ? ownerships.find(o => o.productId === product.id)
    : null;

  const targetBrandId = product?.brandId || effectiveBrand.id || localBrand.id;
  const otherProducts = getProductsByBrand(targetBrandId).filter(p => p.id !== product?.id && p.isPublished !== false);

  const allImages = product ? [product.heroImage, ...(product.galleryImages || [])].filter(img => img && img.trim() !== '') : [];

  // Track scanning analytics on mount (guarded per scan session, disabled in preview)
  useEffect(() => {
    if (product) {
      if (!isPreviewModeReadOnly()) {
        const sessionScanKey = `vt_scanned_${product.id}`;
        if (!sessionStorage.getItem(sessionScanKey)) {
          sessionStorage.setItem(sessionScanKey, 'true');
          recordQRCodeScan(product.id, product.brandId || effectiveBrand.id);
        }
      }
      setCurrentImageIndex(0);
      setIsFavorite(isProductLiked(product.id));
      setLikeCount(product.likeCount || 0);
    }
  }, [cleanProductId, product?.id]);

  // Auto slide effect
  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="bg-white border border-gray-200 p-8 rounded-3xl max-w-sm shadow-xl flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#0F5132] border-t-transparent rounded-full animate-spin" />
          <h2 className="font-display font-semibold text-lg text-gray-900">Authenticating Digital Passport...</h2>
          <p className="text-gray-500 text-xs">
            Connecting to VeriThread registry for ID: <code className="font-mono bg-gray-100 px-1 rounded">{cleanProductId || productId}</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="bg-white border border-gray-200 p-8 rounded-3xl max-w-sm shadow-xl flex flex-col items-center gap-4">
          <X className="w-12 h-12 text-red-600 bg-red-50 p-2 rounded-full animate-bounce" />
          <h2 className="font-display font-semibold text-lg text-gray-900">Passport Record Not Found</h2>
          <p className="text-gray-500 text-xs">
            We couldn't locate a cryptographically verified product passport matching ID: <code className="font-mono bg-gray-100 px-1 rounded">{cleanProductId || productId}</code>.
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('')}
              className="mt-2 bg-[#0F5132] text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Return Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      alert('Please fill out your Name and Email address.');
      return;
    }

    setIsRegistering(true);

    // Split first and last name
    const parts = regName.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || 'Owner';

    setTimeout(() => {
      const res = registerWarranty(product.id, {
        email: regEmail.trim(),
        firstName,
        lastName,
        phone: regPhone.trim() || undefined
      });
      setRegResult(res);
      setIsRegistering(false);
    }, 1200);
  };

  // Get WhatsApp order URL
  const getWhatsAppOrderUrl = () => {
    const text = `Hello ${brandName || 'Atelier'}, I scanned your certified digital passport for "${product.name}" (SKU: ${product.sku}) and am interested in ordering one.`;
    const num = product.buyNowValue ? product.buyNowValue.replace(/[^0-9+]/g, '') : '2348123456789';
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  // Get Instagram order URL
  const getInstagramUrl = () => {
    const handle = product.buyNowValue ? product.buyNowValue.replace('@', '') : 'verithread';
    return `https://instagram.com/${handle}`;
  };

  // Get Storefront website URL
  const getWebsiteUrl = () => {
    const raw = product.buyNowValue?.trim() || effectiveBrand.websiteUrl?.trim() || effectiveBrand.defaultBuyNowUrl?.trim() || '';
    if (!raw) return '#';
    return raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
  };

  // Render Care Icon based on instruction keywords
  const renderCareIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('dry clean')) return <Sparkles className="w-4 h-4 text-emerald-700" />;
    if (lower.includes('wash')) return <Waves className="w-4 h-4 text-blue-700" />;
    if (lower.includes('iron')) return <Thermometer className="w-4 h-4 text-amber-700" />;
    if (lower.includes('hang') || lower.includes('store')) return <Compass className="w-4 h-4 text-purple-700" />;
    return <CheckCircle className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="bg-[#F4F5F6] min-h-screen text-[#1C1C1C] flex flex-col items-center pb-16 pt-6 px-4 font-sans">
      
      {/* Interactive Simulator Role Selector (Shown only when item has been claimed) */}
      {existingOwnership && (
        <div className="w-full max-w-md mb-5 bg-[#0F5132]/5 border border-[#0F5132]/10 p-4 rounded-[24px] flex flex-col gap-2 font-sans shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-[#0F5132] uppercase tracking-wider">🔬 VeriThread Ownership Verification</span>
            <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">CLAIMED</span>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed font-sans">
            This garment has already been registered on the immutable ledger. Toggle below to view as the <strong>Original Owner</strong> vs. a <strong>Secondary Viewer</strong>.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => setViewerRole('owner')}
              className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewerRole === 'owner'
                  ? 'bg-white text-[#0F5132] shadow-sm border border-emerald-100'
                  : 'bg-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              👤 Original Owner
            </button>
            <button
              onClick={() => setViewerRole('guest')}
              className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewerRole === 'guest'
                  ? 'bg-amber-600 text-white shadow-sm border border-amber-700/10'
                  : 'bg-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              👥 Secondary Viewer
            </button>
          </div>
        </div>
      )}

      {/* Upper Certificate Wrapper (Luxury styled, eye-safe elegance) */}
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-0 sm:rounded-[32px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex flex-col relative animate-fade-in">
        
        {/* Crisp, Unobstructed Product Showcase Image */}
        <div className="relative w-full bg-stone-50 overflow-hidden group border-b border-gray-100">
          <div className="relative aspect-[4/5] sm:aspect-[1/1] w-full flex items-center justify-center bg-stone-50">
            <img 
              key={currentImageIndex}
              src={allImages[currentImageIndex] || product.heroImage} 
              className="w-full h-full object-contain sm:object-cover object-center cursor-zoom-in transition-transform duration-300 ease-out hover:scale-105" 
              alt={product.name}
              onClick={() => setLightboxOpen(true)}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Top Floating Badges (Frosted Pill Badges in corners - never obscuring product details) */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-gray-200/60 pointer-events-auto">
              <ShieldCheck className="w-4 h-4 text-[#0F5132]" />
              <span className="text-[10px] font-extrabold text-gray-900 tracking-wider uppercase">Verified Authentic</span>
            </div>
            
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setLightboxOpen(true)}
                className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 backdrop-blur-md rounded-full border border-gray-200/70 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Expand full high-resolution image"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0F5132]" />
              </button>
              <button 
                onClick={handleToggleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 backdrop-blur-md rounded-full shadow-xs border transition-all cursor-pointer text-xs font-bold active:scale-95 ${
                  isFavorite 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'bg-white/90 text-gray-800 border-gray-200/70 hover:bg-white'
                }`}
                title={isFavorite ? 'Unlike Passport' : 'Like Passport'}
              >
                <Heart className={`w-3.5 h-3.5 transition-colors ${isFavorite ? 'text-white fill-current' : 'text-red-500 fill-red-100'}`} />
                <span>{likeCount}</span>
              </button>
            </div>
          </div>

          {/* Left/Right Carousel Arrows (only if multiple images exist) */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center border border-gray-200/80"
                title="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center border border-gray-200/80"
                title="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>

              {/* Indicator Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/80 shadow-xs">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentImageIndex === idx ? 'w-4 bg-[#0F5132]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Gallery Row (clean row beneath main image) */}
        {allImages.length > 1 && (
          <div className="flex gap-2.5 px-4 py-3 bg-gray-50/80 border-b border-gray-100 overflow-x-auto shrink-0 justify-center">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-white shrink-0 shadow-xs ${
                  currentImageIndex === idx 
                    ? 'border-[#0F5132] ring-2 ring-emerald-500/20 scale-100 shadow-sm' 
                    : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        )}

        {/* Product & Brand Information Header (Dedicated, Bright, Clear Section BELOW Image) */}
        <div className="p-6 bg-white border-b border-gray-100 flex flex-col gap-4 text-left">
          {/* Brand Info Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {effectiveBrand.logoUrl ? (
                <img 
                  src={effectiveBrand.logoUrl} 
                  className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-xs bg-white shrink-0" 
                  alt={brandName || 'Brand'} 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#0F5132] text-white shadow-xs flex items-center justify-center font-display font-extrabold text-base shrink-0">
                  {brandName ? brandName.charAt(0).toUpperCase() : 'V'}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider truncate">
                    {brandName || 'Verified Atelier'}
                  </span>
                  <ProBadge plan={effectiveBrand.plan} size={16} />
                </div>
                {brandLocation && (
                  <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5 uppercase tracking-wide">
                    {brandLocation.toLowerCase().includes('origin') ? brandLocation : `${brandLocation} Origin`}
                  </span>
                )}
              </div>
            </div>

            {/* Passport Certificate Tag */}
            <div className="shrink-0 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-right">
              <span className="text-[9px] font-extrabold text-[#0F5132] uppercase tracking-wider block">
                Official Ledger
              </span>
              <span className="text-[9px] text-emerald-700 font-mono font-bold block">
                VT-{product.id.substring(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Product Name Title */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-[#0F5132] px-2.5 py-0.5 rounded-md tracking-wider border border-emerald-100">
                  {product.category}
                </span>
              )}
              {product.priceMin && (
                <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-md">
                  {product.priceMax ? `₦${Number(product.priceMin).toLocaleString()} - ₦${Number(product.priceMax).toLocaleString()}` : `₦${Number(product.priceMin).toLocaleString()}`}
                </span>
              )}
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-[11px] text-gray-400 font-mono tracking-wider">
              SKU: <strong className="text-gray-600">{product.sku}</strong>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {!(existingOwnership && viewerRole === 'guest') && (
          <div className="flex border-b border-gray-100 shrink-0 bg-white sticky top-0 z-10 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-full min-w-max justify-around sm:justify-between px-2 sm:px-4">
              {[
                { id: 'story', label: 'Our Story' },
                { id: 'details', label: 'Specifications' },
                { id: 'authenticity', label: 'Verification' },
                { id: 'warranty', label: 'Warranty' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 sm:px-5 py-3.5 text-center text-[11px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all whitespace-nowrap shrink-0 ${
                    activeTab === tab.id 
                      ? 'border-[#0F5132] text-[#0F5132] bg-emerald-50/20' 
                      : 'border-transparent text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab contents */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          {existingOwnership && viewerRole === 'guest' ? (
            <div className="flex flex-col gap-6 animate-fade-in text-left">
              <div className="bg-red-50 border border-red-100 p-5 rounded-3xl flex flex-col items-center text-center gap-3 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-red-900 uppercase tracking-wider">Garment Officially Sold</h3>
                  <p className="text-[10px] text-red-800 font-medium mt-1 leading-relaxed">
                    This unique, certified luxury piece has already been registered and is owned by another verified collector.
                  </p>
                </div>
                <div className="w-full bg-white/85 p-3 rounded-2xl border border-red-100/50 text-[10px] text-gray-500 font-mono flex flex-col gap-1 text-left shadow-sm">
                  <div><span className="text-gray-400">LEDGER STATE:</span> <span className="text-red-700 font-bold">● OWNERSHIP CLAIMED</span></div>
                  <div><span className="text-gray-400">CLAIM DATE:</span> {new Date(existingOwnership.registrationDate).toLocaleDateString()}</div>
                  <div><span className="text-gray-400">LEDGER HASH:</span> VT-{productId.substring(0, 10).toUpperCase()}</div>
                </div>
              </div>

              {/* Recommendations Section */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Explore {brandName || 'Brand'}</span>
                    <ProBadge plan={effectiveBrand.plan} size={16} />
                  </div>
                  <h4 className="font-display font-extrabold text-base text-gray-900">Bespoke Atelier Collection</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                    Since this specific masterpiece is already claimed, browse other available bespoke designs currently in our collection:
                  </p>
                </div>

                {/* Recommended list */}
                <div className="flex flex-col gap-3">
                  {otherProducts.length > 0 ? (
                    otherProducts.slice(0, 4).map((p) => (
                      <div 
                        key={p.id}
                        className="bg-white border border-gray-100 hover:border-gray-300 rounded-2xl p-3.5 flex gap-3.5 transition-all shadow-sm items-center hover:scale-[1.01]"
                      >
                        <img 
                          src={p.heroImage} 
                          className="w-14 h-14 rounded-xl object-cover border border-gray-50 bg-gray-50" 
                          alt="" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <span className="text-[9px] text-[#0F5132] bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {p.category}
                          </span>
                          <h5 className="font-display font-bold text-xs text-gray-900 truncate mt-1">{p.name}</h5>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5 font-semibold">
                            {p.priceMin && p.priceMax ? `₦${p.priceMin.toLocaleString()} - ₦${p.priceMax.toLocaleString()}` : 'Custom Pricing'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate(`passport/${p.id}`);
                            } else {
                              window.location.hash = `#/passport/${p.id}`;
                            }
                          }}
                          className="bg-[#0F5132] hover:bg-[#145A32] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-sm text-center shrink-0"
                        >
                          Explore
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-white border border-gray-100 rounded-2xl">
                      <p className="text-xs text-gray-400">No other products registered on the ledger yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>

          {/* TAB 1: Product Story */}
          {activeTab === 'story' && (
            <div className="flex flex-col gap-5 animate-fade-in text-left">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">DESIGNER INSPIRATION</span>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-sans">
                  {product.story || "Hand-crafted bespoke masterwork curated with artisan precision."}
                </p>
              </div>

              {product.founderMessage && (
                <div className="bg-gray-50 p-4.5 rounded-2xl border border-gray-100 flex gap-3.5 items-start">
                  <img 
                    className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200 shadow-sm shrink-0" 
                    src={product.founderPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"} 
                    alt="Founder" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">CREATIVE DIRECTOR NOTE</span>
                    <p className="text-xs text-gray-600 italic leading-relaxed font-sans">"{product.founderMessage}"</p>
                  </div>
                </div>
              )}

              {product.collectionStory && (
                <div className="border-t border-gray-100 pt-4 text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">THE COLLECTION SPIRIT</span>
                  <p className="text-gray-500 text-xs leading-relaxed">{product.collectionStory}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Product Specifications */}
          {activeTab === 'details' && (
            <div className="flex flex-col gap-5 animate-fade-in text-left">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">GARMENT BLUEPRINT</span>
                <p className="text-[10px] text-gray-400">Authentic materials mapped to the physical item specifications.</p>
              </div>

              {/* Grid Specifications */}
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { label: 'Fiber / Weave', val: product.fabric },
                  { label: 'Base Material', val: product.material },
                  { label: 'Density Class (GSM)', val: product.gsm || 'Medium weight' },
                  { label: 'Color Coordinates', val: product.color },
                  { label: 'Silhouette Fit', val: product.fit },
                  { label: 'Warranty Policy', val: `${product.warrantyPeriod || 12} Months Active` }
                ].map((spec, i) => (
                  <div key={i} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider">{spec.label}</span>
                    <span className="text-xs text-gray-900 font-bold block mt-1 font-sans">{spec.val}</span>
                  </div>
                ))}
              </div>

              {/* Care Instructions with Lucide Icons */}
              {product.careInstructions && product.careInstructions.length > 0 && (
                <div className="mt-2 text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">CARE PROTOCOLS</span>
                  <div className="flex flex-col gap-2 bg-gray-50 p-4.5 rounded-2xl border border-gray-100">
                    {product.careInstructions.map((inst, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-gray-600">
                        <span className="p-1 rounded-lg bg-white border border-gray-100 shadow-sm shrink-0">
                          {renderCareIcon(inst)}
                        </span>
                        <span className="leading-normal mt-0.5 font-sans">{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.sizeGuide && (
                <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-800/10 text-xs text-left">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">FITTING INSTRUCTIONS</span>
                  <p className="text-gray-600 leading-relaxed font-sans">{product.sizeGuide}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Cryptographic Authenticity */}
          {activeTab === 'authenticity' && (
            <div className="flex flex-col gap-5 animate-fade-in text-left">
              <div className="text-center p-5 bg-emerald-50 border border-emerald-100 rounded-3xl flex flex-col items-center gap-3">
                <ShieldCheck className="w-10 h-10 text-[#0F5132]" />
                <div>
                  <h3 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">Cryptographically Certified</h3>
                  <p className="text-[10px] text-emerald-800 font-bold mt-1 uppercase tracking-widest">VeriThread Cryptographic Ledger Secured</p>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">AUTHENTICITY METADATA</span>
                
                <div className="bg-gray-50 p-4.5 rounded-2xl border border-gray-100 space-y-3 font-mono text-[10px] text-gray-500">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="uppercase text-gray-400">Passport ID:</span>
                    <span className="text-gray-800 font-bold">VT-{product.id.toUpperCase().substring(0, 12)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="uppercase text-gray-400">Garment SKU:</span>
                    <span className="text-gray-800 font-bold">{product.sku}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="uppercase text-gray-400">Batch Code:</span>
                    <span className="text-gray-800 font-bold">BATCH-{(brandName || 'VT').substring(0, 4).toUpperCase()}-{new Date(product.createdAt || Date.now()).getFullYear()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="uppercase text-gray-400">Crafting Origin:</span>
                    <span className="text-gray-800 font-bold">{brandLocation || 'Authentic Handcrafted Origin'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="uppercase text-gray-400">Warranty Period:</span>
                    <span className="text-gray-800 font-bold">{product.warrantyPeriod || 12} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase text-gray-400">Authorized Seal:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">● VERITHREAD LOCK</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Warranty Registry & Ownership */}
          {activeTab === 'warranty' && (
            <div className="flex flex-col gap-6 animate-fade-in text-left">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">GARMENT WARRANTY & OWNERSHIP</span>
                <p className="text-[11px] text-gray-500">Ownership claims and warranty tracking cryptographically secured on VeriThread.</p>
              </div>

              {/* Warranty Tracker Component */}
              <WarrantyTracker
                product={product}
                ownership={regResult?.ownership || existingOwnership}
                brand={effectiveBrand}
              />

              {/* Ownership Registration Form & Celebration Component */}
              <OwnershipRegistration
                product={product}
                brand={effectiveBrand}
                existingOwnership={regResult?.ownership || existingOwnership}
                existingCustomer={regResult?.customer || (existingOwnership ? getCustomers().find(c => c.id === existingOwnership.customerId) : null)}
                onRegisterSuccess={(res) => setRegResult(res)}
                onNavigate={onNavigate}
              />
            </div>
          )}
          </>
          )}

        </div>

        {/* Commerce buy options footer panel */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center block">
            PROMPT COMMERCE REDIRECTS
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            {product.buyNowType === 'website' ? (
              <a
                href={getWebsiteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0F5132] hover:bg-[#145A32] text-white py-2 px-5 rounded-full font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer text-center whitespace-nowrap"
              >
                <Globe className="w-3.5 h-3.5" /> Buy on Website
              </a>
            ) : product.buyNowType === 'instagram' ? (
              <a
                href={getInstagramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0F5132] hover:bg-[#145A32] text-white py-2 px-5 rounded-full font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer text-center whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Order on Instagram
              </a>
            ) : (
              <a
                href={getWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0F5132] hover:bg-[#145A32] text-white py-2 px-5 rounded-full font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer text-center whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat on WhatsApp
              </a>
            )}

            {/* Secondary Channel Options */}
            {product.buyNowType !== 'whatsapp' && (
              <a
                href={getWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] py-2 px-4 rounded-full font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center border border-gray-200/50 whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" /> WhatsApp
              </a>
            )}

            {product.buyNowType !== 'instagram' && (
              <a
                href={getInstagramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] py-2 px-4 rounded-full font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center border border-gray-200/50 whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" /> Instagram
              </a>
            )}

            {product.buyNowType !== 'website' && (
              <a
                href={getWebsiteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] py-2 px-4 rounded-full font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center border border-gray-200/50 whitespace-nowrap"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" /> Storefront
              </a>
            )}
          </div>

          <div className="flex justify-between items-center text-[9px] text-gray-400 mt-2 font-sans border-t border-gray-100 pt-2.5">
            <span className="flex items-center gap-1.5">
              <span>Support: {effectiveBrand.supportEmail || 'contact@brand.com'}</span>
              <ProBadge plan={effectiveBrand.plan} size={16} />
            </span>
            <span className="font-bold text-[#0F5132] flex items-center gap-0.5 uppercase tracking-wider">
              {effectiveBrand.plan === 'starter' ? 'Powered by VeriThread' : 'VeriThread Ledger Certified'} <CheckCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          {effectiveBrand.plan === 'starter' && (
            <div className="mt-2 py-1.5 px-3 bg-emerald-50/80 border border-emerald-100 rounded-xl text-center text-[10px] text-emerald-800 font-semibold flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F5132]" />
              <span>VeriThread Digital Passport • Verified Provenance</span>
            </div>
          )}
        </div>

        {/* Explore More from Brand Section */}
        <div className="w-full mt-8 pt-6 border-t border-gray-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-gray-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-[#0F5132]" /> Explore More from {brandName || 'Atelier'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Browse authenticated garments and digital passports issued by this atelier.
              </p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate(`brand/collections?brandId=${targetBrandId}`)}
                className="self-start sm:self-auto px-4 py-1.5 bg-[#0F5132]/10 hover:bg-[#0F5132]/15 text-[#0F5132] font-semibold text-xs rounded-full border border-[#0F5132]/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
              >
                <span>View All Collection</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {otherProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {otherProducts.map(p => (
                <div
                  key={p.id}
                  className="group bg-white rounded-2xl border border-gray-200/90 p-3 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 mb-2.5 relative">
                      <img
                        src={p.heroImage || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400'}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {p.category && (
                        <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {p.category}
                        </span>
                      )}
                      {p.priceMin && (
                        <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md text-gray-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-gray-200/50">
                          ₦{Number(p.priceMin).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-semibold text-xs text-gray-900 group-hover:text-[#0F5132] transition-colors line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="font-mono text-[10px] text-gray-400 mt-0.5 truncate">
                      SKU: {p.sku}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate(`passport/${p.id}`);
                      } else {
                        window.location.hash = `/passport/${p.id}`;
                      }
                    }}
                    className="mt-3 w-full py-2 text-xs font-semibold text-[#0F5132] bg-emerald-50/80 hover:bg-emerald-100/90 text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-emerald-100 active:scale-[0.98]"
                  >
                    <span>View Passport</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 text-center shadow-xs flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#0F5132] flex items-center justify-center mb-1">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-800">
                Exclusive Signature Piece
              </p>
              <p className="text-[11px] text-gray-500 max-w-xs leading-relaxed">
                This brand hasn't published additional public garments to this collection yet. Check back soon for new authenticated releases.
              </p>
            </div>
          )}
        </div>

        {/* Report Brand link section */}
        <div className="w-full mt-8 pt-6 border-t border-gray-200/80">
          <div className="bg-gray-50/90 border border-gray-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-600 mt-0.5 sm:mt-0">
                <Flag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Encountered an issue with this garment or brand?
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Report counterfeit items, inaccurate descriptions, or fraudulent activity directly to our trust team.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-red-50 text-red-700 hover:text-red-800 border border-red-200/90 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <Flag className="w-3.5 h-3.5 text-red-600" />
              <span>Report Brand</span>
            </button>
          </div>
        </div>

      </div>

      {/* Report Brand Modal */}
      {product && (
        <ReportBrandModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          brandId={targetBrandId}
          brandName={brandName}
          productId={product.id}
          productName={product.name}
        />
      )}

      {/* Back to admin option */}
      {onNavigate && (
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mt-4 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Brand Dashboard
        </button>
      )}

      {/* Full screen Lightbox Visualizer */}
      {lightboxOpen && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 animate-fade-in cursor-zoom-out"
        >
          <button 
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={allImages[currentImageIndex] || product.heroImage} className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" alt="" referrerPolicy="no-referrer" />
        </div>
      )}

    </div>
  );
}
