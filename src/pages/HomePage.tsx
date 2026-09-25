import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { SALON_CONFIG } from '../../salon.config.js';
import { GALERI_CONFIG } from '../../galeri.config.js';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Compass,
} from 'lucide-react';

interface NextSlotData {
  nextSlotIso: string | null;
  dateFormattedDe?: string;
  dateFormattedTr?: string;
  timeFormatted?: string;
}

export const HomePage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [nextSlot, setNextSlot] = useState<NextSlotData | null>(null);
  const [loadingNextSlot, setLoadingNextSlot] = useState(true);

  // Live status for opening hours in Europe/Zurich
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    // 1. Fetch live next slot from API
    fetch('/api/calendar/next-slot')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setNextSlot(data);
      })
      .catch(() => {
        // Fallback gracefully
      })
      .finally(() => setLoadingNextSlot(false));

    // 2. Compute Zurich live status
    const updateOpeningStatus = () => {
      const now = new Date();
      // Format in Europe/Zurich
      const zurichTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: SALON_CONFIG.timeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      const zurichDayStr = now.toLocaleDateString('en-US', {
        timeZone: SALON_CONFIG.timeZone,
        weekday: 'narrow',
      });
      // Get day number 0..6
      const zurichDate = new Date(
        now.toLocaleString('en-US', { timeZone: SALON_CONFIG.timeZone })
      );
      const dayNum = zurichDate.getDay();
      setCurrentDayIndex(dayNum);

      const dayConfig = SALON_CONFIG.openingHours.find((d) => d.day === dayNum);
      if (!dayConfig || !dayConfig.isOpen || !dayConfig.openTime || !dayConfig.closeTime) {
        setIsOpenNow(false);
        return;
      }

      const [curH, curM] = zurichTimeStr.split(':').map(Number);
      const curMinutes = curH * 60 + curM;

      const [openH, openM] = dayConfig.openTime.split(':').map(Number);
      const openMinutes = openH * 60 + openM;

      const [closeH, closeM] = dayConfig.closeTime.split(':').map(Number);
      const closeMinutes = closeH * 60 + closeM;

      setIsOpenNow(curMinutes >= openMinutes && curMinutes < closeMinutes);
    };

    updateOpeningStatus();
    const interval = setInterval(updateOpeningStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const featuredPhotos = GALERI_CONFIG.items.slice(0, 3);
  const featuredServices = SALON_CONFIG.services.slice(0, 3);

  const handleNextSlotClick = () => {
    if (nextSlot?.nextSlotIso) {
      navigate(`/buchen?startIso=${encodeURIComponent(nextSlot.nextSlotIso)}`);
    } else {
      navigate('/buchen');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 4-column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* CARD 1: 2x2 Hero Card */}
        <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[480px] border border-[#e4dacb] card-hover-luxury group shadow-md">
          {/* Hair Photo Background */}
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=85"
            alt="Idris Hacimustafaoglu Coiffure Haute Coiffure Zürich"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2e231c]/90 via-[#2e231c]/30 to-transparent" />
          
          {/* Frosted Glass Floating Panel */}
          <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 p-6 sm:p-8 rounded-2xl bg-[#fbf8f2]/90 backdrop-blur-md border border-[#fbf8f2]/80 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#d4a24c]" />
              <span className="text-[11px] uppercase font-typewriter tracking-[0.25em] text-[#736c62]">
                Haute Coiffure · Zürich
              </span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2e231c] leading-[1.12] mb-1">
              {SALON_CONFIG.name}
            </h1>

            {/* Custom Luxury Font Slogan */}
            <p className="font-editorial text-xl sm:text-2xl text-[#c96442] italic tracking-wide mb-3">
              "{SALON_CONFIG.sloganEn}"
            </p>

            <p className="text-xs sm:text-sm text-[#45413b] font-sans mb-6 max-w-lg leading-relaxed">
              {language === 'de' ? SALON_CONFIG.sloganDe : SALON_CONFIG.sloganTr}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/buchen"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#c96442] hover:bg-[#a94f32] rounded-full shadow-md transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                {t.hero.cta}
              </Link>
              <Link
                to="/arbeiten"
                className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-medium text-[#2e231c] bg-[#efe8dc] hover:bg-[#e4dacb] border border-[#d3c6b3] rounded-full transition-colors"
              >
                {t.hero.explore}
              </Link>
            </div>
          </div>
        </div>

        {/* CARD 2: 1x1 "Nächster freier Termin" Card (Live Calendar Check) */}
        <div
          onClick={handleNextSlotClick}
          className="col-span-1 rounded-3xl p-6 bg-[#fbf8f2] border border-[#e4dacb] card-hover-luxury cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#587a4f]/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase font-typewriter tracking-widest text-[#736c62]">
                {t.nextSlot.title}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#587a4f]/15 flex items-center justify-center text-[#587a4f] relative">
                <span className="absolute w-2.5 h-2.5 rounded-full bg-[#587a4f] live-pulse" />
                <Clock className="w-4 h-4 relative z-10" />
              </div>
            </div>

            {loadingNextSlot ? (
              <p className="text-sm text-[#736c62] animate-pulse">{t.nextSlot.loading}</p>
            ) : nextSlot?.nextSlotIso ? (
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-display font-bold text-[#2e231c] block tracking-tight">
                  {nextSlot.timeFormatted} <span className="text-sm font-normal font-sans text-[#736c62]">Uhr</span>
                </span>
                <span className="text-xs text-[#587a4f] font-semibold block flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#587a4f]" />
                  {language === 'de' ? nextSlot.dateFormattedDe : nextSlot.dateFormattedTr}
                </span>
              </div>
            ) : (
              <p className="text-xs text-[#736c62]">{t.nextSlot.none}</p>
            )}
          </div>

          <div className="pt-4 border-t border-[#e4dacb] flex items-center justify-between text-xs font-semibold text-[#c96442] group-hover:text-[#a94f32] transition-colors">
            <span>{t.nextSlot.bookNow}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* CARD 3: 1x1 Typewriter Butter Yellow Text Card */}
        <div className="col-span-1 rounded-3xl p-6 bg-[#f1e6c0] border border-[#e4dacb] card-hover-luxury flex flex-col justify-between shadow-xs">
          <span className="text-[10px] uppercase font-typewriter tracking-[0.2em] text-[#736c62]">
            Philosophy
          </span>
          <blockquote className="font-editorial text-lg sm:text-xl text-[#211f1c] leading-snug my-2 italic">
            "{SALON_CONFIG.sloganEn}"
          </blockquote>
          <span className="text-[11px] font-typewriter text-[#736c62]">
            Arbenstrasse · 8055 Zürich
          </span>
        </div>

        {/* CARD 4: 1x1 Cancellation Rule Note Card */}
        <div className="col-span-1 rounded-3xl p-6 bg-[#f5e1d5]/50 border border-dashed border-[#c96442]/40 card-hover-luxury flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#c96442] mb-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider font-typewriter">
              {t.cancelRule.title}
            </span>
          </div>
          <p className="text-sm font-semibold text-[#2e231c] leading-snug">
            {t.cancelRule.text}
          </p>
          <p className="text-xs text-[#736c62] mt-2 leading-relaxed">
            {t.cancelRule.detail}
          </p>
        </div>

        {/* CARD 5: 1x1 Opening Hours Card with Live Status Badge */}
        <div className="col-span-1 rounded-3xl p-6 bg-[#fbf8f2] border border-[#e4dacb] card-hover-luxury flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase font-typewriter tracking-widest text-[#736c62]">
                {t.hours.title}
              </span>
              {/* Live Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  isOpenNow
                    ? 'bg-[#587a4f]/15 text-[#587a4f] border border-[#587a4f]/30'
                    : 'bg-[#b0473a]/10 text-[#b0473a] border border-[#b0473a]/25'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOpenNow ? 'bg-[#587a4f] animate-pulse' : 'bg-[#b0473a]'
                  }`}
                />
                {isOpenNow ? t.hours.nowOpen : t.hours.closed}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {SALON_CONFIG.openingHours.map((oh) => {
                const isToday = oh.day === currentDayIndex;
                return (
                  <div
                    key={oh.day}
                    className={`flex justify-between py-0.5 px-1 rounded-md transition-colors ${
                      isToday
                        ? 'bg-[#f1e6c0]/70 font-semibold text-[#2e231c]'
                        : 'text-[#45413b]'
                    }`}
                  >
                    <span>{language === 'de' ? oh.nameDe : oh.nameTr}</span>
                    <span>
                      {oh.isOpen ? `${oh.openTime} – ${oh.closeTime}` : (language === 'de' ? 'Geschlossen' : 'Kapalı')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-[#736c62] pt-2 border-t border-[#e4dacb]">
            {t.hours.lunchNote}
          </div>
        </div>

        {/* CARD 6: 2x1 Address & Map Navigation Card */}
        <div className="md:col-span-2 rounded-3xl p-6 bg-[#fbf8f2] border border-[#e4dacb] card-hover-luxury flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#736c62] text-[11px] uppercase font-typewriter tracking-widest">
              <MapPin className="w-3.5 h-3.5 text-[#d4a24c]" />
              <span>{t.location.title}</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-[#2e231c]">
              {SALON_CONFIG.address.street}
            </h3>
            <p className="text-xs text-[#736c62]">
              {SALON_CONFIG.address.postalCode} {SALON_CONFIG.address.city} · Zürich Albisrieden / Friesenberg
            </p>
          </div>
          <a
            href={SALON_CONFIG.address.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2e231c] hover:bg-[#453830] text-xs font-semibold text-[#f1e6c0] shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442]"
          >
            <Compass className="w-4 h-4 text-[#d4a24c]" />
            <span>{t.location.directions}</span>
          </a>
        </div>

        {/* CARD 7: 2x1 Featured Work Showcase (3 photos + link) */}
        <div className="md:col-span-2 rounded-3xl p-6 bg-[#fbf8f2] border border-[#e4dacb] card-hover-luxury flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] uppercase font-typewriter tracking-widest text-[#736c62]">
              {t.featuredWork.title}
            </span>
            <Link
              to="/arbeiten"
              className="text-xs font-semibold text-[#c96442] hover:text-[#a94f32] transition-colors inline-flex items-center gap-1"
            >
              {t.featuredWork.allLink}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {featuredPhotos.map((item) => (
              <Link
                key={item.id}
                to="/arbeiten"
                className="relative aspect-square rounded-2xl overflow-hidden bg-[#2e231c] group shadow-xs"
              >
                <img
                  src={item.image}
                  alt={language === 'de' ? item.titleDe : item.titleTr}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2e231c]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex items-end">
                  <span className="text-[11px] text-[#f4efe6] font-medium truncate">
                    {language === 'de' ? item.titleDe : item.titleTr}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CARD 8: 2x1 Top 3 Featured Services */}
        <div className="md:col-span-2 rounded-3xl p-6 bg-[#2e231c] text-[#f4efe6] card-hover-luxury flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase font-typewriter tracking-widest text-[#d4a24c]">
                {t.featuredServices.title}
              </span>
              <Link
                to="/leistungen"
                className="text-xs font-semibold text-[#f1e6c0] hover:text-white transition-colors"
              >
                {t.featuredServices.allLink}
              </Link>
            </div>

            <div className="space-y-3">
              {featuredServices.map((srv) => (
                <div
                  key={srv.id}
                  className="flex items-center justify-between py-2 border-b border-[#45413b] last:border-0 hover:bg-[#3a2e26]/50 px-2 rounded-xl transition-colors"
                >
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#f4efe6]">
                      {language === 'de' ? srv.nameDe : srv.nameTr}
                    </h4>
                    <span className="text-xs text-[#a0988b]">
                      {srv.durationMinutes} Min
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-[#f1e6c0]">
                      CHF {srv.priceChf}.–
                    </span>
                    <Link
                      to={`/buchen?service=${srv.id}`}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#c96442] hover:bg-[#a94f32] text-white shadow-xs transition-all active:scale-95"
                    >
                      Buchen
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
