import React from 'react';
import { Target, Layers, Sparkles, CheckCircle } from 'lucide-react';

export const BrandValueSection: React.FC = () => {
  return (
    <section className="py-20 bg-neutral-950 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-3">
            Brand Positioning
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Built to solve real everyday friction, not create clutter.
          </h2>
          <p className="mt-4 text-base text-neutral-400 leading-relaxed">
            The market is saturated with disposable novelties and over-engineered gadgets. Zenvilo takes a measured approach: we identify products that offer enduring utility, clean ergonomics, and dependable construction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-violet-400 mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-2">
              Problem-First Evaluation
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Every item we consider must address an actual functional need—from desk organization to daily transit tools—before entering our catalog.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-violet-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-2">
              Cross-Category Discipline
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Rather than spreading thin across hundreds of generic items, our platform expands systematically across thoughtful lifestyle categories.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-violet-400 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-2">
              Honest Specifications
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Transparent materials, verified dimensions, and straightforward descriptions. No fabricated performance metrics or inflated claims.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
