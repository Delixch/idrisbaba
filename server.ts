import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer, { Transporter } from 'nodemailer';
import { google } from 'googleapis';
import { z } from 'zod';
import dotenv from 'dotenv';
import { SALON_CONFIG, ServiceItem } from './salon.config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isDev = process.env.NODE_ENV !== 'production';

// App URL detection
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Trust proxy for Cloud Run & AI Studio environments
app.set('trust proxy', 1);

// Security Headers (allow iFrame preview in AI Studio)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  })
);

app.use(express.json({ limit: '100kb' }));

// Anti-abuse Rate Limiters
const requestCodeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Zu viele Code-Anfragen. Bitte warten Sie 60 Sekunden.',
    errorTr: 'Çok fazla kod talebi. Lütfen 60 saniye bekleyin.',
  },
});

const verifyCodeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Zu viele Verifizierungsversuche. Bitte warten Sie einen Moment.',
    errorTr: 'Çok fazla doğrulama denemesi. Lütfen biraz bekleyin.',
  },
});

// Environment Secrets
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || `"${SALON_CONFIG.name}" <termin@revair-studio.ch>`;
const CALENDAR_ID = process.env.CALENDAR_ID;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

const hasLiveSmtp = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
const hasLiveCalendar = Boolean(GOOGLE_SERVICE_ACCOUNT_JSON && CALENDAR_ID);

console.log(`[Config] SMTP Live: ${hasLiveSmtp ? 'YES' : 'SIMULATION MODE'}`);
console.log(`[Config] Google Calendar Live: ${hasLiveCalendar ? 'YES' : 'LOCAL SYNCED STORE'}`);

// Google Calendar Setup
let calendarClient: any = null;
if (hasLiveCalendar) {
  try {
    let credentials: any;
    try {
      credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON!);
    } catch {
      // Try base64 decoding if user encoded it
      const decoded = Buffer.from(GOOGLE_SERVICE_ACCOUNT_JSON!, 'base64').toString('utf8');
      credentials = JSON.parse(decoded);
    }
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    calendarClient = google.calendar({ version: 'v3', auth });
    console.log('[Google Calendar] Authenticated with service account successfully.');
  } catch (err: any) {
    console.error('[Google Calendar] Setup warning:', err.message);
  }
}

// Nodemailer Transporter
let mailTransporter: Transporter | null = null;
if (hasLiveSmtp) {
  try {
    mailTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // SSL on 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log('[SMTP] Transporter configured for:', SMTP_USER);
  } catch (err: any) {
    console.error('[SMTP] Setup error:', err.message);
  }
}

// Data Structures
export interface CalendarEventItem {
  id: string;
  summary: string;
  startIso: string;
  endIso: string;
  isHold?: boolean;
  holdExpiresAt?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  serviceId?: string;
  serviceName?: string;
  priceChf?: number;
  cancelToken?: string;
  feeAcceptedAt?: string;
  reminderSent?: boolean;
}

// Synced calendar storage (used when live calendar is unconfigured or alongside for fast lookups)
const localCalendarStore: Map<string, CalendarEventItem> = new Map();

// Verification Codes Storage (in-memory, hashed)
interface VerificationRecord {
  email: string;
  codeHash: string; // SHA-256
  createdAt: number;
  expiresAt: number;
  attempts: number;
  payload: any;
}
const verificationStore: Map<string, VerificationRecord> = new Map();

// Pre-seed some realistic appointments for Zurich local salon
function seedInitialCalendar() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Lunch break holds for current week
  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setDate(now.getDate() + i);
    const dateStr = day.toISOString().split('T')[0];
    const lunchStart = `${dateStr}T12:30:00+02:00`;
    const lunchEnd = `${dateStr}T13:30:00+02:00`;
    const id = `lunch-${dateStr}`;
    localCalendarStore.set(id, {
      id,
      summary: 'Pause / Salon Vorbereitung',
      startIso: lunchStart,
      endIso: lunchEnd,
      isHold: false,
    });
  }
}
seedInitialCalendar();

// Sanitation helper
function sanitizeText(str: string): string {
  if (typeof str !== 'string') return '';
  // Disallow newlines to prevent email header injection
  const noNewlines = str.replace(/[\r\n]/g, ' ').trim();
  // Basic HTML entity escaping
  return noNewlines
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Zod Validation Schemas
const SwissPostalCodeRegex = /^\d{4}$/;
const SwissPhoneRegex = /^(\+41|0041|0)[1-9]\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

const BookingRequestSchema = z.object({
  serviceId: z.string().min(1, 'Dienstleistung ist erforderlich'),
  startIso: z.string().datetime(),
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein').max(50),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein').max(50),
  email: z.string().email('Gültige E-Mail-Adresse erforderlich').max(100),
  phone: z.string().min(9, 'Telefonnummer ungültig').max(25),
  street: z.string().min(3, 'Strasse und Hausnummer erforderlich').max(100),
  postalCode: z.string().regex(SwissPostalCodeRegex, 'Schweizer Postleitzahl muss 4 Ziffern enthalten'),
  city: z.string().min(2, 'Ort ist erforderlich').max(50),
  feeAccepted: z.literal(true),
  privacyAccepted: z.boolean().optional(),
  website_hp: z.string().max(0, 'Bot detected').optional(), // Honeypot
});

