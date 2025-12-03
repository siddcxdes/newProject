'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function AutoSaveIndicator() {
    const { lastSaved } = useApp();
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const updateTimeAgo = () => {
            if (!lastSaved) {
                setTimeAgo('');
                return;
            }

            const seconds = Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000);

            if (seconds < 5) {
                setTimeAgo('Saved just now');
            } else if (seconds < 60) {
                setTimeAgo(`Saved ${seconds}s ago`);
            } else if (seconds < 3600) {
                const minutes = Math.floor(seconds / 60);
                setTimeAgo(`Saved ${minutes}m ago`);
            } else {
                const hours = Math.floor(seconds / 3600);
                setTimeAgo(`Saved ${hours}h ago`);
            }
        };

        updateTimeAgo();
        const interval = setInterval(updateTimeAgo, 1000);

        return () => clearInterval(interval);
    }, [lastSaved]);

    if (!timeAgo) return null;

    return (
        <div className="auto-save-indicator">
            <span className="save-icon">✓</span>
            <span className="save-text">{timeAgo}</span>

            <style jsx>{`
                .auto-save-indicator {
                    position: fixed;
                    bottom: var(--spacing-lg);
                    left: var(--spacing-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                    padding: var(--spacing-sm) var(--spacing-md);
                    background: var(--glass-bg);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-full);
                    box-shadow: 0 4px 12px var(--shadow);
                    z-index: var(--z-sticky);
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                    animation: slideIn var(--transition-base);
                }

                .save-icon {
                    color: var(--color-complete);
                    font-weight: 700;
                }

                .save-text {
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .auto-save-indicator {
                        left: 50%;
                        transform: translateX(-50%);
                        bottom: var(--spacing-md);
                    }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
