import React, { useState, useEffect } from 'react';
import { ProductGrid } from '../common/ProductGrid';
import { getProducts } from '../../services/catalogService';
import { Product } from '../../types/store';
import { useNavigation } from '../../context/NavigationContext';
import { Button } from '../common/Button';

export const ShopSection: React.FC = () => {
  const { navigate } = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const { data } = await getProducts({ limit: 8 });
      if (isMounted && data) {
        setProducts(data);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-neutral-950 border-b border-neutral-900" id="catalog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-2">
              Curated Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Essentials Collection
            </h2>
            <p className="mt-2 text-sm text-neutral-400 max-w-xl">
              Thoughtfully selected products engineered for durability, modern ergonomics, and daily utility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('categories')}
            >
              Browse Categories
            </Button>
          </div>
        </div>

        {/* Product Grid / Empty State */}
        <ProductGrid
          products={products}
          emptyTitle="New products are coming soon."
          emptyDescription="We are finalizing manufacturing specifications and endurance testing for our inaugural catalog. Sign up below to be notified upon launch."
          onNotifyClick={() => {
            const el = document.getElementById('newsletter-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>
    </section>
  );
};
