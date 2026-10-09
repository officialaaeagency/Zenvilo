import { FAQItem } from '../types/store';

export const FAQ_DATA: FAQItem[] = [
  // Orders
  {
    id: 'ord-1',
    category: 'Orders',
    question: 'How do I track my order once it is shipped?',
    answer: 'Once your order is dispatched, you will receive an automated email confirmation containing your carrier tracking number and a direct tracking link.',
  },
  {
    id: 'ord-2',
    category: 'Orders',
    question: 'Can I change or cancel my order after placing it?',
    answer: 'We process orders quickly. If you need to make changes or cancel, please contact our support team within 1 hour of placing your order. Once processing begins, orders cannot be modified.',
  },
  // Shipping
  {
    id: 'ship-1',
    category: 'Shipping',
    question: 'What are your standard shipping times and costs?',
    answer: 'Standard domestic delivery generally takes 3–7 business days following processing. Shipping rates are calculated at checkout based on weight and destination.',
  },
  {
    id: 'ship-2',
    category: 'Shipping',
    question: 'Do you ship internationally?',
    answer: 'International shipping capabilities are rolling out region by region. Available destination countries and international rates will be displayed at checkout.',
  },
  // Returns
  {
    id: 'ret-1',
    category: 'Returns',
    question: 'What is the Zenvilo return policy?',
    answer: 'We offer a 30-day return window from the delivery date for items in their original, unused condition with all original packaging and accessories intact.',
  },
  {
    id: 'ret-2',
    category: 'Returns',
    question: 'How do I initiate a return or exchange?',
    answer: 'Reach out to support@zenvilo.com with your order number and the reason for the return. Our customer care team will provide detailed return instructions.',
  },
  // Payments
  {
    id: 'pay-1',
    category: 'Payments',
    question: 'Which payment methods do you accept?',
    answer: 'We support all major credit cards (Visa, Mastercard, American Express, Discover) as well as modern digital payment methods such as Apple Pay and Google Pay.',
  },
  {
    id: 'pay-2',
    category: 'Payments',
    question: 'Is my payment information secure?',
    answer: 'Yes. All transactions are encrypted via industry-standard SSL (TLS 1.3) protocols. We never store raw payment details on our servers.',
  },
  // Products
  {
    id: 'prod-1',
    category: 'Products',
    question: 'How does Zenvilo select and design products?',
    answer: 'Every product in the Zenvilo catalog is evaluated against strict standards of utility, build quality, and everyday problem-solving capability before being introduced.',
  },
  {
    id: 'prod-2',
    category: 'Products',
    question: 'When will new collections and items become available?',
    answer: 'We curate products in deliberate batches. Subscribe to our newsletter to receive notification the moment our initial collection launches.',
  },
  // General
  {
    id: 'gen-1',
    category: 'General',
    question: 'What is Zenvilo’s brand philosophy?',
    answer: 'Zenvilo is built on clarity, utility, and modern reliability. We focus on essentials that solve real everyday friction without unnecessary complexity.',
  },
  {
    id: 'gen-2',
    category: 'General',
    question: 'How can I contact customer support?',
    answer: 'You can submit an inquiry through our Contact page or email us directly at support@zenvilo.com. We aim to respond within 24–48 business hours.',
  },
];
