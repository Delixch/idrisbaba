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
      titleDe: "Signature Honey Balayage",
      titleTr: "İmza Bal Balyajı",
      subtitleDe: "Fließender Übergang von Naturansatz zu warmen Honigreflexen",
      subtitleTr: "Doğal dipten sıcak altın ve bal ışıltılarına kusursuz geçiş",
      image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=85",
      isBeforeAfter: true,
      beforeImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
      afterImage: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1000&q=85",
      relatedServiceId: "signature-balayage",
      aspect: "wide",
    },
    {
      id: "gal-2",
      category: "schnitt",
      titleDe: "Textured French Bob & Precision Cut",
      titleTr: "Fransız Bob & Hassas Kesim",
      subtitleDe: "Präziser kinnlanger Bob mit weichen, fließenden Spitzen",
      subtitleTr: "Çene hizasında net hatlı, uçları hareketli parizyen bob kesim",
      image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=85",
      relatedServiceId: "schnitt-damen",
      aspect: "square",
    },
    {
      id: "gal-3",
      category: "farbe",
      titleDe: "Rich Espresso Gloss & Silk Shine",
      titleTr: "Zengin Espresso Cila & İpeksi Parlaklık",
      subtitleDe: "Tiefbraune Nuancen mit spiegelndem Seidenglanz",
      subtitleTr: "İpeksi ışıltılı derin espresso ve zengin çikolata tonları",
      image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=85",
      relatedServiceId: "glossing-toning",
      aspect: "portrait",
    },
    {
      id: "gal-4",
      category: "pflege",
      titleDe: "Botanical Hair Spa Ritual",
      titleTr: "Botanik Saç Spa Ritüeli",
      subtitleDe: "Exklusive Kopfhautmassage mit ätherischen Ölen",
      subtitleTr: "Kökten uca canlandırıcı bitkisel yağ terapisi ve kafa derisi masajı",
      image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=85",
      relatedServiceId: "revair-oil-spa",
      aspect: "square",
    },
    {
      id: "gal-5",
      category: "balayage",
      titleDe: "Sun-Kissed Golden Babylights",
      titleTr: "Güneş Işıltısı Babylights",
      subtitleDe: "Mikrofeine Highlights rund um die Gesichtskontur",
      subtitleTr: "Yüz çevresinde doğal ve parlak bebek sarısı ışıltılar",
      image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1000&q=85",
      relatedServiceId: "babylights-meches",
      aspect: "square",
    },
    {
      id: "gal-6",
      category: "schnitt",
      titleDe: "Gentleman Tailored Cut",
      titleTr: "Modern Beyefendi Kesimi",
      subtitleDe: "Klassischer Schnitt mit feiner Kontur und natürlicher Textur",
      subtitleTr: "Temiz ense geçişi ve üstte doğal dokulu erkek saç tasarımı",
      image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1000&q=85",
      relatedServiceId: "schnitt-herren",
      aspect: "square",
    },
    {
      id: "gal-7",
      category: "farbe",
      titleDe: "Vibrant Copper Transformation",
      titleTr: "Canlı Bakır Dönüşümü",
      subtitleDe: "Lebendige Kupferwärme mit dimensionaler Farbtiefe",
      subtitleTr: "Öncesi soluk zemin, sonrası ışıltılı ve parlak bakır tonu",
      image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1000&q=85",
      isBeforeAfter: true,
      beforeImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
      afterImage: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1000&q=85",
      relatedServiceId: "komplett-farbe",
      aspect: "wide",
    },
    {
      id: "gal-8",
      category: "hochzeit",
      titleDe: "Haute Couture Bridal Styling",
      titleTr: "Özel Tasarım Gelin Saçı",
      subtitleDe: "Locker gesteckter Braut-Chignon mit sanften Wellen",
      subtitleTr: "Doğal dalgalarla bezenmiş zarif ve zamansız ense topuzu",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85",
      relatedServiceId: "braut-styling",
      aspect: "portrait",
    },
    {
      id: "gal-9",
      category: "balayage",
      titleDe: "Face-Framing Money Piece",
      titleTr: "Yüz Çerçeveleme Işıltısı",
      subtitleDe: "Sofortige Ausstrahlung durch gezielte Konturaufhellung",
      subtitleTr: "Yüz hatlarını belirginleştiren aydınlık kontur tekniği",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=85",
      relatedServiceId: "face-framing",
      aspect: "square",
    },
    {
      id: "gal-10",
      category: "pflege",
      titleDe: "Liquid Gold Keratin Infusion",
      titleTr: "Sıvı Altın Keratin Kürü",
      subtitleDe: "Tiefenwirksame Restrukturierung für seidig fallendes Haar",
      subtitleTr: "Kırılan saç tellerini onaran pürüzsüzleştirici lüks bakım",
      image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=85",
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
      authorDe: "Idris Philosophie",
      authorTr: "Idris Felsefesi",
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
