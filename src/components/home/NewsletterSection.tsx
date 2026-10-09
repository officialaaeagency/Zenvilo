import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsLoading(true);

    // Simulated integration-ready client dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      showToast('Thank you for subscribing to Zenvilo release notes.', 'success');
      // Ready for integration: e.g. fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) })
    }, 400);
  };

  return (
    <section className="py-20 bg-neutral-950" id="newsletter-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-neutral-900 border border-neutral-800 p-8 sm:p-12 overflow-hidden text-center">
          {/* Subtle accent glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-violet-600/10 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-violet-400 mx-auto mb-5">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Be first to know when products arrive.
          </h2>

          <p className="text-sm text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
            Join the Zenvilo mailing list for curated product dispatches, launch announcements, and early release access. No spam, ever.
          </p>

          {isSubmitted ? (
            <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-violet-950/40 border border-violet-800/40 text-violet-300 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-violet-400" />
              <span>You're confirmed. We'll send an update as soon as the catalog drops.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  aria-label="Email address for launch newsletter"
                  className="w-full h-11 px-4 rounded-lg bg-neutral-950 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="shrink-0 sm:w-auto h-11"
              >
                <span>Notify Me</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}

          <p className="text-[11px] text-neutral-400 mt-4">
            You can unsubscribe at any time. We respect your inbox privacy.
          </p>
        </div>
      </div>
    </section>
  );
};
