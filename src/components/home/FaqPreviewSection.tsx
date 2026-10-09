import React, { useState } from 'react';
import { FAQ_DATA } from '../../data/faqs';
import { useNavigation } from '../../context/NavigationContext';
import { ChevronDown, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '../common/Button';

export const FaqPreviewSection: React.FC = () => {
  const { navigate } = useNavigation();
  const [openId, setOpenId] = useState<string | null>(FAQ_DATA[0]?.id || null);

  // Take first 5 questions for preview
  const previewFaqs = FAQ_DATA.slice(0, 5);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-20 bg-neutral-950 border-b border-neutral-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Clear information regarding our operations, shipping standards, and return guarantees.
          </p>
        </div>

        <div className="space-y-3">
          {previewFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <span className="text-sm font-medium text-neutral-200 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-violet-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/40 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('faq')}
            className="group"
          >
            <span>View All Questions</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};
