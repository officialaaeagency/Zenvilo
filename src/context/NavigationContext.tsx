import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PageRoute, RouteState } from '../types/store';

interface NavigationContextType {
  route: RouteState;
  navigate: (page: PageRoute, params?: RouteState['params']) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function parseHash(): RouteState {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) {
    return { page: 'home' };
  }

  const [path, query] = hash.split('?');
  const searchParams = new URLSearchParams(query || '');

  // Detect admin subroutes
  let page: PageRoute = 'home';
  const params: RouteState['params'] = {};

  if (path.startsWith('admin/products/new')) {
    page = 'admin/products/new';
  } else if (path.startsWith('admin/products/edit')) {
    page = 'admin/products/edit';
    const id = searchParams.get('id') || path.split('/')[3];
    if (id) params.productId = id;
  } else if (path.startsWith('admin/products')) {
    page = 'admin/products';
  } else if (path.startsWith('admin/categories')) {
    page = 'admin/categories';
  } else if (path.startsWith('admin/orders')) {
    page = 'admin/orders';
    const id = searchParams.get('id') || path.split('/')[2];
    if (id) params.orderId = id;
  } else if (path.startsWith('admin/customers')) {
    page = 'admin/customers';
  } else if (path.startsWith('admin/analytics')) {
    page = 'admin/analytics';
  } else if (path.startsWith('admin/reviews')) {
    page = 'admin/reviews';
  } else if (path.startsWith('admin/settings')) {
    page = 'admin/settings';
  } else if (path === 'admin') {
    page = 'admin';
  } else if (path.startsWith('category/')) {
    page = 'category';
    params.categorySlug = decodeURIComponent(path.replace('category/', ''));
  } else if (path.startsWith('product/')) {
    page = 'product';
    params.productSlug = decodeURIComponent(path.replace('product/', ''));
  } else {
    const validPages: PageRoute[] = [
      'home',
      'shop',
      'categories',
      'cart',
      'checkout',
      'about',
      'faq',
      'contact',
      'auth',
      'account',
      'shipping-policy',
      'refund-policy',
      'privacy-policy',
      'terms',
    ];
    page = validPages.includes(path as PageRoute) ? (path as PageRoute) : 'home';
  }

  const q = searchParams.get('q');
  if (q) params.searchQuery = q;

  const tab = searchParams.get('tab');
  if (tab && ['login', 'signup', 'forgot', 'reset'].includes(tab)) {
    params.authTab = tab as any;
  }

  const pid = searchParams.get('productId');
  if (pid) params.productId = pid;

  return { page, params };
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteState>(parseHash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((page: PageRoute, params?: RouteState['params']) => {
    let newHash = page === 'home' ? '' : `#${page}`;

    if (page === 'category' && params?.categorySlug) {
      newHash = `#category/${encodeURIComponent(params.categorySlug)}`;
    } else if (page === 'product' && params?.productSlug) {
      newHash = `#product/${encodeURIComponent(params.productSlug)}`;
    }

    const queryParts: string[] = [];
    if (params?.searchQuery) {
      queryParts.push(`q=${encodeURIComponent(params.searchQuery)}`);
    }
    if (params?.authTab) {
      queryParts.push(`tab=${encodeURIComponent(params.authTab)}`);
    }
    if (params?.productId) {
      queryParts.push(`id=${encodeURIComponent(params.productId)}`);
    }
    if (params?.orderId) {
      queryParts.push(`id=${encodeURIComponent(params.orderId)}`);
    }

    if (queryParts.length > 0) {
      newHash += `?${queryParts.join('&')}`;
    }

    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    } else {
      setRoute({ page, params });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <NavigationContext.Provider value={{ route, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
