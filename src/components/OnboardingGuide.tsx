import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, HelpCircle, ArrowRight, ArrowLeft, BookOpen, Layers, 
  Compass, Heart, CheckCircle2, RefreshCw, Clipboard, Check, Lock, 
  X, Search, ChevronRight, Play, Award, Zap, ShieldCheck, Mail, QrCode, Users, BarChart3, Settings
} from 'lucide-react';
import { getBrand, saveBrand } from '../lib/storage';

interface OnboardingGuideProps {
  onNavigate: (route: string) => void;
  onRefresh: () => void;
}

export default function OnboardingGuide({ onNavigate, onRefresh }: OnboardingGuideProps) {
  // Persistence States
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tour' | 'knowledge'>('tour');
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  // Load state from localStorage
  useEffect(() => {
    const savedStep = localStorage.getItem('vt_onboarding_step');
    const savedCompleted = localStorage.getItem('vt_onboarding_completed');
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
    if (savedCompleted === 'true') {
      setIsCompleted(true);
    } else {
      // Auto-open for first-time brand logins
      const brand = getBrand();
      if (brand && brand.name) {
        setTimeout(() => setIsOpen(true), 1500);
      }
    }
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      localStorage.setItem('vt_onboarding_step', nextStep.toString());
      
      // Auto-navigate to correct view to show relevant UI
      const stepRoute = onboardingSteps[nextStep].autoRoute;
      if (stepRoute) {
        onNavigate(stepRoute);
      }
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      localStorage.setItem('vt_onboarding_step', prevStep.toString());
      
      const stepRoute = onboardingSteps[prevStep].autoRoute;
      if (stepRoute) {
        onNavigate(stepRoute);
      }
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    localStorage.setItem('vt_onboarding_completed', 'true');
    setIsOpen(false);
    onNavigate('dashboard');
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsCompleted(false);
    localStorage.removeItem('vt_onboarding_completed');
    localStorage.setItem('vt_onboarding_step', '0');
    setActiveTab('tour');
    setIsOpen(true);
    onNavigate('dashboard');
  };

  const brand = getBrand();
  const brandName = brand?.name || 'Your Brand';
  const brandPlan = (brand?.plan || 'Starter').toLowerCase();

  const getPlanEncouragement = () => {
    if (brandPlan.includes('enterprise')) {
      return {
        title: "Built for brands where authenticity, ownership, and reputation must scale together.",
        desc: "Protect, verify, and scale your brand with confidence across every collection."
      };
    } else if (brandPlan.includes('pro')) {
      return {
        title: "You’re no longer just starting—you’re building a brand that people can return to.",
        desc: "Use VeriThread to connect products, customers, scans, and post-purchase experiences into one growing ecosystem."
      };
    } else {
      return {
        title: "Your brand deserves to look professional from day one.",
        desc: "VeriThread helps emerging designers build trust, showcase their story, and create digital product passports that make every garment feel like part of a real fashion brand."
      };
    }
  };

  const planEncouragement = getPlanEncouragement();

  // 8 Steps Content
  const onboardingSteps = [
    {
      title: "Welcome & Brand Setup",
      subtitle: "Brand Growth Stage",
      icon: Settings,
      color: "bg-emerald-50 text-[#0F5132]",
      autoRoute: "settings",
      description: `👋 ${planEncouragement.title} ${planEncouragement.desc}`,
      bullets: [
        "Add your professional logo & background imagery",
        "Configure custom brand hex colors",
        "Set up primary business channels (WhatsApp, IG handle)",
        "Set custom default warranty periods (e.g. 12 months)"
      ],
      outcome: "Ensures your Digital Passports look professional and project luxury status, establishing trust on the very first customer scan."
    },
    {
      title: "Your Command Center",
      subtitle: "Principle 8: Dashboard Actionability",
      icon: BarChart3,
      autoRoute: "dashboard",
      color: "bg-blue-50 text-blue-700",
      description: "This dashboard is built to resolve the founder's daily uncertainty by clearly answering: 'What should I do today?'",
      bullets: [
        "A personalized welcome message listing unresolved customer events",
        "Real-time customer metrics: Products created, active scans, and CRM signups",
        "Growth Opportunities: Automatic recommendations highlighting priority follow-ups",
        "One-click quick actions to bypass menu fatigue"
      ],
      outcome: "Eliminates parsing spreadsheets. Read your growth indicators at a glance and focus purely on sales metrics."
    },
    {
      title: "Creating Your First Product",
      subtitle: "Principle 1: Purposeful Creation",
      icon: Sparkles,
      autoRoute: "products",
      color: "bg-purple-50 text-purple-700",
      description: "Every physical product you craft deserves a secure digital twin. This builds authentic provenance and lifetime customer value.",
      bullets: [
        "Input Product Name, custom SKU code, and luxury brand narratives",
        "Add garment care instructions (dry cleaning, steam recommendations)",
        "Write the ancestral textile fiber story (GSM, loom location, artisan heritage)",
        "Upload high-end showcase hero images & Buy Now backlink"
      ],
      outcome: "Transforms standard fashion items into a cryptographic passport, allowing owners to verify origin on checkout or on garment delivery."
    },
    {
      title: "The Digital Passport",
      subtitle: "Principle 12: Direct-to-Garment Storefront",
      icon: QrCode,
      autoRoute: "products",
      color: "bg-indigo-50 text-indigo-700",
      description: "This is the heart of VeriThread. When a customer scans the tag on their garment, they view a secure web-based Certificate of Authenticity.",
      bullets: [
        "Interactive verified trust badges showing tamper-resistant origin",
        "Rich historical story detailing the artisan inspiration behind the drape",
        "Interactive claim form capturing full customer CRM profile",
        "Social share badges and bespoke links back to buy related accessories"
      ],
      outcome: "Bypasses search engine noise and places your store directly into the pocket of your most passionate physical buyer."
    },
    {
      title: "Know Your Customers (CRM)",
      subtitle: "Principle 6: Compounding Customer Value",
      icon: Users,
      autoRoute: "timeline",
      color: "bg-amber-50 text-amber-700",
      description: "Every scan maps a dynamic journey. This tab catalogs ownership registrations and lists verified client profiles in your CRM index.",
      bullets: [
        "Track customer emails, names, telephone, and secure locations",
        "Review VIP client tiers based on physical repeat scan activities",
        "View the 'Customer Timeline' tracking exact scan hours and registration events",
        "Examine device operating systems and active referrer sources"
      ],
      outcome: "Takes anonymous retail buyers off offline racks and converts them into verified CRM contacts with absolute email persistence."
    },
    {
      title: "Automated Campaign Center",
      subtitle: "Principle 5: High-Touch Loyalty Flows",
      icon: Mail,
      autoRoute: "campaigns",
      color: "bg-rose-50 text-rose-700",
      description: "Turn one-time buyers into recurring brand advocates. VeriThread ships automated luxury lifecycle email alerts tailored to customer actions.",
      bullets: [
        "Registration Welcome: 'Thank you for joining the family' bespoke confirmations",
        "Garment Longevity: Dry-cleaning instructions triggered 14 days after purchase",
        "Atelier Drops: Private collection previews targetable solely to VIP verified owners",
        "Birthdays & Milestones: Sizing adjustment invitations sent directly on their day"
      ],
      outcome: "Stays in active, customized contact with your physical buyers without requiring a massive marketing staff or daily manual oversight."
    },
    {
      title: "Growth Insights & Action",
      subtitle: "Principle 7: Clear Decisive Directives",
      icon: Award,
      autoRoute: "analytics",
      color: "bg-teal-50 text-teal-700",
      description: "We hate flat, useless statistics. VeriThread processes scan data to deliver plain-English recommendations showing exact revenue impact.",
      bullets: [
        "Campaign Value: Direct calculation of Naira (₦) influenced by automated campaigns",
        "VIP Dormancy: Triggers alerts for high-value clients who haven't scanned in 60 days",
        "Collection Performance: Identifies which seasonal drops have the highest repeat scans",
        "Action Cards: Click-to-execute loyalty drives targeting specific segments instantly"
      ],
      outcome: "Equips the founder with analytical directives showing what to expand, what to retire, and how to capture dormant demand."
    },
    {
      title: "You're Fully Equipped!",
      subtitle: "Principle 13: Your Blueprint for Expansion",
      icon: Zap,
      autoRoute: "dashboard",
      color: "bg-[#0F5132]/10 text-[#0F5132]",
      description: "You've mastered VeriThread! Here is your clear physical and digital launch checklist to begin securing active buyers:",
      bullets: [
        "1. Finalize your settings & custom color profile",
        "2. Create your signature capsule apparel pieces with detailed specifications",
        "3. Download the beautiful generated QR codes from the Products list",
        "4. Print and stitch the tag inside the garment lining",
        "5. Test-scan with your phone and review the stunning Digital Passport experience!"
      ],
      outcome: "Your digital storefront is active. Let's begin capturing physical customer relationships today!"
    }
  ];

  // Knowledge Center Guides Data
  const knowledgeGuides = [
    {
      id: "beg-1",
      level: "Beginner",
      title: "What is a Digital Product Passport?",
      summary: "Understanding cryptographic apparel provenance and why modern luxury brands are adopting it.",
      content: `### The Standard Fashion Dilemma
Most luxury and bespoke fashion houses (particularly in high-end spaces like Lagos, London, or New York) lose touch with their buyers the moment they walk out of the boutique. They have zero direct-to-consumer data, and the garments are vulnerable to counterfeiting or unauthorized reselling.

### The VeriThread Solution
A **Digital Product Passport (DPP)** is a cloud-hosted, secure certificate uniquely mapped to a specific physical garment's serial number or QR code. 

When a customer scans the sewn-in label:
1. **Verifiable Authenticity**: The buyer sees a 100% tamper-resistant confirmation showing the garment was authentic, handmade by your brand, and certified on your ledger.
2. **Deep Connection**: Instead of just reading a flat cardboard tag, they view high-fidelity artisan stories, fabric weights, loom locations, and GSM details.
3. **Warranty Claim**: They can submit their details to register a dynamic warranty (e.g., 12 or 24 months) and secure ownership.
4. **Permanent Bridge**: Once claimed, their email is logged in your CRM, creating a direct communication channel for life.`
    },
    {
      id: "beg-2",
      level: "Beginner",
      title: "Creating Your First Product Passport",
      summary: "Step-by-step guidance on setting up an apparel catalog that converts physical garments into digital assets.",
      content: `### 1. Settle Your Core Specifications
Before creating, gather the physical specs of your drop:
- **Product Name**: Distinctive luxury title (e.g., *Ancestral Silk Kaftan*).
- **SKU Code**: Distinct identifier for inventory tracking (e.g., *ASK-SILK-01*).
- **Warranty Period**: Standard brand pledge. 12 months is standard for premium garments.

### 2. Craft the Story
Modern luxury buyers don't just buy fabrics—they buy stories. Use the VeriThread AI story builder to craft:
- **Artisan Heritage**: Sourcing of the silk, the hand-embroidery location, and the weaver's narrative.
- **Draping Recommendations**: Explain the mathematical cut or structure.

### 3. Sizing and Purchase URLs
- Provide a clear Buy Now link (WhatsApp Business link, Instagram Store URL, or website link).
- Add crisp showcase images so the customer can visually confirm their product matches the ledger.`
    },
    {
      id: "int-1",
      level: "Intermediate",
      title: "Optimizing Your Customer CRM",
      summary: "How to use scanning data and timelines to identify your premium 20% high-value buyers.",
      content: `### Managing Client Interactions
Every scan registers a geospatial geolocation (e.g. Lagos, Abuja, London) and a timestamp. These details are aggregated on the **Customer Timeline Page**.

### The VIP Tiering Secret
Not all clients are equal. Standard business statistics show that **20% of your customer base drives 80% of your recurring sales**.
- **Scan Tracking**: When a client scans their garment multiple times, or registers more than two pieces in their digital wardrobe, VeriThread logs their intent.
- **VIP Designation**: Click 'Upgrade to VIP' on their profile. This unlocks specific automated campaigns, priority tailored fittings, and early collection pre-order notifications.`
    },
    {
      id: "int-2",
      level: "Intermediate",
      title: "Setting Up High-Touch Automated Campaigns",
      summary: "Configure purpose-driven triggers that keep your physical clients engaged with zero overhead.",
      content: `### The Principle of Purpose-Driven Automations
Avoid spamming. Luxury is defined by scarcity and high-touch care. Create automations for specific milestones:

1. **The Welcome Spark**: Sent instantly when they claim ownership of a passport. Welcome them by name into your premium brand family.
2. **The Longevity Check**: Sent 14 days after registration. Deliver clean, specific instructions on how to cool-iron, dry-clean, or store the garment. This demonstrates extreme craftsmanship.
3. **The Early Lookbook**: Invite high-tier verified owners to view bespoke capsule drops before public launch.`
    },
    {
      id: "adv-1",
      level: "Advanced",
      title: "Compounding Lifetime Customer Value (LTV)",
      summary: "Advanced loyalty frameworks for elite fashion houses using VeriThread analytics.",
      content: `### The Repeat Purchase Cycle
The highest cost in fashion marketing is Customer Acquisition Cost (CAC). Selling a second piece to an existing verified owner is **5× cheaper** than finding a new customer.

### Advanced Growth Strategies
- **Wardrobe Gamification**: Reward customers when they register 3 matching pieces (e.g., a hand-loomed cap, kaftan, and slide set) with a free bespoke custom sizing consultation.
- **Pre-Order Exclusivity**: Launch private campaigns that are only open to current registered owners. Limit the edition to 50 pieces. Customers scan their previous garment's QR to receive the secret pre-order link.`
    },
    {
      id: "adv-2",
      level: "Advanced",
      title: "Analyzing Business Outcomes vs. Static Data",
      summary: "Read our predictive growth directives to optimize seasonal capital allocation.",
      content: `### Stop Looking at Vanity Scans
A high scan count is nice, but did it drive revenue? 

### The Decision Model
Look at your **Growth Insights Dashboard**:
- **Campaign Revenue Influenced**: Tracks Naira (₦) value driven by purchase clicks directly on the digital passport and campaigns.
- **Dormancy Flags**: If a VIP customer who bought three premium pieces hasn't scanned or interacted with a lookbook in 90 days, they are marked as **Dormant**. 
- **Action**: Use the CRM to trigger a private WhatsApp or Email consultation offering a bespoke tailoring refresh or private showing.`
    }
  ];

  const filteredGuides = knowledgeGuides.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Floating Help Trigger Button in bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl cursor-pointer duration-200 transition-all active:scale-95 border border-white/80 ${
            isOpen 
              ? 'bg-[#1C1C1C] text-white hover:bg-[#2C2C2C]' 
              : 'bg-[#0F5132] text-white hover:bg-[#145A32] hover:scale-105'
          }`}
          title="VeriThread Onboarding & Knowledge Center"
          id="onboarding-floating-trigger"
        >
          {isOpen ? <X className="w-5 h-5" /> : <HelpCircle className="w-5.5 h-5.5" />}
          {!isCompleted && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-extrabold text-white animate-bounce shadow-md">
              !
            </span>
          )}
        </button>
      </div>

      {/* Floating Onboarding Guide Panel Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[88vw] xs:w-[310px] sm:w-[320px] max-h-[50vh] sm:max-h-[58vh] bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col font-sans"
          >
            {/* Header section with brand accent */}
            <div className="bg-[#0F5132] text-white p-3 flex flex-col gap-0.5 relative overflow-hidden shrink-0">
              {/* Decorative graphic glow */}
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center z-10">
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-amber-400">Atelier Success</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setActiveTab('tour')}
                    className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded transition-all ${activeTab === 'tour' ? 'bg-white text-[#0F5132]' : 'text-white/80 hover:bg-white/10'}`}
                  >
                    Tour
                  </button>
                  <button 
                    onClick={() => setActiveTab('knowledge')}
                    className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded transition-all ${activeTab === 'knowledge' ? 'bg-white text-[#0F5132]' : 'text-white/80 hover:bg-white/10'}`}
                  >
                    Learn
                  </button>
                </div>
              </div>

              <div className="mt-1.5 z-10">
                <h4 className="font-display font-extrabold text-[11px] tracking-tight uppercase">
                  {activeTab === 'tour' ? 'Interactive Launch Tour' : 'Founder Knowledge Center'}
                </h4>
                <p className="text-white/70 text-[9px]">
                  {activeTab === 'tour' 
                    ? `Step ${currentStep + 1} of ${onboardingSteps.length}: ${onboardingSteps[currentStep].title}`
                    : 'Master physical luxury retail growth.'
                  }
                </p>
              </div>
            </div>

            {/* Content viewport wrapper */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/30 p-3">
              <AnimatePresence mode="wait">
                {activeTab === 'tour' ? (
                  // TOUR TAB
                  <motion.div
                    key={`step-${currentStep}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.12 }}
                    className="flex flex-col gap-2.5"
                  >
                    {/* Feature Badge */}
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 p-1.5 rounded-lg shadow-sm">
                      <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${onboardingSteps[currentStep].color}`}>
                        {React.createElement(onboardingSteps[currentStep].icon, { className: "w-3.5 h-3.5" })}
                      </div>
                      <div>
                        <h5 className="text-[10px] font-bold text-gray-800 leading-tight">
                          {onboardingSteps[currentStep].title}
                        </h5>
                        <p className="text-[8px] font-bold text-amber-600 uppercase mt-0.5 tracking-wider">
                          {onboardingSteps[currentStep].subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Explanatory Description */}
                    <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
                      {onboardingSteps[currentStep].description}
                    </p>

                    {/* Check items */}
                    <div className="flex flex-col gap-1 bg-white border border-gray-100 p-2.5 rounded-lg shadow-sm">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                        🔑 Key Actions & Walkthroughs:
                      </span>
                      {onboardingSteps[currentStep].bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-[9.5px] font-semibold text-gray-700 leading-tight">
                          <CheckCircle2 className="w-3 h-3 text-[#0F5132] shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expected Business Outcome */}
                    <div className="bg-emerald-50/50 border border-emerald-100 p-2 rounded-lg flex gap-1.5">
                      <Zap className="w-3 h-3 text-[#0F5132] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[8px] font-bold text-[#0F5132] uppercase tracking-wider block">Expected Outcome</span>
                        <p className="text-[9px] text-emerald-800 mt-0.5 leading-normal font-semibold">
                          {onboardingSteps[currentStep].outcome}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // KNOWLEDGE CENTER TAB
                  <motion.div
                    key="knowledge-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-2.5"
                  >
                    {selectedGuideId === null ? (
                      // List View
                      <>
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                          <input 
                            type="text" 
                            placeholder="Search guides (e.g. CRM, VIP)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-200 focus:border-[#0F5132] rounded-md text-[10px] font-semibold focus:outline-none"
                          />
                          {searchTerm && (
                            <button 
                              onClick={() => setSearchTerm('')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {/* Guides List */}
                        <div className="flex flex-col gap-1.5">
                          {filteredGuides.map(guide => (
                            <div 
                              key={guide.id}
                              onClick={() => setSelectedGuideId(guide.id)}
                              className="bg-white hover:bg-gray-50 border border-gray-100 p-2.5 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-[1.01] flex flex-col gap-1"
                            >
                              <div className="flex justify-between items-center">
                                <span className={`px-1 py-0.5 rounded text-[7px] font-extrabold uppercase tracking-wider ${
                                  guide.level === 'Beginner' ? 'bg-blue-50 text-blue-700' :
                                  guide.level === 'Intermediate' ? 'bg-amber-50 text-amber-700' :
                                  'bg-purple-50 text-purple-700'
                                }`}>
                                  {guide.level}
                                </span>
                                <ChevronRight className="w-3 h-3 text-gray-400" />
                              </div>
                              <h5 className="text-[10px] font-extrabold text-gray-800 tracking-tight leading-tight uppercase">
                                {guide.title}
                              </h5>
                              <p className="text-[9px] text-gray-500 font-medium leading-relaxed line-clamp-2">
                                {guide.summary}
                              </p>
                            </div>
                          ))}

                          {filteredGuides.length === 0 && (
                            <div className="py-4 text-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                              No matching guides found.
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // Single Guide Detail View
                      (() => {
                        const guide = knowledgeGuides.find(g => g.id === selectedGuideId);
                        if (!guide) return null;
                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-2.5 bg-white border border-gray-100 p-3 rounded-lg shadow-sm"
                          >
                            <button 
                              onClick={() => setSelectedGuideId(null)}
                              className="flex items-center gap-1 text-[8px] text-gray-500 hover:text-[#0F5132] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              <ArrowLeft className="w-2.5 h-2.5" /> Back to Guides
                            </button>

                            <div className="border-b border-gray-50 pb-1.5 mt-1">
                              <span className={`px-1 py-0.5 rounded text-[7px] font-extrabold uppercase tracking-wider ${
                                guide.level === 'Beginner' ? 'bg-blue-50 text-blue-700' :
                                guide.level === 'Intermediate' ? 'bg-amber-50 text-amber-700' :
                                'bg-purple-50 text-purple-700'
                              }`}>
                                {guide.level} Level
                              </span>
                              <h4 className="font-display font-extrabold text-[10px] text-gray-900 uppercase tracking-tight mt-1">
                                {guide.title}
                              </h4>
                              <p className="text-[9px] text-gray-400 mt-0.5 font-semibold leading-relaxed">
                                {guide.summary}
                              </p>
                            </div>

                            {/* Stylized markdown-like guide content */}
                            <div className="text-[9.5px] text-gray-700 leading-relaxed font-medium space-y-2.5 whitespace-pre-wrap select-none">
                              {guide.content.split('\n\n').map((paragraph, index) => {
                                if (paragraph.startsWith('###')) {
                                  return (
                                    <h5 key={index} className="text-[9px] font-bold text-gray-900 uppercase tracking-wider mt-3 first:mt-0">
                                      {paragraph.replace('###', '').trim()}
                                    </h5>
                                  );
                                }
                                if (paragraph.startsWith('-') || paragraph.startsWith('1.')) {
                                  return (
                                    <div key={index} className="pl-2 border-l border-[#0F5132] py-0.5 italic text-gray-600 bg-gray-50/50 rounded-r">
                                      {paragraph}
                                    </div>
                                  );
                                }
                                return (
                                  <p key={index} className="mt-1 text-gray-600 leading-relaxed">
                                    {paragraph}
                                  </p>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      })()
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Navigation Bar */}
            <div className="border-t border-gray-100 bg-white p-2.5 shrink-0">
              {activeTab === 'tour' ? (
                // Tour navigation controls
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleSkip}
                    className="text-[8px] text-gray-400 hover:text-gray-900 font-extrabold uppercase tracking-wider cursor-pointer"
                  >
                    Skip
                  </button>

                  <div className="flex gap-1 items-center">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrev}
                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded cursor-pointer"
                        title="Previous Step"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                    
                    <button
                      onClick={handleNext}
                      className="bg-[#0F5132] hover:bg-[#145A32] text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer active:scale-95 duration-100 shadow-md"
                    >
                      {currentStep === onboardingSteps.length - 1 ? (
                        <>Complete <Check className="w-2.5 h-2.5" /></>
                      ) : (
                        <>Next <ArrowRight className="w-3 h-3" /></>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Knowledge Center options
                <div className="flex justify-between items-center">
                  <span className="text-[8px] text-gray-400 font-bold uppercase">
                    Continuous Learning
                  </span>
                  
                  <button
                    onClick={handleRestart}
                    className="text-[8px] text-[#0F5132] hover:text-[#145A32] font-extrabold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                  >
                    <RefreshCw className="w-2 h-2 animate-spin" /> Restart Tour
                  </button>
                </div>
              )}

              {/* Step indicator bubbles for tour */}
              {activeTab === 'tour' && (
                <div className="flex justify-center gap-1 mt-2 border-t border-gray-50 pt-1.5">
                  {onboardingSteps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentStep(idx);
                        localStorage.setItem('vt_onboarding_step', idx.toString());
                        const stepRoute = onboardingSteps[idx].autoRoute;
                        if (stepRoute) onNavigate(stepRoute);
                      }}
                      className={`h-1 rounded-full transition-all duration-350 cursor-pointer ${
                        idx === currentStep 
                          ? 'w-3 bg-[#0F5132]' 
                          : idx < currentStep 
                            ? 'w-1 bg-[#0F5132]/40 hover:bg-[#0F5132]/60' 
                            : 'w-1 bg-gray-200 hover:bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
