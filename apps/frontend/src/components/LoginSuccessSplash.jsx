import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, CheckCircle2, Radio, Heart } from 'lucide-react';

export default function LoginSuccessSplash({ userName = 'नागरिक', userEmail = '', onComplete }) {
  const { lang, t } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar over 1.8s
    const startTime = Date.now();
    const duration = 1800;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete?.();
        }, 200);
      }
    }, 40);

    // Fallback safety: ensure dashboard opens even if timer stalls
    const safetyTimeout = setTimeout(() => {
      onComplete?.();
    }, 2500);

    return () => {
      clearInterval(timer);
      clearTimeout(safetyTimeout);
    };
  }, [onComplete]);

  return (
    <div 
      onClick={() => onComplete?.()}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden p-6 select-none animate-fadeIn cursor-pointer"
      title={lang === 'ta' ? 'தொடர கிளிக் செய்யவும்' : lang === 'hi' ? 'आगे बढ़ने के लिए क्लिक करें' : 'Click to continue'}
    >
      
      {/* Background Radial Glow & Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-teal-500/20 rounded-full blur-2xl animate-ping" style={{ animationDuration: '3s' }} />

        {/* Ambient floating celebration elements */}
        {['🌾', '✨', '✉️', '⭐', '🌾', '🎉', '📶'].map((emoji, idx) => (
          <span
            key={idx}
            className="absolute text-2xl sm:text-3xl animate-float opacity-70"
            style={{
              left: `${15 + (idx * 12)}%`,
              bottom: `${10 + (idx * 10)}%`,
              animationDelay: `${idx * 0.3}s`,
              animationDuration: `${3 + (idx % 2)}s`
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Centerpiece: Glowing Animated Sampark Logo */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm sm:max-w-md w-full">
        
        {/* Pulsing Outer Rings */}
        <div className="relative mb-5">
          {/* Signal Ring 1 */}
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          {/* Signal Ring 2 */}
          <div className="absolute -inset-3 rounded-3xl border-2 border-emerald-400/40 animate-pulse" style={{ animationDuration: '1.5s' }} />

          {/* The Hero Logo Emblem - 100% Crisp clean logo card with no shadowing */}
          <div className="relative w-48 sm:w-56 rounded-3xl bg-white p-3 shadow-2xl shadow-emerald-500/40 border-2 border-emerald-400/50 flex items-center justify-center transform transition-transform duration-700 hover:scale-105 overflow-hidden">
            <img 
              src="/logo-clean.png" 
              alt="संपर्क Logo" 
              className="w-full h-auto object-contain"
            />

            {/* Glowing verified checkmark badge */}
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center border-4 border-slate-900 shadow-lg animate-scaleIn">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
          {t ? t('appName') : 'संपर्क'}
        </h1>
        <p className="text-xs sm:text-sm font-bold text-emerald-300/90 tracking-wide uppercase mb-4">
          {t ? t('tagline') : 'Your Digital Post'}
        </p>

        {/* Warm Personal Greeting */}
        <div className="space-y-1 mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {lang === 'ta' ? `வணக்கம், ${userName}! 🌾` : lang === 'hi' ? `स्वागत है, ${userName}! 🌾` : `Welcome, ${userName}! 🌾`}
          </h2>
          <p className="text-xs text-slate-300 font-mono">
            {userEmail}
          </p>
          <p className="text-xs text-emerald-300 font-medium pt-1">
            {lang === 'ta'
              ? 'உங்கள் டிஜிட்டல் அஞ்சல் பெட்டி திறக்கப்படுகிறது...'
              : (lang === 'hi' ? 'आपका डिजिटल डाकघर खोला जा रहा है...' : 'Opening your universal mailbox...')}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2.5 p-0.5 border border-slate-700 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500 rounded-full transition-all duration-75 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full mt-2 text-[11px] text-slate-400 font-mono">
          <span>{lang === 'ta' ? 'பாதுகாப்பான சரிபார்ப்பு ✓' : (lang === 'hi' ? 'सुरक्षित सत्यापन ✓' : 'Verified Securely ✓')}</span>
          <span>{progress}%</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onComplete?.();
          }}
          className="mt-3 text-xs text-slate-400 hover:text-emerald-300 font-medium transition-colors"
        >
          {lang === 'ta' ? 'நேரடியாக தொடரவும் ›' : (lang === 'hi' ? 'सीधे इनबॉक्स पर जाएं ›' : 'Skip directly to mailbox ›')}
        </button>

      </div>

    </div>
  );
}
