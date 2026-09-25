import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.js';
import { SALON_CONFIG, ServiceItem } from '../../salon.config.js';
import { ConfirmedAppointment, AvailableSlot } from '../types/index.js';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Compass,
  FileDown,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const BuchenPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();

  // Current Step: 1 = Angaben, 2 = Termin, 3 = Bestätigung, 4 = Erfolg
  const [step, setStep] = useState<number>(1);

  // Form Fields (Step 1)
  const initialServiceId = searchParams.get('service') || SALON_CONFIG.services[0].id;
  const initialStartIso = searchParams.get('startIso') || '';

  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [websiteHp, setWebsiteHp] = useState(''); // Honeypot trap

  // Form Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Step 2: Date & Slot Selection
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialStartIso) {
      try {
        return new Date(initialStartIso).toISOString().split('T')[0];
      } catch {}
    }
    const d = new Date();
    d.setDate(d.getDate() + 1); // Start tomorrow
    return d.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // 10-Minute Hold State
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number>(0);

  // Step 3: Checkboxes & 6-Digit Code
  const [feeAccepted, setFeeAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Success State
  const [confirmedData, setConfirmedData] = useState<ConfirmedAppointment | null>(null);

  const selectedService = SALON_CONFIG.services.find((s) => s.id === selectedServiceId) || SALON_CONFIG.services[0];

  // 1. Fetch available slots when date or service changes
  useEffect(() => {
    if (!selectedDate || !selectedServiceId) return;
    setLoadingSlots(true);
    fetch(`/api/calendar/available-slots?date=${selectedDate}&serviceId=${selectedServiceId}`)
      .then((res) => (res.ok ? res.json() : { slots: [] }))
      .then((data) => {
        setAvailableSlots(data.slots || []);
        if (initialStartIso && step === 1) {
          const match = (data.slots || []).find((s: AvailableSlot) => s.startIso === initialStartIso);
          if (match && match.available) {
            setSelectedSlot(match);
          }
        }
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedServiceId]);

  // 2. Countdown timer for the 10-minute hold
  useEffect(() => {
    if (!holdExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      setHoldSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setHoldId(null);
        setHoldExpiresAt(null);
        setSelectedSlot(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  // 3. Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!selectedServiceId) errs.service = t.booking.errors.selectService;
    if (!firstName.trim()) errs.firstName = t.booking.errors.firstName;
    if (!lastName.trim()) errs.lastName = t.booking.errors.lastName;
    
    // Strict email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = t.booking.errors.email;
    }

    // Swiss phone check (at least 9 digits)
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 9) {
      errs.phone = t.booking.errors.phone;
    }

    if (!street.trim()) errs.street = t.booking.errors.street;

    // Swiss postal code (exact 4 digits)
    if (!/^\d{4}$/.test(postalCode.trim())) {
      errs.postalCode = t.booking.errors.postalCode;
    }

    if (!city.trim()) errs.city = t.booking.errors.city;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoToStep2 = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 2 Slot Selection & 10-Minute Hold Request
  const handleSelectSlot = async (slot: AvailableSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setGeneralError(null);

    try {
      const res = await fetch('/api/booking/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startIso: slot.startIso,
          serviceId: selectedServiceId,
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.error || 'Dieser Termin ist nicht mehr verfügbar.');
        setSelectedSlot(null);
        return;
      }

      setHoldId(data.holdId);
      setHoldExpiresAt(data.expiresAt);
      setHoldSecondsRemaining(SALON_CONFIG.holdDurationMinutes * 60);
    } catch {
      setGeneralError('Verbindungsfehler beim Reservieren des Termins.');
    }
  };

  const handleGoToStep3 = async () => {
    if (!selectedSlot) {
      setGeneralError(t.booking.errors.selectSlot);
      return;
    }

    // Request verification code via API
    setGeneralError(null);
    try {
      const payload = {
        serviceId: selectedServiceId,
        startIso: selectedSlot.startIso,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        street: street.trim(),
        postalCode: postalCode.trim(),
        city: city.trim(),
        feeAccepted: true, // will be confirmed by user on step 3
        privacyAccepted,
        website_hp: websiteHp,
      };

      const res = await fetch('/api/booking/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.error || 'Fehler beim Senden des Codes.');
        return;
      }

      setResendCooldown(60);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Focus first digit after render
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 200);
    } catch {
      setGeneralError('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    }
  };

  // Handle 6-digit input interactions
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const updated = [...digits];
      updated[index] = '';
      setDigits(updated);
      return;
    }

    // If pasted multiple digits
    if (clean.length > 1) {
      const updated = [...digits];
      for (let i = 0; i < 6; i++) {
        if (clean[i]) updated[i] = clean[i];
      }
      setDigits(updated);
      const nextIndex = Math.min(5, clean.length);
      digitInputRefs.current[nextIndex]?.focus();
      return;
    }

    const updated = [...digits];
    updated[index] = clean[0];
    setDigits(updated);

    if (index < 5 && clean[0]) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setGeneralError(null);
    try {
      const payload = {
        serviceId: selectedServiceId,
        startIso: selectedSlot?.startIso,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        street: street.trim(),
        postalCode: postalCode.trim(),
        city: city.trim(),
        feeAccepted: true,
        privacyAccepted,
        website_hp: websiteHp,
      };

      const res = await fetch('/api/booking/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.error || 'Fehler beim erneuten Senden des Codes.');
        return;
      }
      setResendCooldown(60);
      setDigits(['', '', '', '', '', '']);
      digitInputRefs.current[0]?.focus();
    } catch {
      setGeneralError('Netzwerkfehler.');
    }
  };

  // Final Code Verification & Booking Confirmation
  const handleVerifyAndFinalize = async () => {
    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setGeneralError(t.booking.errors.sixDigits);
      return;
    }
    if (!feeAccepted) {
      setGeneralError(t.booking.errors.feeAcceptance);
      return;
    }

    setIsSubmittingCode(true);
    setGeneralError(null);

    try {
      const res = await fetch('/api/booking/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: fullCode,
          holdId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.error || 'Fehler bei der Verifizierung.');
        setIsSubmittingCode(false);
        return;
      }

      setConfirmedData(data.appointment);
      setStep(4); // Success screen
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setGeneralError('Fehler bei der Verifizierung.');
    } finally {
      setIsSubmittingCode(false);
    }
  };

  // Next 14 days list for Step 2
  const nextDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const oh = SALON_CONFIG.openingHours.find((h) => h.day === dayOfWeek);
    return {
      dateStr,
      dayNameDe: d.toLocaleDateString('de-CH', { weekday: 'short' }),
      dayNameTr: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
      dayNum: d.getDate(),
      monthNameDe: d.toLocaleDateString('de-CH', { month: 'short' }),
      monthNameTr: d.toLocaleDateString('tr-TR', { month: 'short' }),
      isOpen: oh?.isOpen || false,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Step Indicator Header (Steps 1..3) */}
      {step <= 3 && (
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-[#e4dacb] z-0" />
            
            {/* Step 1 */}
            <button
              onClick={() => step > 1 && setStep(1)}
              disabled={step === 1}
              className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step >= 1
                  ? 'bg-[#2e231c] text-[#f4efe6] shadow-xs'
                  : 'bg-[#efe8dc] text-[#736c62]'
              }`}
            >
              <span>{t.booking.step1Title}</span>
            </button>

            {/* Step 2 */}
            <button
              onClick={() => step > 2 && setStep(2)}
              disabled={step < 2}
              className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step >= 2
                  ? 'bg-[#2e231c] text-[#f4efe6] shadow-xs'
                  : 'bg-[#efe8dc] text-[#736c62]'
              }`}
            >
              <span>{t.booking.step2Title}</span>
            </button>

            {/* Step 3 */}
            <div
              className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step >= 3
                  ? 'bg-[#2e231c] text-[#f4efe6] shadow-xs'
                  : 'bg-[#efe8dc] text-[#736c62]'
              }`}
            >
              <span>{t.booking.step3Title}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Form Left, Sticky Summary Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Content (2 cols) */}
        <div className="lg:col-span-2">
          
          {/* General Error Banner */}
          {generalError && (
            <div className="mb-6 p-4 rounded-2xl bg-[#b0473a]/10 border border-[#b0473a]/30 text-xs text-[#b0473a] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 1: ANGABEN */}
          {/* ==================================================== */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Google Calendar Direct Scheduling Option */}
              {SALON_CONFIG.contact.googleAppointmentUrl && (
                <div className="bg-[#121c2e] border border-[#2563eb]/40 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center shrink-0 shadow-md">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm sm:text-base font-semibold text-[#93c5fd]">
                        {language === 'de' ? 'Bevorzugen Sie die direkte Google Kalender Buchung?' : 'Google Takvim ile doğrudan randevu almak ister misiniz?'}
                      </h3>
                      <p className="text-xs text-[#60a5fa]">
                        {language === 'de'
                          ? 'Wählen Sie einen freien Slot direkt über unsere offizielle Google Appointments Seite.'
                          : 'Resmi Google Randevu sayfamız üzerinden müsait saatleri anında görüntüleyin ve randevu oluşturun.'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={SALON_CONFIG.contact.googleAppointmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-md transition-colors shrink-0"
                  >
                    <span>{language === 'de' ? 'Zu Google Appointments →' : 'Google Randevu Sayfası →'}</span>
                  </a>
                </div>
              )}

              {/* Service Selection Cards */}
              <div className="bg-[#16120f] border border-[#2d2621] rounded-3xl p-6 sm:p-8 shadow-xl">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#f7f3ec] mb-2">
                  {t.booking.selectService}
                </h2>
                <p className="text-xs text-[#736c62] mb-6">
                  {language === 'de'
                    ? 'Wählen Sie die gewünschte Behandlung aus unserem Salon-Angebot:'
                    : 'Salon menümüzden dilediğiniz işlemi seçin:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SALON_CONFIG.services.map((srv) => {
                    const isSelected = srv.id === selectedServiceId;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#efe8dc] border-[#2e231c] ring-1 ring-[#2e231c] shadow-xs'
                            : 'bg-[#fbf8f2] border-[#e4dacb] hover:border-[#d3c6b3]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-serif text-sm font-semibold text-[#2e231c]">
                              {language === 'de' ? srv.nameDe : srv.nameTr}
                            </h4>
                            <span className="font-mono text-xs font-semibold text-[#2e231c] shrink-0">
                              CHF {srv.priceChf}.–
                            </span>
                          </div>
                          <p className="text-[11px] text-[#736c62] line-clamp-2">
                            {language === 'de' ? srv.descriptionDe : srv.descriptionTr}
                          </p>
                        </div>
                        <span className="text-[10px] text-[#a0988b] font-typewriter mt-2 block">
                          {srv.durationMinutes} Min.
                        </span>
                      </div>
                    );
                  })}
                </div>
                {errors.service && (
                  <p className="text-xs text-[#b0473a] mt-2">{errors.service}</p>
                )}
              </div>

              {/* Personal Details Form */}
              <div className="bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2e231c] mb-2">
                  {t.booking.personalDetails}
                </h2>
                <p className="text-xs text-[#736c62] mb-6">
                  {language === 'de'
                    ? 'Diese Angaben werden in den Kalendereintrag übernommen und für die Bestätigung benötigt.'
                    : 'Bu bilgiler takvim kaydına işlenir ve randevu onayı için kullanılır.'}
                </p>

                {/* Honeypot Bot Trap (invisible) */}
                <input
                  type="text"
                  name="website_hp"
                  value={websiteHp}
                  onChange={(e) => setWebsiteHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-medium text-[#45413b] mb-1">
                      {t.booking.firstName} *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="z.B. Anna"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#fbf8f2] border border-[#e4dacb] text-sm text-[#211f1c] focus:outline-none focus:ring-2 focus:ring-[#c96442]/40"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-[#b0473a] mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-medium text-[#45413b] mb-1">
                      {t.booking.lastName} *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="z.B. Müller"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#fbf8f2] border border-[#e4dacb] text-sm text-[#211f1c] focus:outline-none focus:ring-2 focus:ring-[#c96442]/40"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-[#b0473a] mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-[#45413b] mb-1">
                      {t.booking.email} *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anna.mueller@beispiel.ch"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#fbf8f2] border border-[#e4dacb] text-sm text-[#211f1c] focus:outline-none focus:ring-2 focus:ring-[#c96442]/40"
                    />
                    {errors.email && (
                      <p className="text-xs text-[#b0473a] mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-[#45413b] mb-1">
                      {t.booking.phone} *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+41 79 123 45 67"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#fbf8f2] border border-[#e4dacb] text-sm text-[#211f1c] focus:outline-none focus:ring-2 focus:ring-[#c96442]/40"
                    />
                    {errors.phone && (
                      <p className="text-xs text-[#b0473a] mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Street & No */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#45413b] mb-1">
                      {t.booking.street} *
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Musterstrasse 12"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#fbf8f2] border border-[#e4dacb] text-sm text-[#211f1c] focus:outline-none focus:ring-2 focus:ring-[#c96442]/40"
                    />
                    {errors.street && (
                      <p className="text-xs text-[#b0473a] mt-1">{errors.street}</p>
                    )}
                  </div>

                  {/* Postal Code (Swiss 4 digits) */}
                  <div>
                    <label className="block text-xs font-medium text-[#45413b] mb-1">
                      {t.booking.postalCode} *
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="8001"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#fbf8f2] border border-[#e4dacb] text-sm text-[#211f1c] focus:outline-none focus:ring-2 focus:ring-[#c96442]/40"
                    />
                    {errors.postalCode && (
                      <p className="text-xs text-[#b0473a] mt-1">{errors.postalCode}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-medium text-[#45413b] mb-1">
                      {t.booking.city} *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Zürich"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#fbf8f2] border border-[#e4dacb] text-sm text-[#211f1c] focus:outline-none focus:ring-2 focus:ring-[#c96442]/40"
                    />
                    {errors.city && (
                      <p className="text-xs text-[#b0473a] mt-1">{errors.city}</p>
                    )}
                  </div>

                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleGoToStep2}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#c96442] hover:bg-[#a94f32] rounded-full shadow-xs transition-all active:scale-95"
                  >
                    <span>{t.booking.nextToTime}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: TERMIN (DATUM & UHRZEIT) */}
          {/* ==================================================== */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-6 sm:p-8 shadow-xs">
                
                {/* Hold Countdown Notice if active */}
                {holdExpiresAt && holdSecondsRemaining > 0 && (
                  <div className="mb-6 p-4 rounded-2xl bg-[#a8781f]/10 border border-[#a8781f]/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-[#a8781f] font-medium">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{t.booking.heldNotice}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#a8781f] shrink-0">
                      {Math.floor(holdSecondsRemaining / 60)}:
                      {(holdSecondsRemaining % 60).toString().padStart(2, '0')} Min.
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2e231c]">
                      {t.booking.selectDay}
                    </h2>
                    <p className="text-xs text-[#736c62]">
                      {language === 'de'
                        ? 'Wählen Sie einen passenden Kalendertag:'
                        : 'Lütfen uygun bir takvim günü seçin:'}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-[#736c62] hover:text-[#211f1c] flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Zurück</span>
                  </button>
                </div>

                {/* Horizontal Date Picker Strip */}
                <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none select-none">
                  {nextDays.map((d) => {
                    const isSelected = d.dateStr === selectedDate;
                    return (
                      <button
                        key={d.dateStr}
                        onClick={() => {
                          if (d.isOpen) setSelectedDate(d.dateStr);
                        }}
                        disabled={!d.isOpen}
                        className={`flex flex-col items-center justify-center min-w-[70px] py-3 px-2 rounded-2xl border transition-all shrink-0 ${
                          !d.isOpen
                            ? 'opacity-40 bg-[#efe8dc]/60 border-[#e4dacb] cursor-not-allowed text-[#a0988b]'
                            : isSelected
                            ? 'bg-[#2e231c] text-[#f4efe6] border-[#2e231c] shadow-xs'
                            : 'bg-[#fbf8f2] border-[#e4dacb] text-[#45413b] hover:bg-[#efe8dc]'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-typewriter tracking-wider">
                          {language === 'de' ? d.dayNameDe : d.dayNameTr}
                        </span>
                        <span className="text-lg font-bold font-serif my-0.5">
                          {d.dayNum}
                        </span>
                        <span className="text-[10px]">
                          {language === 'de' ? d.monthNameDe : d.monthNameTr}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Slots Section */}
                <div className="mt-8 pt-6 border-t border-[#e4dacb]">
                  <h3 className="font-serif text-lg font-semibold text-[#2e231c] mb-2">
                    {t.booking.selectTime}
                  </h3>
                  <p className="text-xs text-[#736c62] mb-4">
                    {language === 'de'
                      ? `Freie Termine passend für ${selectedService.nameDe} (${selectedService.durationMinutes} Min):`
                      : `${selectedService.nameTr} (${selectedService.durationMinutes} dk) süresine uygun boş saatler:`}
                  </p>

                  {loadingSlots ? (
                    <div className="py-8 text-center text-xs text-[#736c62] animate-pulse">
                      Termine aus Salon-Kalender werden geladen...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#736c62]">
                      {t.booking.noSlots}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {availableSlots.map((slot) => {
                        const isChosen = selectedSlot?.startIso === slot.startIso;
                        return (
                          <button
                            key={slot.startIso}
                            onClick={() => handleSelectSlot(slot)}
                            disabled={!slot.available}
                            className={`py-2.5 px-2 rounded-xl text-xs font-mono transition-all text-center ${
                              isChosen
                                ? 'bg-[#2e231c] text-[#f4efe6] font-bold shadow-xs'
                                : slot.available
                                ? 'bg-[#fbf8f2] border border-[#587a4f]/50 text-[#211f1c] hover:bg-[#587a4f]/10'
                                : 'bg-[#efe8dc] border border-[#e4dacb] text-[#a0988b] line-through cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Continue to Step 3 Button */}
                <div className="mt-8 pt-6 border-t border-[#e4dacb] flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-xs text-[#45413b] hover:bg-[#efe8dc] rounded-full transition-colors"
                  >
                    ← Zurück zu Angaben
                  </button>
                  <button
                    onClick={handleGoToStep3}
                    disabled={!selectedSlot}
                    className={`inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold rounded-full shadow-xs transition-all ${
                      selectedSlot
                        ? 'bg-[#c96442] hover:bg-[#a94f32] text-white active:scale-95'
                        : 'bg-[#efe8dc] text-[#a0988b] cursor-not-allowed'
                    }`}
                  >
                    <span>{t.booking.nextToVerification}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 3: BESTÄTIGUNG & 6-STELLIGER CODE */}
          {/* ==================================================== */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-6 sm:p-8 shadow-xs">
                
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2e231c] mb-2">
                  {t.booking.step3Heading}
                </h2>
                <p className="text-xs text-[#736c62] mb-6">
                  {t.booking.codeInstruction} <strong className="text-[#2e231c]">{email}</strong>
                </p>

                {/* Mandatory Fee Checkbox */}
                <div className="p-4 rounded-2xl bg-[#f5e1d5]/40 border border-dashed border-[#c96442]/30 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={feeAccepted}
                      onChange={(e) => setFeeAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#c96442] focus:ring-[#c96442]/40"
                    />
                    <span className="text-xs text-[#45413b] leading-relaxed">
                      <strong>{t.booking.mandatoryFeeCheckbox}</strong>
                    </span>
                  </label>
                </div>

                {/* Optional Privacy Checkbox */}
                <div className="mb-8 px-1">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="w-4 h-4 rounded text-[#c96442] focus:ring-[#c96442]/40"
                    />
                    <span className="text-xs text-[#736c62]">
                      {t.booking.privacyCheckbox} (
                      <Link to="/datenschutz" target="_blank" className="underline hover:text-[#211f1c]">
                        Datenschutz lesen
                      </Link>
                      )
                    </span>
                  </label>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#2e231c] uppercase tracking-wider font-typewriter mb-3 text-center">
                    6-stelliger Bestätigungscode
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          digitInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        className="w-11 h-14 sm:w-14 sm:h-16 text-center font-typewriter text-2xl font-bold rounded-xl bg-[#fbf8f2] border border-[#e4dacb] focus:border-[#2e231c] focus:outline-none focus:ring-2 focus:ring-[#c96442]/40 text-[#2e231c]"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Code Button & Cooldown */}
                <div className="text-center mb-8">
                  {resendCooldown > 0 ? (
                    <span className="text-xs text-[#736c62] font-typewriter">
                      {t.booking.resendIn} {resendCooldown} {t.booking.seconds}
                    </span>
                  ) : (
                    <button
                      onClick={handleResendCode}
                      className="text-xs text-[#c96442] hover:text-[#a94f32] font-semibold underline"
                    >
                      {t.booking.resendCode}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-[#e4dacb]">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-xs text-[#45413b] hover:bg-[#efe8dc] rounded-full transition-colors"
                  >
                    ← Datum anpassen
                  </button>
                  <button
                    onClick={handleVerifyAndFinalize}
                    disabled={isSubmittingCode || !feeAccepted || digits.join('').length !== 6}
                    className={`inline-flex items-center gap-2 px-7 py-3 text-xs sm:text-sm font-semibold rounded-full shadow-xs transition-all ${
                      !isSubmittingCode && feeAccepted && digits.join('').length === 6
                        ? 'bg-[#c96442] hover:bg-[#a94f32] text-white active:scale-95'
                        : 'bg-[#efe8dc] text-[#a0988b] cursor-not-allowed'
                    }`}
                  >
                    {isSubmittingCode ? (
                      <span>Wird verifiziert...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t.booking.confirmAndBook}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 4: ERFOLGSSCREEN */}
          {/* ==================================================== */}
          {step === 4 && confirmedData && (
            <div className="bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-8 sm:p-10 shadow-xs animate-in zoom-in-95 duration-300">
              <div className="text-center max-w-md mx-auto mb-8">
                <div className="w-16 h-16 rounded-full bg-[#587a4f]/15 text-[#587a4f] flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2e231c]">
                  {t.booking.success.title}
                </h2>
                <p className="text-xs text-[#736c62] mt-2">
                  {t.booking.success.subtitle}
                </p>
              </div>

              {/* Summary Box */}
              <div className="bg-[#efe8dc] rounded-2xl p-6 mb-8 max-w-lg mx-auto space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-[#d3c6b3]">
                  <span className="text-[#736c62]">Leistung:</span>
                  <span className="font-semibold text-[#211f1c]">{confirmedData.serviceName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#d3c6b3]">
                  <span className="text-[#736c62]">Datum &amp; Uhrzeit:</span>
                  <span className="font-semibold text-[#211f1c]">
                    {new Date(confirmedData.startIso).toLocaleDateString('de-CH', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      timeZone: SALON_CONFIG.timeZone,
                    })}{' '}
                    um{' '}
                    {new Date(confirmedData.startIso).toLocaleTimeString('de-CH', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: SALON_CONFIG.timeZone,
                    })}{' '}
                    Uhr
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#d3c6b3]">
                  <span className="text-[#736c62]">Kunde:</span>
                  <span className="font-semibold text-[#211f1c]">{confirmedData.customerName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#d3c6b3]">
                  <span className="text-[#736c62]">Preis:</span>
                  <span className="font-semibold font-mono text-[#211f1c]">CHF {confirmedData.priceChf}.–</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#736c62]">Ort:</span>
                  <span className="font-semibold text-[#211f1c]">
                    {SALON_CONFIG.address.street}, {SALON_CONFIG.address.postalCode} {SALON_CONFIG.address.city}
                  </span>
                </div>
              </div>

              {/* 3 Buttons as requested in Section 2:
                  "Zum Kalender hinzufügen" (.ics), "Route planen" (harita) ve "Zur Startseite" butonları */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {confirmedData.cancelToken && (
                  <a
                    href={`/api/appointment/${confirmedData.cancelToken}/ics`}
                    download="termin-revair.ics"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2e231c] text-[#f4efe6] text-xs font-semibold hover:bg-[#3a2e26] transition-colors"
                  >
                    <FileDown className="w-4 h-4 text-[#d4a24c]" />
                    <span>{t.booking.success.addToCalendar}</span>
                  </a>
                )}
                <a
                  href={SALON_CONFIG.address.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#efe8dc] hover:bg-[#e4dacb] text-[#2e231c] text-xs font-semibold transition-colors"
                >
                  <Compass className="w-4 h-4 text-[#c96442]" />
                  <span>{t.booking.success.getDirections}</span>
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#e4dacb] hover:bg-[#efe8dc] text-[#45413b] text-xs font-medium transition-colors"
                >
                  <span>{t.booking.success.backHome}</span>
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Right Sticky Summary Card (Desktop) */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-[#fbf8f2] border border-[#e4dacb] rounded-3xl p-6 shadow-xs space-y-4">
            <span className="text-[10px] uppercase font-typewriter tracking-[0.2em] text-[#736c62]">
              Ihre Buchungsübersicht
            </span>

            <div>
              <h3 className="font-serif text-lg font-semibold text-[#2e231c]">
                {language === 'de' ? selectedService.nameDe : selectedService.nameTr}
              </h3>
              <p className="text-xs text-[#736c62] mt-0.5">
                {selectedService.durationMinutes} Min. Behandlungszeit
              </p>
            </div>

            <div className="pt-3 border-t border-dashed border-[#d3c6b3] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#736c62]">Datum:</span>
                <span className="font-medium text-[#2e231c]">
                  {new Date(selectedDate).toLocaleDateString('de-CH', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#736c62]">Uhrzeit:</span>
                <span className="font-medium text-[#2e231c]">
                  {selectedSlot ? `${selectedSlot.time} Uhr` : 'Noch nicht gewählt'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#e4dacb] font-semibold text-sm">
                <span className="text-[#2e231c]">Preis:</span>
                <span className="font-mono text-[#c96442]">CHF {selectedService.priceChf}.–</span>
              </div>
            </div>

            {/* Salon Info */}
            <div className="pt-4 border-t border-[#e4dacb] text-[11px] text-[#736c62] space-y-1">
              <p className="font-medium text-[#2e231c]">{SALON_CONFIG.name}</p>
              <p>{SALON_CONFIG.address.street}, {SALON_CONFIG.address.postalCode} {SALON_CONFIG.address.city}</p>
              <p>Tel: {SALON_CONFIG.contact.phone}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
