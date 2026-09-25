import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { SALON_CONFIG } from '../../salon.config.js';
import { Shield } from 'lucide-react';

export const DatenschutzPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
        
        <div>
          <span className="text-[11px] uppercase font-typewriter tracking-[0.2em] text-[#736c62] block mb-2">
            Schweizer Datenschutzgesetz (revDSG)
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2e231c]">
            {language === 'de' ? 'Datenschutzerklärung' : 'Gizlilik Politikası'}
          </h1>
          <p className="text-xs text-[#736c62] mt-2">
            Stand: September 2026 · {SALON_CONFIG.name}, {SALON_CONFIG.address.city}
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#45413b] leading-relaxed">
          <section>
            <h2 className="font-serif text-lg font-semibold text-[#2e231c] mb-2">
              1. Verantwortliche Stelle
            </h2>
            <p>
              Verantwortlich für die Datenbearbeitungen im Sinne des Bundesgesetzes über den Datenschutz (revDSG) ist:<br />
              <strong>{SALON_CONFIG.name}</strong><br />
              {SALON_CONFIG.address.street}<br />
              {SALON_CONFIG.address.postalCode} {SALON_CONFIG.address.city}, Schweiz<br />
              E-Mail: {SALON_CONFIG.contact.email}<br />
              Telefon: {SALON_CONFIG.contact.phone}
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-[#2e231c] mb-2">
              2. Datenerhebung bei der Online-Terminbuchung
            </h2>
            <p>
              Wir erheben ausschliesslich jene Daten, die für die Durchführung des Coiffure-Termins und die allfällige Rechnungsstellung bei unentschuldigtem Nichterscheinen erforderlich sind:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-[#736c62]">
              <li>Vor- und Nachname</li>
              <li>Mobiltelefonnummer (für Terminerinnerungen und Rückfragen)</li>
              <li>E-Mail-Adresse (für Bestätigungscode, Terminbestätigung und Kalendereintrag)</li>
              <li>Wohnadresse (Strasse, Hausnummer, Postleitzahl, Ort für die Rechnungsadresse)</li>
              <li>Zeitpunkt der Zustimmung zur Ausfallgebühr-Regelung</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-[#2e231c] mb-2">
              3. Google Calendar &amp; Drittanbieter
            </h2>
            <p>
              Zur Verwaltung der Salonkapazitäten werden die Termindaten mit unserem Google Calendar synchronisiert. Es werden keine unbeteiligten Marketing-Tracker oder Tracking-Cookies gesetzt.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-[#2e231c] mb-2">
              4. Speicherdauer &amp; Löschung
            </h2>
            <p>
              Gemäss den Grundsätzen des revDSG werden Termindaten nach Ablauf der gesetzlichen Aufbewahrungsfristen (maximal 2 Jahre für Rechnungs- und Buchungsnachweise) gelöscht.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold text-[#2e231c] mb-2">
              5. Ihre Rechte
            </h2>
            <p>
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.
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
