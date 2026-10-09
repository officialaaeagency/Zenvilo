import React from 'react';
import { Product } from '../../types/store';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';
import { Package, Bell } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  onNotifyClick?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  emptyTitle = 'New products are coming soon.',
  emptyDescription = 'Our inaugural collection is currently in development. Every piece is selected under strict quality criteria.',
  onNotifyClick,
}) => {
  if (products.length === 0) {
    return (
      <div className="w-full py-12 px-4 rounded-2xl bg-neutral-900/30 border border-neutral-900">
        <EmptyState
          icon={<Package className="w-6 h-6 text-violet-400" />}
          title={emptyTitle}
          description={emptyDescription}
          actionText={onNotifyClick ? 'Get Launch Updates' : undefined}
          onAction={onNotifyClick}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
