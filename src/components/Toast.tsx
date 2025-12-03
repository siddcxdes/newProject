'use client';

import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'info', isVisible, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✗';
            default: return 'ℹ';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return 'var(--color-complete)';
            case 'error': return 'var(--color-missed)';
            default: return 'var(--accent-color)';
        }
    };

    return (
        <div className="toast">
            <div className="toast-icon" style={{ color: getColor() }}>
                {getIcon()}
            </div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={onClose}>
                ✕
            </button>

            <style jsx>{`
        .toast {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .toast-icon {
          font-size: var(--text-xl);
          font-weight: 700;
          line-height: 1;
        }
        
        .toast-message {
          flex: 1;
          font-size: var(--text-sm);
          color: var(--text-primary);
        }
        
        .toast-close {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        
        .toast-close:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }
      `}</style>
        </div>
    );
}
