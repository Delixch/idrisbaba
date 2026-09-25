import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { SALON_CONFIG, ServiceItem } from '../../salon.config.js';
import { Scissors, Palette, Sparkles, HeartHandshake, Crown, Info, CheckCircle2 } from 'lucide-react';

export const LeistungenPage: React.FC = () => {
  const { language, t } = useLanguage();

  const categoriesConfig = [
    {
      id: 'schnitt',
      nameDe: 'Schnitt & Styling',
      nameTr: 'Kesim & Şekillendirme',
      icon: Scissors,
      descDe: 'Präzisionshaarschnitt nach Typ und massgeschneidertes Föhnstyling.',
      descTr: 'Kişiye özel saç kesimi ve hacimli fön.',
    },
    {
      id: 'farbe',
      nameDe: 'Farbe & Nuancen',
      nameTr: 'Boya & Renk Tonları',
      icon: Palette,
      descDe: 'Schonende Farbveredelung, lebendige Reflexe und seidenweicher Glanz.',
      descTr: 'Zarar vermeyen renk tonlama, canlı ışıltılar ve ipeksi parlaklık.',
    },
    {
      id: 'balayage',
      nameDe: 'Balayage & Highlights',
      nameTr: 'Balyaj & Işıltılar',
      icon: Sparkles,
      descDe: 'Freihandverläufe mit natürlichem Sonnenkuss-Effekt und Tiefenwirkung.',
      descTr: 'Doğal güneş ışıltılı serbest geçişler ve derinlikli röfle.',
    },
    {
      id: 'pflege',
      nameDe: 'Pflege & Scalp Treatments',
      nameTr: 'Bakım & Saç Derisi Terapileri',
      icon: HeartHandshake,
      descDe: 'Tiefenwirksame Botaniköle und Keratin-Kuren für gesunde Haarfaserbindung.',
      descTr: 'Derinlemesine etkili botanik yağlar ve keratin terapileri.',
    },
    {
      id: 'hochzeit',
      nameDe: 'Hochzeit & Eventfrisuren',
      nameTr: 'Gelin & Özel Davet Tasarımı',
      icon: Crown,
      descDe: 'Exklusive Brautstylings mit Probe und elegante Gala-Hochsteckfrisuren.',
      descTr: 'Özel prova seanslı gelin tasarımları ve davet topuzları.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[11px] uppercase font-typewriter tracking-[0.25em] text-[#d4a24c] block mb-2 font-semibold">
          Preise &amp; Rituale · ZÜRICH 8055
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#f7f3ec]">
          {t.services.title}
        </h1>
        <p className="font-editorial text-xl text-[#fbbf24] italic mt-2">
          "{SALON_CONFIG.sloganEn}"
        </p>
        <p className="text-xs sm:text-sm text-[#d4ccc0] mt-3 font-sans leading-relaxed">
          {t.services.subtitle}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Category Cards */}
        {categoriesConfig.map((cat) => {
          const categoryServices = SALON_CONFIG.services.filter(
            (s) => s.category === cat.id
          );
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              className="p-6 sm:p-7 luxury-glow-card shimmer-hover flex flex-col justify-between bg-[#16120f]"
            >
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#241e19] flex items-center justify-center text-[#fbbf24] border border-[#d4a24c]/40">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#f7f3ec]">
                    {language === 'de' ? cat.nameDe : cat.nameTr}
                  </h3>
                </div>
                <p className="text-xs text-[#9e9486] mb-6">
                  {language === 'de' ? cat.descDe : cat.descTr}
                </p>

                {/* Service Rows */}
                <div className="space-y-4">
                  {categoryServices.map((service, idx) => (
                    <div
                      key={service.id}
                      className={`pt-3 ${
                        idx !== 0 ? 'border-t border-dashed border-[#2d2621]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-serif text-sm font-semibold text-[#f7f3ec]">
                            {language === 'de' ? service.nameDe : service.nameTr}
                          </h4>
                          <p className="text-xs text-[#9e9486] mt-0.5 leading-relaxed">
                            {language === 'de' ? service.descriptionDe : service.descriptionTr}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#d4ccc0]">
                            <span className="font-typewriter text-[11px] text-[#fbbf24]">
                              {service.durationMinutes} Min.
                            </span>
                          </div>
                        </div>

                        {/* Price & Book Action */}
                        <div className="text-right shrink-0">
                          <span className="font-mono text-sm font-semibold text-[#fbbf24] block">
                            CHF {service.priceChf}.–
                          </span>
                          <Link
                            to={`/buchen?service=${service.id}`}
                            className="inline-block mt-1 text-xs font-bold text-[#fbbf24] hover:text-[#f59e0b] transition-colors"
                          >
                            {t.services.bookService} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Bento Card: "Gut zu wissen" (Good to know) */}
        <div className="rounded-3xl p-6 sm:p-7 bg-[#2e231c] text-[#f4efe6] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#d4a24c]">
              <Info className="w-5 h-5" />
              <h3 className="font-serif text-xl font-semibold text-[#f4efe6]">
                {t.services.goodToKnowTitle}
              </h3>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-[#f4efe6]/90">
              <div className="p-3.5 rounded-xl bg-[#3a2e26] border border-[#45413b]">
                <strong className="text-[#f1e6c0] block mb-1">
                  {language === 'de' ? 'Ausfallgebühr (revDSG):' : 'Gelmeme & İptal Kuralı:'}
                </strong>
                <p className="text-[#a0988b]">
                  {language === 'de' ? SALON_CONFIG.noShowRuleDe : SALON_CONFIG.noShowRuleTr}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#3a2e26] border border-[#45413b]">
                <strong className="text-[#f1e6c0] block mb-1">
                  {language === 'de' ? 'Zahlungsmittel:' : 'Ödeme Seçenekleri:'}
                </strong>
                <p className="text-[#a0988b]">
                  {language === 'de'
                    ? SALON_CONFIG.paymentMethodsDe.join(' · ')
                    : SALON_CONFIG.paymentMethodsTr.join(' · ')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#3a2e26] border border-[#45413b]">
                <strong className="text-[#f1e6c0] block mb-1">
                  {language === 'de' ? 'Pünktlichkeit & Zeit:' : 'Zamanında Varış:'}
                </strong>
                <p className="text-[#a0988b]">
                  {t.services.goodToKnowRule3}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-[#45413b]">
            <Link
              to="/buchen"
              className="w-full flex items-center justify-center py-3 text-xs font-semibold text-white bg-[#c96442] hover:bg-[#a94f32] rounded-full shadow-xs transition-all"
            >
              {t.nav.buchen}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
