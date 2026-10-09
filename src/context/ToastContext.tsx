import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none"
        aria-live="polite"
        role="region"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg px-4 py-3 text-sm font-medium shadow-xl border transition-all duration-200 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-neutral-900 border-violet-500/40 text-neutral-100 shadow-violet-950/20'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/40 text-red-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
