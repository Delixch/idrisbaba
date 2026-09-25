import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { SALON_CONFIG } from '../../salon.config.js';

export const ImpressumPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
        
        <div>
          <span className="text-[11px] uppercase font-typewriter tracking-[0.2em] text-[#736c62] block mb-2">
            Rechtliche Angaben
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2e231c]">
            {language === 'de' ? 'Impressum' : 'Künye (Impressum)'}
          </h1>
          <p className="text-xs text-[#736c62] mt-2">
            Angaben gemäss Schweizer Recht
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#45413b] leading-relaxed">
          <section>
            <h2 className="font-serif text-lg font-semibold text-[#2e231c] mb-2">
              Salon &amp; Betreiber
            </h2>
            <p>
              <strong>{SALON_CONFIG.name}</strong><br />
              Inhaber: Idris Hacimustafaoglu<br />
              {SALON_CONFIG.address.street}<br />
              {SALON_CONFIG.address.postalCode} {SALON_CONFIG.address.city}<br />
              Schweiz
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-[#2e231c] mb-2">
              Kontakt
            </h2>
            <p>
              E-Mail: {SALON_CONFIG.contact.email}<br />
              Terminbuchung: Online über Google Appointments &amp; Direktsystem
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-[#2e231c] mb-2">
              Unternehmensidentifikation (UID)
            </h2>
            <p className="text-xs text-[#736c62]">
              CHE-412.890.315 (Einzelunternehmen im Handelsregister des Kantons Zürich)
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-[#2e231c] mb-2">
              Haftungsausschluss
            </h2>
            <p className="text-xs text-[#736c62]">
              Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen. Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen entstehen, werden ausgeschlossen.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-[#e4dacb]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#c96442] hover:text-[#a94f32]"
          >
            ← Zurück zur Startseite
          </Link>
        </div>

      </div>
    </div>
  );
};
