import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, QrCode, Globe, Eye, Trash2, ArrowUpRight, Heart, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { getProducts, getQRCodes, getOwnerships, deleteProduct, getBrand, syncProductsWithRemote } from '../lib/storage';
import { fetchProductsFirestore } from '../lib/firebase';
import ProBadge from './ProBadge';

interface ProductsListPageProps {
  onNavigate: (route: string) => void;
  onRefresh: () => void;
}

export default function ProductsListPage({ onNavigate, onRefresh }: ProductsListPageProps) {
  const brand = getBrand();
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [isSyncing, setIsSyncing] = useState(false);
  const qrcodes = getQRCodes();
  const ownerships = getOwnerships();

  const syncFirestoreData = async () => {
    let activeBrandId = brand.id;
    try {
      const authUserStr = localStorage.getItem('vt_auth_user');
      if (authUserStr) {
        const u = JSON.parse(authUserStr);
        if (u.uid) activeBrandId = u.uid;
      }
    } catch (e) {}

    if (activeBrandId) {
      setIsSyncing(true);
      try {
        const remoteProds = await fetchProductsFirestore(activeBrandId);
        if (remoteProds) {
          const synced = syncProductsWithRemote(remoteProds, activeBrandId);
          setProducts(synced);
        }
      } catch (e) {
        console.warn('[ProductsListPage] Remote sync notice:', e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    const initialProds = getProducts();
    console.log('[DEBUG] ProductsListPage loaded products from getProducts():', initialProds);
    setProducts(initialProds);
    syncFirestoreData();
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const updatedProds = getProducts();
      console.log('[DEBUG] ProductsListPage storage event triggered. Updated products:', updatedProds);
      setProducts(updatedProds);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['All', 'Traditional Wear', 'Streetwear', 'Dresses', 'Accessories', 'Tops', 'Bottoms', 'Other'];

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteProduct(id);
      setProducts(getProducts());
      onRefresh();
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.fabric.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Product Passports</h2>
          <p className="text-sm text-gray-500">Manage your garment digital identities, SKUs, and passport statuses.</p>
        </div>
        <button
          onClick={() => onNavigate('products/new')}
          className="bg-[#0F5132] hover:bg-[#145A32] text-white px-4 h-8 rounded-full text-[11px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Create Digital Product Passport
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search name, SKU, fabric..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 w-full lg:w-auto items-center">
          <Filter className="w-3.5 h-3.5 text-gray-400 mr-1 hidden lg:block" />
          <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer shrink-0 transition-all ${
                  selectedCategory === cat 
                    ? 'bg-[#0F5132] text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid/List Toggle */}
        <div className="hidden lg:flex bg-gray-100 p-1 rounded-xl items-center border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0F5132]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0F5132]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center flex flex-col items-center max-w-md mx-auto gap-4 shadow-sm mt-8">
          <div className="w-12 h-12 rounded-full bg-[#0F5132]/10 flex items-center justify-center text-[#0F5132]">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base text-gray-900">
              {products.length === 0 ? "You Haven't Created Your First Digital Product Passport Yet" : "No Matching Product Passports"}
            </h3>
            <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
              {products.length === 0
                ? "Click the button below to get started generating digital identities for your fashion pieces."
                : "We couldn't find any products matching your search criteria. Try clearing filters or create a new passport."}
            </p>
          </div>
          {products.length === 0 ? (
            <button
              onClick={() => onNavigate('products/new')}
              className="bg-[#0F5132] hover:bg-[#145A32] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Digital Product Passport
            </button>
          ) : (
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="text-xs font-semibold text-[#0F5132] hover:underline cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(p => {
            const qr = qrcodes.find(q => q.productId === p.id);
            const scans = qr ? qr.scanCount : 0;
            const owns = ownerships.filter(o => o.productId === p.id).length;

            return (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group relative"
              >
                {/* Image & Status */}
                <div className="relative h-48 bg-gray-100 shrink-0">
                  <img src={p.heroImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 flex-nowrap max-w-[calc(100%-16px)]">
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow whitespace-nowrap shrink-0 ${
                      p.isPublished 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="bg-white/85 backdrop-blur-sm text-gray-800 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full shadow border border-gray-100 whitespace-nowrap truncate shrink min-w-0">
                      {p.category}
                    </span>
                  </div>

                  {/* Quick hover button to Passport */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-300">
                    <button
                      onClick={() => onNavigate(`passport/${p.id}`)}
                      className="bg-white hover:bg-[#0F5132] hover:text-white text-gray-900 p-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Globe className="w-4 h-4" /> View Passport
                    </button>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-display font-semibold text-base text-gray-900 group-hover:text-[#0F5132] transition-colors leading-tight">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">SKU: {p.sku}</span>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Metrics & Actions bar */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex gap-3">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block">QR Scans</span>
                        <strong className="text-gray-900 text-sm font-bold flex items-center gap-1 mt-0.5">
                          <QrCode className="w-3.5 h-3.5 text-[#0F5132]" /> {scans}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Owners</span>
                        <strong className="text-gray-900 text-sm font-bold flex items-center gap-1 mt-0.5">
                          <Eye className="w-3.5 h-3.5 text-emerald-600" /> {owns}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Likes</span>
                        <strong className="text-gray-900 text-sm font-bold flex items-center gap-1 mt-0.5">
                          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-100" /> {p.likeCount || 0}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        title="Delete product definition"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* List Layout */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">SKU</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Passport ID</th>
                  <th className="py-4 px-6">Metrics</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                {filteredProducts.map(p => {
                  const qr = qrcodes.find(q => q.productId === p.id);
                  const scans = qr ? qr.scanCount : 0;
                  const owns = ownerships.filter(o => o.productId === p.id).length;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" src={p.heroImage} alt={p.name} />
                        <div>
                          <strong className="text-gray-900 font-semibold text-xs block">{p.name}</strong>
                          <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded mt-1 ${
                            p.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[10px]">{p.sku}</td>
                      <td className="py-4 px-6 font-medium">{p.category}</td>
                      <td className="py-4 px-6 text-gray-400 font-mono text-[10px]">{p.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-4">
                          <span><strong>{scans}</strong> scans</span>
                          <span><strong>{owns}</strong> owners</span>
                          <span className="text-red-600"><strong>{p.likeCount || 0}</strong> likes</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => onNavigate(`passport/${p.id}`)}
                            title="Open digital passport"
                            className="p-1.5 text-gray-500 hover:text-[#0F5132] hover:bg-[#0F5132]/5 rounded-lg cursor-pointer transition-all"
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Delete product definition"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
