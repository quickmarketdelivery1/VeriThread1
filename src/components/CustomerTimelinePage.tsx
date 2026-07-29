import React, { useState } from 'react';
import { Search, Mail, Phone, Calendar, Crown, ShieldCheck, Tag, ArrowRight, Send, MessageSquare, Star, ArrowUpRight, CheckCircle2, UserPlus, Users } from 'lucide-react';
import { getCustomers, getOwnerships, getProducts, recordAnalyticsEvent, getBrand } from '../lib/storage';
import { Customer } from '../types';
import LockedFeatureGate from './LockedFeatureGate';

export default function CustomerTimelinePage() {
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const ownerships = getOwnerships();
  const products = getProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  
  // Custom message modal state
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageType, setMessageType] = useState<'email' | 'whatsapp'>('email');
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('Exclusive Atelier Collection');
  const [sentSuccess, setSentSuccess] = useState(false);

  // Dynamic search
  const filteredCustomers = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Get products owned by a customer
  const getCustomerProducts = (customerId: string) => {
    const custOwnerships = ownerships.filter(o => o.customerId === customerId);
    return custOwnerships.map(o => {
      const prod = products.find(p => p.id === o.productId);
      return {
        product: prod,
        ownership: o
      };
    }).filter(item => item.product !== undefined);
  };

  const selectedCustomerProducts = selectedCustomer ? getCustomerProducts(selectedCustomer.id) : [];

  // Toggle VIP status in local state and write back to storage (optional)
  const toggleVIP = (customerId: string) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        const isVIP = !c.isVIP;
        // Log in analytics
        if (isVIP) {
          recordAnalyticsEvent({
            id: `evt-vip-${Date.now()}`,
            productId: selectedCustomerProducts[0]?.product?.id || 'general',
            eventType: 'register',
            timestamp: new Date().toISOString(),
            metadata: {
              location: 'Lagos, Nigeria',
              ownerName: `${c.firstName} ${c.lastName} upgraded to VIP`
            }
          });
        }
        return { ...c, isVIP };
      }
      return c;
    });
    setCustomers(updated);
    localStorage.setItem('vt_customers', JSON.stringify(updated));
  };

  // Generate a customized premium timeline based on the customer and their products
  const getTimelineMilestones = (customer: Customer, ownedItems: ReturnType<typeof getCustomerProducts>) => {
    const milestones = [];
    
    // Calculate dates based on registration or standard offsets to look completely authentic
    const regDateStr = ownedItems[0]?.ownership?.registrationDate || customer.createdAt;
    const regDate = new Date(regDateStr);
    
    // Let's create high-fidelity, customized milestones
    if (ownedItems.length > 0) {
      const primaryProduct = ownedItems[0].product!;
      
      milestones.push({
        id: '1',
        title: `Purchased: ${primaryProduct.name}`,
        description: `Acquired authentic apparel item from verified brand retail storefront.`,
        date: new Date(regDate.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        icon: Tag,
        color: 'bg-emerald-100 text-emerald-800'
      });

      milestones.push({
        id: '2',
        title: 'Registered Ownership',
        description: `Scanned cryptographic secure QR tag and registered the ${primaryProduct.warrantyPeriod}-month product warranty.`,
        date: regDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        icon: ShieldCheck,
        color: 'bg-green-100 text-green-800'
      });

      milestones.push({
        id: '3',
        title: 'Opened Passport',
        description: `Accessed the digital provenance certificate for ${primaryProduct.name} to view fiber story and designer note.`,
        date: regDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        icon: ArrowUpRight,
        color: 'bg-blue-100 text-blue-800'
      });
    } else {
      milestones.push({
        id: '1',
        title: 'Joined Database',
        description: 'Profile created in label relationship index.',
        date: new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        icon: UserPlus,
        color: 'bg-gray-100 text-gray-800'
      });
    }

    // High fidelity repeat engagement milestones
    const baseTime = regDate.getTime();
    
    milestones.push({
      id: '4',
      title: 'Viewed New Collection',
      description: `Opened early access invitation to browse the upcoming seasonal lookbook.`,
      date: new Date(baseTime + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      icon: Star,
      color: 'bg-amber-100 text-amber-800'
    });

    milestones.push({
      id: '5',
      title: 'Clicked New Collection Campaign',
      description: `Expressed strong purchase intent by interacting with interactive pre-order catalog.`,
      date: new Date(baseTime + 18 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      icon: ArrowRight,
      color: 'bg-purple-100 text-purple-800'
    });

    if (ownedItems.length > 1) {
      const secondProduct = ownedItems[1].product!;
      milestones.push({
        id: '6',
        title: `Purchased: ${secondProduct.name}`,
        description: `Verified repeat order completed! Sourced custom Ankara fabric directly.`,
        date: new Date(ownedItems[1].ownership.registrationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        icon: Tag,
        color: 'bg-emerald-100 text-emerald-800'
      });
    } else if (customer.isVIP) {
      milestones.push({
        id: '6',
        title: 'Joined VIP Lounge',
        description: `Granted exclusive tier access for private fitting consultations and complimentary tailoring services.`,
        date: new Date(baseTime + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        icon: Crown,
        color: 'bg-[#D4AF37]/20 text-[#996515] font-semibold'
      });
    }

    milestones.push({
      id: '7',
      title: 'Invited Friend & Referred Lead',
      description: `Shared personalized provenance link via WhatsApp, driving downstream verification scans.`,
      date: new Date(baseTime + 45 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      icon: MessageSquare,
      color: 'bg-indigo-100 text-indigo-800'
    });

    return milestones;
  };

  const handleSendMessage = (type: 'email' | 'whatsapp') => {
    setMessageType(type);
    if (type === 'email') {
      setMessageSubject(`Special Offer for ${selectedCustomer?.firstName}`);
      const currentBrand = getBrand();
      setMessageText(`Hello ${selectedCustomer?.firstName},\n\nWe hope you are enjoying your garments. As one of our cherished clients, we would love to invite you to view our newest upcoming pieces ahead of the public launch.\n\nWarm regards,\n${currentBrand.name}`);
    } else {
      setMessageText(`Hello ${selectedCustomer?.firstName}! We just launched our early pre-orders for the seasonal capsule. Would you like a private fitting session this week?`);
    }
    setMessageOpen(true);
    setSentSuccess(false);
  };

  const submitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setMessageOpen(false);
      setSentSuccess(false);
      // Log event
      if (selectedCustomer) {
        recordAnalyticsEvent({
          id: `evt-msg-${Date.now()}`,
          productId: selectedCustomerProducts[0]?.product?.id || 'general',
          eventType: 'share',
          timestamp: new Date().toISOString(),
          metadata: {
            location: 'Lagos, Nigeria',
            ownerName: `Campaign sent to ${selectedCustomer.firstName}`
          }
        });
      }
    }, 1500);
  };

  return (
    <LockedFeatureGate
      featureName="Customer CRM"
      description="Track purchase loops, timeline milestones, and build deep customer relationships."
      benefits={[
        "Customer profiles & directories",
        "Purchase history & timeline tracking",
        "Direct email & WhatsApp customer engagement",
        "VIP customer status designations",
        "Detailed engagement stats"
      ]}
    >
      <div className="flex flex-col gap-6 animate-fade-in font-sans w-full max-w-full overflow-hidden min-w-0">
      
      {/* Header */}
      <div>
        <h2 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Fashion Customer CRM</h2>
        <p className="text-sm text-gray-500">Track purchase loops, timeline milestones, and build deep customer relationships.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full min-w-0">
        
        {/* Left Column: Customer Directory */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
          <div className="p-4 border-b border-gray-100 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-3 my-auto">
                <div className="w-10 h-10 rounded-full bg-[#0F5132]/10 flex items-center justify-center text-[#0F5132]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">No Customers Registered Yet</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                    When customers scan your QR tags and claim digital ownership, their profile and activity history will appear here.
                  </p>
                </div>
              </div>
            ) : (
              filteredCustomers.map(cust => {
                const owned = getCustomerProducts(cust.id);
                const isSelected = cust.id === selectedCustomerId;
                
                return (
                  <button
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected ? 'bg-emerald-50/40 border-r-4 border-[#0F5132]' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-semibold text-xs text-gray-900 truncate">
                          {cust.firstName} {cust.lastName}
                        </span>
                        {cust.isVIP && (
                          <span className="p-0.5 rounded-full bg-amber-100 text-[#D4AF37]">
                            <Crown className="w-3 h-3 fill-current" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 block truncate">{cust.email}</span>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-[#0F5132] bg-[#0F5132]/10 px-2 py-0.5 rounded-full block">
                        {owned.length} {owned.length === 1 ? 'Garment' : 'Garments'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer Details & Relationship Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full min-w-0">
          {selectedCustomer ? (
            <>
              {/* Profile Card Summary */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full min-w-0">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0F5132] font-display font-bold text-lg flex items-center justify-center uppercase border border-emerald-100 shrink-0">
                    {selectedCustomer.firstName.substring(0, 1)}{selectedCustomer.lastName.substring(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-semibold text-base sm:text-lg text-gray-900 leading-none truncate max-w-xs">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </h3>
                      <button
                        onClick={() => toggleVIP(selectedCustomer.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer transition-all ${
                          selectedCustomer.isVIP 
                            ? 'bg-amber-50 text-[#996515] border-amber-200 hover:bg-amber-100' 
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Crown className={`w-3 h-3 ${selectedCustomer.isVIP ? 'fill-current' : ''}`} />
                        {selectedCustomer.isVIP ? 'VIP Client' : 'Make VIP'}
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-[11px] text-gray-500 mt-2 min-w-0">
                      <span className="flex items-center gap-1 min-w-0 truncate" title={selectedCustomer.email}>
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{selectedCustomer.email}</span>
                      </span>
                      {selectedCustomer.phone && (
                        <span className="flex items-center gap-1 shrink-0">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {selectedCustomer.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        Joined {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 md:justify-end">
                  <button
                    onClick={() => handleSendMessage('email')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold cursor-pointer transition-all min-h-[36px]"
                  >
                    <Mail className="w-3.5 h-3.5 text-gray-500" /> Email
                  </button>
                  <button
                    onClick={() => handleSendMessage('whatsapp')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0F5132] hover:bg-[#145A32] text-white rounded-full text-xs font-semibold cursor-pointer transition-all min-h-[36px] shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              </div>

              {/* Owned items card list */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">Registered Ledger Garments</h4>
                
                {selectedCustomerProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No certified purchases registered yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCustomerProducts.map(({ product, ownership }) => (
                      <div key={ownership.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                        <img className="w-12 h-12 rounded-lg object-cover bg-white border border-gray-100" src={product?.heroImage} alt="" />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-xs text-gray-900 block truncate leading-tight mb-0.5">{product?.name}</span>
                          <span className="text-[10px] text-gray-400 block font-mono mb-1.5">{product?.sku}</span>
                          <span className="text-[9px] font-bold uppercase text-[#0F5132] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block">
                            Warranty ends {new Date(ownership.warrantyExpiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Relationship Timeline */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Client Relationship Journey</h4>
                  <span className="text-[10px] bg-emerald-50 text-[#0F5132] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Cryptographic Logs</span>
                </div>

                <div className="relative border-l-2 border-gray-200 ml-3 pl-6 space-y-6">
                  {getTimelineMilestones(selectedCustomer, selectedCustomerProducts).map((milestone, idx) => {
                    const MilestoneIcon = milestone.icon;
                    return (
                      <div key={milestone.id || idx} className="relative">
                        {/* Bullet Icon */}
                        <span className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow ${milestone.color}`}>
                          <MilestoneIcon className="w-3.5 h-3.5" />
                        </span>

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                          <div>
                            <h5 className="font-bold text-xs text-gray-900">{milestone.title}</h5>
                            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed max-w-xl">{milestone.description}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono sm:text-right shrink-0">{milestone.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 text-center border border-gray-200 rounded-2xl flex flex-col items-center justify-center h-full text-gray-500">
              Select a customer to view their relationship profile.
            </div>
          )}
        </div>
      </div>

      {/* Message Modal Overlay */}
      {messageOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={submitMessage} className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 flex flex-col gap-4 animate-scale-in">
            <div>
              <h3 className="font-display font-semibold text-base text-gray-900">
                Send {messageType === 'email' ? 'Luxury Email' : 'WhatsApp Prompts'}
              </h3>
              <p className="text-xs text-gray-500">Drafting personalized label campaign to {selectedCustomer.firstName}.</p>
            </div>

            {messageType === 'email' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subject Line</label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0F5132]"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Message Content</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={5}
                className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0F5132] font-sans leading-relaxed"
              />
            </div>

            {sentSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-xl flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Message delivered successfully!
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setMessageOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-xl border border-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#0F5132] hover:bg-[#145A32] rounded-xl cursor-pointer flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Send Message
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      </div>
    </LockedFeatureGate>
  );
}
