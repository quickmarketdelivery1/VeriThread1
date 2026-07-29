import React, { useState } from 'react';
import { 
  Sparkles, HelpCircle, ArrowRight, BookOpen, Layers, 
  Compass, Heart, CheckCircle2, RefreshCw, Clipboard, Check, Lock, ShieldAlert, CreditCard, ShieldCheck, MessageSquare, Send
} from 'lucide-react';
import { getBrand, incrementAICount, saveBrand, isValidCoupon } from '../lib/storage';
import { generateProductStory, getPremiumHelp, generateCareInstructions } from '../lib/ai';

interface AIPremiumHelpProps {
  onRefresh: () => void;
  onNavigate: (route: string) => void;
}

export default function AIPremiumHelp({ onRefresh, onNavigate }: AIPremiumHelpProps) {
  const [brand, setBrand] = useState(() => getBrand());
  const [activeTab, setActiveTab] = useState<'products' | 'collections' | 'recommendations' | 'advisor'>('advisor');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Upgrade / pay state inside component
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('4012 8855 9321 0048');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('382');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // AI Fashion Business Advisor Q&A State
  const [advisorPrompt, setAdvisorPrompt] = useState('');
  const [isGeneratingAdvisor, setIsGeneratingAdvisor] = useState(false);
  const [advisorResult, setAdvisorResult] = useState<string>('');

  const handleApplyCoupon = () => {
    if (isValidCoupon(coupon)) {
      setIsCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  // AI Product Playground State
  const [gType, setGType] = useState('Agbada');
  const [gFabric, setGFabric] = useState('Hand-Loomed Aso-Oke');
  const [gVibe, setGVibe] = useState('Royal Dignity');
  const [gGSM, setGGSM] = useState('320');
  const [isGeneratingProduct, setIsGeneratingProduct] = useState(false);
  const [generatedProductResult, setGeneratedProductResult] = useState<string>('');

  // AI Collection Story State
  const [cSeason, setCSeason] = useState('Rainy Season 2026');
  const [cTheme, setCTheme] = useState('Eko Streetwear Revival');
  const [cFocus, setCFocus] = useState('Artisanal Weavers of Oyo');
  const [isGeneratingCollection, setIsGeneratingCollection] = useState(false);
  const [generatedCollectionResult, setGeneratedCollectionResult] = useState<string>('');

  // Recommendations Tab state
  const [recFabric, setRecFabric] = useState('Silk');
  const [customCareResult, setCustomCareResult] = useState<string>('');
  const [isGeneratingCare, setIsGeneratingCare] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleLocalUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCouponApplied) {
      if (cardNumber.length < 15 || expiry.length < 4 || cvv.length < 3) {
        alert('Please enter valid credit card credentials.');
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
      window.dispatchEvent(new Event('storage'));
      window.location.reload();
    }, 1800);
  };

  const triggerAICall = async (type: 'product' | 'collection' | 'advisor' | 'care') => {
    // Check limit first
    const limitResult = incrementAICount();
    if (!limitResult.allowed) {
      if (brand.plan === 'starter') {
        setShowUpgradeModal(true);
      } else {
        alert(limitResult.message || "Monthly AI limit reached.");
      }
      return;
    }

    if (type === 'product') {
      setIsGeneratingProduct(true);
      try {
        const result = await generateProductStory({
          name: gType,
          fabric: gFabric,
          gsm: gGSM,
          vibe: gVibe
        });
        setGeneratedProductResult(result);
      } catch (err) {
        setGeneratedProductResult("AI is currently unavailable. Please try again later.");
      } finally {
        setIsGeneratingProduct(false);
        onRefresh();
      }
    } else if (type === 'collection') {
      setIsGeneratingCollection(true);
      try {
        const prompt = `Write an overarching seasonal collection storyline for a luxury fashion brand.
Season/Campaign: ${cSeason}
Theme: ${cTheme}
Focus Community: ${cFocus}
Brand Name: ${brand.name}`;
        const result = await getPremiumHelp(prompt);
        setGeneratedCollectionResult(result);
      } catch (err) {
        setGeneratedCollectionResult("AI is currently unavailable. Please try again later.");
      } finally {
        setIsGeneratingCollection(false);
        onRefresh();
      }
    } else if (type === 'advisor') {
      if (!advisorPrompt.trim()) return;
      setIsGeneratingAdvisor(true);
      try {
        const result = await getPremiumHelp(advisorPrompt);
        setAdvisorResult(result);
      } catch (err) {
        setAdvisorResult("AI is currently unavailable. Please try again later.");
      } finally {
        setIsGeneratingAdvisor(false);
        onRefresh();
      }
    } else if (type === 'care') {
      setIsGeneratingCare(true);
      try {
        const result = await generateCareInstructions(recFabric);
        setCustomCareResult(result);
      } catch (err) {
        setCustomCareResult("AI is currently unavailable. Please try again later.");
      } finally {
        setIsGeneratingCare(false);
        onRefresh();
      }
    }
  };

  const getFabricRecommendations = (fab: string) => {
    const details: Record<string, { care: string; story: string; gsm: string }> = {
      'Silk': {
        care: 'Dry clean only by a specialized apparel artisan. Iron reverse on low steam with a protective cotton buffer. Keep stored on wide padded hangers inside a breathable cotton garment shield.',
        story: 'Sourced from organic silk cocoons and dyed using traditional bark extracts. Features custom high-luster finish to project pristine ceremony elegance.',
        gsm: '120 GSM - Delicate ceremonies, draped wraps, premium light neck scarves'
      },
      'Hand-Loomed Aso-Oke': {
        care: 'Spot clean by hand using lukewarm water and mild organic soaps. Never tumble dry. Dry flat in natural shade to preserve metallic thread tension. Steam on reverse only.',
        story: 'Handwoven strip-by-strip over traditional wooden looms in Oyo State. Combines fine cotton warp with highly structured metallic weft yarn to achieve a rigid, majestic drape.',
        gsm: '340 GSM - Premium heavy outerwear, structural ceremonial crowns, royal Agbada panels'
      },
      'Ankara Wax Print': {
        care: 'Machine wash cold on gentle cycle with like colors using mild pH-neutral soap. Line dry out of direct sunlight to prevent premium dye fading. Warm iron on reverse side.',
        story: 'High-density pure long-staple cotton wax-resist block prints. Our Ankara supports regional cotton farms, promoting agricultural circularity.',
        gsm: '160 GSM - Summer streetwear jackets, daily structural tailoring, contemporary dresses'
      },
      'Linen / Damask': {
        care: 'Dry clean recommended to preserve the stiff luxury hand-feel. If washing at home, hand wash in cold water and roll in dry towels to absorb moisture before hanging flat.',
        story: 'European-certified sustainable flax linen blended with authentic Jacquard damask weave, creating a gorgeous low-sheen botanical pattern.',
        gsm: '220 GSM - Structured casual shirts, lightweight luxury safari suits, lounge dusters'
      }
    };
    return details[fab] || details['Silk'];
  };

  const currentRec = getFabricRecommendations(recFabric);

  return (
    <div className="flex flex-col gap-8 font-sans max-w-5xl mx-auto pb-12">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-amber-500" /> Professional Core
            </span>
          </div>
          <h1 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            AI Copywriter & Copilot Hub
          </h1>
          <p className="text-gray-500 text-xs md:text-sm">
            Leverage premium deep-learning assistants to craft luxury garment histories, collection storylines, and smart care regimes.
          </p>
        </div>
        
        {brand.plan === 'starter' && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-[#0F5132] hover:bg-[#145A32] text-white font-medium text-[11px] px-4 py-1.5 rounded-full shadow-sm cursor-pointer transition-all hover:opacity-90 flex items-center gap-1.5 self-start"
          >
            <Lock className="w-3 h-3 text-amber-300 fill-amber-300" />
            Unlock Pro Features
          </button>
        )}
      </div>

      {/* Main Tab Controller Navigation */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
        <button
          onClick={() => setActiveTab('advisor')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'advisor'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          AI Premium Help (Fashion Advisor)
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          AI Product Copywriter
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'collections'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          AI Collection Storyteller
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'recommendations'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Compass className="w-4 h-4" />
          Smart Fabric Advisor
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="flex flex-col gap-6">

        {/* TAB 0: AI PREMIUM HELP (FASHION BUSINESS ADVISOR) */}
        {activeTab === 'advisor' && (
          <div className="flex flex-col gap-6 items-start">
            <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-[#0F5132]">
                  <Sparkles className="w-5 h-5 fill-emerald-100" />
                  <h3 className="font-bold text-base text-gray-900">AI Fashion Business Advisor</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Ask our AI expert anything about pricing luxury garments, sourcing African textiles, setting up digital product passports, or scaling your atelier.
                </p>
              </div>

              {/* Input Area */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Question</label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="e.g., How should I price a hand-loomed Aso-Oke Agbada for international luxury retail? What are the best care steps for raw silk kaftans?"
                    value={advisorPrompt}
                    onChange={(e) => setAdvisorPrompt(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none font-medium leading-relaxed pr-24"
                  />
                  <button
                    onClick={() => triggerAICall('advisor')}
                    disabled={isGeneratingAdvisor || !advisorPrompt.trim()}
                    className="absolute bottom-3 right-3 bg-[#0F5132] hover:bg-[#145A32] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    {isGeneratingAdvisor ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Ask AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Response */}
              {advisorResult && (
                <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-2xl p-5 flex flex-col gap-3 relative animate-fade-in">
                  <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#0F5132] tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> AI Advisor Advice
                    </span>
                    <button
                      onClick={() => handleCopy(advisorResult, 'advisor_text')}
                      className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-[#0F5132] bg-white px-2.5 py-1 rounded-full cursor-pointer transition-all border border-gray-200/60 shadow-xs"
                    >
                      {copiedText === 'advisor_text' ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
                      {copiedText === 'advisor_text' ? 'Copied' : 'Copy Response'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-wrap">
                    {advisorResult}
                  </div>
                </div>
              )}

              {/* Example Prompts */}
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Suggested Fashion Prompts</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "How do I explain Digital Product Passports to luxury buyers?",
                    "What are the pricing multipliers for bespoke African couture?",
                    "How to preserve metallic threads in handwoven Aso-Oke?",
                    "What email strategy works best for exclusive VIP drops?"
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setAdvisorPrompt(p);
                      }}
                      className="text-[11px] bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 text-gray-700 hover:text-[#0F5132] px-3 py-1.5 rounded-full cursor-pointer transition-all"
                    >
                      💡 {p}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
        
        {/* TAB 1: PRODUCT COPYWRITING PLAYGROUND */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Input form */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Compass className="w-4 h-4 text-[#0F5132]" />
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">Story Parameters</h3>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Garment Type</label>
                <input
                  type="text"
                  value={gType}
                  onChange={(e) => setGType(e.target.value)}
                  placeholder="e.g. Agbada, Kaftan, Bomber Jacket"
                  className="w-full px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0F5132] focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Primary Luxury Fabric</label>
                <input
                  type="text"
                  value={gFabric}
                  onChange={(e) => setGFabric(e.target.value)}
                  placeholder="e.g. Hand-Loomed Aso-Oke, Brocade"
                  className="w-full px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0F5132] focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight density (GSM)</label>
                  <input
                    type="number"
                    value={gGSM}
                    onChange={(e) => setGGSM(e.target.value)}
                    placeholder="e.g. 320"
                    className="w-full px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0F5132] focus:bg-white focus:outline-none font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Artisanal Vibe</label>
                  <select
                    value={gVibe}
                    onChange={(e) => setGVibe(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0F5132] focus:bg-white focus:outline-none font-medium"
                  >
                    <option value="Royal Dignity">Royal Dignity</option>
                    <option value="Modern Minimalist">Modern Minimalist</option>
                    <option value="Vibrant Avant-Garde">Vibrant Avant-Garde</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => triggerAICall('product')}
                disabled={isGeneratingProduct}
                className="bg-[#0F5132] hover:bg-[#145A32] disabled:opacity-50 text-white px-5 h-8 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-2 self-start"
              >
                {isGeneratingProduct ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Weaving Garment Lore...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Generate Story
                  </>
                )}
              </button>
            </div>

            {/* Output display */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                {brand.plan === 'starter' && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 gap-3">
                    <Lock className="w-10 h-10 text-amber-500 fill-amber-100" />
                    <h4 className="font-display font-bold text-base text-gray-900">Premium Copywriter is Locked</h4>
                    <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
                      Upgrade to the Professional Tier to unleash automated generative stories for luxury products.
                    </p>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="bg-[#0F5132] hover:bg-[#145A32] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                    >
                      Unlock Professional
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-widest">
                      Generated Garment Narrative
                    </span>
                    {generatedProductResult && (
                      <button
                        onClick={() => handleCopy(generatedProductResult, 'prod')}
                        className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-[#0F5132] bg-gray-50 hover:bg-emerald-50 px-2.5 py-1 rounded-full cursor-pointer transition-all border border-gray-200/50"
                      >
                        {copiedText === 'prod' ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
                        {copiedText === 'prod' ? 'Copied' : 'Copy Draft'}
                      </button>
                    )}
                  </div>

                  {generatedProductResult ? (
                    <p className="text-xs text-gray-700 leading-relaxed font-serif bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/50">
                      {generatedProductResult}
                    </p>
                  ) : (
                    <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
                      <HelpCircle className="w-10 h-10 text-gray-300" />
                      <p className="text-xs font-medium max-w-xs">
                        Configure your garment parameters on the left and click "Generate" to construct your tailor-made history.
                      </p>
                    </div>
                  )}
                </div>

                {generatedProductResult && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    <span>Tone: {gVibe}</span>
                    <span className="text-emerald-700">✓ Ready to copy into Product Creator</span>
                  </div>
                )}
              </div>

              {/* Tips block */}
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 flex flex-col gap-3">
                <h4 className="font-bold text-xs text-[#0F5132] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Professional Storytelling Best Practices
                </h4>
                <ul className="text-xs text-emerald-950 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#0F5132] font-bold">1.</span>
                    <span><strong>Detail Your Provenance:</strong> Luxury buyers want to know where and who hand-stitched their fabrics. Mention Nigerian weavers collectives, regional dye-pits (like Kofar Mata), or local master tailors.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0F5132] font-bold">2.</span>
                    <span><strong>Celebrate Fiber Integrity:</strong> Be technical about your fabrics. Use terms like "100% fine long-staple cotton", "heavyweight double-yarn embroidery", or "24-count linen yarn warp" to justify high luxury pricing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0F5132] font-bold">3.</span>
                    <span><strong>Insert in Passport:</strong> Always copy and paste your custom story into Step 3 (Atelier Narratives) when creating a product. This will display beautifully on the mobile web passport screen when scanned.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: COLLECTION STORYTELLING */}
        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Input Form */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Compass className="w-4 h-4 text-[#0F5132]" />
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">Collection Scope</h3>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Campaign / Season Name</label>
                <input
                  type="text"
                  value={cSeason}
                  onChange={(e) => setCSeason(e.target.value)}
                  placeholder="e.g. Harmattan/Winter 2026"
                  className="w-full px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0F5132] focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Artistic Narrative Theme</label>
                <input
                  type="text"
                  value={cTheme}
                  onChange={(e) => setCTheme(e.target.value)}
                  placeholder="e.g. Lagos Architecture, Nomadic Trails"
                  className="w-full px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0F5132] focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Artisan/Weaver Community Focus</label>
                <input
                  type="text"
                  value={cFocus}
                  onChange={(e) => setCFocus(e.target.value)}
                  placeholder="e.g. Iseyin Weaving Guilds, Kano Indigo Dye Guild"
                  className="w-full px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0F5132] focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <button
                onClick={() => triggerAICall('collection')}
                disabled={isGeneratingCollection}
                className="bg-[#0F5132] hover:bg-[#145A32] disabled:opacity-50 text-white px-5 h-8 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-2 self-start"
              >
                {isGeneratingCollection ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Structuring Collection Lore...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Compose Narrative
                  </>
                )}
              </button>
            </div>

            {/* Display Output */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                {brand.plan === 'starter' && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 gap-3">
                    <Lock className="w-10 h-10 text-amber-500 fill-amber-100" />
                    <h4 className="font-display font-bold text-base text-gray-900">Collection Storyteller is Locked</h4>
                    <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
                      Upgrade to the Professional Tier to compose overarching seasonal narratives and designer statements.
                    </p>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="bg-[#0F5132] hover:bg-[#145A32] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                    >
                      Unlock Professional
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-widest">
                      Overarching Collection Narrative
                    </span>
                    {generatedCollectionResult && (
                      <button
                        onClick={() => handleCopy(generatedCollectionResult, 'coll')}
                        className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-[#0F5132] bg-gray-50 hover:bg-emerald-50 px-2.5 py-1 rounded-full cursor-pointer transition-all border border-gray-200/50"
                      >
                        {copiedText === 'coll' ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
                        {copiedText === 'coll' ? 'Copied' : 'Copy Draft'}
                      </button>
                    )}
                  </div>

                  {generatedCollectionResult ? (
                    <p className="text-xs text-gray-700 leading-relaxed font-serif bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/50">
                      {generatedCollectionResult}
                    </p>
                  ) : (
                    <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
                      <HelpCircle className="w-10 h-10 text-gray-300" />
                      <p className="text-xs font-medium max-w-xs">
                        Configure your overarching collection focus parameters on the left to structure your seasonal catalog release.
                      </p>
                    </div>
                  )}
                </div>

                {generatedCollectionResult && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    <span>Theme: {cTheme}</span>
                    <span className="text-emerald-700">✓ Copy directly into "Collections" Page Narrative</span>
                  </div>
                )}
              </div>

              {/* Structuring guidance */}
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 flex flex-col gap-3.5">
                <h4 className="font-bold text-xs text-[#0F5132] uppercase tracking-wider">
                  How to Build High-Converting Collection Stories
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white/80 border border-emerald-100 rounded-xl p-3.5">
                    <span className="text-xs font-extrabold text-[#0F5132] block mb-1">1. THE PROLOGUE</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Start with the spark of inspiration. Is it Lagos at dawn? A specific historic monarch drape? Define the mood.
                    </p>
                  </div>
                  <div className="bg-white/80 border border-emerald-100 rounded-xl p-3.5">
                    <span className="text-xs font-extrabold text-[#0F5132] block mb-1">2. THE COMMUNITY</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Highlight the weavers or cooperative behind the textile. Give them center-stage to justify the custom boutique valuation.
                    </p>
                  </div>
                  <div className="bg-white/80 border border-emerald-100 rounded-xl p-3.5">
                    <span className="text-xs font-extrabold text-[#0F5132] block mb-1">3. THE CODA</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Explain the digital signature of the garments. Frame the integrated QR codes as an exclusive invitation into your inner brand guild.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: SMART RECOMMENDATIONS & FABRICS */}
        {activeTab === 'recommendations' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Fabric selector list */}
            <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider px-2">
                Select Luxury Fiber Profile
              </span>
              
              {['Silk', 'Hand-Loomed Aso-Oke', 'Ankara Wax Print', 'Linen / Damask'].map((fab) => (
                <button
                  key={fab}
                  onClick={() => setRecFabric(fab)}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-xs text-left cursor-pointer transition-all flex items-center justify-between border ${
                    recFabric === fab
                      ? 'bg-emerald-50 border-emerald-200 text-[#0F5132]'
                      : 'bg-white border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{fab}</span>
                  {recFabric === fab && <CheckCircle2 className="w-4 h-4 text-[#0F5132]" />}
                </button>
              ))}

              <hr className="border-gray-100 my-1" />

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                ℹ️ Use these certified luxury templates to automatically populate dry cleaning, wash cycles, and yarn histories.
              </div>
            </div>

            {/* Smart Advice Dashboard */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              
              {/* Care guide segment */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-widest block mb-0.5">Recommended Care Guide Instructions</span>
                    <h3 className="font-bold text-base text-gray-900">{recFabric} Regime</h3>
                  </div>
                  <button
                    onClick={() => handleCopy(currentRec.care, 'care')}
                    className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-[#0F5132] bg-gray-50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-full cursor-pointer transition-all border border-gray-200/50"
                  >
                    {copiedText === 'care' ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
                    {copiedText === 'care' ? 'Copied Care Text' : 'Copy Care Guide'}
                  </button>
                </div>

                <div className="bg-[#0F5132]/5 border border-[#0F5132]/10 p-4 rounded-xl text-xs text-gray-700 leading-relaxed font-sans">
                  {currentRec.care}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suggested Product Creation GSM Level</span>
                  <p className="text-xs font-semibold text-gray-800">{currentRec.gsm}</p>
                </div>
              </div>

              {/* Suggested provenance narrative excerpt */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-widest block mb-0.5">Heritage / Sustainability Snippet</span>
                    <h3 className="font-bold text-sm text-gray-900">Custom Weave Narrative</h3>
                  </div>
                  <button
                    onClick={() => handleCopy(currentRec.story, 'story_fab')}
                    className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-[#0F5132] bg-gray-50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-full cursor-pointer transition-all border border-gray-200/50"
                  >
                    {copiedText === 'story_fab' ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
                    {copiedText === 'story_fab' ? 'Copied Narrative' : 'Copy Narrative'}
                  </button>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-serif bg-gray-50 p-4 rounded-xl">
                  {currentRec.story}
                </p>
              </div>

            </div>

          </div>
        )}

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
              <Check className="w-5 h-5" />
            </button>

            {/* Header banner */}
            <div className="bg-[#0F5132] p-6 text-white text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-amber-400 mb-1">
                <Sparkles className="w-6 h-6 fill-amber-400" />
              </div>
              <h4 className="font-display font-bold text-lg leading-snug">Unlock Pro AI Suite</h4>
              <p className="text-[11px] text-emerald-100 max-w-xs leading-relaxed">
                Unleash generative product storytelling, designer statements, and comprehensive collection campaign lore tailored for luxury items.
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
            <form onSubmit={handleLocalUpgrade} className="p-6 flex flex-col gap-4">
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
                    <Check className="w-3 h-3" /> Coupon applied successfully! 100% discount.
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
