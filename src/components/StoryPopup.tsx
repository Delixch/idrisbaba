import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

const SEEN_KEY = 'idris_story_seen';

// Floating Instagram-style story teaser: autoplays once, sways gently, removes itself when finished.
export const StoryPopup: React.FC = () => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(() => {
    try {
      return sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (gone) return;
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, [gone]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // storage unavailable (private mode) - the story just shows again next visit
    }
    setLeaving(true);
    setTimeout(() => setGone(true), 500);
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  };

  if (gone) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 transition-all duration-500 ease-out ${
        visible && !leaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
      }`}
    >
      <div className="story-sway relative w-[132px] sm:w-[180px] aspect-[9/16] rounded-[22px] p-[3px] bg-[conic-gradient(from_200deg,#e8b860,#c96442,#8a3d6b,#e8b860)] shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
        <div className="relative w-full h-full rounded-[19px] overflow-hidden bg-[#12100e]">
          <video
            ref={videoRef}
            key={language}
            src={`/story/idris_story_${language === 'tr' ? 'tr' : 'de'}.mp4`}
            className="w-full h-full object-cover cursor-pointer"
            autoPlay
            muted
            playsInline
            preload="auto"
            onClick={toggleSound}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress(v.currentTime / v.duration);
            }}
            onEnded={dismiss}
          />

          {/* Instagram-style progress bar */}
          <div className="absolute top-2 left-2.5 right-2.5 h-[3px] rounded-full bg-white/30 overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${progress * 100}%` }} />
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label={language === 'de' ? 'Story schliessen' : "Story'yi kapat"}
            className="absolute top-4 right-2 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? (language === 'de' ? 'Ton an' : 'Sesi aç') : language === 'de' ? 'Ton aus' : 'Sesi kapat'}
            className="absolute bottom-2 left-2 h-7 px-2 rounded-full bg-black/45 text-white flex items-center gap-1 text-[10px] font-semibold hover:bg-black/70 transition-colors"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {muted && <span>{language === 'de' ? 'Ton' : 'Ses'}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
