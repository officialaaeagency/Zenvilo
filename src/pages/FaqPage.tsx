import React, { useState, useMemo } from 'react';
import { FAQ_DATA } from '../data/faqs';
import { useNavigation } from '../context/NavigationContext';
import { Button } from '../components/common/Button';
import { Search, ChevronDown, HelpCircle, Mail, X } from 'lucide-react';
import { FAQItem } from '../types/store';

export const FaqPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'ord-1': true,
    'ship-1': true,
  });

  const categories = ['all', 'Orders', 'Shipping', 'Returns', 'Payments', 'Products', 'General'];

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="hover:text-white transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-neutral-200">Help & FAQ</span>
        </div>

        {/* Title */}
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-2">
            Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Answers to common questions regarding ordering, shipping timelines, returns, and support.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword (e.g. shipping, returns, card)..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-9 py-3 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors min-h-[36px] ${
                selectedCategory === cat
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/60'
              }`}
            >
              {cat === 'all' ? 'All Questions' : cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openIds[faq.id];
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider block mb-1">
                        {faq.category}
                      </span>
                      <span className="text-sm font-medium text-neutral-100 pr-4 block">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-violet-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-neutral-900/30 rounded-xl border border-neutral-900">
            <p className="text-sm text-neutral-300 font-medium">No questions matched your search.</p>
            <p className="text-xs text-neutral-400 mt-1">Try different terms or reach out to our team directly.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Need more help banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-violet-400 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Have a question not listed here?</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Our support team is here to help with orders, returns, or technical specifications.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('contact')}
            className="shrink-0"
          >
            Contact Customer Support
          </Button>
        </div>
      </div>
    </div>
  );
};