// Periodic maintenance (Hold cleanup & 24h reminder check)
setInterval(async () => {
  const now = Date.now();
  // 1. Cleanup expired holds
  for (const [id, event] of localCalendarStore.entries()) {
    if (event.isHold && event.holdExpiresAt && event.holdExpiresAt < now) {
      localCalendarStore.delete(id);
      if (calendarClient && CALENDAR_ID) {
        try {
          await calendarClient.events.delete({ calendarId: CALENDAR_ID, eventId: id });
        } catch {
          // Ignore
        }
      }
    }
  }

  // 2. 24-hour reminder mail check (runs every 15 mins)
  const tomorrow = new Date(now + 24 * 60 * 60 * 1000);
  const tomorrowRangeStart = new Date(tomorrow.getTime() - 15 * 60 * 1000);
  const tomorrowRangeEnd = new Date(tomorrow.getTime() + 15 * 60 * 1000);

  for (const [id, event] of localCalendarStore.entries()) {
    if (!event.isHold && event.customerEmail && !event.reminderSent && event.cancelToken) {
      const eventStart = new Date(event.startIso);
      if (eventStart >= tomorrowRangeStart && eventStart <= tomorrowRangeEnd) {
        event.reminderSent = true;
        await sendReminderEmail(event);
      }
    }
  }
}, 60 * 1000);

