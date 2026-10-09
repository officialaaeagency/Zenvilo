import React, { useState, useEffect } from 'react';
import { checkSupabaseConnection, isSupabaseConfigured } from '../../lib/supabase';
import { Database, CheckCircle2, AlertTriangle, X, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<{
    loading: boolean;
    connected: boolean;
    message: string;
    error?: string;
  }>({
    loading: true,
    connected: false,
    message: 'Testing Supabase connection...',
  });
  const [copied, setCopied] = useState(false);

  const runCheck = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    const result = await checkSupabaseConnection();
    setStatus({
      loading: false,
      connected: result.connected,
      message: result.message,
      error: result.error,
    });
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supabase-status-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-800/50 flex items-center justify-center text-violet-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 id="supabase-status-title" className="text-base font-semibold text-white">
                Supabase Integration Status
              </h3>
              <p className="text-xs text-neutral-400">PostgreSQL Cloud Database Connection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4 text-xs">
          {/* Status card */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              status.loading
                ? 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300'
                : status.connected
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
            }`}
          >
            {status.loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-neutral-400 shrink-0 mt-0.5" />
            ) : status.connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <div className="font-semibold text-white">
                {status.loading
                  ? 'Verifying Connection...'
                  : status.connected
                  ? 'Supabase Client Connected'
                  : 'Connection Requires Setup'}
              </div>
              <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
                {status.message}
              </p>
              {status.error && (
                <p className="mt-1 font-mono text-[11px] text-neutral-400">
                  Detail: {status.error}
                </p>
              )}
            </div>
          </div>

          {/* Config details */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex justify-between items-center text-neutral-400">
              <span>Project ID:</span>
              <span className="font-mono text-neutral-200">tdjcpsvqqzxljjwhinyq</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Project URL:</span>
              <span className="font-mono text-neutral-200 text-[11px]">
                https://tdjcpsvqqzxljjwhinyq.supabase.co
              </span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Public Key (Anon):</span>
              <span className="font-mono text-emerald-400 text-[11px]">
                Configured via .env (Publishable)
              </span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Service Role Key:</span>
              <span className="font-mono text-neutral-500 text-[11px]">
                Omitted from browser (Secure)
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5 text-neutral-300">
            <div className="font-medium text-white flex items-center justify-between">
              <span>Database Tables (12 Total)</span>
              <span className="text-[11px] text-violet-400 font-mono">supabase_migration.sql</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              profiles, categories, products, product_images, product_variants, carts, cart_items, orders, order_items, reviews, addresses, wishlist_items.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={runCheck}
            disabled={status.loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status.loading ? 'animate-spin' : ''}`} />
            <span>Re-test Connection</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
