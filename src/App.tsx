import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { SearchModal } from './components/layout/SearchModal';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { PolicyPage } from './pages/PolicyPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';

const AppContent: React.FC = () => {
  const { route } = useNavigation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync document title dynamically with active page
  useEffect(() => {
    const titles: Record<string, string> = {
      home: 'Zenvilo — Modern Everyday Essentials & Problem-Solving Goods',
      shop: 'Shop All Products — Zenvilo',
      categories: 'Browse Categories — Zenvilo',
      category: 'Category Collection — Zenvilo',
      product: 'Product Specifications — Zenvilo',
      cart: 'Shopping Bag — Zenvilo',
      checkout: 'Secure Checkout — Zenvilo',
      about: 'About Zenvilo — Purpose & Philosophy',
      faq: 'Frequently Asked Questions — Zenvilo Help',
      contact: 'Customer Support & Contact — Zenvilo',
      auth: 'Sign In / Register — Zenvilo Account',
      account: 'Customer Account & Orders — Zenvilo',
      admin: 'Store Administration & Analytics — Zenvilo',
      'shipping-policy': 'Shipping Policy — Zenvilo',
      'refund-policy': 'Returns & Refund Policy — Zenvilo',
      'privacy-policy': 'Privacy Policy — Zenvilo',
      terms: 'Terms & Conditions — Zenvilo',
    };

    if (route.page.startsWith('admin')) {
      document.title = 'Admin Management — Zenvilo Store';
    } else {
      document.title = titles[route.page] || 'Zenvilo — Modern Everyday Essentials';
    }
  }, [route.page]);

  // Keyboard shortcut '/' to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActivePage = () => {
    if (route.page.startsWith('admin')) {
      return <AdminPage />;
    }

    switch (route.page) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'categories':
      case 'category':
        return <CategoriesPage />;
      case 'product':
        return <ProductDetailPage productSlug={route.params?.productSlug} />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'auth':
        return <AuthPage />;
      case 'account':
        return <AccountPage />;
      case 'about':
        return <AboutPage />;
      case 'faq':
        return <FaqPage />;
      case 'contact':
        return <ContactPage />;
      case 'shipping-policy':
      case 'refund-policy':
      case 'privacy-policy':
      case 'terms':
        return <PolicyPage policyType={route.page} />;
      default:
        return <HomePage />;
    }
  };

  const isCheckout = route.page === 'checkout';
  const isAdminView = route.page.startsWith('admin');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-violet-600 selection:text-white">
      {/* Header (hidden during distraction-free checkout or dedicated admin control view) */}
      {!isCheckout && !isAdminView && <Header onOpenSearch={() => setIsSearchOpen(true)} />}

      {/* Main content */}
      <div className="flex-1">{renderActivePage()}</div>

      {/* Footer (hidden during distraction-free checkout or admin view) */}
      {!isCheckout && !isAdminView && <Footer />}

      {/* Interactive global slideout drawers & modals */}
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <ToastProvider>
            <NavigationProvider>
              <AppContent />
            </NavigationProvider>
          </ToastProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
