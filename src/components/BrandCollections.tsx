import React, { useState, useEffect } from 'react';
import { 
  Folder, ArrowLeft, ShieldCheck, ExternalLink, Sparkles, Grid, Layers, Search, CheckCircle, Tag, ChevronRight, Globe, MessageSquare 
} from 'lucide-react';
import { getBrand, getCollectionsWithProducts, getProductsByBrand, syncProductsWithRemote } from '../lib/storage';
import { fetchProductsFirestore, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Collection, Product, Brand } from '../types';
import ProBadge from './ProBadge';

interface BrandCollectionsProps {
  onNavigate?: (route: string) => void;
  brandId?: string;
}

export default function BrandCollections({ onNavigate, brandId }: BrandCollectionsProps) {
  const [brand, setBrand] = useState<Brand>(() => getBrand());

  const targetBrandId = brandId || brand.id;

  const [allBrandProducts, setAllBrandProducts] = useState<Product[]>([]);
  const [collectionsWithProducts, setCollectionsWithProducts] = useState<(Collection & { products: Product[] })[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    const b = getBrand();
    setBrand(b);
    const prods = getProductsByBrand(targetBrandId).filter(p => p.isPublished !== false);
    const cols = getCollectionsWithProducts(targetBrandId);
    setAllBrandProducts(prods);
    setCollectionsWithProducts(cols);
  };

  useEffect(() => {
    loadData();

    if (targetBrandId) {
      fetchProductsFirestore(targetBrandId).then(remoteProds => {
        if (remoteProds && remoteProds.length > 0) {
          syncProductsWithRemote(remoteProds, targetBrandId);
          loadData();
        }
      }).catch(err => console.warn('[BrandCollections] Firestore fetch notice:', err));
    }

    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [targetBrandId]);

  // Filter products by collection tab & search
  const filteredProducts = allBrandProducts.filter(product => {
    const matchesCollection = selectedCollectionId === 'all' || product.collectionId === selectedCollectionId;
    const matchesSearch = !searchQuery.trim() || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCollection && matchesSearch;
  });

  const activeCollectionName = selectedCollectionId === 'all' 
    ? (brand.name ? `All ${brand.name} Collections` : 'All Collections')
    : collectionsWithProducts.find(c => c.id === selectedCollectionId)?.name || 'Collection';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1C1C1C] font-sans pb-16">
      
      {/* Brand Header Banner */}
      <div className="bg-[#0F5132] text-white pt-8 pb-12 px-4 sm:px-6 md:px-12 relative overflow-hidden shadow-md">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
          
          {/* Back Button */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('')}
              className="self-start text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </button>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              {brand.logoUrl ? (
                <img 
                  src={brand.logoUrl} 
                  alt={brand.name || 'Brand Logo'} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg bg-white shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-900 border-2 border-white/30 flex items-center justify-center text-2xl font-display font-bold text-white shadow-lg shrink-0">
                  {brand.name ? brand.name.charAt(0).toUpperCase() : 'V'}
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight">
                    {brand.name}
                  </h1>
                  <ProBadge plan={brand.plan} size={18} />
                </div>
                {brand.slogan ? (
                  <p className="text-xs text-white/80 font-medium mt-1">
                    {brand.slogan}
                  </p>
                ) : brand.name ? (
                  <p className="text-xs text-white/80 font-medium mt-1">
                    {brand.name} Digital Product Passports
                  </p>
                ) : null}
                {brand.location && (
                  <span className="text-[10px] text-emerald-200/90 font-mono uppercase tracking-wider mt-1 block">
                    📍 {brand.location}
                  </span>
                )}
              </div>
            </div>

            {/* Brand Stats Badge */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 self-stretch sm:self-auto justify-around">
              <div className="text-center">
                <span className="text-xs font-bold text-white block">{allBrandProducts.length}</span>
                <span className="text-[9px] text-white/70 uppercase font-semibold">Products</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="text-center">
                <span className="text-xs font-bold text-white block">{collectionsWithProducts.length}</span>
                <span className="text-[9px] text-white/70 uppercase font-semibold">Collections</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="text-center">
                <span className="text-xs font-bold text-emerald-300 block flex items-center justify-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
                <span className="text-[9px] text-white/70 uppercase font-semibold">Ledger</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {brand.description && (
            <p className="text-xs sm:text-sm text-white/90 max-w-2xl font-sans leading-relaxed">
              {brand.description}
            </p>
          )}

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8">
        
        {/* Search & Collection Filter Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          
          {/* Collection Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
            <button
              onClick={() => setSelectedCollectionId('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCollectionId === 'all'
                  ? 'bg-[#0F5132] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> All Products ({allBrandProducts.length})
            </button>

            {collectionsWithProducts.map(col => (
              <button
                key={col.id}
                onClick={() => setSelectedCollectionId(col.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCollectionId === col.id
                    ? 'bg-[#0F5132] text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Folder className="w-3.5 h-3.5" /> {col.name} ({col.products.length})
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search garments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs focus:outline-none focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] transition-all"
            />
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3">
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F5132]" />
              {activeCollectionName}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cryptographically authenticated digital passports by {brand.name || 'VeriThread'}
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Garment' : 'Garments'}
          </span>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden hover:border-gray-300"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                  <img
                    src={product.heroImage || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category Badge */}
                  {product.category && (
                    <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {product.category}
                    </span>
                  )}

                  {/* VeriThread Verification Badge */}
                  <span className="absolute top-2.5 right-2.5 bg-[#0F5132] text-white p-1 rounded-full shadow-md" title="VeriThread Ledger Certified">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Card Details Body */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-gray-900 group-hover:text-[#0F5132] transition-colors truncate">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="font-mono text-[11px] text-gray-400 truncate">
                        {product.sku}
                      </span>
                      {product.priceMin ? (
                        <span className="text-xs font-bold text-gray-900">
                          ₦{Number(product.priceMin).toLocaleString()}
                          {product.priceMax ? ` - ₦${Number(product.priceMax).toLocaleString()}` : ''}
                        </span>
                      ) : null}
                    </div>

                    {product.fabric && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 italic">
                        {product.fabric}
                      </p>
                    )}
                  </div>

                  {/* View Passport Action Button */}
                  <button
                    onClick={() => onNavigate && onNavigate(`passport/${product.id}`)}
                    className="w-full py-2 px-3 bg-[#0F5132] hover:bg-[#145A32] text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    View Passport <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto my-12 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0F5132] flex items-center justify-center">
              <Folder className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-gray-900 text-base">
              No products available in this collection yet.
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {searchQuery 
                ? `No garments found matching "${searchQuery}". Try adjusting your search term.`
                : 'Check back soon for upcoming drops and additions from this atelier.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-semibold text-[#0F5132] underline cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}

        {/* Bottom Guarantee Banner */}
        <div className="mt-16 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#0F5132] flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xs text-gray-900 uppercase tracking-wider">
                VeriThread Authenticity Standard
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Every garment is linked to an immutable digital passport verifying craftsmanship, materials, and ownership.
              </p>
            </div>
          </div>
          
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest whitespace-nowrap">
            VERITHREAD PROVENANCE LEDGER
          </span>
        </div>

      </div>
    </div>
  );
}
