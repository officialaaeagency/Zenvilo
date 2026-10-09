import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { Button } from '../components/common/Button';
import { Compass, ShieldCheck, HeartHandshake, Eye, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useNavigation();

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
          <span className="text-neutral-200">About</span>
        </div>

        {/* Hero Header */}
        <div className="mb-14">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400 mb-3">
            Our Identity & Purpose
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Thoughtfully selected essentials. <br />
            <span className="text-neutral-400">Zero unnecessary noise.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-neutral-300 leading-relaxed">
            Zenvilo is a modern e-commerce brand founded on a simple premise: everyday products should be demonstrably useful, honestly presented, and built to endure daily routine.
          </p>
        </div>

        {/* Core Narrative Sections */}
        <div className="space-y-12 text-neutral-300 leading-relaxed">
          {/* Section 1: What Zenvilo Is */}
          <section className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800">
            <h2 className="text-xl font-bold text-white mb-3">What is Zenvilo?</h2>
            <p className="text-sm leading-relaxed mb-4 text-neutral-300">
              Zenvilo is an evolving destination for problem-solving goods across multi-category everyday disciplines—including desk and workspace tools, mobile accessories, organization items, and functional hardware.
            </p>
            <p className="text-sm leading-relaxed text-neutral-400">
              Instead of operating an uncurated marketplace with hundreds of disposable items, our catalog grows deliberately. Each product is selected through measured criteria: Does it resolve actual daily friction? Is the material choice appropriate? Does it respect the user’s space?
            </p>
          </section>

          {/* Section 2: Brand Philosophy */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-violet-400 mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Intentional Function</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                We believe aesthetic elegance is a byproduct of purpose. We favor clean geometry, durable finishes, and tactile materials that perform day after day.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-violet-400 mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Honest Presentation</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                We present exact dimensions, true specifications, and unembellished descriptions. You will never encounter fabricated reviews, countdown timers, or artificial scarcity on Zenvilo.
              </p>
            </div>
          </section>

          {/* Section 3: Customer-First Approach */}
          <section className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <HeartHandshake className="w-6 h-6 text-violet-400" />
              <h2 className="text-xl font-bold text-white">Our Customer-First Commitment</h2>
            </div>
            <p className="text-sm leading-relaxed mb-4 text-neutral-300">
              E-commerce trust is earned through reliability. That is why we provide:
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                <span><strong>A transparent 30-day return policy</strong> on products in their original condition.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                <span><strong>Responsive customer care</strong> via dedicated email with standard 24–48 business hour response windows.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                <span><strong>Secure checkout protocols</strong> adhering to current cryptographic standards.</span>
              </li>
            </ul>
          </section>

          {/* Action CTA */}
          <div className="pt-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-3">
              Explore Our Launch Collections
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('shop')}
                className="group"
              >
                <span>Visit the Shop</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('contact')}
              >
                Get in Touch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
