import { Product, Category } from '../types/store';

/**
 * Current catalog is intentionally empty as per store launch specification.
 * Add future products here or fetch from an external API / database.
 */
export const PRODUCTS: Product[] = [];

/**
 * Categories list is intentionally empty as per store launch specification.
 * Populate as new collections launch.
 */
export const CATEGORIES: Category[] = [];

/**
 * Architectural Reference Specification
 * Used for demonstrating the complete Product Detail Page architecture
 * without fabricating inventory in the live store listing.
 */
export const ARCHITECTURAL_SAMPLE_PRODUCT: Product = {
  id: 'zenvilo-spec-001',
  slug: 'precision-desk-mat-matte-charcoal',
  title: 'Zenvilo Precision Desk Mat',
  shortDescription: 'High-density micro-weave surface engineered for smooth mouse glide, wrist comfort, and daily durability.',
  description: `Crafted from premium vegan micro-leather and high-density waterproof backing, the Zenvilo Precision Desk Mat protects your workspace while offering a tactile, controlled surface. Every edge is reinforced with anti-fray stitching designed for sustained daily use.`,
  price: 38.00,
  compareAtPrice: 48.00,
  currency: 'USD',
  images: [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
  ],
  category: 'Workspace Essentials',
  categorySlug: 'workspace-essentials',
  variants: [
    {
      id: 'var-standard-black',
      name: 'Standard (80cm x 40cm) / Matte Black',
      price: 38.00,
      inventory: 25,
      options: { Size: 'Standard (80x40cm)', Color: 'Matte Black' },
    },
    {
      id: 'var-large-black',
      name: 'Extended (90cm x 45cm) / Matte Black',
      price: 44.00,
      inventory: 15,
      options: { Size: 'Extended (90x45cm)', Color: 'Matte Black' },
    },
    {
      id: 'var-standard-violet',
      name: 'Standard (80cm x 40cm) / Obsidian Violet',
      price: 40.00,
      inventory: 18,
      options: { Size: 'Standard (80x40cm)', Color: 'Obsidian Violet' },
    },
  ],
  inventory: 58,
  // Real reviews start at 0 until verified customers submit them
  rating: undefined,
  reviewCount: 0,
  features: [
    'Ultra-smooth tactile micro-weave surface',
    'Spill-resistant and easy wipe-clean surface',
    'Non-slip natural rubber grip base',
    'Precision edge-stitched perimeter prevents fraying',
    'Compatible with optical and laser sensors',
  ],
  specifications: [
    { label: 'Dimensions', value: '800 × 400 × 3.5 mm / 900 × 450 × 3.5 mm' },
    { label: 'Top Surface', value: 'Waterproof composite micro-fiber' },
    { label: 'Underlayer', value: 'High-density textured rubber' },
    { label: 'Thickness', value: '3.5 mm balanced cushion' },
    { label: 'Weight', value: '480 grams' },
    { label: 'Care', value: 'Wipe with damp cloth and neutral soap' },
  ],
  shippingInfo: 'Orders are processed within 1–2 business days. Standard shipping takes 3–7 business days depending on location.',
  returnInfo: '30-day hassle-free return window for items in original condition. Return shipping label provided upon request.',
  featured: true,
  bestseller: false,
  newArrival: true,
  createdAt: '2026-01-15T00:00:00Z',
};
