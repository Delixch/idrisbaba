import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { SALON_CONFIG } from '../../salon.config.js';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t.nav.start },
    { to: '/arbeiten', label: t.nav.arbeiten },
    { to: '/leistungen', label: t.nav.leistungen },
    { to: '/buchen', label: t.nav.buchen },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#16120f]/90 backdrop-blur-md border-b border-[#2d2621] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark with Golden Heartbeat Aura */}
        <Link to="/" className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a24c]/40 rounded-2xl p-1.5 relative">
          {/* Golden Heartbeat Pulse Aura in the background */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#fbbf24]/30 via-[#d97746]/35 to-[#fbbf24]/30 rounded-2xl gold-heartbeat-glow pointer-events-none" />
          
          {/* Subtle Golden Outline Pill */}
          <div className="absolute inset-0 bg-[#241e19]/90 border border-[#fbbf24]/50 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.25)] transition-all duration-300 group-hover:border-[#fbbf24] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.45)]" />

          {/* Monogram Badge */}
          <div className="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#b45309] p-[1.5px] shadow-lg transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-[10px] bg-[#16120f] flex items-center justify-center">
              <span className="font-serif text-xl font-bold gold-shimmer-text">
                I
              </span>
            </div>
          </div>

          {/* Text Area */}
          <div className="flex flex-col relative z-10 pr-2">
            <span className="font-sans font-extrabold text-sm sm:text-base tracking-[0.18em] uppercase leading-tight gold-shimmer-text">
              {SALON_CONFIG.shortName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] shadow-[0_0_6px_#fbbf24] animate-ping" />
              <span className="text-[10px] uppercase font-typewriter tracking-[0.2em] text-[#fbbf24] font-semibold">
                ZÜRICH · 8055
              </span>
            </div>
          </div>
        </Link>

        {/* Zone 2: Navigation Links (UPPERCASE) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-xs uppercase tracking-[0.18em] font-semibold transition-colors relative py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a24c]/40 rounded-sm ${
                isActive(link.to)
                  ? 'text-[#fbbf24]'
                  : 'text-[#d4ccc0] hover:text-[#fbbf24]'
              }`}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fbbf24] rounded-full shadow-[0_0_10px_#fbbf24]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Actions & Language Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Language Switcher Pill Toggle */}
          <div className="flex items-center p-0.5 bg-[#241e19] rounded-full border border-[#3d342c] text-xs font-semibold">
            <button
              onClick={() => setLanguage('de')}
              className={`px-2.5 py-1 rounded-full transition-all focus-visible:outline-none ${
                language === 'de'
                  ? 'bg-gradient-to-r from-[#fbbf24] to-[#d4a24c] text-[#12100e] font-bold shadow-xs'
                  : 'text-[#9e9486] hover:text-[#f7f3ec]'
              }`}
              title="Deutsch"
            >
              DE
            </button>
            <button
              onClick={() => setLanguage('tr')}
              className={`px-2.5 py-1 rounded-full transition-all focus-visible:outline-none ${
                language === 'tr'
                  ? 'bg-gradient-to-r from-[#fbbf24] to-[#d4a24c] text-[#12100e] font-bold shadow-xs'
                  : 'text-[#9e9486] hover:text-[#f7f3ec]'
              }`}
              title="Türkçe"
            >
              TR
            </button>
          </div>

          {/* Primary CTA Button */}
          <Link
            to="/buchen"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs uppercase tracking-wider font-bold text-[#12100e] bg-gradient-to-r from-[#fbbf24] to-[#d4a24c] hover:from-[#f59e0b] hover:to-[#b45309] rounded-full shadow-lg shadow-amber-500/20 transition-all active:scale-95 focus-visible:outline-none whitespace-nowrap"
          >
            {t.nav.buchen}
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#fbbf24] bg-[#241e19] hover:bg-[#342a22] border border-[#d4a24c]/40 rounded-xl transition-colors focus-visible:outline-none"
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Redesigned Dark Luxury Lounge Style) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#16120f]/98 backdrop-blur-xl border-b border-[#d4a24c]/30 px-5 pt-4 pb-6 space-y-3 animate-in fade-in slide-in-from-top-3 shadow-2xl">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-xs uppercase tracking-[0.16em] font-semibold transition-all ${
                  isActive(link.to)
                    ? 'bg-[#241e19] text-[#fbbf24] border border-[#fbbf24]/40 shadow-sm'
                    : 'text-[#d4ccc0] hover:bg-[#241e19]/60 hover:text-[#fbbf24]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-[#2d2621]">
            <Link
              to="/buchen"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-3 text-xs uppercase tracking-wider font-bold text-[#12100e] bg-gradient-to-r from-[#fbbf24] to-[#d4a24c] hover:from-[#f59e0b] hover:to-[#b45309] rounded-xl shadow-lg transition-all"
            >
              {t.nav.buchen}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
