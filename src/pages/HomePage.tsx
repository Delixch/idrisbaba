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
          <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 p-6 sm:p-8 rounded-2xl bg-[#16120f]/85 backdrop-blur-md border border-[#d4a24c]/30 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]" />
              <span className="text-[11px] uppercase font-typewriter tracking-[0.25em] text-[#d4a24c] font-semibold">
                Haute Coiffure · Zürich
              </span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#f7f3ec] leading-[1.12] mb-1">
              {SALON_CONFIG.name}
            </h1>

            {/* Custom Luxury Font Slogan */}
            <p className="font-editorial text-xl sm:text-2xl text-[#fbbf24] italic tracking-wide mb-3">
              "{SALON_CONFIG.sloganEn}"
            </p>

            <p className="text-xs sm:text-sm text-[#d4ccc0] font-sans mb-6 max-w-lg leading-relaxed">
              {language === 'de' ? SALON_CONFIG.sloganDe : SALON_CONFIG.sloganTr}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/buchen"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-[#12100e] bg-gradient-to-r from-[#fbbf24] to-[#d4a24c] hover:from-[#f59e0b] hover:to-[#b45309] rounded-full shadow-lg transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4 text-[#12100e]" />
                {t.hero.cta}
              </Link>
              <Link
                to="/arbeiten"
                className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-medium text-[#f7f3ec] bg-[#241e19]/90 hover:bg-[#342a22] border border-[#d4a24c]/40 rounded-full transition-colors"
              >
                {t.hero.explore}
              </Link>
            </div>
          </div>
        </div>

        {/* CARD 2: 1x1 "Nächster freier Termin" Card (Live Calendar Check) */}
        <div
          onClick={handleNextSlotClick}
          className="col-span-1 p-6 luxury-glow-card shimmer-hover cursor-pointer flex flex-col justify-between group overflow-hidden bg-[#16120f]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4ade80]/5 rounded-bl-full pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase font-typewriter tracking-widest text-[#9e9486]">
                {t.nextSlot.title}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#4ade80]/15 flex items-center justify-center text-[#4ade80] relative border border-[#4ade80]/30">
                <span className="absolute w-2.5 h-2.5 rounded-full bg-[#4ade80] live-pulse" />
                <Clock className="w-4 h-4 relative z-10" />
              </div>
            </div>

            {loadingNextSlot ? (
              <p className="text-sm text-[#9e9486] animate-pulse">{t.nextSlot.loading}</p>
            ) : nextSlot?.nextSlotIso ? (
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-display font-bold text-[#f7f3ec] block tracking-tight">
                  {nextSlot.timeFormatted} <span className="text-sm font-normal font-sans text-[#9e9486]">Uhr</span>
                </span>
                <span className="text-xs text-[#4ade80] font-semibold block flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                  {language === 'de' ? nextSlot.dateFormattedDe : nextSlot.dateFormattedTr}
                </span>
              </div>
            ) : (
              <p className="text-xs text-[#9e9486]">{t.nextSlot.none}</p>
            )}
          </div>

          <div className="pt-4 border-t border-[#2d2621] flex items-center justify-between text-xs font-semibold text-[#fbbf24] group-hover:text-[#f59e0b] transition-colors relative z-10">
            <span>{t.nextSlot.bookNow}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5" />
          </div>
        </div>

        {/* CARD 3: 1x1 Typewriter Dark Gold Text Card */}
        <div className="col-span-1 p-6 bg-[#1a140f] luxury-glow-card shimmer-hover flex flex-col justify-between shadow-lg">
          <span className="text-[10px] uppercase font-typewriter tracking-[0.2em] text-[#d4a24c]">
            Philosophy
          </span>
          <blockquote className="font-editorial text-lg sm:text-xl text-[#f7f3ec] leading-snug my-2 italic">
            "{SALON_CONFIG.sloganEn}"
          </blockquote>
          <span className="text-[11px] font-typewriter text-[#9e9486]">
            Arbenstrasse · 8055 Zürich
          </span>
        </div>

        {/* CARD 4: 1x1 Cancellation Rule Note Card */}
        <div className="col-span-1 p-6 bg-[#211612] border border-[#d97746]/40 luxury-glow-card flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#d97746] mb-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider font-typewriter">
              {t.cancelRule.title}
            </span>
          </div>
          <p className="text-sm font-semibold text-[#f7f3ec] leading-snug">
            {t.cancelRule.text}
          </p>
          <p className="text-xs text-[#d4ccc0] mt-2 leading-relaxed">
            {t.cancelRule.detail}
          </p>
        </div>

        {/* CARD 5: 1x1 Opening Hours Card with Live Status Badge */}
        <div className="col-span-1 p-6 luxury-glow-card flex flex-col justify-between bg-[#16120f]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase font-typewriter tracking-widest text-[#9e9486]">
                {t.hours.title}
              </span>
              {/* Live Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  isOpenNow
                    ? 'bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30'
                    : 'bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOpenNow ? 'bg-[#4ade80] animate-pulse' : 'bg-[#ef4444]'
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
                    className={`flex justify-between py-1 px-1.5 rounded-md transition-colors ${
                      isToday
                        ? 'bg-[#241e19] text-[#fbbf24] font-semibold border border-[#d4a24c]/30'
                        : 'text-[#d4ccc0]'
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
          <div className="text-[10px] text-[#9e9486] pt-2 border-t border-[#2d2621]">
            {t.hours.lunchNote}
          </div>
        </div>

        {/* CARD 6: 2x1 Address & Map Navigation Card */}
        <div className="md:col-span-2 p-6 luxury-glow-card shimmer-hover flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-[#16120f]">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-[#d4a24c] text-[11px] uppercase font-typewriter tracking-widest font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>{t.location.title}</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-[#f7f3ec]">
              {SALON_CONFIG.address.street}
            </h3>
            <p className="text-xs text-[#9e9486]">
              {SALON_CONFIG.address.postalCode} {SALON_CONFIG.address.city} · Zürich Albisrieden / Friesenberg
            </p>
          </div>
          <a
            href={SALON_CONFIG.address.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d4a24c] hover:from-[#f59e0b] hover:to-[#b45309] text-xs font-bold text-[#12100e] shadow-lg transition-all focus-visible:outline-none relative z-10"
          >
            <Compass className="w-4 h-4 text-[#12100e]" />
            <span>{t.location.directions}</span>
          </a>
        </div>

        {/* CARD 7: 2x1 Featured Work Showcase (3 photos + link) */}
        <div className="md:col-span-2 p-6 luxury-glow-card flex flex-col justify-between bg-[#16120f]">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-[11px] uppercase font-typewriter tracking-widest text-[#d4a24c]">
              {t.featuredWork.title}
            </span>
            <Link
              to="/arbeiten"
              className="text-xs font-semibold text-[#fbbf24] hover:text-[#f59e0b] transition-colors inline-flex items-center gap-1"
            >
              {t.featuredWork.allLink}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 relative z-10">
            {featuredPhotos.map((item) => (
              <Link
                key={item.id}
                to="/arbeiten"
                className="relative aspect-square rounded-2xl overflow-hidden bg-[#0d0b0a] group shadow-md border border-[#2d2621]"
              >
                <img
                  src={item.image}
                  alt={language === 'de' ? item.titleDe : item.titleTr}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b0a]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex items-end">
                  <span className="text-[11px] text-[#f7f3ec] font-medium truncate">
                    {language === 'de' ? item.titleDe : item.titleTr}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CARD 8: 2x1 Top 3 Featured Services */}
        <div className="md:col-span-2 p-6 bg-[#16120f] text-[#f7f3ec] luxury-glow-card flex flex-col justify-between shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase font-typewriter tracking-widest text-[#d4a24c]">
                {t.featuredServices.title}
              </span>
              <Link
                to="/leistungen"
                className="text-xs font-semibold text-[#fbbf24] hover:text-white transition-colors"
              >
                {t.featuredServices.allLink}
              </Link>
            </div>

            <div className="space-y-3">
              {featuredServices.map((srv) => (
                <div
                  key={srv.id}
                  className="flex items-center justify-between py-2 border-b border-[#2d2621] last:border-0 hover:bg-[#241e19]/60 px-2 rounded-xl transition-colors"
                >
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#f7f3ec]">
                      {language === 'de' ? srv.nameDe : srv.nameTr}
                    </h4>
                    <span className="text-xs text-[#9e9486]">
                      {srv.durationMinutes} Min
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-[#fbbf24]">
                      CHF {srv.priceChf}.–
                    </span>
                    <Link
                      to={`/buchen?service=${srv.id}`}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#fbbf24] to-[#d4a24c] hover:from-[#f59e0b] hover:to-[#b45309] text-[#12100e] shadow-md transition-all active:scale-95"
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
