import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { getProducts } from '../../services/catalogService';
import { Product } from '../../types/store';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { navigate } = useNavigation();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounced search via Supabase
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await getProducts({ searchQuery: query.trim(), limit: 6 });
        setResults(data || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('shop', { searchQuery: query.trim() });
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Search Zenvilo catalog"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-neutral-800 px-4">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search useful products, categories, or keywords..."
            className="w-full bg-transparent py-4 px-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
          {searching && <RefreshCw className="w-4 h-4 animate-spin text-neutral-400 mr-2" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-white"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-2 px-2 py-1 text-xs text-neutral-400 hover:text-white border border-neutral-800 rounded"
          >
            ESC
          </button>
        </form>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {query.trim().length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-400">
              <p className="mb-2">Type keywords to search forthcoming collections</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-neutral-300">
                <span className="text-neutral-400 text-xs">Suggested:</span>
                {['Workspace', 'Daily Carry', 'Hardware', 'Accessories'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="px-2.5 py-1 text-xs rounded-md bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Products ({results.length})
              </div>
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    navigate('product', { productSlug: product.slug });
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-neutral-800/60 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded bg-neutral-800"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center text-xs text-neutral-500">
                        ZV
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-neutral-100 group-hover:text-violet-400 transition-colors">
                        {product.title}
                      </div>
                      <div className="text-xs text-neutral-400">{product.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-violet-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-neutral-300 font-medium">No products found for "{query}"</p>
              <p className="text-xs text-neutral-400 mt-1">
                Our catalog is currently in preparation. Check back soon or browse categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  navigate('shop', { searchQuery: query });
                  onClose();
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium"
              >
                Go to Shop catalog <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
