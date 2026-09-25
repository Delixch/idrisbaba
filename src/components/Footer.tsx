import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { SALON_CONFIG } from '../../salon.config.js';
import { Instagram, MapPin, Phone, Clock, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="w-full bg-[#2e231c] text-[#f4efe6] pt-16 pb-12 border-t border-[#45413b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#45413b]/60">
          
          {/* Col 1: Brand & Slogan */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f1e6c0] flex items-center justify-center text-[#2e231c] font-serif text-lg font-bold">
                R
              </div>
              <span className="font-sans font-bold text-lg tracking-[0.18em] text-[#f4efe6] uppercase">
                {SALON_CONFIG.shortName}
              </span>
            </div>
            <p className="text-xs text-[#a0988b] leading-relaxed font-sans">
              {t.footer.tagline}
            </p>
            <p className="text-xs text-[#f1e6c0] font-typewriter italic">
              "{language === 'de' ? SALON_CONFIG.sloganDe : SALON_CONFIG.sloganTr}"
            </p>
          </div>

          {/* Col 2: Navigation & Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4a24c] mb-4 font-typewriter">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-[#f4efe6]/80">
              <li>
                <Link to="/" className="hover:text-[#f1e6c0] transition-colors">
                  {t.nav.start}
                </Link>
              </li>
              <li>
                <Link to="/arbeiten" className="hover:text-[#f1e6c0] transition-colors">
                  {t.nav.arbeiten}
                </Link>
              </li>
              <li>
                <Link to="/leistungen" className="hover:text-[#f1e6c0] transition-colors">
                  {t.nav.leistungen}
                </Link>
              </li>
              <li>
                <Link to="/buchen" className="hover:text-[#f1e6c0] transition-colors font-medium text-[#f1e6c0]">
                  {t.nav.buchen} →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours Summary */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4a24c] mb-4 font-typewriter flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#d4a24c]" />
              {t.footer.hoursTitle}
            </h4>
            <ul className="space-y-1.5 text-xs text-[#f4efe6]/80">
              <li className="flex justify-between">
                <span className="text-[#a0988b]">{language === 'de' ? 'Di – Fr' : 'Salı – Cuma'}</span>
                <span>09:00 – 19:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#a0988b]">{language === 'de' ? 'Donnerstag' : 'Perşembe'}</span>
                <span>09:00 – 20:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[#a0988b]">{language === 'de' ? 'Samstag' : 'Cumartesi'}</span>
                <span>08:30 – 17:00</span>
              </li>
              <li className="flex justify-between text-[#a0988b]">
                <span>{language === 'de' ? 'So & Mo' : 'Pazar & Pzt'}</span>
                <span>{language === 'de' ? 'Geschlossen' : 'Kapalı'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d4a24c] mb-4 font-typewriter flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#d4a24c]" />
              {t.footer.contactTitle}
            </h4>
            <div className="space-y-3 text-xs text-[#f4efe6]/80">
              <p>
                {SALON_CONFIG.address.street}<br />
                {SALON_CONFIG.address.postalCode} {SALON_CONFIG.address.city}, {SALON_CONFIG.address.country}
              </p>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#d4a24c]" />
                <a href={`tel:${SALON_CONFIG.contact.phone}`} className="hover:text-[#f1e6c0]">
                  {SALON_CONFIG.contact.phoneDisplay}
                </a>
              </div>
              <div className="pt-2">
                <a
                  href={SALON_CONFIG.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3a2e26] hover:bg-[#4a3b32] text-xs text-[#f1e6c0] transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@{SALON_CONFIG.contact.instagram}</span>
                  <ArrowUpRight className="w-3 h-3 text-[#d4a24c]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: revDSG Privacy & Impressum */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a0988b]">
          <p>© {new Date().getFullYear()} {SALON_CONFIG.name}. {t.footer.rights}</p>
          <div className="flex items-center gap-6">
            <Link to="/datenschutz" className="hover:text-[#f4efe6] transition-colors">
              {t.footer.privacy}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/impressum" className="hover:text-[#f4efe6] transition-colors">
              {t.footer.imprint}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
