export interface GalleryItem {
  id: string;
  category: 'schnitt' | 'farbe' | 'balayage' | 'pflege' | 'hochzeit';
  titleDe: string;
  titleTr: string;
  subtitleDe: string;
  subtitleTr: string;
  image: string;
  isBeforeAfter?: boolean;
  beforeImage?: string;
  afterImage?: string;
  relatedServiceId?: string;
  aspect?: 'square' | 'portrait' | 'wide';
}

export interface GalleryQuote {
  id: string;
  quoteDe: string;
  quoteTr: string;
  authorDe?: string;
  authorTr?: string;
}

export const GALERI_CONFIG = {
  items: [
    {
      id: "gal-1",
      category: "balayage",
      titleDe: "Caramel Honey Balayage",
      titleTr: "Karamel Bal Balayage",
      subtitleDe: "Weicher Übergang von Naturansatz zu warmen Honigreflexen",
      subtitleTr: "Doğal dipten sıcak bal ışıltılarına yumuşak geçiş",
      image: "/galeri/look_caramel_balayage.svg",
      isBeforeAfter: true,
      beforeImage: "/galeri/before_caramel.svg",
      afterImage: "/galeri/after_caramel.svg",
      relatedServiceId: "signature-balayage",
      aspect: "wide",
    },
    {
      id: "gal-2",
      category: "schnitt",
      titleDe: "Textured French Bob",
      titleTr: "Fransız Bob Kesimi",
      subtitleDe: "Präziser kinnlanger Bob mit weichen, bewegten Spitzen",
      subtitleTr: "Çene hizasında net hatlı, uçları hareketli bob kesim",
      image: "/galeri/look_french_bob.svg",
      relatedServiceId: "schnitt-damen",
      aspect: "square",
    },
    {
      id: "gal-3",
      category: "farbe",
      titleDe: "Rich Espresso Gloss",
      titleTr: "Zengin Espresso Cila",
      subtitleDe: "Tiefbraune Nuancen mit spiegelndem Seidenglanz",
      subtitleTr: "İpeksi ışıltılı derin espresso ve çikolata tonları",
      image: "/galeri/look_espresso_gloss.svg",
      relatedServiceId: "glossing-toning",
      aspect: "portrait",
    },
    {
      id: "gal-4",
      category: "pflege",
      titleDe: "Botanical Oil Scalp Ritual",
      titleTr: "Botanik Yağ Baş Masajı",
      subtitleDe: "Nährende Kräuteröle für gestärkte Haarwurzeln & Glanz",
      subtitleTr: "Kökten uca canlandırıcı bitkisel yağ terapisi",
      image: "/galeri/look_oil_treatment.svg",
      relatedServiceId: "revair-oil-spa",
      aspect: "square",
    },
    {
      id: "gal-5",
      category: "balayage",
      titleDe: "Sun-Kissed Babylights",
      titleTr: "Güneş Işıltısı Babylights",
      subtitleDe: "Mikrofeine Highlights rund um die Gesichtskontur",
      subtitleTr: "Yüz çevresinde doğal ve parlak bebek sarısı ışıltılar",
      image: "/galeri/look_babylights.svg",
      relatedServiceId: "babylights-meches",
      aspect: "square",
    },
    {
      id: "gal-6",
      category: "schnitt",
      titleDe: "Modern Gentleman Crop",
      titleTr: "Modern Erkek Kesimi",
      subtitleDe: "Klassischer Schnitt mit matter Kontur und Textur oben",
      subtitleTr: "Temiz ense geçişi ve üstte doğal dokulu erkek kesimi",
      image: "/galeri/look_gentleman_cut.svg",
      relatedServiceId: "schnitt-herren",
      aspect: "square",
    },
    {
      id: "gal-7",
      category: "farbe",
      titleDe: "Transformation: Copper Gold",
      titleTr: "Dönüşüm: Bakır Altın",
      subtitleDe: "Vorher matt & ausgewaschen, nachher lebendige Kupferwärme",
      subtitleTr: "Öncesi matlaşmış zemin, sonrası canlı bakır-altın ışıltı",
      image: "/galeri/look_copper_transformation.svg",
      isBeforeAfter: true,
      beforeImage: "/galeri/before_copper.svg",
      afterImage: "/galeri/after_copper.svg",
      relatedServiceId: "komplett-farbe",
      aspect: "wide",
    },
    {
      id: "gal-8",
      category: "hochzeit",
      titleDe: "Romantic Chignon Waves",
      titleTr: "Romantik Gelin Topuzu",
      subtitleDe: "Locker gesteckter Braut-Chignon mit sanften Wellen",
      subtitleTr: "Doğal dalgalarla bezenmiş zarif dağınık ense topuzu",
      image: "/galeri/look_bridal_chignon.svg",
      relatedServiceId: "braut-styling",
      aspect: "portrait",
    },
    {
      id: "gal-9",
      category: "balayage",
      titleDe: "Face Framing Contour",
      titleTr: "Yüz Çerçeveleme Işıltısı",
      subtitleDe: "Sofortige Frische durch gezielte Konturaufhellung",
      subtitleTr: "Yüz hatlarını belirginleştiren aydınlık kontur",
      image: "/galeri/look_face_framing.svg",
      relatedServiceId: "face-framing",
      aspect: "square",
    },
    {
      id: "gal-10",
      category: "pflege",
      titleDe: "Intensive Keratin Infusion",
      titleTr: "Yoğun Keratin Terapisi",
      subtitleDe: "Restrukturierung von brüchigen Spitzen",
      subtitleTr: "Kırılan saç tellerini onaran pürüzsüzleştirici kür",
      image: "/galeri/look_keratin.svg",
      relatedServiceId: "keratin-feuchtigkeit",
      aspect: "square",
    },
    {
      id: "gal-11",
      category: "schnitt",
      titleDe: "Signature 90s Volume Blowout",
      titleTr: "90lar Hacimli Fön",
      subtitleDe: "Sprungkraft, Fülle und schwerelose Seidigkeit",
      subtitleTr: "Ağırlık yapmayan, ipeksi ve dolgun hacimli fön",
      image: "/galeri/look_blowout.svg",
      relatedServiceId: "blowout-styling",
      aspect: "square",
    },
    {
      id: "gal-12",
      category: "hochzeit",
      titleDe: "Boho Bridal Braid & Pins",
      titleTr: "Bohem Gelin Örgüsü",
      subtitleDe: "Detailverliebte Flechtfrisur für Sommerhochzeiten",
      subtitleTr: "Yaz düğünleri için detaylı bohem örgü tasarımı",
      image: "/galeri/look_bridal_braid.svg",
      relatedServiceId: "festliche-frisur",
      aspect: "portrait",
    }
  ] as GalleryItem[],

  quotes: [
    {
      id: "quote-1",
      quoteDe: "Nourish · Restore · Shine",
      quoteTr: "Besle · Onar · Parlat",
      authorDe: "Revair Philosophie",
      authorTr: "Revair Felsefesi",
    },
    {
      id: "quote-2",
      quoteDe: "Jeder Schnitt ist ein Unikat, geschaffen für deine Ausstrahlung.",
      quoteTr: "Her kesim, senin enerjin için yaratılmış eşsiz bir eserdir.",
      authorDe: "Handwerk Zürich",
      authorTr: "Zürih Zanaatkarlığı",
    },
    {
      id: "quote-3",
      quoteDe: "Gesundes Haar braucht keine Magie — nur Geduld, Pflege und Liebe zum Detail.",
      quoteTr: "Sağlıklı saç sihir istemez — sadece sabır, özen ve detay sevgisi.",
      authorDe: "Hair Rituals",
      authorTr: "Saç Ritüelleri",
    }
  ] as GalleryQuote[],
};
