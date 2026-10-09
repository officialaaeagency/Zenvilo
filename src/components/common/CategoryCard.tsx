import React from 'react';
import { Category } from '../../types/store';
import { useNavigation } from '../../context/NavigationContext';
import { ArrowRight, Folder } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { navigate } = useNavigation();

  return (
    <div
      onClick={() => navigate('category', { categorySlug: category.slug })}
      className="group relative bg-neutral-900/60 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-all duration-200 p-6 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      <div>
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-40 object-cover rounded-lg mb-4 bg-neutral-800"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-violet-400 mb-4">
            <Folder className="w-6 h-6" />
          </div>
        )}

        <div className="text-xs text-neutral-400 mb-1">
          {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
        </div>

        <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-violet-300 transition-colors mb-2">
          {category.name}
        </h3>

        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
          {category.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-medium text-violet-400 group-hover:text-violet-300">
        <span>Explore Collection</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};
