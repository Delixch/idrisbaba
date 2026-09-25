export interface ServiceItem {
  id: string;
  nameDe: string;
  nameTr: string;
  category: 'schnitt' | 'farbe' | 'balayage' | 'pflege' | 'hochzeit';
  durationMinutes: number;
  priceChf: number;
  descriptionDe: string;
  descriptionTr: string;
}

export interface SalonOpeningHours {
  day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  nameDe: string;
  nameTr: string;
  isOpen: boolean;
  openTime?: string; // e.g. "09:00"
  closeTime?: string; // e.g. "19:00"
}

export const SALON_CONFIG = {
  name: "Revair Studio Zürich",
  shortName: "Revair",
  sloganDe: "Gepflegtes Haar beginnt mit Zeit für dich.",
  sloganTr: "Bakımlı saç, kendine ayırdığın zamanla başlar.",
  city: "Zürich",
  address: {
    street: "Bahnhofstrasse 48",
    postalCode: "8001",
    city: "Zürich",
    country: "Schweiz",
    googleMapsUrl: "https://maps.google.com/?q=Bahnhofstrasse+48,+8001+Z%C3%BCrich",
  },
  contact: {
    phone: "+41 44 211 48 90",
    phoneDisplay: "+41 44 211 48 90",
    email: "adnan.aydin@bluewin.ch",
    googleAppointmentUrl: "https://calendar.app.google/9y49yDQBuvTrT39WA",
    instagram: "revair.zurich",
    instagramUrl: "https://instagram.com/revair.zurich",
  },
  timeZone: "Europe/Zurich",
  chairsCount: 2, // Koltuk sayısı
  slotIntervalMinutes: 15, // Grid interval
  cancelNoticeHours: 24, // 24 Stunden vorher
  holdDurationMinutes: 10, // 10 Minuten Reservierungssperre
  noShowRuleDe: "Bei unentschuldigtem Nichterscheinen oder einer Absage weniger als 24 Stunden vor dem Termin wird der volle Betrag der Leistung per Post in Rechnung gestellt.",
  noShowRuleTr: "Randevuya gelinmemesi veya 24 saatten az süre kala iptal edilmesi durumunda, hizmet bedeli posta yoluyla faturalandırılır.",
  paymentMethodsDe: ["TWINT", "Maestro / Debit", "Kreditkarten (Visa, Mastercard)", "Barzahlung"],
  paymentMethodsTr: ["TWINT", "Maestro / Banka Kartı", "Kredi Kartı (Visa, Mastercard)", "Nakit"],

  openingHours: [
    { day: 1, nameDe: "Montag", nameTr: "Pazartesi", isOpen: false },
    { day: 2, nameDe: "Dienstag", nameTr: "Salı", isOpen: true, openTime: "09:00", closeTime: "19:00" },
    { day: 3, nameDe: "Mittwoch", nameTr: "Çarşamba", isOpen: true, openTime: "09:00", closeTime: "19:00" },
    { day: 4, nameDe: "Donnerstag", nameTr: "Perşembe", isOpen: true, openTime: "09:00", closeTime: "20:00" },
    { day: 5, nameDe: "Freitag", nameTr: "Cuma", isOpen: true, openTime: "09:00", closeTime: "19:00" },
    { day: 6, nameDe: "Samstag", nameTr: "Cumartesi", isOpen: true, openTime: "08:30", closeTime: "17:00" },
    { day: 0, nameDe: "Sonntag", nameTr: "Pazar", isOpen: false },
  ] as SalonOpeningHours[],

  services: [
    // Schnitt & Styling
    {
      id: "schnitt-damen",
      category: "schnitt",
      nameDe: "Damenhaarschnitt & Styling",
      nameTr: "Kadın Saç Kesimi & Fön",
      durationMinutes: 60,
      priceChf: 110,
      descriptionDe: "Typberatung, wohltuende Haarwäsche mit Kopfmassage, präziser Schnitt & Föhnstyling.",
      descriptionTr: "Stil danışmanlığı, baş masajlı yıkama, kişiye özel kesim ve hacimli fön.",
    },
    {
      id: "schnitt-herren",
      category: "schnitt",
      nameDe: "Herrenhaarschnitt",
      nameTr: "Erkek Saç Kesimi",
      durationMinutes: 45,
      priceChf: 65,
      descriptionDe: "Individueller Schnitt nach Mass, Konturenpflege, Haarwäsche & erfrischendes Styling.",
      descriptionTr: "Kişiye özel kesim, ense ve favori temizliği, saç yıkama ve mat dokulu şekillendirme.",
    },
    {
      id: "blowout-styling",
      category: "schnitt",
      nameDe: "Signature Blowout & Finish",
      nameTr: "Signature Blowout & Fön",
      durationMinutes: 45,
      priceChf: 75,
      descriptionDe: "Glanz-Wäsche, reichhaltige Feuchtigkeitspflege und langanhaltendes Red-Carpet Blowout.",
      descriptionTr: "Parlaklık veren yıkama, yoğun nem terapisi ve gün boyu kalıcı volümlü fön.",
    },
    {
      id: "pony-fresh",
      category: "schnitt",
      nameDe: "Pony nachschneiden",
      nameTr: "Kahkül Düzeltme",
      durationMinutes: 15,
      priceChf: 25,
      descriptionDe: "Schnelles, millimetergenaues Nachschneiden und Auffrischen der Stirnpartie.",
      descriptionTr: "Kahkül ve yüzü çevreleyen tutamların milimetrik hassasiyetle tazelenmesi.",
    },

    // Farbe & Nuancen
    {
      id: "ansatz-coloration",
      category: "farbe",
      nameDe: "Ansatzfarbe & Grauabdeckung",
      nameTr: "Dip Boya & Beyaz Kapama",
      durationMinutes: 75,
      priceChf: 95,
      descriptionDe: "100% perfekte Grauabdeckung und nahtlose Farbanpassung an Ihren Naturton.",
      descriptionTr: "%100 beyaz kapama ve doğal tona pürüzsüz geçişli profesyonel dip boya.",
    },
    {
      id: "komplett-farbe",
      category: "farbe",
      nameDe: "Komplett-Coloration & Glanz",
      nameTr: "Tüm Saç Boyama & Parlaklık",
      durationMinutes: 90,
      priceChf: 145,
      descriptionDe: "Reichhaltige Farbbrillanz vom Ansatz bis in die Spitzen mit versiegelndem Pflegebad.",
      descriptionTr: "Dipten uca canlı, derinlikli renk yansımaları ve renk sabitleyici parlaklık banyosu.",
    },
    {
      id: "glossing-toning",
      category: "farbe",
      nameDe: "Glossing & Farbveredelung",
      nameTr: "Glossing & Cila Terapisi",
      durationMinutes: 45,
      priceChf: 60,
      descriptionDe: "Sanfte Tönung für kühle oder warme Reflexe und glasartigen Glanzeffekt.",
      descriptionTr: "İstenmeyen sıcak/soğuk yansımaları nötrleyen, aynamsı parlaklık veren cila bakımı.",
    },

    // Balayage & Highlights
    {
      id: "signature-balayage",
      category: "balayage",
      nameDe: "Signature Balayage & Glossing",
      nameTr: "Signature Balayage & Cila",
      durationMinutes: 180,
      priceChf: 260,
      descriptionDe: "Freihand-Pinseltechnik für weiche, sonnengeküsste Farbverläufe inkl. Toner & Bond-Schutz.",
      descriptionTr: "Doğal güneş ışıltısı hissi veren serbest el açma tekniği, cila ve bağ koruyucu dahil.",
    },
    {
      id: "babylights-meches",
      category: "balayage",
      nameDe: "Babylights & Full Head Mèches",
      nameTr: "Babylights & İnce Röfle",
      durationMinutes: 150,
      priceChf: 220,
      descriptionDe: "Ultrafeine Foliensträhnen für maximale multidimensionale Helligkeit und Eleganz.",
      descriptionTr: "Çok boyutlu aydınlık sağlayan mikro ince folyo tutamları ve renk tonlaması.",
    },
    {
      id: "face-framing",
      category: "balayage",
      nameDe: "Face Framing / Money Piece",
      nameTr: "Face Framing / Ön Tutam Işıltısı",
      durationMinutes: 90,
      priceChf: 130,
      descriptionDe: "Gezielte Konturaufhellung rund um das Gesicht für einen frischen, strahlenden Look.",
      descriptionTr: "Yüz hatlarını aydınlatan ve ifadeyi canlandıran ön hat ışıltıları ve parlaklık cilası.",
    },

    // Pflege & Treatments
    {
      id: "revair-oil-spa",
      category: "pflege",
      nameDe: "Revair Botanical Oil Spa",
      nameTr: "Revair Botanik Yağ Terapisi",
      durationMinutes: 45,
      priceChf: 70,
      descriptionDe: "Wärmendes Kopfhaut-Ritual mit kaltgepresstem Kräuteröl, Akupressur & Dampfkompresse.",
      descriptionTr: "Soğuk sıkım bitkisel yağlar, akupresür baş masajı ve sıcak buhar kompresiyle derin bakım.",
    },
    {
      id: "keratin-feuchtigkeit",
      category: "pflege",
      nameDe: "Intensive Keratin-Restrukturierung",
      nameTr: "Yoğun Keratin & Nem Bakımı",
      durationMinutes: 30,
      priceChf: 50,
      descriptionDe: "Repariert geschädigte Haarfaserbindungen, stoppt Haarbruch und schenkt Geschmeidigkeit.",
      descriptionTr: "Hasar görmüş saç bağlarını onaran, kırılmaları önleyen ve ipeksi yumuşaklık veren kür.",
    },

    // Hochzeit & Events
    {
      id: "braut-styling",
      category: "hochzeit",
      nameDe: "Braut-Styling Komplett (inkl. Probe)",
      nameTr: "Gelin Saç Tasarımı (Prova Dahil)",
      durationMinutes: 120,
      priceChf: 280,
      descriptionDe: "Ausführlicher Probetermin, typgerechtes Traum-Styling und Schleierbefestigung am Hochzeitstag.",
      descriptionTr: "Detaylı prova seansı, düğün gününde kusursuz gelin saçı ve duvak sabitleme.",
    },
    {
      id: "festliche-frisur",
      category: "hochzeit",
      nameDe: "Festliche Hochsteck- / Eventfrisur",
      nameTr: "Özel Davet & Topuz Tasarımı",
      durationMinutes: 60,
      priceChf: 120,
      descriptionDe: "Elegante Chignon-, Flecht- oder Hollywood-Waves für Galas, Bälle und besondere Anlässe.",
      descriptionTr: "Zarif ense topuzu, örgü veya Hollywood dalgalarıyla unutulmaz davet saçı.",
    },
  ] as ServiceItem[],
};