// Helper to generate .ics file content
function generateIcs(event: CalendarEventItem): string {
  const startStr = new Date(event.startIso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endStr = new Date(event.endIso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Revair Studio Zürich//Hair Appointments//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${event.id}@revair-studio.ch`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${event.summary}`,
    `DESCRIPTION:Termin bei ${SALON_CONFIG.name}\\nService: ${event.serviceName}\\nAdresse: ${SALON_CONFIG.address.street}, ${SALON_CONFIG.address.postalCode} ${SALON_CONFIG.address.city}\\nTelefon: ${SALON_CONFIG.contact.phone}`,
    `LOCATION:${SALON_CONFIG.address.street}, ${SALON_CONFIG.address.postalCode} ${SALON_CONFIG.address.city}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// Mail Sending Helpers
async function sendVerificationCodeEmail(email: string, code: string, serviceName: string) {
  const subject = `Ihr Bestätigungscode für Revair Studio`;
  // Section 4.3: Kod e-postanın konu satırına yazılmaz, sadece içeriğinde bulunur!
  const textBody = `Guten Tag,

Ihr 6-stelliger Bestätigungscode für Ihren Termin (${serviceName}) bei Revair Studio lautet:

${code}

Dieser Code ist 10 Minuten lang gültig. Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese Nachricht.

Mit freundlichen Grüssen,
${SALON_CONFIG.name}
${SALON_CONFIG.address.street}, ${SALON_CONFIG.address.postalCode} ${SALON_CONFIG.address.city}
${SALON_CONFIG.contact.phone}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4efe6; margin: 0; padding: 24px; color: #211f1c;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #fbf8f2; border: 1px solid #e4dacb; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(46,35,28,0.05);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 44px; height: 44px; border-radius: 50%; background-color: #2e231c; color: #f1e6c0; font-family: Georgia, serif; font-size: 22px; line-height: 44px; font-weight: bold;">R</div>
      <h2 style="font-family: 'Source Serif 4', Georgia, serif; color: #2e231c; font-size: 24px; margin: 12px 0 4px;">Revair Studio Zürich</h2>
      <p style="color: #736c62; font-size: 13px; margin: 0; font-family: 'Courier Prime', Courier, monospace; letter-spacing: 0.05em;">HAIR RITUALS &amp; SPA</p>
    </div>
    <div style="border-top: 1px dashed #d3c6b3; margin: 16px 0 24px;"></div>
    <p style="font-size: 15px; line-height: 1.6; color: #45413b;">Guten Tag,</p>
    <p style="font-size: 15px; line-height: 1.6; color: #45413b;">Sie reservieren gerade den Termin für <strong>${serviceName}</strong>. Bitte verwenden Sie den folgenden 6-stelligen Code zur Bestätigung:</p>
    
    <div style="background-color: #f1e6c0; border: 1px solid #d4a24c; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
      <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2e231c;">${code}</span>
    </div>

    <p style="font-size: 13px; color: #736c62; line-height: 1.5;">Dieser Code ist <strong>10 Minuten</strong> gültig. Nach 5 fehlerhaften Eingaben erlischt er aus Sicherheitsgründen.</p>
    <div style="border-top: 1px dashed #d3c6b3; margin: 24px 0 16px;"></div>
    <p style="font-size: 12px; color: #736c62; line-height: 1.4; text-align: center;">
      ${SALON_CONFIG.name} · ${SALON_CONFIG.address.street} · ${SALON_CONFIG.address.postalCode} ${SALON_CONFIG.address.city}<br>
      Telefon: ${SALON_CONFIG.contact.phone}
    </p>
  </div>
</body>
</html>`;

  if (mailTransporter) {
    await mailTransporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    });
  } else {
    console.log(`[Dev Simulation] Verification code for ${email}: ${code}`);
  }
}

async function sendConfirmationEmail(event: CalendarEventItem) {
  const cancelUrl = `${APP_URL}/mein-termin/${event.cancelToken}`;
  const dateFormatted = new Date(event.startIso).toLocaleDateString('de-CH', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: SALON_CONFIG.timeZone,
  });
  const timeFormatted = new Date(event.startIso).toLocaleTimeString('de-CH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: SALON_CONFIG.timeZone,
  });

  const subject = `Ihr Termin ist bestätigt — Revair Studio Zürich`;
  const textBody = `Guten Tag ${event.customerName},

Ihr Termin bei ${SALON_CONFIG.name} ist verbindlich bestätigt:

Leistung: ${event.serviceName}
Datum: ${dateFormatted}
Uhrzeit: ${timeFormatted} Uhr
Preis: CHF ${event.priceChf}.–
Ort: ${SALON_CONFIG.address.street}, ${SALON_CONFIG.address.postalCode} ${SALON_CONFIG.address.city}

Falls Sie Ihren Termin verwalten oder stornieren möchten:
${cancelUrl}

Wichtiger Hinweis:
Kostenlose Absage bis 24 Stunden vorher. Bei Nichterscheinen oder späterer Absage wird der Betrag per Postrechnung in Rechnung gestellt.

Wir freuen uns auf Sie!
${SALON_CONFIG.name}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4efe6; margin: 0; padding: 24px; color: #211f1c;">
  <div style="max-width: 540px; margin: 0 auto; background-color: #fbf8f2; border: 1px solid #e4dacb; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(46,35,28,0.05);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 44px; height: 44px; border-radius: 50%; background-color: #2e231c; color: #f1e6c0; font-family: Georgia, serif; font-size: 22px; line-height: 44px; font-weight: bold;">R</div>
      <h2 style="font-family: 'Source Serif 4', Georgia, serif; color: #2e231c; font-size: 24px; margin: 12px 0 4px;">Terminbestätigung</h2>
      <p style="color: #736c62; font-size: 13px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">REVAIR STUDIO ZÜRICH</p>
    </div>
    
    <p style="font-size: 15px; color: #45413b;">Liebe/r ${event.customerName},</p>
    <p style="font-size: 15px; color: #45413b;">wir haben Ihren Termin erfolgreich in unserem Salon-Kalender eingetragen.</p>

    <div style="background-color: #efe8dc; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="margin-bottom: 8px;"><strong style="color: #211f1c;">Leistung:</strong> <span style="color: #45413b;">${event.serviceName}</span></div>
      <div style="margin-bottom: 8px;"><strong style="color: #211f1c;">Datum &amp; Uhrzeit:</strong> <span style="color: #45413b;">${dateFormatted}, ${timeFormatted} Uhr</span></div>
      <div style="margin-bottom: 8px;"><strong style="color: #211f1c;">Preis:</strong> <span style="color: #45413b;">CHF ${event.priceChf}.–</span></div>
      <div><strong style="color: #211f1c;">Adresse:</strong> <span style="color: #45413b;">${SALON_CONFIG.address.street}, ${SALON_CONFIG.address.postalCode} ${SALON_CONFIG.address.city}</span></div>
    </div>

    <div style="background-color: #f5e1d5; border: 1px dashed #c96442; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 13px; color: #a94f32; line-height: 1.5;">
      <strong>Absageregelung (revDSG):</strong><br>
      Kostenlose Absage bis 24 Stunden vor dem Termin. Bei unentschuldigtem Nichterscheinen oder einer kurzfristigeren Absage wird der Betrag per Postrechnung fällig.
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${cancelUrl}" style="display: inline-block; background-color: #c96442; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 500; font-size: 14px;">Termin verwalten oder absagen</a>
    </div>

    <p style="font-size: 13px; color: #736c62; line-height: 1.5; text-align: center;">Ein Kalendereintrag (.ics) ist dieser E-Mail als Anhang beigefügt.</p>
  </div>
</body>
</html>`;

  const icsData = generateIcs(event);

  if (mailTransporter) {
    await mailTransporter.sendMail({
      from: SMTP_FROM,
      to: event.customerEmail,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: 'termin-revair.ics',
          content: icsData,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        },
      ],
    });
  } else {
    console.log(`[Dev Simulation] Confirmation mail sent to ${event.customerEmail}. Cancel link: ${cancelUrl}`);
  }
}

async function sendReminderEmail(event: CalendarEventItem) {
  const cancelUrl = `${APP_URL}/mein-termin/${event.cancelToken}`;
  const timeFormatted = new Date(event.startIso).toLocaleTimeString('de-CH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: SALON_CONFIG.timeZone,
  });

  const subject = `Erinnerung an Ihren Termin morgen — Revair Studio Zürich`;
  const textBody = `Guten Tag ${event.customerName},

wir freuen uns darauf, Sie morgen um ${timeFormatted} Uhr bei uns im Salon begrüssen zu dürfen!

Leistung: ${event.serviceName}
Ort: ${SALON_CONFIG.address.street}, ${SALON_CONFIG.address.postalCode} ${SALON_CONFIG.address.city}

Falls etwas dazwischenkommt: ${cancelUrl}

Mit herzlichen Grüssen,
Ihr Revair Team`;

  if (mailTransporter) {
    await mailTransporter.sendMail({
      from: SMTP_FROM,
      to: event.customerEmail,
      subject,
      text: textBody,
    });
  } else {
    console.log(`[Dev Simulation] 24h Reminder sent to ${event.customerEmail}`);
  }
}

async function sendCancellationEmail(event: CalendarEventItem) {
  const subject = `Bestätigung: Termin storniert — Revair Studio Zürich`;
  const textBody = `Guten Tag ${event.customerName},

Ihr Termin für ${event.serviceName} wurde erfolgreich aus unserem Kalender gelöscht.

Gerne begrüssen wir Sie zu einem anderen Zeitpunkt wieder bei uns!

${SALON_CONFIG.name}
${SALON_CONFIG.contact.phone}`;

  if (mailTransporter) {
    await mailTransporter.sendMail({
      from: SMTP_FROM,
      to: event.customerEmail,
      subject,
      text: textBody,
    });
  } else {
    console.log(`[Dev Simulation] Cancellation confirmed for ${event.customerEmail}`);
  }
}

// -------------------------------------------------------------
// Calendar Availability Algorithm
// -------------------------------------------------------------
async function getEventsForRange(startIso: string, endIso: string): Promise<CalendarEventItem[]> {
  const events: CalendarEventItem[] = [];

  // Check Google Calendar if configured
  if (calendarClient && CALENDAR_ID) {
    try {
      const response = await calendarClient.events.list({
        calendarId: CALENDAR_ID,
        timeMin: startIso,
        timeMax: endIso,
        singleEvents: true,
        orderBy: 'startTime',
      });
      if (response.data.items) {
        for (const it of response.data.items) {
          const s = it.start?.dateTime || it.start?.date;
          const e = it.end?.dateTime || it.end?.date;
          if (s && e) {
            events.push({
              id: it.id || '',
              summary: it.summary || 'Besetzt',
              startIso: new Date(s).toISOString(),
              endIso: new Date(e).toISOString(),
              isHold: it.summary?.includes('[Beklemede]'),
            });
          }
        }
      }
    } catch (err: any) {
      console.error('[Google Calendar] Query error:', err.message);
    }
  }

  // Also combine with local store (holds and active bookings)
  const rangeStart = new Date(startIso).getTime();
  const rangeEnd = new Date(endIso).getTime();
  for (const item of localCalendarStore.values()) {
    const itemStart = new Date(item.startIso).getTime();
    const itemEnd = new Date(item.endIso).getTime();
    if (itemEnd > rangeStart && itemStart < rangeEnd) {
      if (!events.some((e) => e.id === item.id)) {
        events.push(item);
      }
    }
  }

  return events;
}

// Check if a time slot has available chairs
function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  busyEvents: CalendarEventItem[],
  maxChairs: number = SALON_CONFIG.chairsCount
): boolean {
  let overlappingCount = 0;
  for (const ev of busyEvents) {
    const evStart = new Date(ev.startIso);
    const evEnd = new Date(ev.endIso);
    // Overlap condition
    if (evStart < slotEnd && evEnd > slotStart) {
      overlappingCount++;
      if (overlappingCount >= maxChairs) {
        return false;
      }
    }
  }
  return true;
}

// API Routes
// 1. Config & Status Check
app.get('/api/config-status', (req: Request, res: Response) => {
  res.json({
    liveSmtp: hasLiveSmtp,
    liveCalendar: hasLiveCalendar,
    salonName: SALON_CONFIG.name,
    timeZone: SALON_CONFIG.timeZone,
  });
});

// 2. Next Free Slot for Homepage Hero Card
app.get('/api/calendar/next-slot', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    // Search within next 14 days
    const searchStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 hr minimum advance
    const searchEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const busyEvents = await getEventsForRange(searchStart.toISOString(), searchEnd.toISOString());

    // Iterate through days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + dayOffset);
      const dayOfWeek = checkDate.getDay();
      const dayConfig = SALON_CONFIG.openingHours.find((d) => d.day === dayOfWeek);

      if (!dayConfig || !dayConfig.isOpen || !dayConfig.openTime || !dayConfig.closeTime) {
        continue;
      }

      const [openH, openM] = dayConfig.openTime.split(':').map(Number);
      const [closeH, closeM] = dayConfig.closeTime.split(':').map(Number);

      const dayOpen = new Date(checkDate);
      dayOpen.setHours(openH, openM, 0, 0);

      const dayClose = new Date(checkDate);
      dayClose.setHours(closeH, closeM, 0, 0);

      // Check slots every 30 mins
      let slotRunner = new Date(Math.max(dayOpen.getTime(), searchStart.getTime()));
      // Align to 15 min boundary
      const rem = slotRunner.getMinutes() % 15;
      if (rem > 0) slotRunner.setMinutes(slotRunner.getMinutes() + (15 - rem));

      while (slotRunner.getTime() + 45 * 60 * 1000 <= dayClose.getTime()) {
        const slotEnd = new Date(slotRunner.getTime() + 45 * 60 * 1000); // 45 min default test
        if (isSlotAvailable(slotRunner, slotEnd, busyEvents)) {
          return res.json({
            nextSlotIso: slotRunner.toISOString(),
            dateFormattedDe: slotRunner.toLocaleDateString('de-CH', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
              timeZone: SALON_CONFIG.timeZone,
            }),
            dateFormattedTr: slotRunner.toLocaleDateString('tr-TR', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
              timeZone: SALON_CONFIG.timeZone,
            }),
            timeFormatted: slotRunner.toLocaleTimeString('de-CH', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: SALON_CONFIG.timeZone,
            }),
          });
        }
        slotRunner = new Date(slotRunner.getTime() + 15 * 60 * 1000);
      }
    }

    res.json({ nextSlotIso: null });
  } catch (err: any) {
    console.error('[Next Slot] error:', err.message);
    res.status(500).json({ error: 'Fehler beim Laden des nächsten Termins' });
  }
});

// 3. Get Available Slots for a given Date and Service
app.get('/api/calendar/available-slots', async (req: Request, res: Response) => {
  try {
    const { date, serviceId } = req.query;
    if (!date || typeof date !== 'string' || !serviceId || typeof serviceId !== 'string') {
      return res.status(400).json({ error: 'Datum und Dienstleistung erforderlich' });
    }

    const service = SALON_CONFIG.services.find((s) => s.id === serviceId);
    if (!service) {
      return res.status(400).json({ error: 'Ungültige Dienstleistung' });
    }

    // Parse date YYYY-MM-DD
    const targetDate = new Date(`${date}T00:00:00`);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Ungültiges Datumsformat' });
    }

    const dayOfWeek = targetDate.getDay();
    const dayConfig = SALON_CONFIG.openingHours.find((d) => d.day === dayOfWeek);

    if (!dayConfig || !dayConfig.isOpen || !dayConfig.openTime || !dayConfig.closeTime) {
      return res.json({ isOpen: false, slots: [] });
    }

    const [openH, openM] = dayConfig.openTime.split(':').map(Number);
    const [closeH, closeM] = dayConfig.closeTime.split(':').map(Number);

    const dayStart = new Date(targetDate);
    dayStart.setHours(openH, openM, 0, 0);

    const dayEnd = new Date(targetDate);
    dayEnd.setHours(closeH, closeM, 0, 0);

    const busyEvents = await getEventsForRange(dayStart.toISOString(), dayEnd.toISOString());

    const now = new Date();
    const minLeadTime = new Date(now.getTime() + 45 * 60 * 1000); // 45 min in advance

    const slots: Array<{
      time: string;
      startIso: string;
      endIso: string;
      available: boolean;
      isHold?: boolean;
    }> = [];

    let currentSlot = new Date(dayStart);
    const durationMs = service.durationMinutes * 60 * 1000;

    while (currentSlot.getTime() + durationMs <= dayEnd.getTime()) {
      const slotEnd = new Date(currentSlot.getTime() + durationMs);
      const isPast = currentSlot < minLeadTime;
      const isFree = !isPast && isSlotAvailable(currentSlot, slotEnd, busyEvents);

      slots.push({
        time: currentSlot.toLocaleTimeString('de-CH', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: SALON_CONFIG.timeZone,
        }),
        startIso: currentSlot.toISOString(),
        endIso: slotEnd.toISOString(),
        available: isFree,
      });

      // Step forward by slotIntervalMinutes
      currentSlot = new Date(currentSlot.getTime() + SALON_CONFIG.slotIntervalMinutes * 60 * 1000);
    }

    res.json({
      isOpen: true,
      openTime: dayConfig.openTime,
      closeTime: dayConfig.closeTime,
      slots,
    });
  } catch (err: any) {
    console.error('[Available Slots] error:', err.message);
    res.status(500).json({ error: 'Fehler beim Laden der freien Zeiten' });
  }
});

// 4. Temporary Hold (10-minute hold as [Beklemede] event)
app.post('/api/booking/hold', async (req: Request, res: Response) => {
  try {
    const { startIso, serviceId, email } = req.body;
    if (!startIso || !serviceId) {
      return res.status(400).json({ error: 'startIso und serviceId erforderlich' });
    }

    const service = SALON_CONFIG.services.find((s) => s.id === serviceId);
    if (!service) {
      return res.status(400).json({ error: 'Ungültige Dienstleistung' });
    }

    const slotStart = new Date(startIso);
    const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60 * 1000);

    // Check slot availability again
    const busyEvents = await getEventsForRange(slotStart.toISOString(), slotEnd.toISOString());
    if (!isSlotAvailable(slotStart, slotEnd, busyEvents)) {
      return res.status(409).json({
        error: 'Dieser Termin wurde soeben vergeben. Bitte wählen Sie einen anderen Zeitpunkt.',
        errorTr: 'Bu randevu saati az önce doldu. Lütfen başka bir saat seçin.',
      });
    }

    const holdId = `hold-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const holdExpiresAt = Date.now() + SALON_CONFIG.holdDurationMinutes * 60 * 1000;

    const holdItem: CalendarEventItem = {
      id: holdId,
      summary: '[Beklemede] Reservierung reserviert',
      startIso: slotStart.toISOString(),
      endIso: slotEnd.toISOString(),
      isHold: true,
      holdExpiresAt,
      serviceId,
      serviceName: service.nameDe,
      customerEmail: email ? sanitizeText(email) : undefined,
    };

    localCalendarStore.set(holdId, holdItem);

    // If live calendar is connected, also create the hold event in Google Calendar
    if (calendarClient && CALENDAR_ID) {
      try {
        const calRes = await calendarClient.events.insert({
          calendarId: CALENDAR_ID,
          requestBody: {
            id: holdId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30),
            summary: '[Beklemede] Reservierung',
            description: 'Temporäre Reservierung (10 Minuten)',
            start: { dateTime: slotStart.toISOString() },
            end: { dateTime: slotEnd.toISOString() },
          },
        });
        if (calRes.data.id) {
          holdItem.id = calRes.data.id;
        }
      } catch (err: any) {
        console.error('[Google Calendar] Hold insert error:', err.message);
      }
    }

    res.json({
      holdId: holdItem.id,
      expiresAt: holdExpiresAt,
      holdDurationSeconds: SALON_CONFIG.holdDurationMinutes * 60,
    });
  } catch (err: any) {
    console.error('[Hold] error:', err.message);
    res.status(500).json({ error: 'Reservierung konnte nicht temporär gesperrt werden' });
  }
});

