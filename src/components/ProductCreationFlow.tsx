import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, ShieldCheck, QrCode, Upload, Eye, CheckCircle2, ChevronRight, HelpCircle, X, CreditCard, RefreshCw } from 'lucide-react';
import { Product, Collection } from '../types';
import { getCollections, saveProduct, getProducts, getBrand, saveBrand, incrementQRCount, incrementAICount, isValidCoupon } from '../lib/storage';
import { saveProductFirestore } from '../lib/firebase';
import { generateProductStory, generateCareInstructions, generateProductTags, getPremiumHelp } from '../lib/ai';

// Client-side image compression helper to prevent mobile canvas freeze & localStorage quota errors
export function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If file size is already under 200KB, read directly
    if (file.size < 200 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

interface ProductCreationFlowProps {
  onNavigate: (route: string) => void;
  onRefresh: () => void;
}

export default function ProductCreationFlow({ onNavigate, onRefresh }: ProductCreationFlowProps) {
  const collections = getCollections();

  const [brand, setBrand] = useState(() => getBrand());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalConfig, setUpgradeModalConfig] = useState({ featureName: '', description: '' });
  const [cardNumber, setCardNumber] = useState('4012 8855 9321 0048');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('382');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  const handleApplyCoupon = () => {
    if (isValidCoupon(coupon)) {
      setIsCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  // AI states
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdProductId, setCreatedProductId] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [category, setCategory] = useState('Traditional Wear');
  const [priceMin, setPriceMin] = useState<number | ''>('');
  const [priceMax, setPriceMax] = useState<number | ''>('');

  // Step 2: Product Details
  const [fabric, setFabric] = useState('');
  const [material, setMaterial] = useState('Cotton');
  const [gsm, setGsm] = useState('Medium 150-200');
  const [color, setColor] = useState('');
  const [fit, setFit] = useState('Regular');
  const [sizeGuide, setSizeGuide] = useState('');
  const [selectedCare, setSelectedCare] = useState<string[]>([
    'Professional dry clean recommended',
    'Steam iron on low-medium heat'
  ]);
  const [customCare, setCustomCare] = useState('');

  // Step 3: Media & Gallery (Support up to 6 images)
  const [galleryImages, setGalleryImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
    '', '', '', '', ''
  ]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const heroImage = galleryImages[0] || '';
  const setHeroImage = (val: string) => {
    const updated = [...galleryImages];
    updated[0] = val;
    setGalleryImages(updated);
  };
  const [videoUrl, setVideoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputSlotIndexRef = React.useRef<number | null>(null);

  // Step 4: Customer Experience
  const [story, setStory] = useState('');
  const [founderMessage, setFounderMessage] = useState('');
  const [collectionStory, setCollectionStory] = useState('');
  const [buyNowType, setBuyNowType] = useState('whatsapp');
  const [buyNowValue, setBuyNowValue] = useState('+234 812 345 6789');
  const [warrantyPeriod, setWarrantyPeriod] = useState(12); // Default 1 Year

  // Error validations
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpgradeOnTheFly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCouponApplied) {
      if (cardNumber.length < 15 || expiry.length < 4 || cvv.length < 3) {
        alert('Please enter valid credit card details.');
        return;
      }
    }
    setIsUpgrading(true);
    setTimeout(() => {
      const freshBrand = getBrand();
      const updatedBrand = {
        ...freshBrand,
        plan: 'professional' as const,
        billingHistory: [
          ...(freshBrand.billingHistory || []),
          {
            id: `inv-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            amount: isCouponApplied ? 0 : 25000,
            planName: 'Professional',
            status: isCouponApplied ? 'Coupon' : 'Paid'
          }
        ]
      };
      saveBrand(updatedBrand);
      setBrand(updatedBrand);
      setIsUpgrading(false);
      setShowUpgradeModal(false);
      onRefresh();
      // Dispatch storage event to notify header/other parts of UI
      window.dispatchEvent(new Event('storage'));
      window.location.reload();
    }, 1800);
  };

  const generateAISector = async (sector: 'story' | 'founder' | 'collection' | 'care' | 'tags') => {
    // Check and increment AI limit first
    const aiResult = incrementAICount();
    if (!aiResult.allowed) {
      const freshBrand = getBrand();
      if (freshBrand.plan === 'starter') {
        setUpgradeModalConfig({
          featureName: "AI Creative Writers",
          description: "Unlock AI-powered boutique stories, designer statements, and heritage narratives tailored for luxury items."
        });
        setShowUpgradeModal(true);
      } else {
        alert(aiResult.message || "Monthly AI generation limit reached.");
      }
      return;
    }

    setIsGeneratingAI(sector);
    
    try {
      if (sector === 'story') {
        const generated = await generateProductStory({
          name: name || 'Traditional Garment',
          fabric: fabric || 'Premium Luxury Fabric',
          material,
          price: typeof priceMin === 'number' ? priceMin : undefined,
          category,
          gsm,
          vibe: 'Royal Dignity'
        });
        setStory(generated);
      } else if (sector === 'founder') {
        const prompt = `Write a short 1-2 sentence inspiring designer or founder note for a luxury fashion item called "${name || 'garment'}" by brand "${brand.name}".`;
        const generated = await getPremiumHelp(prompt);
        setFounderMessage(generated);
      } else if (sector === 'collection') {
        const prompt = `Write a short collection vision note (2-3 sentences) explaining how "${name || 'garment'}" fits into a luxury seasonal collection for brand "${brand.name}".`;
        const generated = await getPremiumHelp(prompt);
        setCollectionStory(generated);
      } else if (sector === 'care') {
        const generated = await generateCareInstructions(fabric || material, material);
        setCustomCare(generated);
      } else if (sector === 'tags') {
        const tags = await generateProductTags(name || 'Garment', story);
        if (tags && tags.length > 0) {
          alert(`AI Suggested Tags: ${tags.join(', ')}`);
        }
      }
    } catch (err) {
      console.warn("AI generation error:", err);
    } finally {
      setIsGeneratingAI(null);
      onRefresh(); // update global brand counts
    }
  };

  // Auto-generate SKU on name change
  useEffect(() => {
    if (name && !sku) {
      const prefix = 'AA';
      const catCode = category.substring(0, 3).toUpperCase();
      const rand = Math.floor(100 + Math.random() * 900);
      setSku(`${prefix}-${catCode}-${rand}`);
    }
  }, [name, category]);

  // Standard care instructions list
  const standardCareOptions = [
    'Dry clean only by a premium apparel specialist',
    'Professional dry clean recommended',
    'Hand wash cold with delicate detergent',
    'Machine wash cold on gentle cycle',
    'Do not wash in standard machines',
    'Do not twist or wring',
    'Steam iron on low-medium heat',
    'Line dry out of direct heavy sunlight'
  ];

  const handleCareToggle = (opt: string) => {
    if (selectedCare.includes(opt)) {
      setSelectedCare(selectedCare.filter(c => c !== opt));
    } else {
      setSelectedCare([...selectedCare, opt]);
    }
  };

  // Preset Unsplash Fashion images for fast demonstration
  const imagePresets = [
    { name: 'Traditional Luxury (Brocade)', url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800' },
    { name: 'Artisanal Textile (Aso-Oke)', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800' },
    { name: 'Emerald Velvet / Silk', url: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=800' },
    { name: 'Ankara Geometric Print', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800' },
    { name: 'Bespoke Tan Linen Suite', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800' }
  ];

  const handleFileChange = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploadingImage(true);
      try {
        const compressedBase64 = await compressImage(file, 1200, 1200, 0.82);
        const updated = [...galleryImages];
        let targetIndex = selectedSlotIndex;
        
        if (fileInputSlotIndexRef.current !== null) {
          targetIndex = fileInputSlotIndexRef.current;
        } else {
          // Find next available slot index
          const defaultPreset = 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800';
          if (galleryImages[0] === defaultPreset) {
            targetIndex = 0;
          } else {
            const firstEmptyIndex = galleryImages.findIndex(img => !img || img.trim() === '');
            if (firstEmptyIndex !== -1) {
              targetIndex = firstEmptyIndex;
            } else {
              targetIndex = selectedSlotIndex; // fallback to selected
            }
          }
        }
        
        updated[targetIndex] = compressedBase64;
        setGalleryImages(updated);
        setSelectedSlotIndex(targetIndex);
        fileInputSlotIndexRef.current = null;
      } catch (err) {
        console.error('[ProductCreationFlow] Error processing image:', err);
        alert('Could not process image file. Please try selecting a smaller JPEG or PNG image.');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Validation functions
  const validateStep = (step: number) => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!name.trim()) errs.name = 'Product name is required';
      if (!sku.trim()) errs.sku = 'SKU is required';
    } else if (step === 2) {
      if (!fabric.trim()) errs.fabric = 'Fabric composition details are required';
      if (!color.trim()) errs.color = 'Color is required';
    } else if (step === 3) {
      const currentHero = heroImage.trim() || galleryImages.find(img => img && img.trim());
      if (!currentHero) errs.heroImage = 'A high-resolution hero image URL is required';
    } else if (step === 4) {
      if (buyNowType === 'whatsapp' && !buyNowValue.trim()) {
        errs.buyNowValue = 'WhatsApp contact phone is required';
      } else if (buyNowType === 'instagram' && !buyNowValue.trim()) {
        errs.buyNowValue = 'Instagram handle/profile is required';
      } else if (buyNowType === 'custom' && !buyNowValue.trim()) {
        errs.buyNowValue = 'Destination URL or coordinate value is required';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAllSteps = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Product name is required';
    if (!sku.trim()) errs.sku = 'SKU is required';
    if (!fabric.trim()) errs.fabric = 'Fabric composition details are required';
    if (!color.trim()) errs.color = 'Color is required';

    if (buyNowType === 'whatsapp' && !buyNowValue.trim()) {
      errs.buyNowValue = 'WhatsApp contact phone is required';
    } else if (buyNowType === 'instagram' && !buyNowValue.trim()) {
      errs.buyNowValue = 'Instagram handle/profile is required';
    } else if (buyNowType === 'custom' && !buyNowValue.trim()) {
      errs.buyNowValue = 'Destination URL or coordinate value is required';
    }

    if (errs.name || errs.sku) {
      setErrors(errs);
      setCurrentStep(1);
      return false;
    }
    if (errs.fabric || errs.color) {
      setErrors(errs);
      setCurrentStep(2);
      return false;
    }
    if (errs.buyNowValue) {
      setErrors(errs);
      setCurrentStep(4);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePublish = async (isPublishing: boolean) => {
    if (isSubmittingProduct) return;
    console.log('[ProductCreationFlow] handlePublish initiated. isPublishing:', isPublishing);

    if (!validateAllSteps()) {
      console.warn('[ProductCreationFlow] Validation failed in handlePublish');
      return;
    }

    setIsSubmittingProduct(true);

    try {
      // 1. Strict limit check on active publication
      const qrResult = incrementQRCount();
      if (!qrResult.allowed) {
        console.warn('[ProductCreationFlow] Monthly QR limit reached:', qrResult.message);
        const freshBrand = getBrand();
        setUpgradeModalConfig({
          featureName: "Digital Passport QR Codes",
          description: qrResult.message || `You have reached the monthly limit of active QR passport certifications for the ${freshBrand.plan.toUpperCase()} tier.`
        });
        setShowUpgradeModal(true);
        setIsSubmittingProduct(false);
        return;
      }

      const finalCare = [...selectedCare];
      if (customCare.trim()) {
        finalCare.push(customCare.trim());
      }

      const safeName = (name || 'Bespoke Garment').trim();
      const uniqueId = `prod-${safeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const safeHeroImage = heroImage.trim() || galleryImages.find(img => img && img.trim()) || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800';

      const newProduct: Product = {
        id: uniqueId,
        brandId: brand.id || 'brand-1',
        collectionId: collectionId.trim() || undefined,
        name: safeName,
        sku: sku.trim() || `AA-TRD-${Math.floor(100 + Math.random() * 900)}`,
        category: category || 'Traditional Wear',
        description: `Premium bespoke tailored ${safeName}. Sourced and handcrafted in Nigeria.`,
        priceMin: priceMin !== '' ? Number(priceMin) : undefined,
        priceMax: priceMax !== '' ? Number(priceMax) : undefined,
        fabric: fabric.trim() || 'Premium Fabric',
        material: material || 'Cotton',
        gsm: gsm || 'Medium 150-200',
        color: color.trim() || 'Bespoke',
        fit: fit || 'Regular',
        careInstructions: finalCare,
        sizeGuide: sizeGuide.trim() || undefined,
        story: story.trim() || undefined,
        founderMessage: founderMessage.trim() || undefined,
        founderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
        collectionStory: collectionStory.trim() || undefined,
        heroImage: safeHeroImage,
        galleryImages: galleryImages.filter(img => img && img.trim() !== ''),
        videoUrl: videoUrl.trim() || undefined,
        buyNowType: buyNowType || 'whatsapp',
        buyNowValue: buyNowValue.trim() || '+234 812 345 6789',
        warrantyPeriod: warrantyPeriod || 12,
        isActive: true,
        isPublished: isPublishing,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('[ProductCreationFlow] Saving product to localStorage:', newProduct);
      saveProduct(newProduct);

      // Background Firestore sync safely without blocking success UI
      saveProductFirestore(newProduct).catch(fsErr => {
        console.warn('[ProductCreationFlow] Firestore background sync notice:', fsErr);
      });

      console.log('[ProductCreationFlow] Product certified & saved successfully:', uniqueId);
      setCreatedProductId(uniqueId);
      setIsSuccess(true);
      onRefresh();
      
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error("[ProductCreationFlow] Error publishing product:", err);
      alert("Could not certify product passport. Please check required fields and try again.");
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center gap-6 animate-fade-in font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="font-display font-bold text-2xl text-gray-900 tracking-tight">Passport Certified Successfully</h2>
          <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
            The Digital Passport for <strong>{name}</strong> is now deployed to the ledger.
            You can stick the QR tag directly onto your luxury garments.
          </p>
        </div>

        {/* QR Showcase Frame */}
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner flex flex-col items-center gap-4 w-full max-w-sm">
          <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100">
            {/* Standard decorative QR container */}
            <div className="w-40 h-40 bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 relative">
              <QrCode className="w-32 h-32 text-gray-800" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-[#0F5132] text-white text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded shadow">
                  VeriThread
                </span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-gray-400 font-mono block">SECURE HASH ID</span>
            <span className="text-xs font-mono font-semibold text-gray-700 block truncate max-w-xs">{createdProductId}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => onNavigate(`passport/${createdProductId}`)}
            className="flex-1 bg-[#0F5132] hover:bg-[#145A32] text-white py-3 rounded-xl font-medium text-sm transition-all shadow cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" /> View Live Passport
          </button>
          
          <button
            onClick={() => {
              // Reset all states and go to step 1
              setName('');
              setSku('');
              setCollectionId('');
              setCategory('Traditional Wear');
              setPriceMin('');
              setPriceMax('');
              setFabric('');
              setColor('');
              setSizeGuide('');
              setSelectedCare([
                'Professional dry clean recommended',
                'Steam iron on low-medium heat'
              ]);
              setCustomCare('');
              setStory('');
              setFounderMessage('');
              setCollectionStory('');
              setGalleryImages([
                'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
                '', '', '', '', ''
              ]);
              setSelectedSlotIndex(0);
              setIsSuccess(false);
              setCurrentStep(1);
            }}
            className="flex-1 border border-gray-300 hover:border-[#0F5132] text-gray-700 hover:text-[#0F5132] py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
          >
            Create Another Product
          </button>
        </div>

        <button
          onClick={() => onNavigate('products')}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
        >
          Back to Product List
        </button>
      </div>
    );
  }

  const currentProductsCount = getProducts().length;
  const isProductLimitReached = brand.plan === 'starter' && currentProductsCount >= 3;

  if (isProductLimitReached) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-[32px] p-8 shadow-xl text-center flex flex-col items-center gap-6 animate-fade-in font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0F5132] flex items-center justify-center border border-amber-100">
          <Sparkles className="w-8 h-8 animate-pulse text-[#0F5132]" />
        </div>
        <div>
          <span className="text-xs font-extrabold uppercase bg-emerald-100 text-[#0F5132] px-3 py-1 rounded-full tracking-wider">
            Starter Limit Reached
          </span>
          <h2 className="font-display font-extrabold text-2xl text-gray-900 mt-3 tracking-tight">Upgrade to Professional</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-2 leading-relaxed max-w-md mx-auto">
            Your brand is currently on the <strong>Starter Tier</strong>, which strictly limits you to <strong>3 products</strong> on the registry. You have reached this limit. Upgrade to unlock unlimited products, multi-angle images, premium AI, and high-tier QR quotas.
          </p>
        </div>

        {/* Benefits list */}
        <div className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl p-5 text-left max-w-md shadow-inner font-sans">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">What's unlocked in Professional:</p>
          <ul className="space-y-2 text-xs text-gray-700 font-medium">
            <li className="flex items-center gap-2 text-gray-700">✅ Unlimited Products & Digital Passports</li>
            <li className="flex items-center gap-2 text-gray-700">✅ Add up to 6 gallery images per product</li>
            <li className="flex items-center gap-2 text-gray-700">✅ Advanced AI copy and narrative generator</li>
            <li className="flex items-center gap-2 text-gray-700">✅ Complete white-labeling (remove VeriThread branding)</li>
          </ul>
        </div>

        <button
          onClick={() => {
            setUpgradeModalConfig({
              featureName: "Unlimited Luxury Passports",
              description: "Register unlimited garments on the ledger, design premium stories, and add up to 6 imagery details."
            });
            setShowUpgradeModal(true);
          }}
          className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-2 rounded-full font-medium text-xs transition-all hover:opacity-90 duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
        >
          <CreditCard className="w-3.5 h-3.5 text-white" /> Pay ₦25,000 & Upgrade Instantly
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-md animate-fade-in font-sans">
      
      {/* Wizard Step Headers */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-8 overflow-x-auto gap-4 scrollbar-none">
        {[
          { step: 1, label: 'Basic Info' },
          { step: 2, label: 'Specs & Care' },
          { step: 3, label: 'Media Assets' },
          { step: 4, label: 'Client Exp' },
          { step: 5, label: 'Review' }
        ].map(item => (
          <div key={item.step} className="flex items-center gap-2 shrink-0">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              currentStep === item.step 
                ? 'bg-[#0F5132] text-white ring-4 ring-[#0F5132]/10' 
                : currentStep > item.step ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
            }`}>
              {item.step}
            </span>
            <span className={`text-xs font-semibold hidden sm:inline ${currentStep === item.step ? 'text-[#0F5132]' : 'text-gray-400'}`}>
              {item.label}
            </span>
            {item.step < 5 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Main Wizard Form Body */}
      <div className="min-h-96 flex flex-col justify-between">
        
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <h3 className="font-display font-bold text-lg text-gray-900">Step 1: Product Basics</h3>
            <p className="text-xs text-gray-500 -mt-3">Establish the core name, category, and catalog identifiers.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. The Agbada Royale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.name ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-[#0F5132] focus:bg-white'} rounded-xl text-sm transition-all focus:outline-none min-h-[44px]`}
                />
                {errors.name && <span className="text-[10px] text-red-600 font-medium">{errors.name}</span>}
              </div>

              {/* SKU */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product SKU / Serial *</label>
                <input
                  type="text"
                  placeholder="Auto-generated or custom"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.sku ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-[#0F5132] focus:bg-white'} rounded-xl text-sm font-mono focus:outline-none min-h-[44px]`}
                />
                {errors.sku && <span className="text-[10px] text-red-600 font-medium">{errors.sku}</span>}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value="Traditional Wear">Traditional Wear</option>
                  <option value="Streetwear">Streetwear</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Collection dropdown */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Associated Collection</label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value="">None (Standalone Release)</option>
                  {collections.map(col => (
                    <option key={col.id} value={col.id}>{col.name} ({col.season} {col.year})</option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Min Price (₦, Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 120000"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Price (₦, Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Spec details & Care */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <h3 className="font-display font-bold text-lg text-gray-900">Step 2: Specifications & Fabric Care</h3>
            <p className="text-xs text-gray-500 -mt-3">Add detailed fabric properties, fit coordinates, and care templates.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Fabric Details */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fabric Composition *</label>
                  <span className="text-[10px] font-medium text-gray-400">Click a preset or type custom blend</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 100% Supima Cotton, Mulberry Silk, or Hand-loomed Aso-Oke..."
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.fabric ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-[#0F5132] focus:bg-white'} rounded-xl text-sm focus:outline-none`}
                />
                {errors.fabric && <span className="text-[10px] text-red-600 font-medium">{errors.fabric}</span>}

                {/* Popular Fashion Fabric Presets */}
                <div className="mt-1 flex flex-wrap items-center gap-1.5 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-1">Popular Fabrics:</span>
                  {[
                    '100% Supima Cotton',
                    'Hand-loomed Aso-Oke',
                    'Mulberry Silk Satin',
                    'Italian Wool Tweed',
                    'French Guipure Lace',
                    '100% Pure Linen',
                    'Damask Brocade',
                    'Cashmere Wool Blend',
                    '14oz Raw Denim',
                    'Cotton Velvet',
                    'Silk Organza',
                    'Heavy French Terry (400 GSM)',
                    'Rayon Viscose',
                    'Lambskin Leather',
                    'Jacquard Weave'
                  ].map((fPreset) => (
                    <button
                      key={fPreset}
                      type="button"
                      onClick={() => setFabric(fPreset)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium ${
                        fabric === fPreset
                          ? 'bg-[#0F5132] text-white border-[#0F5132] shadow-sm font-semibold'
                          : 'bg-white hover:bg-emerald-50 text-gray-700 hover:text-[#0F5132] border-gray-200 hover:border-emerald-200'
                      }`}
                    >
                      + {fPreset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Material Class</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value="Cotton">Cotton (Supima, Organic, Egyptian)</option>
                  <option value="Linen">Linen & Linen Blends</option>
                  <option value="Silk">Silk (Mulberry, Satin, Organza, Chiffon)</option>
                  <option value="Wool">Wool (Merino, Cashmere, Tweed, Flannel)</option>
                  <option value="Aso-Oke (Loomed)">Aso-Oke & Traditional Handloom</option>
                  <option value="Damask / Brocade">Damask, Brocade & Jacquard</option>
                  <option value="Velvet">Velvet & Corduroy</option>
                  <option value="Denim">Denim & Heavy Twill</option>
                  <option value="Lace">Lace, Guipure & Tulle</option>
                  <option value="Satin">Satin & Charmeuse</option>
                  <option value="Viscose / Rayon">Viscose, Rayon & Modal</option>
                  <option value="Leather">Leather, Suede & Vegan Leather</option>
                  <option value="Knitwear">Fleece, French Terry & Heavy Knit</option>
                  <option value="Chiffon / Sheer">Chiffon, Georgette & Sheer</option>
                  <option value="Polyester">Polyester & Technical Synthetics</option>
                  <option value="Blended">Blended / Composite Fabrics</option>
                  <option value="Other">Other Specialty Fabric</option>
                </select>
              </div>

              {/* GSM */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fabric Density (GSM)</label>
                <select
                  value={gsm}
                  onChange={(e) => setGsm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value="Light 100-150">Light 100-150 (Airy kaftans/resort)</option>
                  <option value="Medium 150-200">Medium 150-200 (Senator suits/linen)</option>
                  <option value="Heavy 200-300">Heavy 200-300 (Heavy Agbada/jackets)</option>
                  <option value="Custom">Custom Density</option>
                </select>
              </div>

              {/* Color & Fit */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Color / Wash *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Indigo"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.color ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-[#0F5132] focus:bg-white'} rounded-xl text-sm focus:outline-none`}
                />
                {errors.color && <span className="text-[10px] text-red-600 font-medium">{errors.color}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Silhoutte Fit</label>
                <select
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value="Regular">Regular Fit</option>
                  <option value="Slim">Slim Tailored Fit</option>
                  <option value="Relaxed">Relaxed Flowing Fit</option>
                  <option value="Oversized">Oversized Drape</option>
                  <option value="Bespoke custom">Bespoke Custom Tailored</option>
                </select>
              </div>

              {/* Care options checkboxes */}
              <div className="flex flex-col gap-2 sm:col-span-2 mt-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stitched Care Instructions</label>
                <div className="grid sm:grid-cols-2 gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {standardCareOptions.map(opt => (
                    <label key={opt} className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCare.includes(opt)}
                        onChange={() => handleCareToggle(opt)}
                        className="mt-0.5 accent-[#0F5132]"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Care instruction add */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Care Note (Optional)</label>
                <input
                  type="text"
                  placeholder="Add custom care line to be displayed in passport..."
                  value={customCare}
                  onChange={(e) => setCustomCare(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Media */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-gray-900">Step 3: High-Fashion Media Assets</h3>
                <p className="text-xs text-gray-500 mt-0.5">Upload your main showcase visual and up to 5 optional detailed garment angles.</p>
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-50 text-[#0F5132] px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                {galleryImages.filter(img => img && img.trim() !== '').length}/6 Slots Added
              </span>
            </div>

            <div className="flex flex-col gap-5">
              
              {/* Grid of 6 image slots */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Garment Imagery Gallery</label>
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                    ✨ 6 Detail Slots Active for All Tiers
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const isLocked = false;
                    const slotImage = galleryImages[idx];
                    const isSelected = selectedSlotIndex === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isLocked) {
                            setUpgradeModalConfig({
                              featureName: "Boutique Multi-Angle Gallery",
                              description: "Upload up to 6 professional product views, fabric details, and styling angles to create an immersive, luxury-grade customer passport."
                            });
                            setShowUpgradeModal(true);
                          } else {
                            setSelectedSlotIndex(idx);
                            // If slot is empty, trigger file input directly for this slot!
                            if (!slotImage || slotImage.trim() === '') {
                              fileInputSlotIndexRef.current = idx;
                              document.getElementById('device-image-input')?.click();
                            }
                          }
                        }}
                        className={`relative aspect-square rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center transition-all bg-white group cursor-pointer ${
                          isSelected 
                            ? 'border-[#0F5132] ring-2 ring-[#0F5132]/10 scale-[1.02] shadow-sm' 
                            : 'border-gray-200 hover:border-[#0F5132]'
                        }`}
                      >
                        {slotImage ? (
                          <>
                            <img src={slotImage} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            {/* Clear slot button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation(); // Stop click from bubbling and selecting the slot
                                const updated = [...galleryImages];
                                updated[idx] = '';
                                setGalleryImages(updated);
                              }}
                              className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full shadow transition-all hover:scale-110 z-10"
                              title="Remove image"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 p-1 text-center">
                            <Upload className="w-4 h-4 text-gray-400 group-hover:text-[#0F5132]" />
                            <span className="text-[8px] text-gray-400 font-bold uppercase group-hover:text-gray-600">Slot {idx + 1}</span>
                            <span className="text-[6px] text-[#0F5132] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Click to Upload</span>
                          </div>
                        )}

                        {/* Badge indicator */}
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[6px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
                          {idx === 0 ? 'Cover' : `Angle ${idx + 1}`}
                        </div>

                        {/* Lock overlay for Starter tier */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center gap-0.5 text-white">
                            <span className="p-1 bg-[#0F5132]/90 rounded-full scale-90">
                              <svg className="w-2.5 h-2.5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </span>
                            <span className="text-[6px] font-extrabold uppercase tracking-widest text-amber-300">PRO</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Editing block for current selected slot */}
              <div className="bg-white p-5 border border-gray-100 rounded-3xl flex flex-col gap-4 shadow-sm relative">
                <div className="flex items-center gap-2 justify-between flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      Editing Slot {selectedSlotIndex + 1}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {selectedSlotIndex === 0 ? '(Primary Cover Image)' : '(Detail/Gallery Angle)'}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#0F5132] font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
                    💡 Click any slot above to view/edit it
                  </span>
                </div>

                {/* Drag and Drop Zone */}
                <div className="flex flex-col gap-1.5">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => {
                      fileInputSlotIndexRef.current = null; // Auto-detect slot
                      document.getElementById('device-image-input')?.click();
                    }}
                    className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#0F5132] bg-[#0F5132]/5 scale-[0.99]'
                        : 'border-gray-200 hover:border-[#0F5132] hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <input
                      id="device-image-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#0F5132] flex items-center justify-center">
                      {isUploadingImage ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-800">
                        {isUploadingImage ? '⚡ Optimizing & Compressing Image...' : '⚡ Quick Fast Upload Zone'}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {isUploadingImage
                          ? 'Auto-scaling high-res phone photo to lightweight 1200px web format...'
                          : 'Click here or drop a file to automatically fill the next available slot!'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                        PNG, JPG, JPEG, or WEBP (Direct auto-flow, no manual slot picking needed)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main image preview */}
                {galleryImages[selectedSlotIndex] && (
                  <div className="relative h-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm max-w-xs mx-auto w-full">
                    <img src={galleryImages[selectedSlotIndex]} className="w-full h-full object-cover" alt="Selected Preview" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 right-2 bg-[#0F5132] text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase shadow">
                      Slot {selectedSlotIndex + 1} Active Preview
                    </div>
                  </div>
                )}

                {selectedSlotIndex === 0 && errors.heroImage && !galleryImages[0] && (
                  <span className="text-[10px] text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100 block text-center">{errors.heroImage}</span>
                )}
              </div>

              {/* Video Url */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Video Highlight URL (Optional)</label>
                <input
                  type="text"
                  placeholder="YouTube, Vimeo, or MP4 link showing model walking/production..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Customer Experience */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <h3 className="font-display font-bold text-lg text-gray-900">Step 4: Customer Experience & Stories</h3>
            <p className="text-xs text-gray-500 -mt-3">Draft provenance narratives and configure social commerce WhatsApp routing.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Product Story */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Garment Story (Optional, max 300 words)</label>
                  <button
                    type="button"
                    disabled={isGeneratingAI !== null}
                    onClick={() => generateAISector('story')}
                    className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-white bg-[#0F5132] hover:bg-[#145A32] px-2.5 py-1 sm:px-3 sm:py-1 rounded-md cursor-pointer transition-all active:scale-95 duration-150 disabled:opacity-50 shadow-none border border-emerald-800/10"
                  >
                    {isGeneratingAI === 'story' ? (
                      <>
                        <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                        Weaving Lore...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-500" />
                        AI Generate Story
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  placeholder="Describe the aesthetic background, weavers cooperative, and design details..."
                  rows={3}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                />
              </div>

              {/* Founder message */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Designer / Founder Note (Max 100 words)</label>
                  <button
                    type="button"
                    disabled={isGeneratingAI !== null}
                    onClick={() => generateAISector('founder')}
                    className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-white bg-[#0F5132] hover:bg-[#145A32] px-2.5 py-1 sm:px-3 sm:py-1 rounded-md cursor-pointer transition-all active:scale-95 duration-150 disabled:opacity-50 shadow-none border border-emerald-800/10"
                  >
                    {isGeneratingAI === 'founder' ? (
                      <>
                        <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                        Drafting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-500" />
                        AI Generate Note
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  placeholder="e.g. 'True elegance lies in custom identity...'"
                  rows={2}
                  value={founderMessage}
                  onChange={(e) => setFounderMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                />
              </div>

              {/* Collection narrative */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collection Vision Note (Max 200 words)</label>
                  <button
                    type="button"
                    disabled={isGeneratingAI !== null}
                    onClick={() => generateAISector('collection')}
                    className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-white bg-[#0F5132] hover:bg-[#145A32] px-2.5 py-1 sm:px-3 sm:py-1 rounded-md cursor-pointer transition-all active:scale-95 duration-150 disabled:opacity-50 shadow-none border border-emerald-800/10"
                  >
                    {isGeneratingAI === 'collection' ? (
                      <>
                        <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                        Styling Vision...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-500" />
                        AI Generate Vision
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  placeholder="How does this garment map into the broader seasonal vision..."
                  rows={2}
                  value={collectionStory}
                  onChange={(e) => setCollectionStory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                />
              </div>

              <hr className="sm:col-span-2 border-gray-100 my-1" />

              {/* Social CTA config */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Default 'Buy Now' Channel</label>
                <select
                  value={buyNowType}
                  onChange={(e) => {
                    setBuyNowType(e.target.value);
                    if (e.target.value === 'whatsapp') setBuyNowValue('+234 812 345 6789');
                    else if (e.target.value === 'instagram') setBuyNowValue('adeleke_atelier');
                    else setBuyNowValue('');
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value="whatsapp">WhatsApp Business Chat</option>
                  <option value="instagram">Instagram Direct Message</option>
                  <option value="website">Brand Website Storefront (Optional URL)</option>
                  <option value="custom">Other Custom Link</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {buyNowType === 'whatsapp' 
                    ? 'WhatsApp Phone Number *' 
                    : buyNowType === 'instagram' 
                    ? 'Instagram Handle *' 
                    : buyNowType === 'website' 
                    ? 'Website URL (Optional)' 
                    : 'Destination URL Link *'}
                </label>
                <input
                  type="text"
                  placeholder={
                    buyNowType === 'whatsapp' 
                      ? 'e.g. +2348123456789' 
                      : buyNowType === 'instagram' 
                      ? 'e.g. adeleke_atelier' 
                      : buyNowType === 'website'
                      ? 'e.g. https://yourbrand.com/item (Optional - defaults to brand homepage)'
                      : 'e.g. https://brand.com/item'
                  }
                  value={buyNowValue}
                  onChange={(e) => setBuyNowValue(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.buyNowValue ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-[#0F5132] focus:bg-white'} rounded-xl text-sm focus:outline-none font-medium`}
                />
                {buyNowType === 'website' && (
                  <span className="text-[10px] text-gray-500 font-medium">
                    Optional: Leave blank if you want customers to visit your brand's primary homepage URL.
                  </span>
                )}
                {errors.buyNowValue && <span className="text-[10px] text-red-600 font-medium">{errors.buyNowValue}</span>}
              </div>

              {/* Warranty period */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lifetime Warranty Period</label>
                <select
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value={6}>6 Months Warranty</option>
                  <option value={12}>1 Year Corporate Warranty</option>
                  <option value={24}>2 Year Platinum Warranty</option>
                  <option value={36}>3 Year Premium Bespoke Warranty</option>
                  <option value={60}>5 Year Heritage Warranty</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Publish Summary */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <h3 className="font-display font-bold text-lg text-gray-900">Step 5: Review & Certify Product Identity</h3>
            <p className="text-xs text-gray-500 -mt-3">Inspect all parameters before signing the registry definitions.</p>

            <div className="grid sm:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
              
              {/* Thumbnail and specs card */}
              <div className="flex flex-col gap-3">
                <div className="h-44 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img src={heroImage} className="w-full h-full object-cover" alt="Review hero" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-gray-900">{name || 'Unnamed Product'}</h4>
                  <span className="text-[10px] font-mono text-gray-400 mt-0.5 block">SKU: {sku}</span>
                  <span className="inline-block bg-[#0F5132]/10 text-[#0F5132] font-semibold text-[9px] uppercase px-2 py-0.5 rounded-full mt-1.5">
                    {category}
                  </span>
                </div>
              </div>

              {/* Parameters specs */}
              <div className="sm:col-span-2 flex flex-col gap-4 text-xs text-gray-600">
                <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Fabric</span>
                    <strong className="text-gray-900 font-semibold">{fabric || 'Not set'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Material Type</span>
                    <strong className="text-gray-900 font-semibold">{material}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Density (GSM)</span>
                    <strong className="text-gray-900 font-semibold">{gsm}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Silhouette</span>
                    <strong className="text-gray-900 font-semibold">{fit}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Color Coordinates</span>
                    <strong className="text-gray-900 font-semibold">{color || 'Not set'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Warranty Period</span>
                    <strong className="text-gray-900 font-semibold">{warrantyPeriod} Months</strong>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1.5">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Social Ordering Routing Target</span>
                  <p className="text-gray-900 font-medium font-mono text-xs">
                    [{buyNowType.toUpperCase()}] ➔ {buyNowValue || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons Row */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between border-t border-gray-150 pt-5 mt-6 sm:mt-8 gap-3 w-full pb-10 sm:pb-0 relative z-20">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => handleBack()}
              className="px-4 py-3 sm:py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 sm:bg-transparent hover:bg-gray-100 rounded-full cursor-pointer transition-all flex items-center justify-center gap-1.5 min-h-[48px] sm:min-h-[44px] touch-manipulation w-full sm:w-auto active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Back
            </button>
          ) : (
            <div className="w-1 hidden sm:block" />
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto relative z-20">
            {currentStep === 5 ? (
              <>
                <button
                  type="button"
                  disabled={isSubmittingProduct}
                  onClick={() => {
                    console.log('[ProductCreationFlow] Mobile/Desktop Save Draft clicked');
                    handlePublish(false);
                  }}
                  className="px-4 py-3 sm:py-2.5 border border-gray-200 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center justify-center whitespace-nowrap min-h-[48px] sm:min-h-[44px] touch-manipulation w-full sm:w-auto bg-white active:scale-[0.98] disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmittingProduct}
                  onClick={() => {
                    console.log('[ProductCreationFlow] Mobile/Desktop Certify & Publish clicked');
                    handlePublish(true);
                  }}
                  className="bg-[#0F5132] hover:bg-[#145A32] active:bg-[#0B3D26] text-white px-5 py-3 sm:py-2.5 rounded-full text-xs font-semibold shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all whitespace-nowrap min-h-[48px] sm:min-h-[44px] touch-manipulation w-full sm:w-auto relative z-30 select-none active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmittingProduct ? (
                    <>
                      <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5 animate-spin" />
                      Certifying Passport...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Certify & Publish
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleNext()}
                className="bg-[#0F5132] hover:bg-[#145A32] active:bg-[#0B3D26] text-white px-5 py-3 sm:py-2.5 rounded-full text-xs font-semibold shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all whitespace-nowrap min-h-[48px] sm:min-h-[44px] touch-manipulation w-full sm:w-auto relative z-30 select-none active:scale-[0.98]"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Upgrade Modal overlay */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative animate-scale-up">
            
            {/* Close */}
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-full hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header banner */}
            <div className="bg-[#0F5132] p-6 text-white text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-amber-400 mb-1">
                <Sparkles className="w-6 h-6 fill-amber-400" />
              </div>
              <h4 className="font-display font-bold text-lg leading-snug">Unlock {upgradeModalConfig.featureName}</h4>
              <p className="text-[11px] text-emerald-100 max-w-xs leading-relaxed">
                {upgradeModalConfig.description}
              </p>
            </div>

            {/* Price block */}
            <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 text-center">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block mb-1">PRO MEMBERSHIP</span>
              <div className="flex items-baseline justify-center gap-1.5 text-[#0F5132]">
                <span className="text-3xl font-bold font-sans">
                  {isCouponApplied ? 'FREE' : '₦25,000'}
                </span>
                <span className="text-xs font-semibold text-[#0F5132]/70">
                  {isCouponApplied ? 'Coupon Applied' : '/ month'}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpgradeOnTheFly} className="p-6 flex flex-col gap-4">
              {/* Coupon Code Input */}
              <div className="flex flex-col gap-1.5 border-b border-gray-100 pb-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (e.g. FREE_PRO)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    disabled={isUpgrading || isCouponApplied}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isUpgrading || isCouponApplied || !coupon.trim()}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
                  >
                    {isCouponApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-600 font-medium">{couponError}</p>}
                {isCouponApplied && (
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Coupon applied successfully! 100% discount.
                  </p>
                )}
              </div>

              {!isCouponApplied ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Debit Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs font-mono focus:outline-none"
                        placeholder="4012 8855 9321 0048"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs font-mono focus:outline-none"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CVV Security</label>
                      <input
                        type="text"
                        required
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs font-mono focus:outline-none"
                        placeholder="3-Digits"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-center text-xs text-emerald-800 font-medium">
                  💳 Payment fields bypassed with 100% coupon discount
                </div>
              )}

              <button
                type="submit"
                disabled={isUpgrading}
                className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-2 rounded-full font-medium text-xs transition-all hover:opacity-90 mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isUpgrading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Authorizing Secure Paystack...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isCouponApplied ? 'Upgrade Now for Free' : 'Authorize & Upgrade Instantly'}
                  </>
                )}
              </button>

              <p className="text-[9px] text-center text-gray-400 max-w-xs mx-auto leading-relaxed">
                🔒 Secured by Paystack and Stripe. Refundable 14-day premium guarantee.
              </p>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
