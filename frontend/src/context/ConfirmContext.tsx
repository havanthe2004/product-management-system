import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
}

type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | null>(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

interface ConfirmProviderProps {
  children: React.ReactNode;
}

export const ConfirmProvider = ({ children }: ConfirmProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<(ConfirmOptions & { resolve: (val: boolean) => void }) | null>(null);

  const confirm = useCallback((opt: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions({
        ...opt,
        resolve,
      });
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    if (options) {
      options.resolve(true);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (options) {
      options.resolve(false);
    }
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {isOpen && options && (
        <ConfirmDialog
          title={options.title || 'Xác nhận'}
          message={options.message}
          confirmText={options.confirmText || 'Xác nhận'}
          cancelText={options.cancelText || 'Hủy'}
          type={options.type || 'warning'}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
};