// 5. Request Email Verification Code
app.post('/api/booking/request-code', requestCodeLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = BookingRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues?.[0]?.message || 'Ungültige Eingaben';
      return res.status(400).json({ error: firstError });
    }

    const data = parseResult.data;

    // Honeypot check
    if (data.website_hp && data.website_hp.length > 0) {
      // Quiet rejection for bots
      return res.json({ success: true, message: 'Code versendet' });
    }

    // Check max 2 active bookings for this email
    let activeBookingsCount = 0;
    const now = Date.now();
    for (const ev of localCalendarStore.values()) {
      if (!ev.isHold && ev.customerEmail?.toLowerCase() === data.email.toLowerCase()) {
        if (new Date(ev.startIso).getTime() > now) {
          activeBookingsCount++;
        }
      }
    }
    if (activeBookingsCount >= 2) {
      return res.status(400).json({
        error: 'Für diese E-Mail-Adresse existieren bereits 2 aktive Termine.',
        errorTr: 'Bu e-posta adresiyle kayıtlı halihazırda 2 aktif randevu bulunmaktadır.',
      });
    }

    const service = SALON_CONFIG.services.find((s) => s.id === data.serviceId);
    if (!service) {
      return res.status(400).json({ error: 'Ungültige Dienstleistung' });
    }

    // Cooldown check: 60s
    const existing = verificationStore.get(data.email.toLowerCase());
    if (existing && Date.now() - existing.createdAt < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - existing.createdAt)) / 1000);
      return res.status(429).json({
        error: `Bitte warten Sie ${waitSeconds} Sekunden vor der nächsten Code-Anforderung.`,
        errorTr: `Yeni kod talep etmeden önce lütfen ${waitSeconds} saniye bekleyin.`,
      });
    }

    // Generate cryptographic 6-digit code (Section 4.3: crypto.randomInt)
    const codeNumber = crypto.randomInt(100000, 1000000);
    const code = codeNumber.toString();

    // Store as SHA-256 hash (Section 4.3: Kod belleğe hash'lenmiş olarak yazılır)
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    verificationStore.set(data.email.toLowerCase(), {
      email: data.email.toLowerCase(),
      codeHash,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
      payload: data,
    });

    // Send email with code
    await sendVerificationCodeEmail(data.email, code, service.nameDe);

    res.json({
      success: true,
      message: 'Der 6-stellige Bestätigungscode wurde an Ihre E-Mail-Adresse gesendet.',
      messageTr: '6 haneli doğrulama kodu e-posta adresinize gönderildi.',
      // In dev mode when SMTP is unconfigured, return code in dev helper to make review/testing effortless
      ...(isDev && !hasLiveSmtp ? { devCode: code } : {}),
    });
  } catch (err: any) {
    console.error('[Request Code] error:', err.message);
    res.status(500).json({
      error: 'Code konnte nicht generiert oder gesendet werden. Bitte versuchen Sie es erneut.',
    });
  }
});

