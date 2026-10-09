import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  DollarSign,
  Package,
  Layers,
  Truck,
  FileText,
  Search,
  Eye,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Percent,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Category, ProductVariant, ProductSpecification, ProductFAQ } from '../../types/store';
import {
  createProduct,
  updateProduct,
  uploadCatalogImage,
  AdminProductPayload,
} from '../../services/adminService';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

type TabType =
  | 'basic'
  | 'images'
  | 'pricing'
  | 'inventory'
  | 'variants'
  | 'shipping'
  | 'details'
  | 'seo'
  | 'display'
  | 'faq';

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onClose,
  onSaved,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 1. BASIC INFORMATION
  const [name, setName] = useState(product?.title || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [shortDesc, setShortDesc] = useState(product?.shortDescription || '');
  const [description, setDescription] = useState(product?.description || '');
  const [brand, setBrand] = useState(product?.brand || 'Zenvilo');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [subcategory, setSubcategory] = useState(product?.subcategory || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [productType, setProductType] = useState<'physical' | 'digital' | 'bundle' | 'service'>(
    product?.productType || 'physical'
  );
  const [tagsInput, setTagsInput] = useState((product?.tags || []).join(', '));
  const [status, setStatus] = useState<'active' | 'draft' | 'inactive'>(
    product?.status || (product?.isActive ? 'active' : 'draft')
  );

  // 2. IMAGES
  interface ImageItem {
    url: string;
    altText: string;
    isPrimary: boolean;
  }
  const [images, setImages] = useState<ImageItem[]>(() => {
    if (!product || !product.images) return [];
    return product.images.map((url, idx) => ({
      url,
      altText: product.imageAltTexts?.[url] || '',
      isPrimary: idx === 0,
    }));
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  // 3. PRICING (ADMIN-ONLY COST & PROFIT)
  const [price, setPrice] = useState(product ? String(product.price) : '49.00');
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ? String(product.compareAtPrice) : ''
  );
  const [costPrice, setCostPrice] = useState(
    product?.costPrice !== undefined ? String(product.costPrice) : '20.00'
  );
  const [currency, setCurrency] = useState(product?.currency || 'USD');

  // 4. INVENTORY
  const [inventory, setInventory] = useState(product ? String(product.inventory) : '25');
  const [trackInventory, setTrackInventory] = useState(product?.trackInventory ?? true);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product?.lowStockThreshold !== undefined ? String(product.lowStockThreshold) : '5'
  );
  const [allowBackorders, setAllowBackorders] = useState(product?.allowBackorders ?? false);

  // 5. VARIANTS
  const [variants, setVariants] = useState<Array<{
    id?: string;
    name: string;
    sku: string;
    price: string;
    compareAtPrice: string;
    costPrice: string;
    inventory: string;
    imageUrl: string;
    isActive: boolean;
    options: Record<string, string>;
  }>>(() => {
    if (!product || !product.variants) return [];
    return product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku || '',
      price: v.price !== undefined ? String(v.price) : '',
      compareAtPrice: v.compareAtPrice !== undefined ? String(v.compareAtPrice) : '',
      costPrice: v.costPrice !== undefined ? String(v.costPrice) : '',
      inventory: v.inventory !== undefined ? String(v.inventory) : '10',
      imageUrl: v.imageUrl || '',
      isActive: v.isActive !== false,
      options: v.options || {},
    }));
  });

  // 6. SHIPPING
  const [weight, setWeight] = useState(product?.weight ? String(product.weight) : '');
  const [length, setLength] = useState(
    product?.dimensions?.length ? String(product.dimensions.length) : ''
  );
  const [width, setWidth] = useState(
    product?.dimensions?.width ? String(product.dimensions.width) : ''
  );
  const [height, setHeight] = useState(
    product?.dimensions?.height ? String(product.dimensions.height) : ''
  );
  const [dimUnit, setDimUnit] = useState(product?.dimensions?.unit || 'cm');
  const [shippingClass, setShippingClass] = useState(product?.shippingClass || 'standard');
  const [processingTime, setProcessingTime] = useState(
    product?.processingTime || '1–2 business days'
  );
  const [shippingInfo, setShippingInfo] = useState(
    product?.shippingInfo || 'Standard shipping takes 3–7 business days.'
  );
  const [returnInfo, setReturnInfo] = useState(
    product?.returnInfo || '30-day hassle-free returns on original items.'
  );

  // 7. DETAILS & SPECIFICATIONS
  const [features, setFeatures] = useState<string[]>(
    product?.features && product.features.length > 0
      ? product.features
      : ['Precision-engineered durable materials', 'Minimalist aesthetic tailored for everyday use']
  );
  const [specifications, setSpecifications] = useState<ProductSpecification[]>(
    product?.specifications && product.specifications.length > 0
      ? product.specifications
      : [
          { label: 'Brand', value: 'Zenvilo' },
          { label: 'Origin', value: 'Designed in California' },
        ]
  );
  const [materials, setMaterials] = useState(product?.materials || '');
  const [whatsIncluded, setWhatsIncluded] = useState(product?.whatsIncluded || '');
  const [careInstructions, setCareInstructions] = useState(product?.careInstructions || '');
  const [warrantyInfo, setWarrantyInfo] = useState(
    product?.warrantyInfo || '1-year limited manufacturer warranty included.'
  );
  const [internalNotes, setInternalNotes] = useState(product?.internalNotes || '');

  // 8. SEO
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(product?.seoKeywords || '');

  // 9. STORE DISPLAY SETTINGS
  const [isFeatured, setIsFeatured] = useState(product?.featured ?? false);
  const [isBestseller, setIsBestseller] = useState(product?.bestseller ?? false);
  const [isNew, setIsNew] = useState(product?.newArrival ?? true);
  const [isHomepageVisible, setIsHomepageVisible] = useState(product?.isHomepageVisible ?? true);
  const [isShopVisible, setIsShopVisible] = useState(product?.isShopVisible ?? true);
  const [sortOrder, setSortOrder] = useState(
    product?.sortOrder !== undefined ? String(product.sortOrder) : '0'
  );

  // 10. FAQS
  const [faqs, setFaqs] = useState<ProductFAQ[]>(
    product?.faqs && product.faqs.length > 0
      ? product.faqs
      : [
          {
            question: 'What is the expected delivery time?',
            answer: 'Orders are processed within 1-2 business days and arrive in 3-5 days.',
          },
        ]
  );

  // Auto-generate slug when name changes for new products
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!product) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      if (!seoTitle) setSeoTitle(val ? `${val} | Zenvilo` : '');
    }
  };

  // Calculations for Margin and Discount
  const numPrice = parseFloat(price) || 0;
  const numCompare = parseFloat(compareAtPrice) || 0;
  const numCost = parseFloat(costPrice) || 0;
  const profitMargin = numPrice - numCost;
  const profitMarginPercent = numPrice > 0 ? ((profitMargin / numPrice) * 100).toFixed(1) : '0';
  const discountPercent =
    numCompare > numPrice && numCompare > 0
      ? Math.round(((numCompare - numPrice) / numCompare) * 100)
      : null;

  // Image Upload Handler via Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    let uploadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const res = await uploadCatalogImage(file, 'products');
      if (res.url) {
        setImages((prev) => [
          ...prev,
          {
            url: res.url!,
            altText: `${name || 'Product'} image ${prev.length + 1}`,
            isPrimary: prev.length === 0,
          },
        ]);
        uploadedCount++;
      } else {
        showToast(`Failed to upload ${file.name}: ${res.error}`, 'error');
      }
    }

    setIsUploadingImage(false);
    if (uploadedCount > 0) {
      showToast(`${uploadedCount} image(s) uploaded successfully!`, 'success');
    }
  };

  // Add Image by Direct URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        url: newImageUrl.trim(),
        altText: `${name || 'Product'} photo`,
        isPrimary: prev.length === 0,
      },
    ]);
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const copy = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  // Variant Helpers
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: `Option ${prev.length + 1}`,
        sku: sku ? `${sku}-V${prev.length + 1}` : '',
        price: price,
        compareAtPrice: compareAtPrice,
        costPrice: costPrice,
        inventory: '10',
        imageUrl: images[0]?.url || '',
        isActive: true,
        options: { Size: 'Standard' },
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Feature Helpers
  const handleAddFeature = () => {
    setFeatures((prev) => [...prev, '']);
  };
  const handleUpdateFeature = (index: number, val: string) => {
    setFeatures((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };
  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Specification Helpers
  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { label: '', value: '' }]);
  };
  const handleUpdateSpec = (index: number, field: 'label' | 'value', val: string) => {
    setSpecifications((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };
  const handleRemoveSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, idx) => idx !== index));
  };

  // FAQ Helpers
  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  };
  const handleUpdateFaq = (index: number, field: 'question' | 'answer', val: string) => {
    setFaqs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };
  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, idx) => idx !== index));
  };

  // SUBMIT FORM
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Product name is required', 'error');
      setActiveTab('basic');
      return;
    }
    if (!slug.trim()) {
      showToast('Product URL slug is required', 'error');
      setActiveTab('basic');
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      showToast('Please specify a valid non-negative price', 'error');
      setActiveTab('pricing');
      return;
    }

    setIsSubmitting(true);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const cleanFeatures = features.map((f) => f.trim()).filter(Boolean);
    const cleanSpecs = specifications.filter((s) => s.label.trim() && s.value.trim());
    const cleanFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());

    const payload: AdminProductPayload = {
      name: name.trim(),
      slug: slug.trim(),
      shortDescription: shortDesc.trim(),
      description: description.trim(),
      brand: brand.trim() || 'Zenvilo',
      categoryId: categoryId || null,
      subcategory: subcategory.trim() || undefined,
      sku: sku.trim() || undefined,
      productType,
      tags: parsedTags,
      status,
      price: numPrice,
      compareAtPrice: numCompare > 0 ? numCompare : null,
      costPrice: !isNaN(numCost) ? numCost : null,
      currency,
      inventoryQuantity: parseInt(inventory, 10) || 0,
      trackInventory,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
      allowBackorders,
      weight: parseFloat(weight) || null,
      dimensions: {
        length: parseFloat(length) || 0,
        width: parseFloat(width) || 0,
        height: parseFloat(height) || 0,
        unit: dimUnit,
      },
      dimensionsText: length && width && height ? `${length} x ${width} x ${height} ${dimUnit}` : undefined,
      shippingClass,
      processingTime,
      shippingInfo,
      returnInfo,
      materials: materials.trim() || undefined,
      whatsIncluded: whatsIncluded.trim() || undefined,
      careInstructions: careInstructions.trim() || undefined,
      warrantyInfo: warrantyInfo.trim() || undefined,
      internalNotes: internalNotes.trim() || undefined,
      isActive: status === 'active',
      isFeatured,
      isBestseller,
      isNew,
      isHomepageVisible,
      isShopVisible,
      sortOrder: parseInt(sortOrder, 10) || 0,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      seoKeywords: seoKeywords.trim() || undefined,
      features: cleanFeatures,
      specifications: cleanSpecs,
      faqs: cleanFaqs,
      images: images.map((img, idx) => ({
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: idx,
      })),
      variants: variants.map((v) => ({
        name: v.name.trim(),
        sku: v.sku.trim() || undefined,
        price: v.price ? parseFloat(v.price) : undefined,
        compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
        costPrice: v.costPrice ? parseFloat(v.costPrice) : undefined,
        inventory: parseInt(v.inventory, 10) || 0,
        imageUrl: v.imageUrl.trim() || undefined,
        options: v.options,
        isActive: v.isActive,
      })),
    };

    try {
      if (product) {
        const res = await updateProduct(product.id, payload);
        if (res.error) {
          showToast(`Save failed: ${res.error}`, 'error');
        } else {
          showToast(`Product "${name}" updated successfully!`, 'success');
          onSaved();
        }
      } else {
        const res = await createProduct(payload);
        if (res.error) {
          showToast(`Creation failed: ${res.error}`, 'error');
        } else {
          showToast(`Product "${name}" created successfully!`, 'success');
          onSaved();
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Error occurred while saving product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navTabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'images', label: `Images (${images.length})`, icon: ImageIcon },
    { id: 'pricing', label: 'Pricing & Margin', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: Layers },
    { id: 'variants', label: `Variants (${variants.length})`, icon: Sparkles },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'details', label: 'Details & Specs', icon: FileText },
    { id: 'seo', label: 'SEO & Slug', icon: Search },
    { id: 'display', label: 'Store Display', icon: Eye },
    { id: 'faq', label: `FAQs (${faqs.length})`, icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-950/80 border border-violet-800/60 flex items-center justify-center text-violet-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {product ? `Edit: ${product.title}` : 'Add New Product'}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Configure complete catalog metadata, pricing, stock, and variants.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tab Navigation (Scrollable on Mobile) */}
        <div className="flex items-center gap-1 px-4 sm:px-8 py-2.5 bg-neutral-950/50 border-b border-neutral-800/80 overflow-x-auto scrollbar-none shrink-0">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body: Active Tab Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* 1. BASIC INFORMATION TAB */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Ergonomic Precision Desk Mat"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ergonomic-precision-desk-mat"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Unique path used in product URLs.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Zenvilo"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Unassigned (General)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Subcategory (Optional)
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Workspace Accessories"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Product SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="ZNV-MAT-01"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Product Type
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="physical">Physical Goods (Shipped)</option>
                    <option value="digital">Digital Product</option>
                    <option value="bundle">Product Bundle</option>
                    <option value="service">Service / Custom</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Product Status
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'active', label: 'Active', desc: 'Visible on customer storefront' },
                      { id: 'draft', label: 'Draft', desc: 'Hidden from store, admin only' },
                      { id: 'inactive', label: 'Inactive', desc: 'Archived / discontinued' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatus(st.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          status === st.id
                            ? 'bg-violet-950/60 border-violet-500 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="font-semibold text-xs capitalize">{st.label}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="desk, ergonomic, minimalist, leather, matte black"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Short Description (Summary)
                  </label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Brief 1-line hook displayed on product cards and listings"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Full Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="In-depth story, materials, craftsmanship, and benefits..."
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. IMAGES TAB */}
          {activeTab === 'images' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Upload to Supabase Storage Dropzone */}
              <div className="p-6 border-2 border-dashed border-neutral-800 hover:border-violet-600 rounded-2xl bg-neutral-950/60 text-center transition-colors">
                <input
                  type="file"
                  id="catalog-img-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
                <label
                  htmlFor="catalog-img-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-violet-950/80 border border-violet-800/60 flex items-center justify-center text-violet-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {isUploadingImage ? 'Uploading to Supabase Storage...' : 'Click to Upload Images'}
                    </span>
                    <p className="text-xs text-neutral-500 mt-1">
                      PNG, JPG, WEBP up to 5MB. Files are automatically saved to Supabase Storage (zenvilo-catalog).
                    </p>
                  </div>
                </label>
              </div>

              {/* Or Add Image By URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Or enter direct image URL (e.g. Unsplash or CDN)..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                />
                <Button type="button" variant="secondary" onClick={handleAddImageUrl} size="sm">
                  Add URL
                </Button>
              </div>

              {/* Images Gallery & Management */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Product Gallery ({images.length})
                </h4>

                {images.length === 0 ? (
                  <div className="p-8 bg-neutral-950 border border-neutral-800/60 rounded-2xl text-center text-xs text-neutral-500">
                    No images added yet. Upload files above to make your product shine.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`p-3 bg-neutral-950 border rounded-2xl space-y-3 relative overflow-hidden transition-all ${
                          img.isPrimary
                            ? 'border-violet-500 ring-1 ring-violet-500/50'
                            : 'border-neutral-800'
                        }`}
                      >
                        <div className="relative aspect-video rounded-xl bg-neutral-900 overflow-hidden border border-neutral-800">
                          <img
                            src={img.url}
                            alt={img.altText || 'Product'}
                            className="w-full h-full object-cover"
                          />
                          {img.isPrimary && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-600 text-white shadow-md">
                              Primary Image
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] text-neutral-400 mb-1">Alt Text (SEO)</label>
                          <input
                            type="text"
                            value={img.altText}
                            onChange={(e) => {
                              const val = e.target.value;
                              setImages((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, altText: val } : item))
                              );
                            }}
                            placeholder="Descriptive alt text for accessibility and Google"
                            className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, 'up')}
                              className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30"
                              title="Move left/up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === images.length - 1}
                              onClick={() => handleMoveImage(idx, 'down')}
                              className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30"
                              title="Move right/down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {!img.isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="text-[11px] text-violet-400 hover:underline"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. PRICING & PROFIT MARGIN TAB (ADMIN-ONLY VISIBILITY) */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-800/40 flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300">
                  <strong className="text-violet-300">Admin-Only Confidential Pricing:</strong> Cost price
                  and profit margins are strictly protected and never exposed to customers or in public
                  storefront APIs.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Selling Price * (Customer Pays)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="49.00"
                      className="w-full pl-7 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Compare-At Price (Original / Strikethrough)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      placeholder="69.00"
                      className="w-full pl-7 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  {discountPercent && (
                    <p className="text-[10px] text-emerald-400 mt-1">
                      Customer saves {discountPercent}% off compare price
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center justify-between">
                    <span>Cost Price (Admin Only)</span>
                    <span className="text-[10px] text-amber-400">Confidential</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="20.00"
                      className="w-full pl-7 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Profit & Margin Real-Time Calculator */}
              <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-[11px] text-neutral-400">Estimated Gross Profit</div>
                  <div
                    className={`text-xl font-bold font-mono mt-1 ${
                      profitMargin >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    ${profitMargin.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Selling price - Cost price</div>
                </div>

                <div>
                  <div className="text-[11px] text-neutral-400">Profit Margin</div>
                  <div
                    className={`text-xl font-bold font-mono mt-1 ${
                      Number(profitMarginPercent) >= 30 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {profitMarginPercent}%
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Profit / Selling price</div>
                </div>

                <div>
                  <div className="text-[11px] text-neutral-400">Base Currency</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">{currency}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Store currency standard</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Available Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Admin dashboard highlights items below this count.
                  </p>
                </div>
              </div>

              {/* Status Preview */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Live Stock Status Preview</div>
                  <div className="text-[11px] text-neutral-400">
                    Calculated automatically from stock count and threshold
                  </div>
                </div>
                <div>
                  {parseInt(inventory, 10) <= 0 ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800/60">
                      Out of Stock (0)
                    </span>
                  ) : parseInt(inventory, 10) <= parseInt(lowStockThreshold, 10) ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                      Low Stock ({inventory})
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                      In Stock ({inventory})
                    </span>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trackInventory}
                    onChange={(e) => setTrackInventory(e.target.checked)}
                    className="rounded border-neutral-800 text-violet-600 focus:ring-violet-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">Track Inventory Automatically</div>
                    <div className="text-[11px] text-neutral-400">
                      Decrements stock on successful customer checkout
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowBackorders}
                    onChange={(e) => setAllowBackorders(e.target.checked)}
                    className="rounded border-neutral-800 text-violet-600 focus:ring-violet-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">Allow Backorders When Out of Stock</div>
                    <div className="text-[11px] text-neutral-400">
                      Permit customers to purchase even if quantity reaches 0
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* 5. VARIANTS TAB */}
          {activeTab === 'variants' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Product Variants ({variants.length})
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Add size, color, style or material combinations with individual SKUs and pricing.
                  </p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddVariant}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Variant
                </Button>
              </div>

              {variants.length === 0 ? (
                <div className="p-8 bg-neutral-950 border border-neutral-800 rounded-2xl text-center space-y-2">
                  <div className="text-xs text-neutral-400">No variants created for this product.</div>
                  <p className="text-[11px] text-neutral-500">
                    The product will sell as a single standard item. Tap "Add Variant" to add options.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
                        <span className="text-xs font-bold text-violet-400">Variant #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">Variant Name *</label>
                          <input
                            type="text"
                            required
                            value={v.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                              );
                            }}
                            placeholder="e.g. Matte Black / Large"
                            className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">Variant SKU</label>
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, sku: val } : item))
                              );
                            }}
                            placeholder="ZNV-MAT-BLK-LG"
                            className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={v.price}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                              );
                            }}
                            placeholder={price}
                            className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">Stock</label>
                          <input
                            type="number"
                            value={v.inventory}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, inventory: val } : item))
                              );
                            }}
                            placeholder="10"
                            className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. SHIPPING TAB */}
          {activeTab === 'shipping' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.45"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Length</label>
                  <input
                    type="number"
                    step="0.1"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="90"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Width</label>
                  <input
                    type="number"
                    step="0.1"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="40"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Height</label>
                  <input
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="0.3"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Shipping Class</label>
                  <select
                    value={shippingClass}
                    onChange={(e) => setShippingClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="standard">Standard Parcel</option>
                    <option value="express">Express Priority</option>
                    <option value="heavy">Heavy / Bulky Freight</option>
                    <option value="free">Free Shipping Eligible</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Processing Time
                  </label>
                  <input
                    type="text"
                    value={processingTime}
                    onChange={(e) => setProcessingTime(e.target.value)}
                    placeholder="1–2 business days"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Shipping Policy Information
                  </label>
                  <textarea
                    rows={2}
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Returns Policy Information
                  </label>
                  <textarea
                    rows={2}
                    value={returnInfo}
                    onChange={(e) => setReturnInfo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. DETAILS & SPECS TAB */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Features List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Key Features (Bullet Points)
                  </h4>
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddFeature}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Bullet
                  </Button>
                </div>

                <div className="space-y-2">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                        placeholder="Feature point (e.g. Water-resistant micro-textured surface)..."
                        className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-2 text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Specifications Table
                  </h4>
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddSpec}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Spec
                  </Button>
                </div>

                <div className="space-y-2">
                  {specifications.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      <input
                        type="text"
                        value={spec.label}
                        onChange={(e) => handleUpdateSpec(idx, 'label', e.target.value)}
                        placeholder="Label (e.g. Material)"
                        className="sm:col-span-2 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                        placeholder="Value (e.g. Vegan Leather)"
                        className="sm:col-span-2 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-2 text-neutral-500 hover:text-red-400 flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials, What's Included, Care & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Materials & Build
                  </label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="e.g. Anodized aluminum & vegan micro-leather"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    What's Included in Box
                  </label>
                  <input
                    type="text"
                    value={whatsIncluded}
                    onChange={(e) => setWhatsIncluded(e.target.value)}
                    placeholder="e.g. 1x Desk Mat, 1x Cable Strap, 1x Care Card"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Care & Cleaning Instructions
                  </label>
                  <input
                    type="text"
                    value={careInstructions}
                    onChange={(e) => setCareInstructions(e.target.value)}
                    placeholder="e.g. Wipe clean with a damp microfiber cloth"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Warranty Information
                  </label>
                  <input
                    type="text"
                    value={warrantyInfo}
                    onChange={(e) => setWarrantyInfo(e.target.value)}
                    placeholder="1-year manufacturer warranty against defects"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center justify-between">
                    <span>Internal Admin Notes</span>
                    <span className="text-[10px] text-amber-400">Never shown to customers</span>
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Supplier contact, restock cycle, manufacturing batch ID..."
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 8. SEO TAB */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={name ? `${name} | Zenvilo` : 'Product Title | Zenvilo'}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                  <div className="text-[10px] text-neutral-500 mt-1">
                    {seoTitle.length}/60 characters recommended
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Compelling 150-160 character snippet that appears in Google search engine result snippets."
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                  <div className="text-[10px] text-neutral-500 mt-1">
                    {seoDescription.length}/160 characters recommended
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Search Keywords
                  </label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="desk pad, desk mat, workspace accessories, minimal desk"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Live Google Search Preview Card */}
              <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-violet-400" />
                  <span>Google Search SERP Preview</span>
                </div>
                <div className="p-4 bg-black/60 border border-neutral-900 rounded-xl space-y-1">
                  <div className="text-[11px] text-neutral-400 font-mono">
                    https://zenvilo.com/product/{slug || 'product-slug'}
                  </div>
                  <div className="text-sm font-semibold text-violet-400 line-clamp-1">
                    {seoTitle || name || 'Zenvilo Store Product'}
                  </div>
                  <div className="text-xs text-neutral-400 line-clamp-2">
                    {seoDescription ||
                      shortDesc ||
                      'Discover premium problem-solving lifestyle essentials engineered for modern aesthetics.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. STORE DISPLAY SETTINGS TAB */}
          {activeTab === 'display' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-neutral-800 text-violet-600 focus:ring-violet-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">⭐ Featured Product</div>
                    <div className="text-[11px] text-neutral-400">
                      Highlighted in featured carousels and top collections
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="rounded border-neutral-800 text-violet-600 focus:ring-violet-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">🔥 Bestseller Badge</div>
                    <div className="text-[11px] text-neutral-400">
                      Displays hot seller badge across store cards
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="rounded border-neutral-800 text-violet-600 focus:ring-violet-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">⚡ New Arrival Badge</div>
                    <div className="text-[11px] text-neutral-400">
                      Displays 'New' badge and filters into new arrivals
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHomepageVisible}
                    onChange={(e) => setIsHomepageVisible(e.target.checked)}
                    className="rounded border-neutral-800 text-violet-600 focus:ring-violet-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">🏠 Homepage Visibility</div>
                    <div className="text-[11px] text-neutral-400">Eligible to render on home page sections</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isShopVisible}
                    onChange={(e) => setIsShopVisible(e.target.checked)}
                    className="rounded border-neutral-800 text-violet-600 focus:ring-violet-500 w-4 h-4"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">🛍️ Shop Catalog Visibility</div>
                    <div className="text-[11px] text-neutral-400">Shows in the /shop all products directory</div>
                  </div>
                </label>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <label className="block text-xs font-semibold text-white">Display Sort Rank</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-violet-500"
                  />
                  <p className="text-[10px] text-neutral-500">
                    Lower numbers display first (e.g. 0 before 10).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 10. PRODUCT FAQS TAB */}
          {activeTab === 'faq' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Product Questions & Answers ({faqs.length})
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Direct answers to common customer questions shown on the product detail page.
                  </p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddFaq}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Question
                </Button>
              </div>

              {faqs.length === 0 ? (
                <div className="p-8 bg-neutral-950 border border-neutral-800 rounded-2xl text-center text-xs text-neutral-500">
                  No product FAQs added yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-violet-400">Q#{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                        placeholder="Question (e.g. Is this water resistant?)"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                      />

                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                        placeholder="Detailed answer for the customer..."
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Bar */}
          <div className="flex items-center justify-between pt-5 border-t border-neutral-800 shrink-0">
            <div className="text-xs text-neutral-500 hidden sm:block">
              {status === 'active' ? (
                <span className="text-emerald-400 font-medium">● Will be published live</span>
              ) : (
                <span className="text-amber-400 font-medium">● Will be saved as {status}</span>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {product ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
