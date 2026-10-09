import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { PageRoute } from '../types/store';
import { Shield, FileText, ArrowLeft } from 'lucide-react';

interface PolicyPageProps {
  policyType: 'shipping-policy' | 'refund-policy' | 'privacy-policy' | 'terms';
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ policyType }) => {
  const { navigate } = useNavigation();

  const policyContent = {
    'shipping-policy': {
      title: 'Shipping & Delivery Policy',
      lastUpdated: 'October 2026',
      subtitle: 'Information regarding domestic and international fulfillment, carrier partners, and delivery standards.',
      sections: [
        {
          heading: '1. Order Processing Time',
          text: 'All standard orders are processed within 1 to 2 business days (excluding weekends and standard public holidays). You will receive an automated dispatch notification with carrier tracking once your order package is scanned into the carrier network.',
        },
        {
          heading: '2. Domestic Shipping Rates & Estimates',
          text: 'Standard domestic ground shipping typically arrives within 3 to 7 business days following carrier receipt. Standard shipping is complimentary on qualifying orders exceeding $50.00 USD. For orders under this threshold, a flat carrier fee is calculated and displayed prior to payment authorization.',
        },
        {
          heading: '3. Expedited Shipping Options',
          text: 'Where available, expedited 1–2 business day transit can be selected at checkout for an additional charge. Expedited dispatch applies to transit time after fulfillment verification.',
        },
        {
          heading: '4. International Shipping',
          text: 'We are expanding international shipping support incrementally. When ordering to international destinations, all applicable import duties, customs fees, and local taxes remain the responsibility of the purchaser according to regional customs policies.',
        },
        {
          heading: '5. Tracking and Shipment Inquiries',
          text: 'If your tracking status shows no update after 5 business days from dispatch, please contact support@zenvilo.com with your order number for an immediate carrier trace investigation.',
        },
      ],
    },
    'refund-policy': {
      title: 'Returns & Refund Policy',
      lastUpdated: 'October 2026',
      subtitle: 'Clear, straightforward 30-day return guidelines for items in original condition.',
      sections: [
        {
          heading: '1. 30-Day Return Window',
          text: 'We provide a 30-day return window starting on the calendar day your order is marked as delivered by the carrier. To qualify for a return, the product must be in its original, unused state with all factory packaging, inserts, and accessories intact.',
        },
        {
          heading: '2. Return Initiation Process',
          text: 'To initiate a return, contact support@zenvilo.com with your order number and the reason for return. Our support department will verify the return eligibility and issue Return Merchandise Authorization (RMA) instructions along with return shipping details.',
        },
        {
          heading: '3. Refunds & Processing Timeline',
          text: 'Upon receipt and inspection of returned merchandise at our facility, refunds are initiated back to the original method of payment. Financial institutions generally take 3 to 7 business days to post refunded balances to your account statement.',
        },
        {
          heading: '4. Damaged or Defective Items',
          text: 'If your item arrives with transit damage or a manufacturing defect, notify support@zenvilo.com within 48 hours of delivery with photographic evidence. We will dispatch a complimentary replacement or execute a full immediate refund.',
        },
        {
          heading: '5. Non-Returnable Items',
          text: 'Customized goods, digital downloads, and personal care items (once seal is broken) are non-returnable unless defective upon arrival.',
        },
      ],
    },
    'privacy-policy': {
      title: 'Privacy Policy',
      lastUpdated: 'October 2026',
      subtitle: 'How Zenvilo collects, uses, and safeguards customer information across our digital storefront.',
      sections: [
        {
          heading: '1. Information We Collect',
          text: 'We collect information you directly provide when placing an order, contacting support, or subscribing to our email newsletter. This includes contact details (name, email, phone number) and shipping destination addresses necessary to fulfill commercial purchases.',
        },
        {
          heading: '2. Payment Security',
          text: 'Payment processing is routed directly through PCI-DSS compliant payment gateways via encrypted connections. Zenvilo does not store, process, or view full credit card numbers or sensitive card verification values on our application servers.',
        },
        {
          heading: '3. Use of Information',
          text: 'We use collected information solely to process orders, communicate shipment milestones, respond to customer service tickets, and send product release dispatches if you have explicitly opted in.',
        },
        {
          heading: '4. Third-Party Disclosures',
          text: 'We do not sell, rent, or trade your personal information. Data is shared exclusively with necessary operational partners (e.g., shipping carriers and payment processors) strictly to execute fulfillment.',
        },
        {
          heading: '5. Your Rights and Contact',
          text: 'You may request access to, correction of, or deletion of your personal data at any time by contacting our privacy compliance desk at support@zenvilo.com.',
        },
      ],
    },
    'terms': {
      title: 'Terms & Conditions',
      lastUpdated: 'October 2026',
      subtitle: 'Standard rules and guidelines governing the use of the Zenvilo website and digital store.',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          text: 'By visiting our website or purchasing products from Zenvilo, you engage in our service and agree to be bound by the following terms, conditions, and applicable laws.',
        },
        {
          heading: '2. Catalog and Pricing Accuracy',
          text: 'We endeavor to ensure that all product descriptions, specifications, and pricing are accurate. However, in the event an error occurs, Zenvilo reserves the right to correct inaccurate information or cancel orders placed for improperly priced items prior to shipment.',
        },
        {
          heading: '3. Intellectual Property',
          text: 'All visual brand marks, typography compositions, vector graphics, product copy, and layout arrangements appearing on Zenvilo are the intellectual property of Zenvilo and protected by applicable copyright and trademark provisions.',
        },
        {
          heading: '4. Limitation of Liability',
          text: 'To the fullest extent permitted by applicable law, Zenvilo shall not be liable for any indirect, incidental, or consequential damages arising from the use of products purchased on this platform beyond the purchase price of the item in question.',
        },
        {
          heading: '5. Governing Law',
          text: 'These terms and conditions are governed by and construed in accordance with applicable regional commercial codes, without regard to conflicts of law principles.',
        },
      ],
    },
  };

  const current = policyContent[policyType];

  return (
    <div className="min-h-screen bg-neutral-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="hover:text-white transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-neutral-200">Legal & Policies</span>
        </div>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-neutral-900">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Store Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {current.title}
          </h1>
          <p className="mt-3 text-sm text-neutral-400 max-w-2xl leading-relaxed">
            {current.subtitle}
          </p>
          <div className="mt-4 text-xs text-neutral-400 font-mono">
            Last Updated: {current.lastUpdated}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-neutral-300">
          {current.sections.map((section, idx) => (
            <section
              key={idx}
              className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800/80"
            >
              <h2 className="text-base font-semibold text-white mb-2">{section.heading}</h2>
              <p className="text-sm leading-relaxed text-neutral-300">{section.text}</p>
            </section>
          ))}
        </div>

        {/* Questions Footer */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            Questions concerning this policy? Reach us directly at{' '}
            <span className="text-violet-300 font-mono">support@zenvilo.com</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="text-neutral-300 hover:text-white inline-flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
