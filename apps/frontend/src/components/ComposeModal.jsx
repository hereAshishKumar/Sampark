import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { startVoiceDictation } from '../utils/speech';
import { Send, X, Mic, MicOff, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ComposeModal({ isOpen, onClose, onSent, initialTo = '', initialSubject = '' }) {
  const { lang, t } = useLanguage();
  const { token, user } = useAuth();

  const [to, setTo] = useState(initialTo || '');
  const [subject, setSubject] = useState(initialSubject || '');
  const [body, setBody] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  // Reset/sync data whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setTo(initialTo || '');
      setSubject(initialSubject || '');
      setBody('');
      setError('');
      setIsDictating(false);
    }
  }, [isOpen, initialTo, initialSubject]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Erase all mail data so new mail starts completely fresh
    setTo('');
    setSubject('');
    setBody('');
    setError('');
    setIsDictating(false);
    if (recognitionInstance) {
      try { recognitionInstance.stop(); } catch (e) {}
    }
    onClose();
  };

  const handleToggleDictation = () => {
    if (isDictating && recognitionInstance) {
      recognitionInstance.stop();
      setIsDictating(false);
      return;
    }

    setIsDictating(true);
    const recognition = startVoiceDictation(
      lang,
      (transcript) => {
        setBody((prev) => (prev ? `${prev} ${transcript}` : transcript));
      },
      () => {
        setIsDictating(false);
      },
      (err) => {
        setIsDictating(false);
      }
    );
    setRecognitionInstance(recognition);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');

    if (!to || !subject) {
      setError(
        lang === 'ta' 
          ? 'பெறுநர் மற்றும் பொருளை உள்ளிடவும்.' 
          : lang === 'hi' 
          ? 'कृपया प्राप्तकर्ता और विषय भरें।' 
          : 'Please fill recipient and subject.'
      );
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ to, subject, body })
      });
      const data = await res.json();
      if (res.ok) {
        // Completely erase all form data after sending for next new mail
        setTo('');
        setSubject('');
        setBody('');
        setError('');
        setIsDictating(false);
        if (recognitionInstance) {
          try { recognitionInstance.stop(); } catch (e) {}
        }
        onSent?.();
        onClose();
      } else {
        setError(data.error || (lang === 'ta' ? 'செய்தி அனுப்ப முடியவில்லை.' : lang === 'hi' ? 'पत्र भेजने में विफलता हुई।' : 'Failed to dispatch email.'));
      }
    } catch (err) {
      setError(lang === 'ta' ? 'அனுப்புவதில் பிழை ஏற்பட்டது.' : lang === 'hi' ? 'संदेश भेजने में नेटवर्क त्रुटि हुई।' : 'Network error sending email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
              ✏️
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {t('compose')}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {t('fromLabel')} {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSend} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t('toLabel')}
            </label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="kisan@sampark.in"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 outline-none transition-all shadow-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {t('subjectLabel')}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('subjectPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 outline-none transition-all shadow-xs"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('bodyLabel')}
              </label>

              {/* Voice Dictation (Speech-to-Text) Button */}
              <button
                type="button"
                onClick={handleToggleDictation}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  isDictating
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                }`}
              >
                {isDictating ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>{t('listeningMic')}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>{t('speakToType')}</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={isDictating ? t('listeningMic') : t('bodyPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:border-emerald-500 outline-none resize-none leading-relaxed transition-all shadow-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {t('cancelBtn')}
            </button>
            
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-md shadow-emerald-500/20 transition-all text-xs sm:text-sm active:scale-98"
            >
              {sending ? t('sendingText') : t('sendBtn')}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
