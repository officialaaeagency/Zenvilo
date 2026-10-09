import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getProducts, getCategories } from '../services/catalogService';
import { Product, Category } from '../types/store';
import { ARCHITECTURAL_SAMPLE_PRODUCT } from '../data/catalog';
import { ProductGrid } from '../components/common/ProductGrid';
import { EmptyState } from '../components/common/EmptyState';
import { useNavigation } from '../context/NavigationContext';
import { Search, PackageOpen, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

export const ShopPage: React.FC = () => {
  const { route, navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    route.params?.categorySlug || 'all'
  );
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories once on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      const { data } = await getCategories();
      if (isMounted && data) {
        setCategories(data);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products from Supabase
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await getProducts({
        categorySlug: selectedCategory !== 'all' ? selectedCategory : undefined,
        searchQuery: searchQuery.trim() || undefined,
        sortBy,
      });

      if (queryError) {
        setError('Unable to load products from database. Please try again.');
      } else {
        setProducts(data || []);
      }
    } catch (err: any) {
      setError('Unable to load products. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="min-h-screen bg-neutral-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Breadcrumb */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-neutral-200">Shop</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            All Products
          </h1>
          <p className="mt-2 text-sm text-neutral-400 max-w-xl">
            Explore our curated selection of high-utility tools and everyday essentials.
          </p>
        </div>

        {/* Filter, Search & Sort Bar */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs & Sort */}
          <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
            {/* Category selection */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[36px] ${
                  selectedCategory === 'all'
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-white bg-neutral-950/60'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[36px] ${
                    selectedCategory === c.slug
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'text-neutral-400 hover:text-white bg-neutral-950/60'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative inline-block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products"
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 min-h-[36px] cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Sort: Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content States: Loading, Error, Populated Grid, or Clean Empty State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-violet-400 mb-3" />
            <p className="text-xs text-neutral-400">Loading catalog from Supabase...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800 p-8 text-center max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">{error}</h3>
            <p className="text-xs text-neutral-400 mb-5">
              Could not retrieve items from the server.
            </p>
            <Button variant="outline" size="sm" onClick={loadProducts}>
              Retry Query
            </Button>
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-2xl bg-neutral-900/30 border border-neutral-900 py-16 px-4">
            <EmptyState
              icon={<PackageOpen className="w-8 h-8 text-violet-400" />}
              title="No products available yet. Check back soon."
              description="Our inaugural catalog is currently being prepared with strict focus on utility and craftsmanship. No placeholder items are fabricated."
              actionText="Notify Me Upon Launch"
              onAction={() => {
                const el = document.getElementById('newsletter-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('home');
                }
              }}
              secondaryActionText="Preview PDP Architecture Template"
              onSecondaryAction={() => {
                navigate('product', { productSlug: ARCHITECTURAL_SAMPLE_PRODUCT.slug });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
