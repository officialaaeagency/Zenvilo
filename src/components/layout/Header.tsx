import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { CurrencySelector } from '../common/CurrencySelector';
import { useNavigation } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Search, ShoppingBag, Menu, X, ArrowRight, ShieldCheck, User, Shield } from 'lucide-react';
import { PageRoute } from '../../types/store';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { route, navigate } = useNavigation();
  const { openCart, itemCount } = useCart();
  const { user, profile, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; page: PageRoute }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Shop', page: 'shop' },
    { label: 'Categories', page: 'categories' },
    { label: 'About', page: 'about' },
    { label: 'FAQ', page: 'faq' },
    { label: 'Contact', page: 'contact' },
  ];

  const handleNavClick = (page: PageRoute) => {
    navigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* 1. Subtle, Professional Announcement / Trust Bar */}
      <div className="bg-neutral-950 border-b border-neutral-800 text-neutral-300 text-[11px] sm:text-xs py-2 px-4 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-300 font-medium tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
            <span className="hidden sm:inline">Thoughtfully curated everyday essentials.</span>
            <span>Free shipping on all qualifying orders over $50</span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="h-3 w-px bg-neutral-800 hidden md:block" />
            <CurrencySelector />
          </div>
        </div>
      </div>

      {/* 2. Main Professional Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo */}
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg p-1 -ml-1"
              aria-label="Zenvilo Homepage"
            >
              <Logo size="md" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
              {navLinks.map((link) => {
                const isActive = route.page === link.page;
                return (
                  <button
                    key={link.page}
                    type="button"
                    onClick={() => handleNavClick(link.page)}
                    className={`text-sm font-medium transition-colors py-1 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded ${
                      isActive
                        ? 'text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Icons: Search, Cart, Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Search button */}
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Search catalog"
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 min-h-[44px]"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-xs text-neutral-400">Search</span>
                <kbd className="hidden md:inline-block text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                  /
                </kbd>
              </button>

              {/* Admin badge button if user is store administrator */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleNavClick('admin')}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-950/70 border border-violet-800/60 text-violet-300 hover:bg-violet-900/60 rounded-lg text-xs font-semibold transition-colors min-h-[44px]"
                  title="Store Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5 text-violet-400" />
                  <span>Admin</span>
                </button>
              )}

              {/* Account / Sign In button */}
              <button
                type="button"
                onClick={() => handleNavClick(user ? 'account' : 'auth')}
                aria-label={user ? 'My Account' : 'Sign In'}
                className="flex items-center gap-1.5 p-2.5 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 min-h-[44px]"
              >
                {user ? (
                  <div className="w-5 h-5 rounded-full bg-violet-950 border border-violet-800 flex items-center justify-center text-[10px] font-bold text-violet-300">
                    {(profile?.fullName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="w-5 h-5 text-neutral-400" />
                )}
                <span className="hidden md:inline text-xs font-medium">
                  {user ? (profile?.fullName ? profile.fullName.split(' ')[0] : 'Account') : 'Sign In'}
                </span>
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                aria-label={`Open shopping cart with ${itemCount} items`}
                className="relative p-2.5 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-violet-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                className="lg:hidden p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown / Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-neutral-950 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = route.page === link.page;
                return (
                  <button
                    key={link.page}
                    type="button"
                    onClick={() => handleNavClick(link.page)}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium transition-colors text-left min-h-[44px] ${
                      isActive
                        ? 'bg-neutral-900 text-violet-400 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-neutral-600" />
                  </button>
                );
              })}

              {/* Mobile Account Link */}
              <button
                type="button"
                onClick={() => handleNavClick(user ? 'account' : 'auth')}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium transition-colors text-left min-h-[44px] text-neutral-300 hover:bg-neutral-900 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-400" />
                  <span>{user ? 'My Account' : 'Sign In / Register'}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-600" />
              </button>

              {/* Mobile Admin Link if admin */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleNavClick('admin')}
                  className="flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium transition-colors text-left min-h-[44px] bg-violet-950/40 border border-violet-800/40 text-violet-300 hover:bg-violet-900/40"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-400" />
                    <span>Admin Dashboard</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-violet-400" />
                </button>
              )}
            </nav>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Preferred Currency:</span>
              <CurrencySelector />
            </div>
          </div>
        )}
      </header>
    </>
  );
};
