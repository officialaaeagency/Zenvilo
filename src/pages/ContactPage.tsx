import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Mail, Clock, ShieldCheck, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!formData.email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');

    // Simulate sending message to support architecture
    setTimeout(() => {
      setStatus('success');
      showToast('Your message has been sent successfully.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="hover:text-white transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-neutral-200">Contact</span>
        </div>

        {/* Title */}
        <div className="mb-12">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-2">
            Get In Touch
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact Zenvilo Support
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Have a question about an upcoming release, order, or product specification? We are here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Contact Details & Office Hours (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-violet-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Direct Support Email</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  For order inquiries, return requests, and general questions:
                </p>
                <div className="mt-2 font-mono text-sm text-violet-300 select-all">
                  support@zenvilo.com
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-violet-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Support Operating Hours</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Monday – Friday: 9:00 AM – 5:00 PM EST
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Typical response window: <strong>24–48 business hours</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/60 text-xs text-neutral-400 space-y-2">
              <div className="flex items-center gap-2 text-neutral-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <span>Customer Care Integrity</span>
              </div>
              <p>
                We do not outsource customer service to automated chat bots. Every inquiry is reviewed by our team.
              </p>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6 sm:p-8">
              {status === 'success' ? (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Message Received</h3>
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto mb-6">
                    Thank you for reaching out. A confirmation has been logged, and a representative will reply within 24–48 business hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus('idle')}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {status === 'error' && (
                    <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Morgan"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="alex@domain.com"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="">General Inquiry</option>
                      <option value="Product Question">Product Specification Question</option>
                      <option value="Order Status">Order Tracking / Status</option>
                      <option value="Return Request">Return / Exchange Request</option>
                      <option value="Press / Partnership">Press / Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your inquiry with as much detail as possible..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-violet-500 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={status === 'submitting'}
                    className="flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
