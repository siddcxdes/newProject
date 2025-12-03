'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  progress?: number; // 0-100
  status?: 'complete' | 'in-progress' | 'missed' | 'upcoming';
  onClick?: () => void;
  navigateTo?: string; // Page to navigate to when clicked
  showPercentage?: boolean; // Show progress as percentage
}

export default function MetricCard({
  icon,
  label,
  value,
  subtext,
  progress,
  status = 'upcoming',
  onClick,
  navigateTo,
  showPercentage = false,
}: MetricCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      router.push(navigateTo);
    }
  };

  const isClickable = onClick || navigateTo;
  const displayValue = showPercentage && typeof progress === 'number'
    ? `${Math.round(progress)}%`
    : value;

  return (
    <div
      className={`card metric-card ${status} ${isClickable ? 'clickable' : ''}`}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-label">{label}</div>
        <div className="metric-value">{displayValue}</div>
        {subtext && <div className="metric-subtext">{subtext}</div>}
        {typeof progress === 'number' && (
          <div className="metric-progress">
            <div className="progress-bar-mini">
              <div
                className="progress-fill-mini"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            {!showPercentage && (
              <span className="progress-text">{Math.round(progress)}%</span>
            )}
          </div>
        )}
      </div>
      {isClickable && (
        <div className="metric-arrow">→</div>
      )}
    </div>
  );
}
