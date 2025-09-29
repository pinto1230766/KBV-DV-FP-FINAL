import React, { createContext, useState, useCallback, ReactNode, useContext, useEffect } from 'react';
import { Toast as ToastInterface, ToastType } from '../types';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XIcon } from '../components/Icons';

// --- Toast Component ---
interface ToastProps {
  toast: ToastInterface;
  onDismiss: (id: string) => void;
}

const icons: { [key in ToastType]: React.FC<{className?: string}> } = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
};

const toastStyles: { [key in ToastType]: { bg: string } } = {
  success: { bg: 'bg-green-600' },
  error: { bg: 'bg-red-600' },
  info: { bg: 'bg-primary' },
  warning: { bg: 'bg-amber-500' },
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, message, type, duration = 5000 } = toast;
  const Icon = icons[type];
  const styles = toastStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration); // Auto-dismiss after custom or default duration

    return () => clearTimeout(timer);
  }, [id, onDismiss, duration]);

  return (
    <div className={`flex items-center p-4 rounded-xl shadow-2xl text-white ${styles.bg} animate-fade-in-right w-full max-w-sm`}>
      <div className="flex-shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button onClick={() => onDismiss(id)} className="inline-flex rounded-md p-1.5 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white">
          <span className="sr-only">Fermer</span>
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// --- Toast Container ---
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div aria-live="assertive" className="fixed inset-0 flex items-center justify-center px-4 py-6 pointer-events-none sm:p-6 z-[100]">
        <div className="w-full max-w-sm flex flex-col-reverse space-y-4 space-y-reverse pointer-events-auto">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    </div>
  );
};


// --- Context & Provider ---
interface ToastContextType {
  toasts: ToastInterface[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastInterface[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = crypto.randomUUID();
    setToasts((prevToasts) => [{ id, message, type, duration }, ...prevToasts]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// --- Hook ---
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
