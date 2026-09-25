import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/galeri');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function createSvg(title, tone, extraSvg = '') {
  let g1 = '#42281a', g2 = '#23160e', highlight = '#e5ab46';
  if (tone === 'balayage') {
    g1 = '#9b6c31'; g2 = '#2a1a11'; highlight = '#fae3a0';
  } else if (tone === 'before') {
    g1 = '#3a332d'; g2 = '#1f1b18'; highlight = '#80756a';
  } else if (tone === 'after') {
    g1 = '#b87333'; g2 = '#361d12'; highlight = '#ffdfa0';
  } else if (tone === 'oil') {
    g1 = '#785324'; g2 = '#2c1e0e'; highlight = '#ffda73';
  } else if (tone === 'espresso') {
    g1 = '#332018'; g2 = '#170f0b'; highlight = '#8a5c3e';
  } else if (tone === 'bridal') {
    g1 = '#6e5645'; g2 = '#2a1f18'; highlight = '#f3e5d3';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="grad" cx="60%" cy="40%" r="70%">
      <stop offset="0%" stop-color="${highlight}" stop-opacity="0.85"/>
      <stop offset="40%" stop-color="${g1}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${g2}" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="lines" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="${highlight}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#grad)"/>
  
  <!-- Flowing hair line paths -->
  <g stroke="url(#lines)" fill="none" stroke-linecap="round" opacity="0.6">
    <path d="M 100,50 C 250,200 180,500 350,850" stroke-width="18"/>
    <path d="M 200,30 C 350,220 280,520 450,850" stroke-width="22"/>
    <path d="M 320,10 C 470,240 400,540 560,850" stroke-width="26"/>
    <path d="M 450,0 C 580,260 520,560 670,850" stroke-width="16"/>
    <path d="M 580,20 C 690,280 620,580 750,850" stroke-width="20"/>
  </g>

  <!-- Accent glow highlights -->
  <circle cx="550" cy="250" r="140" fill="${highlight}" opacity="0.25" filter="blur(40px)"/>

  ${extraSvg}

  <!-- Watermark badge -->
  <g transform="translate(40, 710)">
    <rect width="280" height="50" rx="12" fill="#2e231c" opacity="0.75"/>
    <text x="20" y="32" font-family="'Source Serif 4', serif" font-size="19" fill="#fbf8f2" font-weight="600">${title}</text>
  </g>
</svg>`;
}

const assets = [
  { name: 'look_caramel_balayage.svg', title: 'Caramel Balayage', tone: 'balayage' },
  { name: 'before_caramel.svg', title: 'Vorher: Matt & Aschig', tone: 'before' },
  { name: 'after_caramel.svg', title: 'Nachher: Warm Honey', tone: 'after' },
  { name: 'look_french_bob.svg', title: 'French Bob & Fringe', tone: 'espresso' },
  { name: 'look_espresso_gloss.svg', title: 'Rich Espresso Gloss', tone: 'espresso' },
  { name: 'look_oil_treatment.svg', title: 'Botanical Hair Oil', tone: 'oil' },
  { name: 'look_babylights.svg', title: 'Fine Babylights', tone: 'balayage' },
  { name: 'look_gentleman_cut.svg', title: 'Gentleman Precision Cut', tone: 'espresso' },
  { name: 'look_copper_transformation.svg', title: 'Copper Gold Glow', tone: 'after' },
  { name: 'before_copper.svg', title: 'Vorher: Stumpf & Ausgewaschen', tone: 'before' },
  { name: 'after_copper.svg', title: 'Nachher: Kupferrot Gold', tone: 'after' },
  { name: 'look_bridal_chignon.svg', title: 'Bridal Romantic Updo', tone: 'bridal' },
  { name: 'look_face_framing.svg', title: 'Face Framing Highlights', tone: 'balayage' },
  { name: 'look_keratin.svg', title: 'Keratin Restructure', tone: 'oil' },
  { name: 'look_blowout.svg', title: 'Voluminous 90s Blowout', tone: 'balayage' },
  { name: 'look_bridal_braid.svg', title: 'Boho Bridal Braid', tone: 'bridal' },
];

for (const a of assets) {
  const filePath = path.join(outDir, a.name);
  fs.writeFileSync(filePath, createSvg(a.title, a.tone), 'utf8');
}

console.log(`Generated ${assets.length} gallery assets successfully.`);
