import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { speakOtpDigits, stopSpeaking, playChime } from '../utils/speech';
import { 
  Smartphone, Volume2, VolumeX, PhoneCall, ArrowRight, 
  ShieldCheck, Sparkles, CheckCircle2, KeyRound, Grid, Delete, Wifi, BatteryMedium 
} from 'lucide-react';

export default function OtpAuthModal({ onLoginSuccess }) {
  const { lang, t } = useLanguage();
  const { requestOtp, loginWithOtp } = useAuth();

  const [phone, setPhone] = useState('9236531947');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverDemoOtp, setServerDemoOtp] = useState('');
  const [isSpeakingOtp, setIsSpeakingOtp] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);

  const handleKeyPress = (digit) => {
    playChime('click');
    if (step === 'phone') {
      if (phone.length < 10) setPhone(prev => prev + digit);
    } else {
      if (otp.length < 6) setOtp(prev => prev + digit);
    }
  };

  const handleKeyBackspace = () => {
    playChime('click');
    if (step === 'phone') {
      setPhone(prev => prev.slice(0, -1));
    } else {
      setOtp(prev => prev.slice(0, -1));
    }
  };

  const handleSendOtp = async (channel = 'sms') => {
    playChime('click');
    setError('');
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const res = await requestOtp(cleanPhone, lang, channel);
      if (res.success) {
        playChime('success');
        const code = res.demo_otp || '123456';
        setServerDemoOtp(code);
        setStep('otp');
        
        if (channel === 'voice_ui') {
          handleSpeakCode(code);
        }
      } else {
        setError(res.error || 'ओटीपी भेजने में त्रुटि हुई।');
      }
    } catch (err) {
      setError('सर्वर से संपर्क नहीं हो पाया।');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakCode = (codeToSpeak) => {
    const targetCode = codeToSpeak || serverDemoOtp || '123456';
    if (isSpeakingOtp) {
      stopSpeaking();
      setIsSpeakingOtp(false);
      return;
    }

    setIsSpeakingOtp(true);
    speakOtpDigits(targetCode, lang, () => {
      setIsSpeakingOtp(false);
    });
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    playChime('click');
    setError('');
    if (!otp || otp.trim().length < 4) {
      setError('कृपया 6 अंकों का ओटीपी कोड दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
      const res = await loginWithOtp(cleanPhone, otp.trim(), lang, name);
      if (res.success) {
        playChime('success');
        // Trigger post-login celebration splash!
        onLoginSuccess?.({
          name: name || `नागरिक ${cleanPhone.slice(-4)}`,
          email: `${cleanPhone}@sampark.in`
        });
      } else {
        setError(res.error || 'ओटीपी कोड अमान्य है।');
      }
    } catch (err) {
      setError('सत्यापन में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  const useDemoCode = (code) => {
    playChime('click');
    setOtp(code);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors relative overflow-hidden">
      
      {/* Playful Floating Ambient Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <span className="absolute top-10 left-10 text-5xl opacity-20 animate-float" style={{ animationDuration: '6s' }}>🌾</span>
        <span className="absolute bottom-16 left-16 text-6xl opacity-15 animate-float" style={{ animationDuration: '8s' }}>☀️</span>
        <span className="absolute top-20 right-16 text-5xl opacity-20 animate-float" style={{ animationDuration: '7s' }}>✉️</span>
        <span className="absolute bottom-20 right-12 text-6xl opacity-15 animate-float" style={{ animationDuration: '9s' }}>🇮🇳</span>
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden transition-all relative z-10">
        
        {/* Banner with Official Sampark Logo - Fully Immune to Bright Mode Switching */}
        <div className="bg-slate-950 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-7 text-white text-center relative overflow-hidden border-b border-slate-800">
          <div className="w-28 sm:w-32 mx-auto mb-3.5 rounded-2xl bg-white p-2.5 shadow-xl border border-white/40 flex items-center justify-center transform hover:scale-105 transition-transform overflow-hidden">
            <img 
              src="/logo-clean.png" 
              alt="संपर्क" 
              className="w-full h-auto object-contain"
            />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>{t('appName')}</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold tracking-wider uppercase">
              {t('tagline')}
            </span>
          </h2>
          
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-medium">
            {t('loginSubtitle')}
          </p>

          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'ta' ? 'பாதுகாப்பானது மற்றும் இலவசம்' : lang === 'hi' ? 'सुरक्षित एवं निःशुल्क सेवा' : '100% Free & Secure'}</span>
          </div>
        </div>

        {/* Dynamic Simulated Phone Screen Preview */}
        <div className="px-6 pt-4 pb-2">
          <div className="bg-slate-950 text-emerald-400 p-3 rounded-2xl border border-slate-800 font-mono shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800/80">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Wifi className="w-3 h-3" />
                <span>SAMPARK 5G</span>
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span>98%</span>
                <BatteryMedium className="w-3 h-3 text-emerald-400" />
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">{t('myEmail')}</span>
                <span className="font-bold text-emerald-300 text-sm">
                  {phone ? `${phone.slice(-10)}@sampark.in` : '9236531947@sampark.in'}
                </span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-7 pt-2">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {step === 'phone' ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('phoneInputLabel')}
                  </label>
                  <button
                    type="button"
                    onClick={() => { playChime('click'); setShowKeypad(!showKeypad); }}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Grid className="w-3 h-3" />
                    <span>{showKeypad ? t('keypadToggleHide') : t('keypadToggleShow')}</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9236531947"
                    className="block w-full pl-20 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 text-xl font-bold tracking-wider focus:border-emerald-500 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Optional Interactive Tactile Keypad */}
              {showKeypad && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleKeyPress(d)}
                      className="py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-bold text-slate-800 dark:text-slate-100 hover:bg-emerald-50 active:scale-95 transition-all shadow-2xs"
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { playChime('click'); setPhone(''); }}
                    className="py-2.5 rounded-xl bg-red-100 text-red-700 font-bold text-xs"
                  >
                    {t('clearKeypad')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyPress('0')}
                    className="py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-bold text-slate-800 dark:text-slate-100"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleKeyBackspace}
                    className="py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Three Verification Options */}
              <div className="space-y-2.5 pt-2">
                
                {/* 1. Primary: SMS OTP */}
                <button
                  type="button"
                  onClick={() => handleSendOtp('sms')}
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span className="text-lg">📱</span>
                  <span>{loading ? (lang === 'ta' ? 'காத்திருக்கவும்...' : lang === 'hi' ? 'प्रतीक्षा करें...' : 'Please wait...') : t('sendOtpSms')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                {/* 2. Audio Voice OTP Speaker */}
                <button
                  type="button"
                  onClick={() => handleSendOtp('voice_ui')}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800 font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <span className="text-base">🔊</span>
                  <span>{t('listenOtpAloud')}</span>
                </button>

                {/* 3. Twilio Automated Voice Call */}
                <button
                  type="button"
                  onClick={() => handleSendOtp('call')}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <span className="text-base">📞</span>
                  <span>{t('sendOtpVoiceCall')}</span>
                </button>

              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  🔑 {t('otpInputLabel')}
                </label>
                <button
                  type="button"
                  onClick={() => { playChime('click'); setStep('phone'); }}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>{t('changeNumber')} (+91 {phone})</span>
                </button>
              </div>

              {/* OTP Digits Input */}
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="• • • • • •"
                className="block w-full text-center py-3.5 px-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 text-3xl font-black tracking-[0.4em] focus:border-emerald-500 outline-none shadow-inner"
                autoFocus
              />

              {/* Voice OTP Speaker Button in OTP View */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSpeakCode(serverDemoOtp)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSpeakingOtp
                      ? 'bg-red-500 text-white border-red-600 animate-pulse'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {isSpeakingOtp ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                  <span>{isSpeakingOtp ? t('stopSpeaking') : t('listenOtpAloud')}</span>
                </button>
              </div>

              {/* Fast-Track Demo Chips for Evaluators */}
              <div className="p-3 bg-emerald-50/70 dark:bg-slate-800/60 border border-emerald-200 dark:border-slate-700 rounded-2xl space-y-1.5 text-center">
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  💡 {t('quickDemoOtp')}:
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => useDemoCode(serverDemoOtp || '123456')}
                    className="px-3 py-1.5 bg-emerald-200/80 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-300 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>⚡ {serverDemoOtp ? (lang === 'ta' ? `குறியீடு: ${serverDemoOtp}` : lang === 'hi' ? `प्राप्त कोड: ${serverDemoOtp}` : `Code: ${serverDemoOtp}`) : (lang === 'ta' ? 'மாதிரி: 123456' : lang === 'hi' ? 'परीक्षण कोड: 123456' : 'Demo: 123456')}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-base"
              >
                <span>{loading ? (lang === 'ta' ? 'சரிபார்க்கிறது...' : lang === 'hi' ? 'जाँच हो रही है...' : 'Verifying...') : t('verifyOtpBtn')}</span>
                <CheckCircle2 className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp('sms')}
                className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold py-1"
              >
                {t('resendOtp')}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
