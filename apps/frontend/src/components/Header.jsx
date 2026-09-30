import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { playChime } from '../utils/speech';
import { 
  Radio, Smartphone, LogOut, CheckCircle2, Bot, 
  Sun, Moon, ShieldCheck 
} from 'lucide-react';

export default function Header({ onToggleSimulator, simulatorOpen, onOpenAi, isMobile = false }) {
  const { lang, setLang, darkMode, toggleDarkMode, t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800 transition-colors w-full overflow-hidden">
      <div className={`${isMobile ? 'max-w-lg' : 'max-w-7xl'} mx-auto px-2.5 sm:px-6 lg:px-8 w-full`}>
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-3">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white p-1 shadow-md border border-white/20 select-none overflow-hidden shrink-0">
              <img 
                src="/logo-clean.png" 
                alt="संपर्क" 
                className="w-full h-full object-contain" 
              />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-2xl font-black tracking-tight text-white truncate">
                  {lang === 'en' ? 'Sampark' : 'संपर्क'}
                </span>
                {lang !== 'en' && (
                  <span className="hidden sm:inline text-xs font-semibold text-slate-400 border-l border-slate-700 pl-2 font-mono">
                    Sampark
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-300 font-semibold tracking-wide truncate max-w-[85px] xs:max-w-[125px] sm:max-w-none">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Action Bar (100% Inside Viewport, Perfectly Aligned on Mobile) */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            
            {/* AI Assistant Button (Sampark Saathi) */}
            <button
              onClick={() => {
                playChime('click');
                onOpenAi();
              }}
              title={t('aiAssistant')}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0"
            >
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200" />
              <span className="hidden md:inline">{t('aiAssistant')}</span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-300 animate-ping" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                playChime('click');
                toggleDarkMode();
              }}
              title={darkMode ? t('lightMode') : t('darkMode')}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center shrink-0"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />}
            </button>

            {/* Language Selector: Desktop Full Mode */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-bold shrink-0">
              <button
                onClick={() => { playChime('click'); setLang('hi'); }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  lang === 'hi'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => { playChime('click'); setLang('ta'); }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  lang === 'ta'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => { playChime('click'); setLang('en'); }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  lang === 'en'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Language Selector: Ultra-Compact Mobile Mode (Prevents any overflow) */}
            <div className="flex sm:hidden items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px] font-black shrink-0">
              <button
                onClick={() => { playChime('click'); setLang('hi'); }}
                className={`px-1.5 py-1 rounded-md transition-all ${
                  lang === 'hi'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हि
              </button>
              <button
                onClick={() => { playChime('click'); setLang('ta'); }}
                className={`px-1.5 py-1 rounded-md transition-all ${
                  lang === 'ta'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                த
              </button>
              <button
                onClick={() => { playChime('click'); setLang('en'); }}
                className={`px-1.5 py-1 rounded-md transition-all ${
                  lang === 'en'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Live Telephony Simulator ("Mobile update section") */}
            <button
              onClick={() => {
                playChime('click');
                onToggleSimulator();
              }}
              title={t('phoneSimulator')}
              className={`flex items-center gap-1 p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border shrink-0 ${
                simulatorOpen 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' 
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-emerald-400/50 hover:text-emerald-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="hidden lg:inline">{t('phoneSimulator')}</span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Logout */}
            {user && (
              <button
                onClick={() => {
                  playChime('click');
                  logout();
                }}
                title={t('logout')}
                className="p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors border border-slate-700 flex items-center justify-center text-xs font-bold shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">{t('logout')}</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
