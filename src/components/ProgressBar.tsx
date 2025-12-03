'use client';

import React from 'react';

interface ProgressBarProps {
    current: number;
    expected: number;
    max: number;
    label: string;
}

export default function ProgressBar({ current, expected, max, label }: ProgressBarProps) {
    const currentPercent = (current / max) * 100;
    const expectedPercent = (expected / max) * 100;
    const isAhead = current >= expected;

    return (
        <div className="progress-container">
            <div className="progress-header">
                <span className="progress-label">{label}</span>
                <span className="progress-stats">
                    Week {current} of {max}
                    {isAhead ? (
                        <span className="ahead"> ✓ On Track</span>
                    ) : (
                        <span className="behind"> ⚠ Behind</span>
                    )}
                </span>
            </div>

            <div className="progress-bar-wrapper">
                <div className="progress-bar">
                    <div
                        className="progress-fill current"
                        style={{ width: `${Math.min(currentPercent, 100)}%` }}
                    />
                    <div
                        className="progress-marker expected"
                        style={{ left: `${Math.min(expectedPercent, 100)}%` }}
                    >
                        <div className="marker-line" />
                        <div className="marker-label">Expected</div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .progress-container {
          margin: var(--spacing-lg) 0;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }
        
        .progress-label {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .progress-stats {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        
        .ahead {
          color: var(--color-complete);
          font-weight: 600;
        }
        
        .behind {
          color: var(--color-in-progress);
          font-weight: 600;
        }
        
        .progress-bar-wrapper {
          position: relative;
        }
        
        .progress-bar {
          position: relative;
          height: 12px;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          overflow: visible;
        }
        
        .progress-fill.current {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-color), var(--accent-light));
          border-radius: var(--radius-md);
          transition: width var(--transition-slow);
        }
        
        .progress-marker {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          z-index: 10;
        }
        
        .marker-line {
          width: 2px;
          height: 12px;
          background-color: var(--text-tertiary);
          margin: 0 auto;
        }
        
        .marker-label {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          margin-top: var(--spacing-xs);
          white-space: nowrap;
          transform: translateX(-50%);
          margin-left: 50%;
        }
      `}</style>
        </div>
    );
}
