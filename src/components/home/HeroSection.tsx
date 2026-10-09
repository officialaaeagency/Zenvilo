import React from 'react';
import { Button } from '../common/Button';
import { useNavigation } from '../../context/NavigationContext';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-neutral-950 border-b border-neutral-900">
      {/* Subtle modern geometric accent lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute inset-y-0 right-1/4 w-px bg-gradient-to-b from-transparent via-neutral-800 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 left-1/4 w-px bg-gradient-to-b from-transparent via-neutral-800 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Brand Positioning Kicker (Clean unboxed text, no pill slop) */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400 mb-6">
            <span className="w-2 h-0.5 bg-violet-500" />
            <span>Modern Everyday Essentials</span>
            <span className="w-2 h-0.5 bg-violet-500" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 font-['Space_Grotesk']">
            Engineered for utility. <br />
            <span className="text-neutral-400">Designed for everyday focus.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto mb-10">
            Zenvilo is a modern e-commerce brand curating problem-solving, high-utility essentials across everyday categories. Every piece is selected for function, durability, and uncluttered design.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('shop')}
              className="group sm:w-auto"
            >
              <span>Explore Zenvilo</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => navigate('about')}
              className="sm:w-auto"
            >
              Learn More
            </Button>
          </div>

          {/* Core Brand Attributes */}
          <div className="mt-14 pt-10 border-t border-neutral-900 grid grid-cols-2 sm:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-mono mb-1">
                Curated Intake
              </div>
              <div className="text-sm font-medium text-neutral-200">
                Rigorous utility criteria
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-mono mb-1">
                Zero Clutter
              </div>
              <div className="text-sm font-medium text-neutral-200">
                Focused essentials only
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-mono mb-1">
                Direct Integrity
              </div>
              <div className="text-sm font-medium text-neutral-200">
                Honest specifications
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
