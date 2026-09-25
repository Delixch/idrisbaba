import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { GALERI_CONFIG, GalleryItem } from '../../galeri.config.js';
import { SALON_CONFIG } from '../../salon.config.js';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider.js';
import { Lightbox } from '../components/Lightbox.js';
import { Instagram, ArrowUpRight, Sparkles } from 'lucide-react';

export const ArbeitenPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'all', label: t.gallery.filterAll },
    { id: 'schnitt', label: t.gallery.filterSchnitt },
    { id: 'farbe', label: t.gallery.filterFarbe },
    { id: 'balayage', label: t.gallery.filterBalayage },
    { id: 'pflege', label: t.gallery.filterPflege },
    { id: 'hochzeit', label: t.gallery.filterHochzeit },
  ];

  const filteredItems = GALERI_CONFIG.items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header & Category Filter */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[11px] uppercase font-typewriter tracking-[0.25em] text-[#d4a24c] block mb-2 font-semibold">
          Portfolio &amp; Hair Rituals
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#f7f3ec]">
          {t.gallery.title}
        </h1>
        <p className="font-editorial text-lg sm:text-xl text-[#fbbf24] italic mt-2">
          "{SALON_CONFIG.sloganEn}"
        </p>
        <p className="text-xs sm:text-sm text-[#d4ccc0] mt-3 font-sans leading-relaxed">
          {t.gallery.subtitle}
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:outline-none ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#fbbf24] to-[#d4a24c] text-[#12100e] shadow-md shadow-amber-500/20'
                  : 'bg-[#1a1613] border border-[#2d2621] text-[#d4ccc0] hover:border-[#d4a24c]/40 hover:text-[#fbbf24]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(240px,auto)]">
        {filteredItems.map((item, index) => {
          const title = language === 'de' ? item.titleDe : item.titleTr;
          const subtitle = language === 'de' ? item.subtitleDe : item.subtitleTr;

          // Before/After 2x1 Card
          if (item.isBeforeAfter && item.beforeImage && item.afterImage) {
            return (
              <div
                key={item.id}
                className="col-span-1 md:col-span-2 row-span-1 rounded-2xl overflow-hidden border border-[#e4dacb] shadow-xs hover:border-[#d3c6b3] transition-all"
              >
                <BeforeAfterSlider
                  beforeImage={item.beforeImage}
                  afterImage={item.afterImage}
                  title={title}
                  subtitle={subtitle}
                />
              </div>
            );
          }

          // Portrait 1x2 Card vs Standard 1x1 Card
          const isPortrait = item.aspect === 'portrait';

          return (
            <React.Fragment key={item.id}>
              {/* Regular Bento Photo Card */}
              <div
                onClick={() => setActiveLightboxItem(item)}
                className={`relative rounded-2xl overflow-hidden bg-[#2e231c] border border-[#e4dacb] card-hover-luxury group cursor-pointer shadow-xs ${
                  isPortrait ? 'col-span-1 md:row-span-2 min-h-[360px]' : 'col-span-1 min-h-[240px]'
                }`}
              >
                <img
                  src={item.image}
                  alt={title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 bg-[#2e231c]/70 backdrop-blur-xs text-[#f1e6c0] text-[10px] uppercase font-typewriter tracking-widest rounded-md">
                    {item.category}
                  </span>
                </div>

                {/* Bottom Overlay Scrim */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#2e231c]/85 via-[#2e231c]/40 to-transparent transition-opacity opacity-90 group-hover:opacity-100">
                  <h4 className="font-serif text-sm font-semibold text-[#f4efe6] leading-snug">
                    {title}
                  </h4>
                  <p className="text-xs text-[#f4efe6]/80 mt-0.5 line-clamp-1">
                    {subtitle}
                  </p>
                </div>
              </div>

              {/* Interspersed Typewriter Text Card every 6 items */}
              {index === 3 && (
                <div className="col-span-1 p-6 bg-[#1a140f] luxury-glow-card flex flex-col justify-between shadow-lg">
                  <span className="text-[10px] uppercase font-typewriter tracking-[0.2em] text-[#d4a24c]">
                    {GALERI_CONFIG.quotes[0].authorDe}
                  </span>
                  <p className="font-editorial text-xl text-[#f7f3ec] leading-relaxed my-3 font-semibold italic">
                    "{language === 'de' ? GALERI_CONFIG.quotes[0].quoteDe : GALERI_CONFIG.quotes[0].quoteTr}"
                  </p>
                  <span className="text-[11px] font-typewriter text-[#9e9486]">
                    Signature Care
                  </span>
                </div>
              )}

              {index === 8 && (
                <div className="col-span-1 md:col-span-2 p-6 bg-[#16120f] luxury-glow-card flex flex-col justify-between shadow-lg">
                  <span className="text-[10px] uppercase font-typewriter tracking-[0.2em] text-[#d4a24c]">
                    {GALERI_CONFIG.quotes[1].authorDe}
                  </span>
                  <p className="font-editorial text-lg sm:text-xl text-[#f7f3ec] leading-relaxed my-3 italic">
                    "{language === 'de' ? GALERI_CONFIG.quotes[1].quoteDe : GALERI_CONFIG.quotes[1].quoteTr}"
                  </p>
                  <span className="text-[11px] font-typewriter text-[#9e9486]">
                    Idris Hacimustafaoglu · Zürich
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Ending Card: Instagram Connection */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 p-8 luxury-glow-card shimmer-hover flex flex-col sm:flex-row items-center justify-between gap-6 mt-4 bg-[#16120f]">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-[#241e19] flex items-center justify-center text-[#fbbf24] border border-[#fbbf24]/40 shadow-md">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#f7f3ec]">
                @{SALON_CONFIG.contact.instagram}
              </h3>
              <p className="text-xs text-[#9e9486]">
                {t.gallery.instagramFollow}
              </p>
            </div>
          </div>
          <a
            href={SALON_CONFIG.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d4a24c] hover:from-[#f59e0b] hover:to-[#b45309] text-xs font-bold text-[#12100e] transition-all shadow-lg relative z-10"
          >
            <span>Instagram öffnen</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        item={activeLightboxItem}
        onClose={() => setActiveLightboxItem(null)}
      />
    </div>
  );
};
