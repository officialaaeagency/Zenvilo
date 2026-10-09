import React, { useState, useEffect } from 'react';
import { getCategories } from '../services/catalogService';
import { Category } from '../types/store';
import { CategoryCard } from '../components/common/CategoryCard';
import { EmptyState } from '../components/common/EmptyState';
import { useNavigation } from '../context/NavigationContext';
import { Layers, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

export const CategoriesPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: catError } = await getCategories();
      if (catError) {
        setError('Unable to load categories. Please try again.');
      } else {
        setCategories(data || []);
      }
    } catch {
      setError('Unable to load categories from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
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
            <span className="text-neutral-200">Categories</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Product Categories
          </h1>
          <p className="mt-2 text-sm text-neutral-400 max-w-xl">
            Browse Zenvilo’s scalable category verticals. As new collections are released, they will be indexed here.
          </p>
        </div>

        {/* Loading / Error / Empty States */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-violet-400 mb-3" />
            <p className="text-xs text-neutral-400">Loading categories from Supabase...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800 p-8 text-center max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">{error}</h3>
            <p className="text-xs text-neutral-400 mb-5">
              Could not retrieve category definitions from the server.
            </p>
            <Button variant="outline" size="sm" onClick={loadCategories}>
              Retry Query
            </Button>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-neutral-900/30 border border-neutral-900 py-16 px-4">
            <EmptyState
              icon={<Layers className="w-8 h-8 text-violet-400" />}
              title="Categories in Development"
              description="We are structuring our inaugural categories across Workspace Essentials, Daily Carry, and Focus Hardware. No fabricated departments are shown."
              actionText="Return to Shop"
              onAction={() => navigate('shop')}
              secondaryActionText="About Zenvilo"
              onSecondaryAction={() => navigate('about')}
            />
          </div>
        )}
      </div>
    </div>
  );
};
