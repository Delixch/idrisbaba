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
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2e231c]">
          {t.gallery.title}
        </h1>
        <p className="font-editorial text-lg sm:text-xl text-[#c96442] italic mt-2">
          "{SALON_CONFIG.sloganEn}"
        </p>
        <p className="text-xs sm:text-sm text-[#45413b] mt-3 font-sans leading-relaxed">
          {t.gallery.subtitle}
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442] ${
                selectedCategory === cat.id
                  ? 'bg-[#2e231c] text-[#f4efe6] shadow-xs'
                  : 'bg-[#fbf8f2] border border-[#e4dacb] text-[#45413b] hover:bg-[#efe8dc]'
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
                <div className="col-span-1 rounded-2xl p-6 bg-[#f1e6c0] border border-[#e4dacb] flex flex-col justify-between shadow-xs">
                  <span className="text-[10px] uppercase font-typewriter tracking-[0.2em] text-[#736c62]">
                    {GALERI_CONFIG.quotes[0].authorDe}
                  </span>
                  <p className="font-typewriter text-lg text-[#211f1c] leading-relaxed my-3 font-semibold">
                    "{language === 'de' ? GALERI_CONFIG.quotes[0].quoteDe : GALERI_CONFIG.quotes[0].quoteTr}"
                  </p>
                  <span className="text-[11px] font-typewriter text-[#736c62]">
                    Signature Care
                  </span>
                </div>
              )}

              {index === 8 && (
                <div className="col-span-1 md:col-span-2 rounded-2xl p-6 bg-[#efe8dc] border border-[#d3c6b3] flex flex-col justify-between shadow-xs">
                  <span className="text-[10px] uppercase font-typewriter tracking-[0.2em] text-[#736c62]">
                    {GALERI_CONFIG.quotes[1].authorDe}
                  </span>
                  <p className="font-typewriter text-base sm:text-lg text-[#2e231c] leading-relaxed my-3">
                    "{language === 'de' ? GALERI_CONFIG.quotes[1].quoteDe : GALERI_CONFIG.quotes[1].quoteTr}"
                  </p>
                  <span className="text-[11px] font-typewriter text-[#736c62]">
                    Revair Atelier · Zürich
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Ending Card: Instagram Connection */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl p-8 bg-[#2e231c] text-[#f4efe6] flex flex-col sm:flex-row items-center justify-between gap-6 mt-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f1e6c0] flex items-center justify-center text-[#2e231c]">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#f4efe6]">
                @{SALON_CONFIG.contact.instagram}
              </h3>
              <p className="text-xs text-[#a0988b]">
                {t.gallery.instagramFollow}
              </p>
            </div>
          </div>
          <a
            href={SALON_CONFIG.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c96442] hover:bg-[#a94f32] text-xs font-semibold text-white transition-all shadow-xs"
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
