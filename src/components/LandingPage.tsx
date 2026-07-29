import { useState, useEffect } from 'react';
import { 
  ArrowRight, CheckCircle2, ShieldCheck, QrCode, Share2, 
  Smartphone, MessageSquare, Award, BarChart3, BarChart2, HelpCircle, 
  Star, Instagram, Sparkles, Link, Users, RotateCcw, 
  LineChart, Layers, MapPin, Building2, Lock, Zap, Check, X,
  Globe, Headphones, Code, GraduationCap, Plug, PhoneCall, Shield
} from 'lucide-react';
import EnterpriseModal from './EnterpriseModal';
import DemoBanner from './DemoBanner';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onBypassLogin: () => void;
  isLoggedIn?: boolean;
}

export default function LandingPage({ onNavigate, onBypassLogin, isLoggedIn }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);

  useEffect(() => {
    document.title = "VeriThread — Digital Product Passport for Fashion Brands";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Give every fashion product a permanent digital identity. Build trust, authenticity, and customer loyalty with VeriThread — built exclusively for fashion brands.'
    );
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const promises = [
    {
      title: "Your Brand Will Feel Premium",
      subtitle: "Professional Digital Passports with authenticity badges",
      description: "Elevate every garment with a high-end Digital Passport that communicates craftsmanship, verified origin, and luxury detail instantly.",
      icon: Sparkles,
      color: "bg-emerald-50 text-emerald-800 border-emerald-100"
    },
    {
      title: "You'll Never Lose Contact with Customers",
      subtitle: "Every product is a permanent connection",
      description: "Turn every piece of clothing you sell into an active communication channel that keeps buyers connected to your label for years.",
      icon: Link,
      color: "bg-blue-50 text-blue-800 border-blue-100"
    },
    {
      title: "Customers Will Trust You More",
      subtitle: "Verified authenticity and warranty tracking",
      description: "Eliminate doubt and fake copies with cryptographic origin verification and digital warranty protection.",
      icon: ShieldCheck,
      color: "bg-purple-50 text-purple-800 border-purple-100"
    },
    {
      title: "You'll Understand Your Customers",
      subtitle: "Customer CRM with full relationship timeline",
      description: "Access complete customer purchase histories, scan habits, and lifetime value in a dedicated fashion CRM.",
      icon: Users,
      color: "bg-amber-50 text-amber-800 border-amber-100"
    },
    {
      title: "You'll Get Repeat Customers",
      subtitle: "Automated campaigns for loyalty",
      description: "Engage existing owners with automated drop announcements, VIP care tips, and exclusive loyalty rewards.",
      icon: RotateCcw,
      color: "bg-rose-50 text-rose-800 border-rose-100"
    },
    {
      title: "You'll Make Better Business Decisions",
      subtitle: "Growth Insights with actionable recommendations",
      description: "Harness real-time geographic scan telemetry and sales trends to stock smarter and expand strategically.",
      icon: LineChart,
      color: "bg-indigo-50 text-indigo-800 border-indigo-100"
    },
    {
      title: "You'll Never Outgrow VeriThread",
      subtitle: "Free starter plan, scales with your business",
      description: "Start free with 25 monthly QR codes and seamlessly scale up to unlimited passports as your brand expands globally.",
      icon: Layers,
      color: "bg-teal-50 text-teal-800 border-teal-100"
    }
  ];

  const testimonials = [
  {
    name: "Adeola",
    brand: "Adeleke Atelier",
    location: "Lagos, Nigeria",
    quote: "Before VeriThread, I didn't know who bought my clothes. Customers would buy, leave, and I'd never see them again. Now I have a database of every person who owns my pieces. I send them new collections and they actually come back. My repeat sales have doubled.",
    image: "https://ui-avatars.com/api/?name=Adeola+Adebayo&background=0F5132&color=fff&size=120"
  },
  {
    name: "Chidi",
    brand: "Chidi's Native Wear",
    location: "Abuja, Nigeria",
    quote: "I sell everything through WhatsApp. Customers used to ask me a hundred questions before buying — is it authentic? What's the fabric? How do I wash it? Now they scan the QR code, see everything themselves, and buy faster. I spend less time answering questions and more time creating.",
    image: "https://ui-avatars.com/api/?name=Chidi+Okonkwo&background=0F5132&color=fff&size=120"
  },
  {
    name: "Fatima",
    brand: "Fatima's Fashion House",
    location: "Kano, Nigeria",
    quote: "My brand is small. I can't afford luxury packaging or a big marketing team. But with VeriThread, my products look like they cost twice as much. Customers see the digital passport and think they're buying from a premium brand. It's completely changed how people perceive my work.",
    image: "https://ui-avatars.com/api/?name=Fatima+Aliyu&background=0F5132&color=fff&size=120"
  },
  {
    name: "Emeka",
    brand: "Lagos Streetwear Co.",
    location: "Lagos, Nigeria",
    quote: "I've been running my streetwear brand for three years. I always struggled to get repeat customers. VeriThread changed that. Now when someone buys a hoodie, I can send them care tips, behind-the-scenes content, and early access to new drops. They feel connected to the brand. They keep buying.",
    image: "https://ui-avatars.com/api/?name=Emeka+Okafor&background=0F5132&color=fff&size=120"
  },
  {
    name: "Zainab",
    brand: "Zainab's Luxury Studio",
    location: "Ibadan, Nigeria",
    quote: "Running a fashion brand in Nigeria is hard. You're competing with imported goods and big brands. VeriThread gives me a way to stand out. My customers trust me more because they can verify authenticity. It's not just software — it's a business partner.",
    image: "https://ui-avatars.com/api/?name=Zainab+Abdullahi&background=0F5132&color=fff&size=120"
  },
  {
    name: "Tunde",
    brand: "Tunde's Bespoke Tailoring",
    location: "Ilorin, Nigeria",
    quote: "I'm a tailor, not a tech person. When I first heard about VeriThread, I thought it would be too complicated. But it's so simple. I just fill in the details, upload photos, and get a QR code. My customers love scanning it. It makes me look like I'm running a big brand.",
    image: "https://ui-avatars.com/api/?name=Tunde+Balogun&background=0F5132&color=fff&size=120"
  },
  {
    name: "Ngozi",
    brand: "Ngozi's Ankara Collection",
    location: "Enugu, Nigeria",
    quote: "I used to lose customers after they bought from me. They'd wear the clothes and disappear. Now with VeriThread, every customer who buys gets a digital passport. When they scan it, they see my story, my new collections, and they come back. It's like having a permanent connection to my customers.",
    image: "https://ui-avatars.com/api/?name=Ngozi+Eze&background=0F5132&color=fff&size=120"
  },
  {
    name: "Segun",
    brand: "Segun's Premium Denim",
    location: "Abeokuta, Nigeria",
    quote: "I never knew who was buying my jeans. Was it young people? Older people? People from Lagos? Now VeriThread shows me exactly who buys from me — name, location, and what they bought. I can finally understand my customers and make products they actually want.",
    image: "https://ui-avatars.com/api/?name=Segun+Adebayo&background=0F5132&color=fff&size=120"
  },
  {
    name: "Halima",
    brand: "Halima's Silk Studio",
    location: "Kaduna, Nigeria",
    quote: "I make luxury silk garments for weddings and special events. My customers need to trust that what they're buying is authentic and high quality. VeriThread gives them that trust. The digital passport shows them everything — the fabric, the care instructions, the warranty. They buy with confidence.",
    image: "https://ui-avatars.com/api/?name=Halima+Mohammed&background=0F5132&color=fff&size=120"
  }
];

  const faqs = [
    {
      q: "What is a Digital Product Passport (DPP)?",
      a: "A Digital Product Passport is a unique, cryptographically verifiable web profile for an individual fashion item. Customers scan a QR code stitched into your clothing to see its exact specifications, verified brand origin, product story, wash care details, and register their warranty."
    },
    {
      q: "Do I need a website to use VeriThread?",
      a: "No. VeriThread works seamlessly with WhatsApp Business, Instagram, physical stores, and exhibitions. You don't need a website to start using VeriThread."
    },
    {
      q: "How much does VeriThread cost?",
      a: "VeriThread has a free Starter plan with 25 QR codes per month. The Professional plan is ₦25,000 per month with 250 QR codes and AI features. Enterprise plans are custom priced."
    },
    {
      q: "How does the QR code work?",
      a: "Each product gets a unique QR code that links to a Digital Passport. When a customer scans the QR code with their smartphone, they see the passport with product details, authenticity verification, and registration options."
    },
    {
      q: "Can I sell through WhatsApp with VeriThread?",
      a: "Yes. VeriThread is designed for fashion brands that sell through WhatsApp Business. The Buy Now button can redirect customers directly to WhatsApp for purchase."
    }
  ];

  // Google Advanced Indexing / SEO Schema (JSON-LD)
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "VeriThread",
      "description": "Digital Product Passport platform built exclusively for fashion brands.",
      "url": "https://verithread.com",
      "logo": "https://verithread.com/logo.png",
      "sameAs": [
        "https://instagram.com/verithread",
        "https://twitter.com/verithread"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "VeriThread Digital Product Passport",
      "description": "Give every fashion product a permanent digital identity with QR codes, authenticity verification, and customer relationship management.",
      "brand": {
        "@type": "Brand",
        "name": "VeriThread"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "NGN",
        "lowPrice": "0",
        "highPrice": "25000",
        "offerCount": "3"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "VeriThread",
      "description": "Digital Product Passport platform for Nigerian fashion brands.",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NG"
      }
    }
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-[#1C1C1C] overflow-x-hidden font-sans">
      {/* Demo Banner shown ONLY for non-logged in visitors on Home/Landing page */}
      {!isLoggedIn && (
        <DemoBanner onRefresh={() => {}} isFreshBrand={false} onToggleBrandMode={() => {}} />
      )}

      {/* Inject SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      {/* Premium Header */}
      <header className="border-b border-gray-200 bg-white/85 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('')}>
            <div className="w-8 h-8 rounded-lg bg-[#0F5132] flex items-center justify-center text-white font-display font-bold text-lg">
              V
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-[#0F5132]">VeriThread</span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <a href="#promises" className="hover:text-[#0F5132] transition-colors">Promises</a>
            <a href="#how-it-works" className="hover:text-[#0F5132] transition-colors">How It Works</a>
            <a href="#features" className="hover:text-[#0F5132] transition-colors">Features</a>
            <button onClick={() => onNavigate('demo')} className="hover:text-[#0F5132] transition-colors cursor-pointer uppercase">Plan Demos</button>
            <a href="#pricing" className="hover:text-[#0F5132] transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-2.5">
            {isLoggedIn ? (
              <button 
                onClick={() => onNavigate('dashboard')}
                className="bg-[#0F5132] hover:bg-[#145A32] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-xs font-semibold text-[#0F5132] hover:bg-gray-50 border border-gray-200 rounded-full px-3 py-1 transition-all cursor-pointer whitespace-nowrap bg-white shadow-sm"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => onNavigate('signup')}
                  className="hidden sm:flex bg-[#0F5132] hover:bg-[#145A32] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer items-center gap-1 shrink-0"
                >
                  Get Started <ArrowRight className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-16 lg:py-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Tagline Prominently Placed Above Main Headline */}
            <div className="flex flex-col gap-2">
              <span className="text-[#0F5132] font-black text-xs sm:text-sm tracking-widest uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                Built exclusively for fashion brands.
              </span>
              <div className="inline-flex items-center gap-2 bg-[#0F5132]/10 text-[#0F5132] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide w-fit">
                <Award className="w-3.5 h-3.5" /> Digital Product Passport Platform
              </div>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight tracking-tight">
              Give Every Product a <span className="text-[#0F5132] underline decoration-wavy decoration-1 underline-offset-8">Digital Identity</span>
            </h1>
            
            <p className="text-gray-600 text-lg sm:text-xl leading-relaxed max-w-2xl">
              Build ultimate brand trust and multiply your sales. Provide modern, interactive product passports showing authenticity, fabric provenance, and warranties—optimized directly for WhatsApp and Instagram.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'signup')}
                className="bg-[#0F5132] hover:bg-[#145A32] text-white px-5 py-2.5 rounded-full font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => onNavigate('demo')}
                className="border border-gray-300 hover:border-[#0F5132] hover:bg-[#0F5132]/5 text-gray-700 hover:text-[#0F5132] px-5 py-2.5 rounded-full font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Explore Plan Demos
              </button>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="flex -space-x-2 shrink-0">
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover shrink-0" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" alt="Adeole" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover shrink-0" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100" alt="Chidi" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover shrink-0" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100" alt="Fatima" />
              </div>
              <p className="text-xs text-gray-500 font-medium leading-normal">
                Over <strong className="text-gray-900 font-semibold">120+ fashion labels</strong> in Lagos, Abuja, Kano, and Ibadan are already certifying provenance.
              </p>
            </div>
          </div>

          {/* Interactive Passport Mockup */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="absolute inset-0 bg-[#0F5132]/5 rounded-3xl blur-2xl -z-10 transform rotate-6 scale-95" />
            
            {/* Phone Frame */}
            <div className="relative w-80 h-[560px] bg-black rounded-[40px] p-3 shadow-2xl border-4 border-gray-800 flex flex-col overflow-hidden">
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-800 mr-2" />
                <div className="w-12 h-1 bg-gray-800 rounded-full" />
              </div>

              {/* Inner screen - Mock Digital Passport */}
              <div className="flex-1 bg-[#F8F9FA] rounded-[32px] overflow-y-auto overflow-x-hidden text-xs relative pt-4 pb-8 scrollbar-thin">
                {/* Certificate Badge */}
                <div className="bg-[#0F5132] text-white py-1 px-3 text-[9px] uppercase tracking-wider text-center flex items-center justify-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> CRYPTOGRAPHIC PASSPORT
                </div>

                {/* Hero Banner */}
                <div className="relative h-44 bg-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1733324961705-97bd6cd7f4ba?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    className="w-full h-full object-cover" 
                    alt="Product" 
                  />
                  <div className="absolute bottom-2 left-2 bg-black/75 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    100% Authentic
                  </div>
                </div>

                {/* Info block */}
                <div className="p-3.5 flex flex-col gap-2.5">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-emerald-800">Nigerian Heritage House</p>
                    <h4 className="font-display text-sm font-bold text-gray-900 leading-tight">Premium Ankara Collection</h4>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">SKU: VT-PASSPORT-001</p>
                  </div>

                  <hr className="border-gray-200" />

                  <div>
                    <span className="font-semibold text-gray-800 text-[10px] block mb-1">PROVENANCE & METRICS</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                      <div><span className="text-gray-400 block text-[9px]">Fabric</span> 85% Damask Cotton</div>
                      <div><span className="text-gray-400 block text-[9px]">Origin</span> Loomed in Oyo, NG</div>
                      <div><span className="text-gray-400 block text-[9px]">Tailor</span> Lagos Atelier</div>
                      <div><span className="text-gray-400 block text-[9px]">Warranty</span> 2 Years</div>
                    </div>
                  </div>

                  {/* Warranty registration block */}
                  <div className="bg-[#0F5132]/5 p-2.5 rounded-xl border border-[#0F5132]/10">
                    <span className="font-semibold text-[#0F5132] text-[10px] block">SECURE LIFETIME WARRANTY</span>
                    <p className="text-[9px] text-gray-500 mb-2">Register ownership on-chain & claim warranty</p>
                    <div className="space-y-1.5">
                      <input placeholder="Full Name" className="w-full bg-white border border-gray-200 p-1 rounded text-[10px]" disabled />
                      <button className="w-full bg-[#0F5132] text-white py-1 rounded text-[10px] font-medium cursor-default">
                        Register Warranty
                      </button>
                    </div>
                  </div>

                  {/* Buy Now Button */}
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-sm">
                    <MessageSquare className="w-3.5 h-3.5" /> Order on WhatsApp
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
            Empowering Fashion Heritage Across Nigeria
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-55 saturate-50">
            <span className="font-display font-bold text-lg text-gray-800">ADELEKE ATELIER</span>
            <span className="font-display font-semibold text-lg text-gray-800">LAGOS STREET CO.</span>
            <span className="font-display font-medium text-lg text-gray-800">CHIDI'S NATIVE</span>
            <span className="font-display font-bold text-lg text-gray-800">FATIMA'S HOUSE</span>
            <span className="font-display font-semibold text-lg text-gray-800">ZAINAB LUXURY</span>
          </div>
        </div>
      </section>

      {/* PART 1: THE 7 PROMISES SECTION */}
      <section id="promises" className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#0F5132] font-semibold text-xs tracking-widest uppercase bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full">
              OUR COMMITMENT TO YOUR BRAND
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
              The 7 Promises of VeriThread
            </h2>
            <p className="text-gray-500 mt-3 text-base sm:text-lg">
              Every feature we build is designed to protect your craftsmanship, deepen customer relationships, and scale your sales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promises.map((p, idx) => (
              <div 
                key={idx} 
                className="bg-[#F8F9FA] border border-gray-200/80 p-6 rounded-2xl flex flex-col gap-3 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${p.color}`}>
                    <p.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-300 group-hover:text-[#0F5132] transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900 group-hover:text-[#0F5132] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#0F5132] mt-0.5">
                    {p.subtitle}
                  </p>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mt-1">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section id="how-it-works" className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#0F5132] font-semibold text-sm tracking-widest uppercase">THE VALUE</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 mt-2">
              Why Forward-Thinking Brands Choose Digital Passports
            </h2>
            <p className="text-gray-500 mt-4 text-base sm:text-lg">
              The modern customer expects authentication and storytelling. Standard labels rip or fade, but VeriThread product passports live forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200/70 flex flex-col gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 flex items-center justify-center text-[#0F5132]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900">Cryptographic Authenticity</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Eliminate knockoffs. Each QR code maps to a secure database entry acting as a cryptographic seal of origin. Customers know they have bought original design.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200/70 flex flex-col gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-700">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900">WhatsApp & Social Ready</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We make buying effortless. Integrated routing channels allow scanning customers to immediately order matching sizes, accessories, or contact the founder on WhatsApp.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200/70 flex flex-col gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900">Deep Customer Trust</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Showcase your master craftsmanship. Share the textile weavers’ heritage, structural yarn counts, fit coordinates, and offer formal warranties that build lifetime loyalty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-20 bg-white border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#0F5132] font-semibold text-sm tracking-widest uppercase">3-STEP WORKFLOW</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 mt-2">
              Generate Premium Passports in Minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block -z-10" />
            
            <div className="flex flex-col items-center text-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200/60 shadow-sm relative">
              <div className="absolute -top-5 w-10 h-10 rounded-full bg-[#0F5132] text-white flex items-center justify-center font-bold font-display text-base shadow-md">
                1
              </div>
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#0F5132] mt-2 shadow-xs">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900 mt-2">Create Product</h3>
              <p className="text-gray-500 text-sm">
                Log fabric composition, loom origin stories, designer notes, care instructions, and set custom warranty periods in our wizard.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200/60 shadow-sm relative">
              <div className="absolute -top-5 w-10 h-10 rounded-full bg-[#0F5132] text-white flex items-center justify-center font-bold font-display text-base shadow-md">
                2
              </div>
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#0F5132] mt-2 shadow-xs">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900 mt-2">Stitch QR Code</h3>
              <p className="text-gray-500 text-sm">
                Download high-resolution, branded QR codes to print as premium hangtags, luxury paper inserts, or woven tags stitched inside the garments.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200/60 shadow-sm relative">
              <div className="absolute -top-5 w-10 h-10 rounded-full bg-[#0F5132] text-white flex items-center justify-center font-bold font-display text-base shadow-md">
                3
              </div>
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#0F5132] mt-2 shadow-xs">
                <Share2 className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900 mt-2">Track & Re-engage</h3>
              <p className="text-gray-500 text-sm">
                Customers scan the tags, register ownership, view provenance, and purchase more. You track every scan and build a direct customer database.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#0F5132] font-semibold text-sm tracking-widest uppercase">THE CAPABILITIES</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 mt-2">
              Engineered Specifically for Fashion Innovators
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white border border-gray-200/80 rounded-2xl hover:shadow-md transition-all">
              <ShieldCheck className="w-8 h-8 text-[#0F5132] mb-3" />
              <h4 className="font-display text-base font-semibold text-gray-900 mb-2">Immutable Provenance</h4>
              <p className="text-gray-500 text-sm">
                Stamps details cryptographically so counterfeiters cannot replicate your design serial numbers or copy digital certifications.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200/80 rounded-2xl hover:shadow-md transition-all">
              <MessageSquare className="w-8 h-8 text-emerald-600 mb-3" />
              <h4 className="font-display text-base font-semibold text-gray-900 mb-2">WhatsApp Order Routing</h4>
              <p className="text-gray-500 text-sm">
                Configured with your exact WhatsApp coordinates so customers can purchase items or request tailored adjustments with 1-click.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200/80 rounded-2xl hover:shadow-md transition-all">
              <Award className="w-8 h-8 text-amber-600 mb-3" />
              <h4 className="font-display text-base font-semibold text-gray-900 mb-2">Warranty Engine</h4>
              <p className="text-gray-500 text-sm">
                Offer certified warranties (6 months to 5 years). Customers register ownership in seconds, giving you their emails for brand campaigns.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200/80 rounded-2xl hover:shadow-md transition-all">
              <BarChart3 className="w-8 h-8 text-[#0F5132] mb-3" />
              <h4 className="font-display text-base font-semibold text-gray-900 mb-2">Geographic Analytics</h4>
              <p className="text-gray-500 text-sm">
                Know exactly where your garments are traveling. View live metrics on scan frequencies, locations, and registration conversions over time.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200/80 rounded-2xl hover:shadow-md transition-all">
              <Instagram className="w-8 h-8 text-pink-600 mb-3" />
              <h4 className="font-display text-base font-semibold text-gray-900 mb-2">Instagram Integration</h4>
              <p className="text-gray-500 text-sm">
                Embed your Instagram handle directly. Allow shoppers to browse other collections or tag your handle when sharing their authentic garment scans.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200/80 rounded-2xl hover:shadow-md transition-all">
              <QrCode className="w-8 h-8 text-cyan-600 mb-3" />
              <h4 className="font-display text-base font-semibold text-gray-900 mb-2">Custom QR Designing</h4>
              <p className="text-gray-500 text-sm">
                Match your QR codes to your luxury palette. Customize background matrices, select size ranges, and append brand logos to the core of the QR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PART 2: REALISTIC HUMAN TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 bg-white border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#0F5132] font-semibold text-xs tracking-widest uppercase bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full">
              REAL FASHION FOUNDER STORIES
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
              Trusted by Designers Across Nigeria
            </h2>
            <p className="text-gray-500 mt-3 text-base sm:text-lg">
              Hear directly from fashion founders using VeriThread to connect with customers, build trust, and multiply repeat sales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div 
                key={i} 
                className="bg-[#F8F9FA] p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(5)].map((_, starIdx) => (
                      <Star key={starIdx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60">
                  <img 
                    src={t.image} 
                    alt={t.name} 
                    className="w-11 h-11 rounded-full object-cover border border-emerald-200 shrink-0" 
                  />
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-sm text-gray-900 truncate">
                      {t.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#0F5132] truncate">
                      {t.brand}
                    </p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{t.location}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#0F5132] font-semibold text-xs tracking-widest uppercase font-sans">TRANSPARENT PRICING</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-gray-900 mt-2">
              Simple Plans For Fashion Brands of All Sizes
            </h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
              Choose the right tier to build trust, connect with customers, and scale your fashion house.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            {/* STARTER */}
            <div className="border border-gray-200 rounded-3xl p-8 bg-white flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Starter</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-gray-900">Free Forever</h3>
                  <p className="font-display text-sm font-bold text-[#0F5132] mt-1">
                    Look like a real brand before you can afford a big store.
                  </p>
                </div>

                <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100/80 text-xs text-gray-600 space-y-2 leading-relaxed">
                  <p className="font-medium text-gray-800">
                    Starter is for emerging fashion brands that need trust, identity, and a professional presence from day one.
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    Create digital product passports, add your logo and brand story, and give every garment a professional identity—even if you’re still operating from a small studio, shared workspace, or your bedroom.
                  </p>
                </div>
                
                <hr className="border-gray-100 my-1" />
                
                <ul className="space-y-2.5 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>25 QR Code Generations per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Basic Digital Passports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>WhatsApp & Instagram Buy Now</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Basic Analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Community Support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>VeriThread Branding on Passports</span>
                  </li>
                  <li className="flex items-start gap-2 font-semibold text-red-600">
                    <span className="text-red-500">No AI Features</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('signup')}
                className="w-full border border-gray-300 hover:border-[#0F5132] hover:text-[#0F5132] hover:bg-gray-50 py-2.5 rounded-full font-semibold text-xs mt-8 transition-all cursor-pointer h-[36px]"
              >
                Sign Up Free
              </button>
            </div>

            {/* PROFESSIONAL */}
            <div className="border-2 border-[#0F5132] rounded-3xl p-8 bg-gradient-to-b from-[#0F5132]/5 to-white flex flex-col justify-between relative shadow-md hover:shadow-lg transition-shadow">
              <div className="absolute -top-3.5 right-6 bg-[#0F5132] text-white text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow">
                Most Popular
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F5132] font-sans">Professional</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-gray-900">
                    ₦25,000 <span className="text-sm font-normal text-gray-400">/ month</span>
                  </h3>
                  <p className="font-display text-sm font-bold text-[#0F5132] mt-1">
                    Turn customers into a community that keeps coming back.
                  </p>
                </div>

                <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 text-xs text-gray-600 space-y-2 leading-relaxed">
                  <p className="font-medium text-gray-800">
                    Professional is for growing fashion brands that are ready to move beyond one-time sales.
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    Track scans, register customers, build loyalty, launch campaigns, and create a connected brand experience that keeps people engaged long after the first purchase.
                  </p>
                </div>
                
                <hr className="border-[#0F5132]/10 my-1" />
                
                <ul className="space-y-2.5 text-xs text-gray-600">
                  <li className="flex items-start gap-2 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>250 QR Code Generations per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Advanced Digital Passports (Premium Design)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Custom QR Code Branding (Logo + Colors)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Unlimited Collections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Product Variants (Sizes, Colors)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Bulk Product Import (CSV)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Advanced Analytics (Geo-location, Trends)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Customer Management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>CSV/PNG Report Downloads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>90-Day Data History</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Remove VeriThread Branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Custom Brand Colors on Passports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Multi-User Access (Up to 3 Team Members)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] shrink-0 mt-0.5" />
                    <span>Priority Support (24-Hour Response)</span>
                  </li>
                  <li className="flex flex-col gap-1 text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-1.5 text-xs text-[#0F5132] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simple AI Features (50 uses/month)</span>
                    </div>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('signup')}
                className="w-full bg-[#0F5132] hover:bg-[#145A32] text-white py-2.5 rounded-full font-semibold text-xs mt-8 shadow-sm transition-all cursor-pointer h-[36px]"
              >
                Start Free Pro Trial
              </button>
            </div>

            {/* ENTERPRISE */}
            <div className="border border-emerald-900/20 rounded-3xl p-8 bg-gradient-to-b from-gray-900 via-gray-900 to-[#0F5132]/90 text-white flex flex-col justify-between relative shadow-xl hover:shadow-2xl transition-shadow">
              <div className="absolute -top-3.5 right-6 bg-emerald-500 text-gray-950 text-[9px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow">
                Custom Quote
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-sans">Enterprise</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">Custom Pricing</h3>
                  <p className="font-display text-sm font-bold text-emerald-400 mt-1">
                    Protect, verify, and scale your brand with confidence.
                  </p>
                </div>

                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 text-xs text-emerald-100 space-y-2 leading-relaxed">
                  <p className="text-emerald-50 font-medium">
                    Enterprise is built for established fashion houses and large-scale manufacturers that require advanced authenticity, ownership tracking, compliance support, and connected customer experiences across every product they release.
                  </p>
                </div>
                
                <hr className="border-white/10 my-1" />
                
                <ul className="space-y-2.5 text-xs text-emerald-50">
                  <li className="flex items-start gap-2 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>♾️ <strong>Unlimited QR Code Generations</strong></span>
                  </li>
                  <li className="flex items-start gap-2 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>♾️ <strong>Unlimited Products & Collections</strong></span>
                  </li>
                  <li className="flex items-start gap-2 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>♾️ <strong>Unlimited Team Members & AI Usage</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>White-Label Solution (No VeriThread branding)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Custom Domain (passport.yourbrand.com)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Dedicated Account Manager & Phone Line</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>24/7 Priority Support (4-Hour SLA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Full REST API & Webhook Support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Single Sign-On (SSO) & Audit Logs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>WhatsApp API, Shopify & ERP Integrations</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setIsEnterpriseModalOpen(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold py-2.5 rounded-full text-xs mt-8 shadow-md transition-all cursor-pointer h-[36px] flex items-center justify-center gap-1.5"
              >
                Contact Sales <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ENTERPRISE PLAN FEATURE BREAKDOWN */}
          <div className="mt-20 pt-16 border-t border-gray-200">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-[#0F5132] font-semibold text-xs tracking-widest uppercase bg-emerald-50 text-emerald-800 border border-emerald-100 px-3.5 py-1 rounded-full">
                ENTERPRISE ARCHITECTURE
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                Built for High-Volume Fashion Leaders
              </h3>
              <p className="text-gray-500 text-sm mt-2">
                Everything required to digitize, secure, and scale your brand identity across global supply chains.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Unlimited Everything */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F5132] flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-gray-900">Unlimited Everything</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• <strong>Unlimited QR Code Generations:</strong> No monthly caps</li>
                  <li>• <strong>Unlimited Products:</strong> Digitize full archives</li>
                  <li>• <strong>Unlimited Collections:</strong> Seasonal, capsule & drops</li>
                  <li>• <strong>Unlimited Team Members:</strong> Designers, sales & staff</li>
                  <li>• <strong>Unlimited AI Usage:</strong> No per-month limits</li>
                </ul>
              </div>

              {/* White-Label Solution */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-gray-900">White-Label Solution</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• <strong>Remove VeriThread Branding:</strong> Your brand logo only</li>
                  <li>• <strong>Custom Domain:</strong> Live on passport.yourbrand.com</li>
                  <li>• <strong>Full Brand Control:</strong> Match custom CSS, fonts & palette</li>
                </ul>
              </div>

              {/* Dedicated Support */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-gray-900">Dedicated Support</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• <strong>Dedicated Account Manager:</strong> Direct point of contact</li>
                  <li>• <strong>24/7 Priority Support:</strong> 4-hour response SLA</li>
                  <li>• <strong>Phone Support:</strong> Direct hotline for urgent needs</li>
                </ul>
              </div>

              {/* Advanced Features */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <Code className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-gray-900">Advanced Features</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• <strong>API Access:</strong> Full REST API for ERP/POS integration</li>
                  <li>• <strong>Webhook Support:</strong> Real-time scan & register events</li>
                  <li>• <strong>Custom Feature Dev:</strong> Tailored capabilities on request</li>
                  <li>• <strong>Full Data Export:</strong> Export in CSV, JSON or PDF</li>
                </ul>
              </div>

              {/* Security & Compliance */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-gray-900">Security & Compliance</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• <strong>SSO (Single Sign-On):</strong> Integrates with your identity auth</li>
                  <li>• <strong>Custom Contract & SLA:</strong> Uptime guarantee SLA</li>
                  <li>• <strong>Audit Logs:</strong> Full access transparency</li>
                  <li>• <strong>Advanced Security:</strong> Custom role permission controls</li>
                </ul>
              </div>

              {/* Training & Implementation */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-gray-900">Training & Implementation</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• <strong>Onboarding Session:</strong> Step-by-step setup walkthrough</li>
                  <li>• <strong>Team Training:</strong> Complete platform staff training</li>
                  <li>• <strong>Implementation Support:</strong> Workflow & QR tag integration</li>
                </ul>
              </div>

              {/* Integrations */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold">
                  <Plug className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-gray-900">Enterprise Integrations</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• <strong>WhatsApp Business API:</strong> Direct automated commerce</li>
                  <li>• <strong>Instagram Shopping:</strong> Connect passport to social store</li>
                  <li>• <strong>Shopify & WooCommerce:</strong> Live product & order sync</li>
                  <li>• <strong>ERP Sync:</strong> SAP, Oracle, or custom POS connectors</li>
                </ul>
              </div>

              {/* Analytics & Reporting */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F5132]/10 text-[#0F5132] flex items-center justify-center font-bold">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-base text-gray-900">Analytics & Predictive</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• <strong>Advanced Analytics:</strong> Scan telemetry & retention maps</li>
                  <li>• <strong>Custom Reports:</strong> Tailored business metric exports</li>
                  <li>• <strong>Predictive Insights:</strong> Forecast repurchase probability</li>
                </ul>
              </div>

            </div>
          </div>

          {/* PLAN COMPARISON MATRIX TABLE */}
          <div className="mt-20 pt-16 border-t border-gray-200">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-[#0F5132] font-semibold text-xs tracking-widest uppercase font-sans">
                DETAILED FEATURE COMPARISON
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                Compare All Plans Side by Side
              </h3>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 font-bold text-gray-900 w-2/5">Feature</th>
                    <th className="p-4 font-bold text-gray-700 text-center">Starter</th>
                    <th className="p-4 font-bold text-[#0F5132] text-center bg-emerald-50/50">Professional</th>
                    <th className="p-4 font-bold text-gray-900 text-center bg-gray-900 text-white rounded-tr-2xl">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Price</td>
                    <td className="p-4 text-center text-gray-600 font-medium">Free</td>
                    <td className="p-4 text-center font-bold text-[#0F5132] bg-emerald-50/30">₦25,000 / mo</td>
                    <td className="p-4 text-center font-bold text-gray-900">Custom Quote</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Best For</td>
                    <td className="p-4 text-center text-gray-500">Small brands, testing, tailors</td>
                    <td className="p-4 text-center text-gray-600 bg-emerald-50/30">Growing labels, 250 QR/mo</td>
                    <td className="p-4 text-center text-gray-900 font-semibold">Large fashion houses, unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">QR Codes per Month</td>
                    <td className="p-4 text-center text-gray-600">25</td>
                    <td className="p-4 text-center font-medium text-gray-900 bg-emerald-50/30">250</td>
                    <td className="p-4 text-center font-bold text-[#0F5132]">♾️ Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">AI Features Usage</td>
                    <td className="p-4 text-center text-red-500">❌ No</td>
                    <td className="p-4 text-center text-gray-700 bg-emerald-50/30">✅ 50 uses/month</td>
                    <td className="p-4 text-center font-bold text-[#0F5132]">♾️ Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Team Members</td>
                    <td className="p-4 text-center text-gray-600">1 user</td>
                    <td className="p-4 text-center text-gray-700 bg-emerald-50/30">3 users</td>
                    <td className="p-4 text-center font-bold text-[#0F5132]">♾️ Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">VeriThread Branding</td>
                    <td className="p-4 text-center text-emerald-800">✅ Included</td>
                    <td className="p-4 text-center text-gray-500 bg-emerald-50/30">❌ Removed</td>
                    <td className="p-4 text-center font-semibold text-gray-900">❌ Removed</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">White-Label Solution</td>
                    <td className="p-4 text-center text-red-500">❌ No</td>
                    <td className="p-4 text-center text-red-500 bg-emerald-50/30">❌ No</td>
                    <td className="p-4 text-center text-emerald-700 font-bold">✅ Included</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Custom Domain (passport.yourbrand.com)</td>
                    <td className="p-4 text-center text-red-500">❌ No</td>
                    <td className="p-4 text-center text-red-500 bg-emerald-50/30">❌ No</td>
                    <td className="p-4 text-center text-emerald-700 font-bold">✅ Included</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Dedicated Account Manager</td>
                    <td className="p-4 text-center text-red-500">❌ No</td>
                    <td className="p-4 text-center text-red-500 bg-emerald-50/30">❌ No</td>
                    <td className="p-4 text-center text-emerald-700 font-bold">✅ Included</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">24/7 Priority Support (4h SLA)</td>
                    <td className="p-4 text-center text-red-500">❌ No</td>
                    <td className="p-4 text-center text-gray-500 bg-emerald-50/30">24h Response</td>
                    <td className="p-4 text-center text-emerald-700 font-bold">✅ 24/7 (4h SLA)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Direct Phone Support</td>
                    <td className="p-4 text-center text-red-500">❌ No</td>
                    <td className="p-4 text-center text-red-500 bg-emerald-50/30">❌ No</td>
                    <td className="p-4 text-center text-emerald-700 font-bold">✅ Included</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">REST API & Webhooks Access</td>
                    <td className="p-4 text-center text-red-500">❌ No</td>
                    <td className="p-4 text-center text-red-500 bg-emerald-50/30">❌ No</td>
                    <td className="p-4 text-center text-emerald-700 font-bold">✅ Included</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Single Sign-On (SSO)</td>
                    <td className="p-4 text-center text-red-500">❌ No</td>
                    <td className="p-4 text-center text-red-500 bg-emerald-50/30">❌ No</td>
                    <td className="p-4 text-center text-emerald-700 font-bold">✅ Included</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Custom Feature Development</td>
                    <td className="p-4 text-center text-red-500">❌ No</td>
                    <td className="p-4 text-center text-red-500 bg-emerald-50/30">❌ No</td>
                    <td className="p-4 text-center text-[#0F5132] font-bold">✅ On Request</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsEnterpriseModalOpen(true)}
                className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                Request Enterprise Plan Quote <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white border-t border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <HelpCircle className="w-10 h-10 text-[#0F5132] mx-auto mb-2" />
            <h2 className="font-display text-3xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-2">Everything you need to know about VeriThread digital passports</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#F8F9FA] rounded-xl border border-gray-200 shadow-xs overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center font-display font-medium text-gray-900 hover:text-[#0F5132] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-[#0F5132] text-lg font-bold">{activeFaq === i ? '−' : '+'}</span>
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-200/60 pt-3 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-[#0F5132] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#145A32_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 flex flex-col gap-6 items-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Elevate Your Fashion Label Today
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl">
            Join Nigeria’s most prestigious fashion designers. Build interactive digital product passports, protect your brand provenance, and delight your modern audience.
          </p>
          <button
            onClick={() => onNavigate('signup')}
            className="bg-white hover:bg-gray-100 text-[#0F5132] px-8 py-4 rounded-xl font-semibold text-base shadow-lg transition-all cursor-pointer flex items-center gap-2 mt-4"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-sm">
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('')}>
              <div className="w-8 h-8 rounded-lg bg-[#0F5132] flex items-center justify-center text-white font-display font-bold text-lg">
                V
              </div>
              <span className="font-display font-semibold text-xl tracking-tight text-[#0F5132]">VeriThread</span>
            </div>
            <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
              VeriThread is a Digital Product Passport platform empowering fashion brands to protect provenance, build customer trust, and streamline social commerce operations.
            </p>
          </div>
          <div>
            <h6 className="font-bold text-[#0F5132] mb-3">PRODUCT</h6>
            <ul className="space-y-2 text-gray-500 text-xs">
              <li><a href="#promises" className="hover:text-[#0F5132]">The 7 Promises</a></li>
              <li><a href="#how-it-works" className="hover:text-[#0F5132]">Provenance Engine</a></li>
              <li><a href="#features" className="hover:text-[#0F5132]">QR Code Manager</a></li>
              <li><a href="#pricing" className="hover:text-[#0F5132]">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-[#0F5132] mb-3">LEGAL</h6>
            <ul className="space-y-2 text-gray-500 text-xs">
              <li><span className="hover:text-[#0F5132] cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-[#0F5132] cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-[#0F5132] cursor-pointer">Cookie Settings</span></li>
              <li><span className="hover:text-[#0F5132] cursor-pointer">Nigeria Ledger Access</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 VeriThread Inc. Built exclusively for fashion brands in Lagos, Nigeria.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#0F5132] cursor-pointer">WhatsApp Support</span>
            <span>•</span>
            <span className="hover:text-[#0F5132] cursor-pointer">Instagram Community</span>
          </div>
        </div>
      </footer>

      {/* Enterprise Contact Sales Modal */}
      <EnterpriseModal 
        isOpen={isEnterpriseModalOpen} 
        onClose={() => setIsEnterpriseModalOpen(false)} 
      />
    </div>
  );
}
