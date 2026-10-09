import React, { useState, useEffect } from 'react';
import { getCategories } from '../../services/catalogService';
import { Category } from '../../types/store';
import { CategoryCard } from '../common/CategoryCard';
import { EmptyState } from '../common/EmptyState';
import { Layers } from 'lucide-react';

export const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const { data } = await getCategories();
      if (isMounted && data) {
        setCategories(data);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-neutral-950 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-2">
            Catalog Structure
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Browse by Category
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Our multi-category architecture is structured to support focused everyday verticals as items are introduced.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-2xl bg-neutral-900/30 border border-neutral-900 py-6">
            <EmptyState
              icon={<Layers className="w-6 h-6 text-violet-400" />}
              title="Categories in Preparation"
              description="Categories are being calibrated to organize our upcoming product lines. Check back as new departments open."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
