'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import AutoSaveIndicator from './AutoSaveIndicator';

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { state } = useApp();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/checkin', label: 'Daily Check-In', icon: '✅' },
    { href: '/academics', label: 'Academics', icon: '📚' },
    { href: '/gym', label: 'Gym & Health', icon: '🏋️' },
    { href: '/social', label: 'Social & Goals', icon: '🎯' },
    { href: '/jobs', label: 'Job Hunt', icon: '💼' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
    { href: '/admin', label: 'Admin', icon: '🔧' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="main-layout">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        <span className="menu-icon">{mounted && isSidebarOpen ? '✕' : '☰'}</span>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">🚀</div>
            <div>
              <h1 className="app-title">Ascension</h1>
              <p className="app-subtitle">Your Journey to Success</p>
            </div>
          </div>

          <div className="user-badge">
            <div className="level-badge">
              <span className="level-icon">⭐</span>
              <span className="level-text">Level {state.gamification.level}</span>
            </div>
            <div className="xp-bar">
              <div
                className="xp-fill"
                style={{
                  width: `${(state.gamification.totalXP % 500) / 5}%`
                }}
              />
            </div>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {pathname === item.href && <span className="active-indicator" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="streak-mini">
            <span className="streak-icon">🔥</span>
            <span className="streak-text">{state.gamification.currentStreak} day streak</span>
          </div>
          <div className="version">v1.0.0 • Built with ❤️</div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {children}
        <AutoSaveIndicator />
      </main>
    </div>
  );
}
