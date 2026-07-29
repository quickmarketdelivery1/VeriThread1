import React, { useState, useRef } from 'react';
import { Plus, Folder, Calendar, Layers, Image, Eye, Trash2, ArrowLeft, CheckCircle2, Search, X, ChevronRight, Upload } from 'lucide-react';
import { Collection, Product } from '../types';
import { getCollections, saveCollection, deleteCollection, getProducts, saveProduct, getBrand } from '../lib/storage';

interface CollectionsPageProps {
  onRefresh: () => void;
}

export default function CollectionsPage({ onRefresh }: CollectionsPageProps) {
  const collections = getCollections();
  const products = getProducts();

  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail' | 'edit'>('list');
  const [selectedColId, setSelectedColId] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [season, setSeason] = useState('Spring/Summer');
  const [year, setYear] = useState(2026);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800');
  const [colorPalette, setColorPalette] = useState<string[]>(['#0F5132', '#D4AF37', '#E07A5F']);

  const collectionCoverInputRef = useRef<HTMLInputElement>(null);

  const handleCollectionCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  const imagePresets = [
    { name: 'Eko Resort (Tropical)', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800' },
    { name: 'Traditional Ceremony Couture', url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800' },
    { name: 'Lagos Streetwear Urbanism', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800' }
  ];

  const activeCollection = collections.find(c => c.id === selectedColId);
  const activeProducts = products.filter(p => p.collectionId === selectedColId);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name is required');

    const newId = `col-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.floor(10 + Math.random() * 90)}`;
    const currentBrand = getBrand();
    const col: Collection = {
      id: newId,
      brandId: currentBrand.id,
      name,
      season,
      year,
      description: description || undefined,
      coverImage,
      colorPalette,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveCollection(col);
    setViewMode('list');
    resetForm();
    onRefresh();
  };

  const handleUpdateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCollection) return;

    const col: Collection = {
      ...activeCollection,
      name,
      season,
      year,
      description: description || undefined,
      coverImage,
      colorPalette,
      updatedAt: new Date().toISOString()
    };

    saveCollection(col);
    setViewMode('detail');
    onRefresh();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the collection "${name}"? Associate products will be kept but detached.`)) {
      deleteCollection(id);
      setViewMode('list');
      onRefresh();
    }
  };

  const resetForm = () => {
    setName('');
    setSeason('Spring/Summer');
    setYear(2026);
    setDescription('');
    setCoverImage(imagePresets[0].url);
    setColorPalette(['#0F5132', '#D4AF37', '#E07A5F']);
  };

  const startEdit = (col: Collection) => {
    setName(col.name);
    setSeason(col.season);
    setYear(col.year);
    setDescription(col.description || '');
    setCoverImage(col.coverImage);
    setColorPalette(col.colorPalette || ['#0F5132', '#D4AF37', '#E07A5F']);
    setViewMode('edit');
  };

  const handleAddProductToCollection = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      prod.collectionId = selectedColId;
      saveProduct(prod);
      onRefresh();
    }
  };

  const handleRemoveProductFromCollection = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      prod.collectionId = undefined;
      saveProduct(prod);
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* List View */}
      {viewMode === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Product Collections</h2>
              <p className="text-sm text-gray-500">Group your products into seasonal releases and couture themes.</p>
            </div>
            <button
              onClick={() => { resetForm(); setViewMode('create'); }}
              className="bg-[#0F5132] hover:bg-[#145A32] text-white px-5 py-2 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" /> Create Product Collection
            </button>
          </div>

          {collections.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center flex flex-col items-center max-w-md mx-auto gap-4 shadow-sm mt-8">
              <div className="w-12 h-12 rounded-full bg-[#0F5132]/10 flex items-center justify-center text-[#0F5132]">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-base text-gray-900">No Product Collections Created Yet</h3>
                <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                  Group your fashion items into seasonal drops, runway releases, and couture themes.
                </p>
              </div>
              <button
                onClick={() => { resetForm(); setViewMode('create'); }}
                className="bg-[#0F5132] hover:bg-[#145A32] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Create Product Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map(col => {
                const colProducts = products.filter(p => p.collectionId === col.id);
                return (
                  <div 
                    key={col.id}
                    onClick={() => { setSelectedColId(col.id); setViewMode('detail'); }}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col group relative"
                  >
                    <div className="h-44 bg-gray-100 relative shrink-0">
                      <img src={col.coverImage} className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500" alt={col.name} />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-[#0F5132] shadow flex items-center gap-1">
                        <Folder className="w-3.5 h-3.5" /> {colProducts.length} Products
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{col.season} {col.year}</span>
                        </div>
                        <h4 className="font-display font-semibold text-base text-gray-900 group-hover:text-[#0F5132] transition-colors leading-tight">
                          {col.name}
                        </h4>
                        {col.description && (
                          <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                            {col.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <div className="flex gap-1">
                          {col.colorPalette?.map((hex, idx) => (
                            <span key={idx} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }} />
                          ))}
                        </div>
                        <span className="text-[#0F5132] text-xs font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          Manage <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Create View */}
      {viewMode === 'create' && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-md animate-fade-in w-full">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setViewMode('list')} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-all">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 tracking-tight">Create Collection</h2>
              <p className="text-xs text-gray-500">Launch a seasonal category, bespoke range, or capsule collection.</p>
            </div>
          </div>

          <form onSubmit={handleCreateCollection} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collection Name *</label>
              <input
                type="text"
                placeholder="e.g. Eko Fusion Summer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Release Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value="Spring/Summer">Spring/Summer</option>
                  <option value="Fall/Winter">Fall/Winter</option>
                  <option value="Resort">Resort</option>
                  <option value="Pre-Fall">Pre-Fall</option>
                  <option value="Capsule">Capsule Range</option>
                  <option value="Custom Couture">Custom Couture</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Launch Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value={2026}>2026 (Current)</option>
                  <option value={2025}>2025</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description (Optional)</label>
              <textarea
                placeholder="Tell the brand narrative and material inspiration behind this collection..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
              />
            </div>

            {/* Cover Image */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collection Cover Image *</label>
              <input
                type="file"
                ref={collectionCoverInputRef}
                accept="image/*"
                onChange={handleCollectionCoverUpload}
                className="hidden"
              />
              
              <div 
                onClick={() => collectionCoverInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#0F5132] hover:bg-gray-50/50 bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {coverImage ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-100 shadow-sm group">
                    <img src={coverImage} className="w-full h-full object-cover animate-fade-in" alt="Cover Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 uppercase tracking-wider">
                      <Upload className="w-4 h-4" /> Change Image
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#0F5132] flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">Click to upload collection cover</p>
                    <p className="text-[10px] text-gray-400">PNG, JPG, or WEBP up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Color palette representation */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vibe Color Palette</label>
              <div className="flex gap-3">
                {colorPalette.map((hex, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-full border border-gray-100 pr-3 shadow-sm">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => {
                        const nextPalette = [...colorPalette];
                        nextPalette[idx] = e.target.value;
                        setColorPalette(nextPalette);
                      }}
                      className="w-6 h-6 rounded-full border-0 cursor-pointer overflow-hidden p-0"
                    />
                    <span className="text-[10px] font-mono uppercase text-gray-500">{hex}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0F5132] hover:bg-[#145A32] text-white py-2.5 px-5 rounded-full text-xs font-semibold shadow-sm transition-all mt-4 cursor-pointer min-h-[38px]"
            >
              Launch Collection
            </button>
          </form>
        </div>
      )}

      {/* Edit View */}
      {viewMode === 'edit' && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-md animate-fade-in w-full">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setViewMode('detail')} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-all">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900 tracking-tight">Edit Collection</h2>
              <p className="text-xs text-gray-500">Amend the season details or delete this collection folder.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateCollection} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collection Name *</label>
              <input
                type="text"
                placeholder="e.g. Eko Fusion Summer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Release Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value="Spring/Summer">Spring/Summer</option>
                  <option value="Fall/Winter">Fall/Winter</option>
                  <option value="Resort">Resort</option>
                  <option value="Pre-Fall">Pre-Fall</option>
                  <option value="Capsule">Capsule Range</option>
                  <option value="Custom Couture">Custom Couture</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Launch Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
                >
                  <option value={2026}>2026 (Current)</option>
                  <option value={2025}>2025</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description (Optional)</label>
              <textarea
                placeholder="Tell the brand narrative and material inspiration behind this collection..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none"
              />
            </div>

            {/* Cover Image */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cover Image URL *</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-xl text-sm focus:outline-none font-mono"
              />
            </div>

            {/* Color palette representation */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vibe Color Palette</label>
              <div className="flex gap-3">
                {colorPalette.map((hex, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-full border border-gray-100 pr-3 shadow-sm">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => {
                        const nextPalette = [...colorPalette];
                        nextPalette[idx] = e.target.value;
                        setColorPalette(nextPalette);
                      }}
                      className="w-6 h-6 rounded-full border-0 cursor-pointer overflow-hidden p-0"
                    />
                    <span className="text-[10px] font-mono uppercase text-gray-500">{hex}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleDelete(selectedColId, activeCollection?.name || '')}
                className="flex-1 border border-red-200 hover:bg-red-50 text-red-600 py-2.5 px-5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px]"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Collection
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#0F5132] hover:bg-[#145A32] text-white py-2.5 px-5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer min-h-[38px]"
              >
                Update Collection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detail View */}
      {viewMode === 'detail' && activeCollection && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Cover Hero section */}
          <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden border border-gray-200 shadow-sm shrink-0">
            <img src={activeCollection.coverImage} className="w-full h-full object-cover" alt={activeCollection.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
            
            <div className="absolute top-4 left-4">
              <button 
                onClick={() => setViewMode('list')}
                className="bg-white/95 text-gray-800 p-2.5 rounded-xl shadow-md cursor-pointer hover:bg-white flex items-center justify-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Collections
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-white">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-white/70 block">
                  {activeCollection.season} {activeCollection.year}
                </span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl leading-none">{activeCollection.name}</h3>
                {activeCollection.description && (
                  <p className="text-white/80 text-xs sm:text-sm max-w-xl leading-relaxed mt-1">
                    {activeCollection.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(activeCollection)}
                  className="bg-white/15 hover:bg-white/25 border border-white/30 px-5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all min-h-[36px]"
                >
                  Edit Settings
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#0F5132] hover:bg-[#145A32] text-white px-5 py-2 rounded-full text-xs font-semibold shadow-sm cursor-pointer transition-all min-h-[36px]"
                >
                  Add Products
                </button>
              </div>
            </div>
          </div>

          {/* Collection Products Grid Header */}
          <div>
            <h4 className="font-display text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Garments in Collection ({activeProducts.length})
            </h4>

            {activeProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center max-w-md mx-auto gap-4 shadow-sm">
                <Folder className="w-10 h-10 text-gray-300" />
                <div>
                  <h5 className="font-semibold text-gray-900">No products in this collection</h5>
                  <p className="text-gray-500 text-xs mt-1 leading-normal">
                    This collection folder is empty. Go ahead and attach some of your existing products to categorize them.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#0F5132] hover:bg-[#145A32] text-white px-5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all shadow-sm min-h-[36px]"
                >
                  Add Products Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col relative group">
                    <div className="h-40 bg-gray-50 shrink-0 relative">
                      <img src={p.heroImage} className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => handleRemoveProductFromCollection(p.id)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-lg cursor-pointer transition-colors shadow"
                        title="Remove from collection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <strong className="text-gray-900 font-semibold text-sm block leading-tight">{p.name}</strong>
                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Products Modal Sheet */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md max-h-[500px] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                  <h4 className="font-display font-semibold text-sm text-gray-900 uppercase tracking-wider">
                    Add Products to Collection
                  </h4>
                  <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-200 rounded-lg cursor-pointer transition-all">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="p-3 border-b border-gray-100 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search available products..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2.5">
                  {products
                    .filter(p => p.name.toLowerCase().includes(modalSearch.toLowerCase()) || p.sku.toLowerCase().includes(modalSearch.toLowerCase()))
                    .map(p => {
                      const isInThisCollection = p.collectionId === selectedColId;
                      return (
                        <div key={p.id} className="flex items-center justify-between p-2.5 bg-gray-50/50 hover:bg-gray-100/60 rounded-xl border border-gray-100 transition-all">
                          <div className="flex items-center gap-3">
                            <img className="w-10 h-10 rounded-lg object-cover bg-gray-100" src={p.heroImage} alt="" />
                            <div>
                              <strong className="text-xs font-semibold text-gray-900 block truncate max-w-[200px]">{p.name}</strong>
                              <span className="text-[10px] text-gray-400 font-mono">{p.sku}</span>
                            </div>
                          </div>

                          {isInThisCollection ? (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddProductToCollection(p.id)}
                              className="bg-[#0F5132] hover:bg-[#145A32] text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                            >
                              Add Here
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
