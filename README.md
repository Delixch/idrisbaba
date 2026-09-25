# Revair Studio Zürich — Coiffure Web & Buchungssystem

Professionelle Webpräsenz und Online-Terminbuchungssystem für einen Coiffure-Salon in Zürich, Schweiz.

## 1. Übersicht & Philosophie
- **Design:** Warme Creme- und Espressotöne, Honig-Akzente, Source Serif 4 & Geist Typografie, daktilo-inspirierte Zitate mit Courier Prime, Bento-Raster (Desktop 4 Spalten, Tablet 2, Mobile 1).
- **Zweisprachig:** Deutsch (Standard) und Türkisch (Umschalter oben rechts).
- **Einzige Wahrheitsquelle:** Salon Google Kalender (`googleapis` Service Account). Freie und belegte Zeiten werden direkt synchronisiert. Mittagspausen, Ferien und Vor-Ort-Termine, die die Coiffeuse im Telefon-Kalender einträgt, blockieren die Terminauswahl automatisch.
- **revDSG-Konformität:** Schweizer Datenschutzgesetz: Minimale Datenerfassung, Speicherung der Ausfallgebühr-Zustimmung mit Zeitstempel, Stornierungslinks mit 32-Byte-Zufallstoken, automatische Löschung nach Ablauf der Fristen.
- **Sicherheit & Anti-Missbrauch:** 6-stelliger kryptografischer E-Mail-Code (`crypto.randomInt`), SHA-256 Hash im Speicher, `timingSafeEqual`-Abgleich, Rate-Limiting (express-rate-limit), Bot-Honeypot, 10-Minuten-Reservierungssperre ([Beklemede] im Kalender).

---

## 2. Installations- & Einrichtungsschritte (Setup Guide)

### Schritt A: Google Kalender Service Account erstellen
1. Öffnen Sie die [Google Cloud Console](https://console.cloud.google.com/).
2. Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes.
3. Aktivieren Sie die **Google Calendar API** unter *APIs & Dienste -> Bibliothek*.
4. Wechseln Sie zu *APIs & Dienste -> Anmeldedaten -> Anmeldedaten erstellen -> Dienstkonto (Service Account)*.
5. Vergeben Sie einen Namen (z.B. `revair-calendar-bot`). Klicken Sie auf *Fertigstellen*.
6. Klicken Sie auf das neu erstellte Dienstkonto, wechseln Sie zum Reiter **Schlüssel** und wählen Sie *Schlüssel hinzufügen -> Neuen Schlüssel erstellen -> JSON*.
7. Laden Sie die JSON-Datei herunter. Kopieren Sie deren gesamten Inhalt (oder Base64-codieren Sie ihn).

### Schritt B: Salon-Kalender für das Dienstkonto freigeben
1. Öffnen Sie [Google Kalender](https://calendar.google.com/) auf dem Computer oder Mobiltelefon.
2. Suchen Sie Ihren Salon-Kalender in der linken Leiste unter *Meine Kalender*.
3. Klicken Sie auf die drei Punkte daneben -> *Einstellungen und Freigabe*.
4. Scrollen Sie zu *Für bestimmte Personen freigeben* und klicken Sie auf **Personen hinzufügen**.
5. Fügen Sie die E-Mail-Adresse des Dienstkontos ein (endet auf `@...iam.gserviceaccount.com`).
6. Berechtigung: **Änderungen an Terminen vornehmen** (oder *Termine verwalten*).
7. Scrollen Sie im selben Einstellungsfenster zum Abschnitt *Kalender integrieren* und kopieren Sie die **Kalender-ID** (z.B. `ihrsalon@gmail.com` oder eine lange ID mit `@group.calendar.google.com`).

### Schritt C: E-Mail App-Passwort (SMTP) generieren
Aus Sicherheitsgründen (Abschnitt 4.1 der Vorgaben) darf **niemals das Haupt-Passwort** Ihres E-Mail-Kontos verwendet werden, sondern ein anwendungsspezifisches App-Passwort:
- **Gmail / Google Workspace:**
  1. Google-Konto aufrufen -> *Sicherheit*.
  2. Sicherstellen, dass *2-Faktor-Authentifizierung (2FA)* aktiv ist.
  3. Nach *App-Passwörter* suchen.
  4. Eine neue App namens `Revair Buchungssystem` anlegen.
  5. Das generierte 16-stellige Passwort kopieren.
- **Hostpoint / Infomaniak / Swisscom:**
  1. Webmail Control Panel aufrufen -> *E-Mail-Konten -> Einstellungen -> Passwörter / Externe Programme*.
  2. SMTP-Server (z.B. `mail.hostpoint.ch`), Port 587 (STARTTLS) oder 465 (SSL).

### Schritt D: Secrets in AI Studio / Umgebungsvariablen eintragen
Tragen Sie die folgenden Werte in AI Studio Secrets bzw. `.env` ein:

```env
# Google Calendar
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
CALENDAR_ID="ihre-kalender-id@group.calendar.google.com"

# E-Mail (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="ihre-email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"
SMTP_FROM="Revair Studio <termin@revair-studio.ch>"

# Optionaler Sicherheitsschlüssel für Token
TOKEN_SECRET=""
```

*Hinweis: Wenn diese Umgebungsvariablen noch nicht eingetragen sind, startet die Anwendung im sicheren Simulations- und Entwicklungsmodus, damit die Website und das Buchungserlebnis in der Vorschau sofort fehlerfrei getestet werden können.*

---

## 3. Architektur & Dateistruktur
- `/salon.config.ts`: Alle Salondaten (Name, Telefon, Adresse, Dienstleistungen, Preise CHF, Dauer, Öffnungszeiten, 24h-Stornobedingung, revDSG-Ausfallgebühr).
- `/galeri.config.ts`: Galerie-Konfiguration, Vorher/Nachher-Paare, Zitate und Filterkategorien.
- `/public/galeri/`: Bilddateien und Vorher/Nachher-Vergleiche.
- `/server.ts`: Express-Backend mit Google Calendar API, Nodemailer, Rate-Limiting, Zod-Validierung, 10-Minuten-Hold-Cronjob und 24h-Terminerinnerungen.
- `/src/pages/HomePage.tsx`: Startseite mit 2x2 Hero-Karte, Live-Nächster-Termin, Öffnungszeiten-Badge, Fotokarten.
- `/src/pages/ArbeitenPage.tsx`: Instagram-inspirierte Bento-Galerie mit Vorher/Nachher-Schieberegler und Lightbox.
- `/src/pages/LeistungenPage.tsx`: Übersicht aller Kategorien mit gestrichelten Linien und Direkt-Buchungslinks.
- `/src/pages/BuchenPage.tsx`: 3-stufiger Buchungsablauf mit 6-stelligem Code und 10-Minuten-Reservierungssperre.
- `/src/pages/MeinTerminPage.tsx`: Geschützte Buchungsverwaltung per Einmal-Link für Kunden.
- `/src/pages/DatenschutzPage.tsx` & `/src/pages/ImpressumPage.tsx`: Gesetzliche Bestimmungen Schweiz (revDSG).
