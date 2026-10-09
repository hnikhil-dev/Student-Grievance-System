'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertType } from '../../types/design-system';
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, Bot, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '380px',
          width: 'calc(100% - 3rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          const typeStyles: Record<AlertType, { bg: string; border: string; text: string; Icon: React.ElementType }> = {
            info: { bg: '#FFFFFF', border: '#3B82F6', text: '#1E3A8A', Icon: Info },
            success: { bg: '#FFFFFF', border: '#10B981', text: '#064E3B', Icon: CheckCircle2 },
            warning: { bg: '#FFFFFF', border: '#F59E0B', text: '#78350F', Icon: AlertTriangle },
            error: { bg: '#FFFFFF', border: '#EF4444', text: '#7F1D1D', Icon: AlertOctagon },
            ai: { bg: '#FFFFFF', border: '#4F46E5', text: '#312E81', Icon: Bot },
          };

          const styleConfig = typeStyles[t.type];
          const ToastIcon = styleConfig.Icon;

          return (
            <div
              key={t.id}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '0.85rem 1.1rem',
                backgroundColor: styleConfig.bg,
                color: styleConfig.text,
                borderRadius: '12px',
                borderLeft: `5px solid ${styleConfig.border}`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                fontSize: '0.875rem',
                animation: 'sg-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <span style={{ display: 'inline-flex', marginTop: '0.125rem' }}>
                  <ToastIcon size={18} color={styleConfig.border} />
                </span>
                <div>
                  <h5 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{t.title}</h5>
                  {t.message && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', opacity: 0.85 }}>{t.message}</p>}
                </div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: styleConfig.text, opacity: 0.6, display: 'inline-flex', padding: '0.2rem' }}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <style jsx global>{`
        @keyframes sg-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
