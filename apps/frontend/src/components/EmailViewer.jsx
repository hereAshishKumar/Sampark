import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speakTextFemale, stopSpeaking, playChime } from '../utils/speech';
import { 
  ArrowLeft, Volume2, VolumeX, Reply, Trash2, Printer, 
  ShieldCheck, Calendar, User, Mail, Star, AlertTriangle, 
  Globe, Bot, CheckCircle2, Mic2 
} from 'lucide-react';

export default function EmailViewer({ email, onBack, onReply, onDelete, onToggleStar, onMoveFolder }) {
  const { lang, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  if (!email) return null;

  // Speak with female assistant voice
  const handleListenFemale = (customText = null) => {
    playChime('click');
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const content = customText || translatedText || email.body_text;
    const speechIntro = lang === 'ta' 
      ? `${email.sender_name || 'அனுப்புநர்'} அனுப்பிய கடிதம். பொருள்: ${email.subject}. செய்தி விவரம்: `
      : (lang === 'hi' 
        ? `${email.sender_name || 'प्रेषक'} द्वारा भेजा गया पत्र। विषय है: ${email.subject}। संदेश इस प्रकार है: `
        : `Email from ${email.sender_name || 'sender'}. Subject: ${email.subject}. Content: `);

    speakTextFemale(`${speechIntro} ${content}`, lang, () => {
      setIsSpeaking(false);
    });
  };

  // 1-Tap Sentence-by-Sentence Regional Translation
  const handleTranslate = async () => {
    playChime('click');
    if (translatedText) {
      setTranslatedText(null);
      return;
    }

    setTranslating(true);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: email.body_text, targetLang: lang })
      });
      const data = await res.json();
      if (data.translated) {
        setTranslatedText(data.translated);
        playChime('success');
      }
    } catch (err) {
      alert('अनुवाद में समस्या आई।');
    } finally {
      setTranslating(false);
    }
  };

  // AI Explanation in pure single language
  const handleAiExplain = async () => {
    playChime('click');
    if (aiExplanation) {
      setAiExplanation(null);
      return;
    }

    setExplaining(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: email.subject,
          body: email.body_text,
          sender: email.sender_name,
          language: lang
        })
      });
      const data = await res.json();
      if (data.summary) {
        setAiExplanation(data.summary);
        playChime('success');
      }
    } catch (err) {
      alert('विश्लेषण में समस्या आई।');
    } finally {
      setExplaining(false);
    }
  };

  const isGovOrBank = email.sender.includes('gov.in') || 
                      email.sender.includes('bank') || 
                      email.sender.includes('kisan') || 
                      email.sender.includes('sbi');
  const isSpam = email.folder === 'spam';

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl lg:rounded-none shadow-sm lg:shadow-none border border-slate-200 dark:border-slate-800 lg:border-0 overflow-hidden flex flex-col h-full transition-colors">
      
      {/* Top Action Bar with Crisp Separator */}
      <div className="p-3 sm:p-4 border-b-2 border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        
        <button
          onClick={() => {
            stopSpeaking();
            playChime('click');
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backBtn')}</span>
        </button>

        {/* Action Controls (Clean Emerald / Navy styling, No Orange) */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Female Voice Assistant Readout */}
          <button
            onClick={() => handleListenFemale()}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition-all ${
              isSpeaking
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{t('stopSpeaking')}</span>
              </>
            ) : (
              <>
                <Mic2 className="w-4 h-4 text-emerald-200" />
                <span>{t('listenFemale')}</span>
              </>
            )}
          </button>

          {/* Regional Translator */}
          <button
            onClick={handleTranslate}
            disabled={translating}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
              translatedText
                ? 'bg-teal-600 text-white border-teal-700'
                : 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800 hover:bg-teal-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{translating ? '...' : (translatedText ? t('originalBtn') : t('translateBtn'))}</span>
          </button>

          {/* AI Explanation */}
          <button
            onClick={handleAiExplain}
            disabled={explaining}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
              aiExplanation
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-500" />
            <span>{explaining ? t('aiExplaining') : t('aiExplainBtn')}</span>
          </button>

          {/* Star Toggle */}
          <button
            onClick={() => onToggleStar(email.id)}
            title={email.is_starred ? t('unstarBtn') : t('starBtn')}
            className={`p-2 rounded-2xl border transition-all ${
              email.is_starred
                ? 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-500 border-yellow-300'
                : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-yellow-500'
            }`}
          >
            <Star className={`w-4 h-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </button>

          {/* Reply */}
          <button
            onClick={() => onReply(email)}
            className="p-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100"
            title="उत्तर दें"
          >
            <Reply className="w-4 h-4" />
          </button>

          {/* Spam Toggle */}
          <button
            onClick={() => onMoveFolder(email.id, email.folder === 'spam' ? 'inbox' : 'spam')}
            title={t('spamBtn')}
            className={`p-2 rounded-2xl border transition-all ${
              isSpam
                ? 'bg-red-500 text-white border-red-600'
                : 'bg-white dark:bg-slate-800 text-red-600 border-slate-200 dark:border-slate-700 hover:bg-red-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(email.id)}
            title={t('deleteBtn')}
            className="p-2 text-red-600 bg-white dark:bg-slate-800 border border-red-200 dark:border-slate-700 rounded-2xl hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* AI Explanation Card */}
      {aiExplanation && (
        <div className="p-4 sm:p-5 m-3 sm:m-4 bg-emerald-50 dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-200">
                {aiExplanation.title}
              </h4>
            </div>
            
            <button
              onClick={() => speakTextFemale(aiExplanation.spoken, lang)}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t('listenFemale')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-slate-700">
              <div className="font-bold text-slate-500 dark:text-slate-400 mb-0.5">{lang === 'ta' ? '📌 விவரம்:' : lang === 'hi' ? '📌 विवरण:' : '📌 Details:'}</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{aiExplanation.what}</div>
            </div>

            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-slate-700">
              <div className="font-bold text-slate-500 dark:text-slate-400 mb-0.5">{lang === 'ta' ? '💰 தொகை:' : lang === 'hi' ? '💰 राशि:' : '💰 Amount:'}</div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-400">{aiExplanation.money}</div>
            </div>

            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-slate-700">
              <div className="font-bold text-slate-500 dark:text-slate-400 mb-0.5">{lang === 'ta' ? '✅ அடுத்த படி:' : lang === 'hi' ? '✅ अगला कदम:' : '✅ Next Step:'}</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{aiExplanation.action}</div>
            </div>

            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-slate-700">
              <div className="font-bold text-slate-500 dark:text-slate-400 mb-0.5">{lang === 'ta' ? '🛡️ பாதுகாப்பு:' : lang === 'hi' ? '🛡️ सुरक्षा:' : '🛡️ Safety:'}</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">{aiExplanation.safety}</div>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
        
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-snug">
            {email.subject}
          </h1>

          {isSpam ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>{t('spamNotice')}</span>
            </span>
          ) : isGovOrBank && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('verifiedNotice')}</span>
            </span>
          )}
        </div>

        {/* Sender details */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black flex items-center justify-center text-lg shrink-0 shadow-sm">
            {(email.sender_name || email.sender).charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
              {email.sender_name || email.sender}
            </div>
            <div className="text-xs text-slate-400 font-mono truncate">
              {email.sender}
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 shrink-0">
            <div>
              {new Date(email.received_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="mt-0.5">
              {new Date(email.received_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        {translatedText ? (
          <div className="space-y-4">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'மொழிபெயர்க்கப்பட்ட செய்தி' : lang === 'hi' ? 'अनुवादित संदेश' : 'Translated Message'}</span>
              </span>
              <button
                onClick={() => setTranslatedText(null)}
                className="underline text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100"
              >
                {t('originalBtn')}
              </button>
            </div>
            <div className="text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
              {translatedText}
            </div>
          </div>
        ) : email.body_html ? (
          <div 
            className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed break-words"
            dangerouslySetInnerHTML={{ __html: email.body_html }}
          />
        ) : (
          <div className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
            {email.body_text}
          </div>
        )}
      </div>

    </div>
  );
}
