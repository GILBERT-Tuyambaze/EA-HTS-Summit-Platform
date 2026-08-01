import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import PopupMessage from '../components/PopupMessage';

type PopupType = 'success' | 'error' | 'info';

type PopupOptions = {
  title?: string;
  message: string;
  type?: PopupType;
  duration?: number;
};

type PopupContextValue = {
  showPopup: (options: PopupOptions) => void;
};

const PopupContext = createContext<PopupContextValue | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupOptions | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPopup = useCallback(() => {
    setPopup(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showPopup = useCallback((options: PopupOptions) => {
    setPopup({ type: 'info', duration: 4500, ...options });
  }, []);

  useEffect(() => {
    if (!popup || popup.duration === undefined) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setPopup(null);
      timeoutRef.current = null;
    }, popup.duration);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [popup]);

  const value = useMemo(() => ({ showPopup }), [showPopup]);

  return (
    <PopupContext.Provider value={value}>
      {children}
      {popup ? (
        <PopupMessage
          title={popup.title}
          message={popup.message}
          type={popup.type}
          onClose={clearPopup}
        />
      ) : null}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within PopupProvider');
  }
  return context;
}
