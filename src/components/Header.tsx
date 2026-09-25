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
        
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a24c]/40 rounded-lg p-1">
          <div className="w-10 h-10 rounded-full bg-[#241e19] flex items-center justify-center text-[#d4a24c] font-serif text-xl font-bold shadow-md transition-transform group-hover:scale-105 border border-[#d4a24c]/60">
            I
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-base sm:text-lg tracking-[0.16em] text-[#f7f3ec] uppercase leading-tight">
              {SALON_CONFIG.shortName}
            </span>
            <span className="text-[10px] uppercase font-typewriter tracking-[0.18em] text-[#d4a24c]">
              ZÜRICH · 8055
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm tracking-wide transition-colors relative py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a24c]/40 rounded-sm ${
                isActive(link.to)
                  ? 'text-[#fbbf24] font-semibold'
                  : 'text-[#d4ccc0] hover:text-[#fbbf24]'
              }`}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fbbf24] rounded-full shadow-[0_0_8px_#fbbf24]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Actions & Language Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Language Switcher Pill Toggle */}
          <div className="flex items-center p-0.5 bg-[#241e19] rounded-full border border-[#3d342c] text-xs font-medium">
            <button
              onClick={() => setLanguage('de')}
              className={`px-2.5 py-1 rounded-full transition-all focus-visible:outline-none ${
                language === 'de'
                  ? 'bg-[#d4a24c] text-[#12100e] font-bold shadow-xs'
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
                  ? 'bg-[#2e231c] text-[#f4efe6] shadow-xs'
                  : 'text-[#736c62] hover:text-[#211f1c]'
              }`}
              title="Türkçe"
            >
              TR
            </button>
          </div>

          {/* Primary CTA Button */}
          <Link
            to="/buchen"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#c96442] hover:bg-[#a94f32] rounded-full shadow-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442]/50 whitespace-nowrap"
          >
            {t.nav.buchen}
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#2e231c] hover:bg-[#efe8dc] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442]/40"
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#fbf8f2] border-b border-[#e4dacb] px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-[#efe8dc] text-[#2e231c] font-semibold'
                  : 'text-[#45413b] hover:bg-[#efe8dc]/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              to="/buchen"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-2.5 text-xs font-semibold text-white bg-[#c96442] hover:bg-[#a94f32] rounded-xl shadow-xs transition-all"
            >
              {t.nav.buchen}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
