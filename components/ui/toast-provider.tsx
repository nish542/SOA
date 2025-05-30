'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toast } from './toast';

interface ToastContextType {
  toast: (props: { title: string; description?: string; type: 'success' | 'error' | 'info' }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, toast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
} 