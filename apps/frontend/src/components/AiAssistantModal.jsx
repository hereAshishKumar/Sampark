import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speakTextFemale, stopSpeaking, startVoiceDictation, playChime } from '../utils/speech';
import { 
  Bot, X, Send, Mic, MicOff, Volume2, VolumeX, Sparkles, 
  HelpCircle, ShieldCheck, Landmark, MessageSquare, ArrowRight 
} from 'lucide-react';

export default function AiAssistantModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'ta'
        ? "வணக்கம்! நான் உங்கள் 'சம்பார்க் கிராம உதவியாளர்'. உங்கள் வங்கி கடிதங்கள், அரசு திட்டங்கள் அல்லது ஏதேனும் சந்தேகங்கள் பற்றி என்னிடம் கேளுங்கள்!"
        : (lang === 'hi'
          ? "नमस्ते! मैं आपका 'संपर्क साथी' हूँ। आप मुझसे अपने सरकारी पत्रों, बैंक मैसेज या किसी भी योजना के बारे में सरल भाषा में पूछ सकते हैं!"
          : "Hello! I am your 'Sampark Rural Guide'. Ask me anything about your bank letters, government subsidies, or email safety!"),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  if (!isOpen) return null;

  const quickPrompts = lang === 'ta' ? [
    "🌾 என் கிசான் திட்ட பணம் வந்துவிட்டதா?",
    "🏦 எஸ்பிஐ கடன் கடிதத்தில் என்ன எழுதப்பட்டுள்ளது?",
    "🚨 போலி லாட்டரி செய்தியை எப்படி கண்டறிவது?"
  ] : (lang === 'hi' ? [
    "🌾 क्या मेरा पीएम-किसान पैसा आ गया है?",
    "🏦 बैंक के KCC लोन पत्र में क्या लिखा है?",
    "🚨 फर्जी लॉटरी और फ्रॉड से कैसे बचें?"
  ] : [
    "🌾 Did I receive my PM-Kisan subsidy?",
    "🏦 Explain my SBI KCC loan letter",
    "🚨 How to spot fake lottery scams?"
  ]);

  const handleSend = async (questionText) => {
    const q = questionText || input;
    if (!q || !q.trim()) return;

    playChime('click');
    const userMsg = {
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, language: lang })
      });
      const data = await res.json();
      
      const aiReply = {
        sender: 'ai',
        text: data.answer || "मैं आपकी बात समझ रहा हूँ। कृपया अपने बैंक या पंचायत मित्र से भी संपर्क करें।",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiReply]);
      playChime('success');
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "माफ कीजिए, नेटवर्क धीमा है। कृपया थोड़ी देर बाद पूछें।",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text, index) => {
    if (speakingIndex === index) {
      stopSpeaking();
      setSpeakingIndex(null);
      return;
    }
    setSpeakingIndex(index);
    speakTextFemale(text, lang, () => {
      setSpeakingIndex(null);
    });
  };

  const handleToggleDictation = () => {
    if (isDictating) {
      setIsDictating(false);
      return;
    }
    setIsDictating(true);
    startVoiceDictation(lang, (transcript) => {
      setInput(transcript);
      handleSend(transcript);
    }, () => {
      setIsDictating(false);
    }, () => {
      setIsDictating(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              🤖
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-1.5">
                <span>{t('aiTitle')}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                {t('aiTagline')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat message area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-lg shrink-0">
                  🤖
                </div>
              )}

              <div className={`max-w-[80%] rounded-2xl p-4 shadow-xs ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5 text-[10px] text-slate-400">
                  <span>{m.time}</span>
                  {m.sender === 'ai' && (
                    <button
                      onClick={() => handleSpeak(m.text, idx)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                        speakingIndex === idx
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200'
                      }`}
                    >
                      {speakingIndex === idx ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{speakingIndex === idx ? t('stopSpeaking') : t('listen')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400 italic">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{lang === 'ta' ? 'சிந்திக்கிறது...' : lang === 'hi' ? 'संपर्क साथी सोच रहा है...' : 'Sampark Guide is thinking...'}</span>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
            {lang === 'ta' ? '💡 விரைவான கேள்விகள்:' : lang === 'hi' ? '💡 त्वरित सवाल:' : '💡 Quick Questions:'}
          </span>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-emerald-400 hover:text-emerald-600 shrink-0 shadow-2xs transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleToggleDictation}
            className={`p-3 rounded-2xl transition-all shadow-xs border ${
              isDictating
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
            }`}
            title={t('speakToType')}
          >
            {isDictating ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isDictating ? t('listeningMic') : (lang === 'ta' ? 'உங்கள் கேள்வியை இங்கே எழுதவும்...' : lang === 'hi' ? 'अपना प्रश्न यहाँ लिखें या बोलकर पूछें...' : 'Type your question or click mic to speak...')}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
}
