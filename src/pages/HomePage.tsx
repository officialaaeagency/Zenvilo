import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { BrandValueSection } from '../components/home/BrandValueSection';
import { ShopSection } from '../components/home/ShopSection';
import { CategoriesSection } from '../components/home/CategoriesSection';
import { WhyZenviloSection } from '../components/home/WhyZenviloSection';
import { ProductDiscoverySection } from '../components/home/ProductDiscoverySection';
import { FaqPreviewSection } from '../components/home/FaqPreviewSection';
import { NewsletterSection } from '../components/home/NewsletterSection';
import { getProducts } from '../services/catalogService';
import { Product } from '../types/store';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const { data } = await getProducts();
      if (isMounted && data) {
        setProducts(data);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main id="main-content">
      {/* 3. Hero Section */}
      <HeroSection />

      {/* 4. Brand Value Section */}
      <BrandValueSection />

      {/* 5. Shop Section */}
      <ShopSection />

      {/* 6. Categories Section */}
      <CategoriesSection />

      {/* 7. Why Zenvilo */}
      <WhyZenviloSection />

      {/* 8. Product Discovery Section (Hides automatically when no products) */}
      <ProductDiscoverySection products={products} />

      {/* 9. FAQ Preview */}
      <FaqPreviewSection />

      {/* 10. Newsletter Section */}
      <NewsletterSection />
    </main>
  );
};
