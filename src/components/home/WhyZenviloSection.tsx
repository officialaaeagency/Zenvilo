import React from 'react';
import { CheckCircle2, ShieldCheck, FileText, Headphones } from 'lucide-react';

export const WhyZenviloSection: React.FC = () => {
  const values = [
    {
      icon: <CheckCircle2 className="w-5 h-5 text-violet-400" />,
      title: 'Thoughtfully Selected',
      description:
        'We do not chase temporary trends. Every item is vetted for utility, ergonomic balance, and lasting build quality.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-violet-400" />,
      title: 'Simple Shopping',
      description:
        'A clean, frictionless interface free from aggressive countdown timers, misleading popups, or deceptive badges.',
    },
    {
      icon: <FileText className="w-5 h-5 text-violet-400" />,
      title: 'Clear Information',
      description:
        'Transparent dimensions, honest material disclosures, straightforward pricing, and real shipping timelines.',
    },
    {
      icon: <Headphones className="w-5 h-5 text-violet-400" />,
      title: 'Customer-Focused Support',
      description:
        'Responsive, human customer support ready to answer questions, handle returns, and assist with any order inquiries.',
    },
  ];

  return (
    <section className="py-20 bg-neutral-950 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-2">
            The Zenvilo Standard
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why choose Zenvilo
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Principles guiding our selection, product information, and service standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center mb-5">
                  {v.icon}
                </div>
                <h3 className="text-base font-semibold text-neutral-100 mb-2">
                  {v.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {v.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
