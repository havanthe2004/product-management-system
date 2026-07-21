import React from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmText,
  cancelText,
  type,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  // Map type to icons and theme colors
  const getThemeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: (
            <svg style={{ width: '28px', height: '28px', color: 'var(--danger)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          iconBg: 'var(--danger-light)',
          confirmBtnBg: 'var(--danger)',
          confirmBtnHoverBg: 'var(--danger)'
        };
      case 'warning':
        return {
          icon: (
            <svg style={{ width: '28px', height: '28px', color: 'var(--warning)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          iconBg: 'var(--warning-light)',
          confirmBtnBg: 'var(--warning)',
          confirmBtnHoverBg: 'var(--warning)'
        };
      case 'success':
        return {
          icon: (
            <svg style={{ width: '28px', height: '28px', color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'var(--success-light)',
          confirmBtnBg: 'var(--success)',
          confirmBtnHoverBg: 'var(--success)'
        };
      case 'info':
      default:
        return {
          icon: (
            <svg style={{ width: '28px', height: '28px', color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'var(--primary-light)',
          confirmBtnBg: 'var(--primary)',
          confirmBtnHoverBg: 'var(--primary-hover)'
        };
    }
  };

  const theme = getThemeConfig();

  // Close dialog on escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content animate-scaleUp" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '440px', 
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {/* Circular Icon Container */}
          <div 
            style={{ 
              backgroundColor: theme.iconBg, 
              borderRadius: '50%', 
              padding: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {theme.icon}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              {message}
            </p>
          </div>
        </div>

        {/* Buttons Panel */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn btn-secondary"
            style={{ 
              padding: '10px 18px', 
              borderRadius: '8px', 
              fontWeight: '600', 
              fontSize: '14px',
              minWidth: '90px'
            }}
          >
            {cancelText}
          </button>
          
          <button 
            type="button" 
            onClick={onConfirm} 
            className="btn btn-primary"
            style={{ 
              padding: '10px 18px', 
              borderRadius: '8px', 
              fontWeight: '600', 
              fontSize: '14px',
              backgroundColor: theme.confirmBtnBg,
              borderColor: 'transparent',
              minWidth: '90px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
