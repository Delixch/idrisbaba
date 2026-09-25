import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { GalleryItem } from '../../galeri.config.js';
import { SALON_CONFIG } from '../../salon.config.js';
import { X, Calendar } from 'lucide-react';

interface LightboxProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ item, onClose }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const title = language === 'de' ? item.titleDe : item.titleTr;
  const subtitle = language === 'de' ? item.subtitleDe : item.subtitleTr;
  const matchedService = SALON_CONFIG.services.find((s) => s.id === item.relatedServiceId);

  const handleBookLook = () => {
    onClose();
    if (item.relatedServiceId) {
      navigate(`/buchen?service=${item.relatedServiceId}`);
    } else {
      navigate('/buchen');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#211f1c]/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-[#fbf8f2] border border-[#e4dacb] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#2e231c]/75 text-[#f4efe6] hover:bg-[#2e231c] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442]"
          aria-label="Schliessen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Slot */}
        <div className="relative aspect-4/3 w-full bg-[#2e231c] overflow-hidden">
          <img
            src={item.image}
            alt={title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="px-2.5 py-1 bg-[#2e231c]/80 backdrop-blur-xs text-[#f1e6c0] text-[11px] uppercase font-typewriter tracking-widest rounded-full">
              {item.category}
            </span>
          </div>
        </div>

        {/* Body Details */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4dacb]">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2e231c]">
                {title}
              </h3>
              <p className="text-sm text-[#736c62] mt-1 font-sans">
                {subtitle}
              </p>
            </div>
            {matchedService && (
              <div className="text-right sm:self-center">
                <span className="text-xs text-[#736c62] block font-typewriter uppercase">
                  {language === 'de' ? 'Empfohlene Leistung' : 'Önerilen Hizmet'}
                </span>
                <span className="text-sm font-semibold text-[#2e231c] font-sans">
                  CHF {matchedService.priceChf}.– · {matchedService.durationMinutes} Min
                </span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-[#45413b] hover:bg-[#efe8dc] border border-[#e4dacb] rounded-full transition-colors"
            >
              {language === 'de' ? 'Schliessen' : 'Kapat'}
            </button>
            <button
              onClick={handleBookLook}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#c96442] hover:bg-[#a94f32] rounded-full shadow-xs transition-all active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              {t.gallery.bookThisLook}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
