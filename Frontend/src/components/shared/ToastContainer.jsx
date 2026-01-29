'use client';
import React from 'react';
import { useToast } from '@/lib/toastStore';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-neo-green" />,
  error: <AlertCircle className="w-5 h-5 text-neo-red" />,
  warning: <AlertTriangle className="w-5 h-5 text-neo-yellow" />,
  info: <Info className="w-5 h-5 text-neo-blue" />,
};

const toastStyles = {
  success: 'border-neo-green bg-green-50 dark:bg-green-950/30',
  error: 'border-neo-red bg-red-50 dark:bg-red-950/30',
  warning: 'border-neo-yellow bg-yellow-50 dark:bg-yellow-950/30',
  info: 'border-neo-blue bg-blue-50 dark:bg-blue-950/30',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-md w-full sm:w-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 border-4 border-neo-black dark:border-white shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] animate-in slide-in-from-right-full duration-300",
            toastStyles[toast.type] || toastStyles.info
          )}
        >
          <div className="shrink-0 mt-0.5">
            {icons[toast.type] || icons.info}
          </div>
          <div className="flex-grow">
            <p className="font-bold text-sm dark:text-white uppercase tracking-tight">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-neo-black dark:text-white hover:bg-neo-black/10 dark:hover:bg-white/10 p-1 transition-colors"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      ))}
    </div>
  );
}
