import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { SALON_CONFIG } from '../../salon.config.js';
import { AlertTriangle, Calendar, Phone, CheckCircle, Clock, MapPin, XCircle } from 'lucide-react';

interface AppointmentData {
  id: string;
  serviceName: string;
  customerName: string;
  priceChf: number;
  startIso: string;
  endIso: string;
  isUnder24Hours: boolean;
  hoursUntilAppointment: number;
  noShowRuleDe: string;
  noShowRuleTr: string;
}

export const MeinTerminPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { language, t } = useLanguage();

  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg(
        language === 'de'
          ? 'Ungültiger Link. Bitte rufen Sie uns an: ' + SALON_CONFIG.contact.phone
          : 'Geçersiz bağlantı. Lütfen bizi arayın: ' + SALON_CONFIG.contact.phone
      );
      setLoading(false);
      return;
    }

    fetch(`/api/appointment/${token}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((d) => {
            throw new Error(language === 'de' ? d.error : d.errorTr || d.error);
          });
        }
        return res.json();
      })
      .then((data) => {
        setAppointment(data.appointment);
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Termin konnte nicht aufgerufen werden.');
      })
      .finally(() => setLoading(false));
  }, [token, language]);

  const handleCancelAppointment = async () => {
    if (!token) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/appointment/${token}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(language === 'de' ? data.error : data.errorTr || 'Stornierung fehlgeschlagen');
        setIsCancelling(false);
        return;
      }
      setIsCancelled(true);
      setShowConfirmModal(false);
    } catch {
      alert('Netzwerkfehler.');
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-xs text-[#736c62] animate-pulse">
        Termindaten werden aus Salon-System geladen...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#b0473a]/15 text-[#b0473a] flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#2e231c]">
            {language === 'de' ? 'Termin nicht verfügbar' : 'Randevu Bulunamadı'}
          </h2>
          <p className="text-sm text-[#45413b] leading-relaxed">
            {errorMsg}
          </p>
          <div className="pt-4 border-t border-[#e4dacb]">
            <a
              href={`tel:${SALON_CONFIG.contact.phone}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2e231c] text-[#f4efe6] text-xs font-semibold hover:bg-[#3a2e26]"
            >
              <Phone className="w-3.5 h-3.5 text-[#d4a24c]" />
              <span>{SALON_CONFIG.contact.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-8 text-center space-y-4 shadow-xs animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-[#587a4f]/15 text-[#587a4f] flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#2e231c]">
            {t.manage.cancelledTitle}
          </h2>
          <p className="text-sm text-[#45413b] leading-relaxed">
            {t.manage.cancelledText}
          </p>
          <div className="pt-4">
            <Link
              to="/buchen"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c96442] hover:bg-[#a94f32] text-white text-xs font-semibold shadow-xs"
            >
              {t.manage.bookNew}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <span className="text-[11px] uppercase font-typewriter tracking-[0.2em] text-[#736c62] block mb-2">
          REVAIR STUDIO ZÜRICH
        </span>
        <h1 className="font-serif text-3xl font-semibold text-[#2e231c]">
          {t.manage.title}
        </h1>
        <p className="text-xs text-[#736c62] mt-1 font-sans">
          {t.manage.subtitle}
        </p>
      </div>

      {/* Appointment Summary Box */}
      <div className="bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Warning if under 24 hours */}
        {appointment.isUnder24Hours && (
          <div className="p-4 rounded-2xl bg-[#b0473a]/10 border border-[#b0473a]/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#b0473a] shrink-0 mt-0.5" />
            <div className="text-xs text-[#b0473a] leading-relaxed">
              <strong className="block mb-1 font-semibold">
                {language === 'de' ? 'Kurzfristige Stornierung:' : 'Kısa Süre Kalan İptal:'}
              </strong>
              {t.manage.under24Warning}
            </div>
          </div>
        )}

        {/* Details Card */}
        <div className="bg-[#efe8dc] rounded-2xl p-6 space-y-3 text-xs">
          <div className="flex justify-between pb-2 border-b border-[#d3c6b3]">
            <span className="text-[#736c62]">Leistung:</span>
            <span className="font-semibold text-[#211f1c]">{appointment.serviceName}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-[#d3c6b3]">
            <span className="text-[#736c62]">Kunde:</span>
            <span className="font-semibold text-[#211f1c]">{appointment.customerName}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-[#d3c6b3]">
            <span className="text-[#736c62]">Datum &amp; Uhrzeit:</span>
            <span className="font-semibold text-[#211f1c]">
              {new Date(appointment.startIso).toLocaleDateString('de-CH', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: SALON_CONFIG.timeZone,
              })}{' '}
              um{' '}
              {new Date(appointment.startIso).toLocaleTimeString('de-CH', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: SALON_CONFIG.timeZone,
              })}{' '}
              Uhr
            </span>
          </div>
          <div className="flex justify-between pb-2 border-b border-[#d3c6b3]">
            <span className="text-[#736c62]">Preis:</span>
            <span className="font-semibold font-mono text-[#211f1c]">CHF {appointment.priceChf}.–</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#736c62]">Ort:</span>
            <span className="font-semibold text-[#211f1c]">
              {SALON_CONFIG.address.street}, {SALON_CONFIG.address.postalCode} {SALON_CONFIG.address.city}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e4dacb]">
          <Link
            to="/"
            className="text-xs text-[#736c62] hover:text-[#211f1c] transition-colors"
          >
            ← Zurück zur Website
          </Link>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#b0473a]/10 hover:bg-[#b0473a]/20 text-[#b0473a] text-xs font-semibold border border-[#b0473a]/30 transition-colors"
          >
            {t.manage.cancelBtn}
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#211f1c]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#b0473a]/15 text-[#b0473a] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#2e231c] text-center">
              {t.manage.confirmCancelTitle}
            </h3>
            <p className="text-xs text-[#45413b] text-center leading-relaxed">
              {t.manage.confirmCancelText}
            </p>

            {appointment.isUnder24Hours && (
              <div className="p-3 rounded-xl bg-[#f5e1d5] border border-dashed border-[#c96442] text-xs text-[#a94f32]">
                Hinweis: Da weniger als 24 Stunden verbleiben, wird der Betrag per Postrechnung gestellt.
              </div>
            )}

            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={handleCancelAppointment}
                disabled={isCancelling}
                className="w-full py-3 rounded-full bg-[#b0473a] hover:bg-[#96372c] text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Wird storniert...' : t.manage.confirmCancelYes}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2.5 rounded-full border border-[#e4dacb] hover:bg-[#efe8dc] text-xs text-[#45413b] transition-colors"
              >
                {t.manage.confirmCancelNo}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