// 6. Verify Code & Finalize Booking in Google Calendar
app.post('/api/booking/verify-code', verifyCodeLimiter, async (req: Request, res: Response) => {
  try {
    const { email, code, holdId } = req.body;
    if (!email || !code || typeof code !== 'string') {
      return res.status(400).json({ error: 'E-Mail und 6-stelliger Code erforderlich' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = verificationStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({
        error: 'Kein aktiver Bestätigungscode gefunden. Bitte fordern Sie einen neuen Code an.',
        errorTr: 'Aktif doğrulama kodu bulunamadı. Lütfen yeni bir kod isteyin.',
      });
    }

    // Check expiration (10 min)
    if (Date.now() > record.expiresAt) {
      verificationStore.delete(cleanEmail);
      return res.status(400).json({
        error: 'Der Bestätigungscode ist abgelaufen. Bitte fordern Sie einen neuen Code an.',
        errorTr: 'Doğrulama kodunun süresi doldu. Lütfen yeni bir kod isteyin.',
      });
    }

    // Check max 5 attempts (Section 4.3)
    if (record.attempts >= 5) {
      verificationStore.delete(cleanEmail);
      return res.status(400).json({
        error: 'Zu viele Fehlversuche. Der Code wurde gesperrt. Bitte fordern Sie einen neuen an.',
        errorTr: 'Çok fazla hatalı deneme. Kod iptal edildi. Lütfen yeni bir kod talep edin.',
      });
    }

    // Verify code with timing-safe comparison (Section 4.3)
    const inputHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    const inputBuf = Buffer.from(inputHash, 'utf8');
    const targetBuf = Buffer.from(record.codeHash, 'utf8');

    const isMatch = inputBuf.length === targetBuf.length && crypto.timingSafeEqual(inputBuf, targetBuf);

    if (!isMatch) {
      record.attempts += 1;
      const remainingAttempts = 5 - record.attempts;
      return res.status(400).json({
        error: `Ungültiger Code. Noch ${remainingAttempts} Versuch(e) übrig.`,
        errorTr: `Geçersiz kod. Kalan deneme hakkı: ${remainingAttempts}.`,
      });
    }

    // Code is valid! Consume it immediately
    verificationStore.delete(cleanEmail);

    const bookingData = record.payload;
    const service = SALON_CONFIG.services.find((s) => s.id === bookingData.serviceId);
    if (!service) {
      return res.status(400).json({ error: 'Dienstleistung nicht gefunden' });
    }

    const slotStart = new Date(bookingData.startIso);
    const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60 * 1000);

    // Section 3: Seçilen saat Google Takvim'de TEKRAR kontrol edilir
    const busyEvents = await getEventsForRange(slotStart.toISOString(), slotEnd.toISOString());
    // Filter out our own hold if holdId matches
    const otherBusyEvents = busyEvents.filter((b) => b.id !== holdId);
    if (!isSlotAvailable(slotStart, slotEnd, otherBusyEvents)) {
      return res.status(409).json({
        error: 'Der gewählte Termin ist leider nicht mehr verfügbar. Bitte wählen Sie einen neuen Zeitpunkt.',
        errorTr: 'Seçilen saat artık müsait değil. Lütfen yeni bir saat seçin.',
      });
    }

    // Generate 32-byte secure random cancellation token (Section 4.6)
    const cancelToken = crypto.randomBytes(32).toString('hex');
    const feeAcceptedAt = new Date().toISOString();

    const sanitizedFirstName = sanitizeText(bookingData.firstName);
    const sanitizedLastName = sanitizeText(bookingData.lastName);
    const fullName = `${sanitizedFirstName} ${sanitizedLastName}`;
    const sanitizedPhone = sanitizeText(bookingData.phone);
    const fullAddress = `${sanitizeText(bookingData.street)}, ${sanitizeText(bookingData.postalCode)} ${sanitizeText(bookingData.city)}`;

    const eventTitle = `${service.nameDe} – ${fullName}`;
    const cancelLink = `${APP_URL}/mein-termin/${cancelToken}`;

    const description = [
      `Dienstleistung: ${service.nameDe} (${service.durationMinutes} Min, CHF ${service.priceChf}.-)`,
      `Kunde: ${fullName}`,
      `Telefon: ${sanitizedPhone}`,
      `E-Mail: ${cleanEmail}`,
      `Adresse für Rechnungsstellung: ${fullAddress}`,
      `Ausfallgebühr akzeptiert am: ${feeAcceptedAt}`,
      `Stornierungslink: ${cancelLink}`,
    ].join('\n');

    const appointmentId = holdId || `evt-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const finalizedEvent: CalendarEventItem = {
      id: appointmentId,
      summary: eventTitle,
      startIso: slotStart.toISOString(),
      endIso: slotEnd.toISOString(),
      isHold: false,
      customerName: fullName,
      customerEmail: cleanEmail,
      customerPhone: sanitizedPhone,
      customerAddress: fullAddress,
      serviceId: service.id,
      serviceName: service.nameDe,
      priceChf: service.priceChf,
      cancelToken,
      feeAcceptedAt,
    };

    localCalendarStore.set(appointmentId, finalizedEvent);

    // Convert hold or insert new event into Google Calendar
    if (calendarClient && CALENDAR_ID) {
      try {
        if (holdId) {
          // Update hold to confirmed event
          await calendarClient.events.update({
            calendarId: CALENDAR_ID,
            eventId: holdId,
            requestBody: {
              summary: eventTitle,
              description,
              start: { dateTime: slotStart.toISOString() },
              end: { dateTime: slotEnd.toISOString() },
            },
          });
        } else {
          const insertRes = await calendarClient.events.insert({
            calendarId: CALENDAR_ID,
            requestBody: {
              summary: eventTitle,
              description,
              start: { dateTime: slotStart.toISOString() },
              end: { dateTime: slotEnd.toISOString() },
            },
          });
          if (insertRes.data.id) {
            finalizedEvent.id = insertRes.data.id;
          }
        }
      } catch (err: any) {
        console.error('[Google Calendar] Event confirm error:', err.message);
      }
    }

    // Send confirmation email with .ics attachment and cancellation link
    await sendConfirmationEmail(finalizedEvent);

    res.json({
      success: true,
      appointment: {
        id: finalizedEvent.id,
        serviceName: service.nameDe,
        serviceNameTr: service.nameTr,
        priceChf: service.priceChf,
        durationMinutes: service.durationMinutes,
        startIso: finalizedEvent.startIso,
        endIso: finalizedEvent.endIso,
        customerName: fullName,
        cancelToken,
        cancelUrl: cancelLink,
      },
    });
  } catch (err: any) {
    console.error('[Verify Code] error:', err.message);
    res.status(500).json({ error: 'Termin konnte nicht abgeschlossen werden' });
  }
});

// 7. Get Appointment Details by Cancel Token (Page 5: Mein Termin)
app.get('/api/appointment/:token', (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    if (!token || token.length < 32) {
      return res.status(404).json({
        error: 'Ungültiger oder abgelaufener Link. Bitte kontaktieren Sie uns telefonisch unter ' + SALON_CONFIG.contact.phone,
        errorTr: 'Geçersiz veya süresi dolmuş bağlantı. Lütfen ' + SALON_CONFIG.contact.phone + ' numaralı telefondan bize ulaşın.',
      });
    }

    let foundEvent: CalendarEventItem | null = null;
    for (const ev of localCalendarStore.values()) {
      if (ev.cancelToken === token) {
        foundEvent = ev;
        break;
      }
    }

    if (!foundEvent) {
      return res.status(404).json({
        error: 'Termin wurde nicht gefunden oder bereits storniert. Rufen Sie uns bei Fragen gerne an: ' + SALON_CONFIG.contact.phone,
        errorTr: 'Randevu bulunamadı veya daha önce iptal edilmiş. Sorularınız için arayabilirsiniz: ' + SALON_CONFIG.contact.phone,
      });
    }

    const now = Date.now();
    const eventTime = new Date(foundEvent.startIso).getTime();

    // Token invalid once appointment time has passed (Section 4.6)
    if (eventTime < now) {
      return res.status(400).json({
        error: 'Dieser Termin liegt bereits in der Vergangenheit.',
        errorTr: 'Bu randevunun tarihi geçmiş durumdadır.',
      });
    }

    const hoursUntilAppointment = (eventTime - now) / (1000 * 60 * 60);
    const isUnder24Hours = hoursUntilAppointment < SALON_CONFIG.cancelNoticeHours;

    res.json({
      appointment: {
        id: foundEvent.id,
        serviceName: foundEvent.serviceName,
        customerName: foundEvent.customerName,
        priceChf: foundEvent.priceChf,
        startIso: foundEvent.startIso,
        endIso: foundEvent.endIso,
        isUnder24Hours,
        hoursUntilAppointment: Math.round(hoursUntilAppointment * 10) / 10,
        noShowRuleDe: SALON_CONFIG.noShowRuleDe,
        noShowRuleTr: SALON_CONFIG.noShowRuleTr,
      },
    });
  } catch (err: any) {
    console.error('[Appointment View] error:', err.message);
    res.status(500).json({ error: 'Fehler beim Laden des Termins' });
  }
});

// 8. Cancel Appointment by Token
app.post('/api/appointment/:token/cancel', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    let foundEventKey: string | null = null;
    let foundEvent: CalendarEventItem | null = null;

    for (const [key, ev] of localCalendarStore.entries()) {
      if (ev.cancelToken === token) {
        foundEventKey = key;
        foundEvent = ev;
        break;
      }
    }

    if (!foundEvent || !foundEventKey) {
      return res.status(404).json({
        error: 'Termin wurde nicht gefunden oder bereits storniert.',
        errorTr: 'Randevu bulunamadı veya zaten iptal edilmiş.',
      });
    }

    const now = Date.now();
    const eventTime = new Date(foundEvent.startIso).getTime();
    if (eventTime < now) {
      return res.status(400).json({
        error: 'Vergangene Termine können nicht mehr storniert werden.',
        errorTr: 'Geçmiş randevular iptal edilemez.',
      });
    }

    const hoursUntilAppointment = (eventTime - now) / (1000 * 60 * 60);
    const isUnder24Hours = hoursUntilAppointment < SALON_CONFIG.cancelNoticeHours;

    // Delete from local store
    localCalendarStore.delete(foundEventKey);

    // Delete from Google Calendar
    if (calendarClient && CALENDAR_ID) {
      try {
        await calendarClient.events.delete({
          calendarId: CALENDAR_ID,
          eventId: foundEvent.id,
        });
      } catch (err: any) {
        console.error('[Google Calendar] Delete event error:', err.message);
      }
    }

    // Send cancellation confirmation email
    await sendCancellationEmail(foundEvent);

    res.json({
      success: true,
      messageDe: 'Ihr Termin wurde erfolgreich storniert.',
      messageTr: 'Randevunuz başarıyla iptal edildi.',
      isUnder24Hours,
    });
  } catch (err: any) {
    console.error('[Cancel Appointment] error:', err.message);
    res.status(500).json({ error: 'Termin konnte nicht storniert werden' });
  }
});

// 9. Download .ics directly
app.get('/api/appointment/:token/ics', (req: Request, res: Response) => {
  const { token } = req.params;
  let foundEvent: CalendarEventItem | null = null;
  for (const ev of localCalendarStore.values()) {
    if (ev.cancelToken === token) {
      foundEvent = ev;
      break;
    }
  }

  if (!foundEvent) {
    return res.status(404).send('Termin nicht gefunden');
  }

  const icsData = generateIcs(foundEvent);
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="termin-revair.ics"');
  res.send(icsData);
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Revair Studio Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
