import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { ArbeitenPage } from './pages/ArbeitenPage.js';
import { LeistungenPage } from './pages/LeistungenPage.js';
import { BuchenPage } from './pages/BuchenPage.js';
import { MeinTerminPage } from './pages/MeinTerminPage.js';
import { DatenschutzPage } from './pages/DatenschutzPage.js';
import { ImpressumPage } from './pages/ImpressumPage.js';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#12100e] text-[#f7f3ec] relative selection:bg-[#fbbf24] selection:text-[#12100e]">
          {/* Ambient Gold Spot Light */}
          <div className="ambient-gold-spot" />
          <Header />
          <main className="flex-1 relative z-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/arbeiten" element={<ArbeitenPage />} />
              <Route path="/leistungen" element={<LeistungenPage />} />
              <Route path="/buchen" element={<BuchenPage />} />
              <Route path="/mein-termin/:token" element={<MeinTerminPage />} />
              <Route path="/datenschutz" element={<DatenschutzPage />} />
              <Route path="/impressum" element={<ImpressumPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
