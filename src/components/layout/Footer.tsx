import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, CheckCircle2, Shield, RotateCcw, Clock, Mail, Database } from 'lucide-react';
import { PageRoute } from '../../types/store';
import { DatabaseStatusModal } from '../common/DatabaseStatusModal';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setIsSubscribed(true);
    showToast('Thank you for subscribing to Zenvilo updates.', 'success');
  };

  const navTo = (page: PageRoute) => {
    navigate(page);
  };

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400">
      {/* Upper Value Reassurance Row */}
      <div className="border-b border-neutral-900/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-violet-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-200">Secure Architecture</h4>
                <p className="text-xs text-neutral-400">Encrypted payment & checkout standards</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-violet-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-200">30-Day Return Window</h4>
                <p className="text-xs text-neutral-400">Straightforward refund & return terms</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-violet-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-200">Dedicated Support</h4>
                <p className="text-xs text-neutral-400">Replies within 24–48 business hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-violet-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-200">Curated Dispatch</h4>
                <p className="text-xs text-neutral-400">Only verified product releases</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <button
              type="button"
              onClick={() => navTo('home')}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded p-1 -ml-1"
            >
              <Logo size="md" />
            </button>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              Zenvilo is a modern, trustworthy e-commerce brand designed to sell useful, problem-solving products across multiple categories.
            </p>

            {/* Newsletter In Footer */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                Stay Informed on Product Launches
              </span>
              {isSubscribed ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-2.5 rounded-lg max-w-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>You're subscribed. We'll notify you when new products drop.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest mb-4">
              Shop & Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navTo('shop')}
                  className="hover:text-white transition-colors"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navTo('categories')}
                  className="hover:text-white transition-colors"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navTo('cart')}
                  className="hover:text-white transition-colors"
                >
                  View Cart
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navTo('account')}
                  className="hover:text-white transition-colors"
                >
                  Customer Account
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div>
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navTo('about')}
                  className="hover:text-white transition-colors"
                >
                  About Zenvilo
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navTo('faq')}
                  className="hover:text-white transition-colors"
                >
                  Help & FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navTo('contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <span className="text-xs text-neutral-400 block pt-1">
                  Email: support@zenvilo.com
                </span>
              </li>
            </ul>
          </div>

          {/* Policy Column */}
          <div>
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest mb-4">
              Policies
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navTo('shipping-policy')}
                  className="hover:text-white transition-colors"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navTo('refund-policy')}
                  className="hover:text-white transition-colors"
                >
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navTo('privacy-policy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navTo('terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Social channels placeholder & Copyright */}
        <div className="pt-12 mt-12 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} Zenvilo. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setIsDbModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-violet-400 transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Database Status</span>
                </button>
                <span className="text-neutral-800">|</span>
                <button
                  type="button"
                  onClick={() => navTo('admin')}
                  className="hover:text-violet-400 text-neutral-400 transition-colors"
                >
                  Admin Portal
                </button>
                <span className="text-neutral-800">|</span>
              </>
            )}
            <button
              type="button"
              onClick={() => navTo('terms')}
              className="hover:text-neutral-300 transition-colors"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => navTo('privacy-policy')}
              className="hover:text-neutral-300 transition-colors"
            >
              Privacy
            </button>
          </div>
        </div>
      </div>

      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </footer>
  );
};
