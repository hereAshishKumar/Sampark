import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speakTextFemale, stopSpeaking, playChime } from '../utils/speech';
import { 
  Volume2, VolumeX, Mail, RefreshCw, PenSquare, 
  ChevronRight, Inbox, ShieldCheck, Star, AlertTriangle, Mic2 
} from 'lucide-react';

export default function MobileInbox({ 
  emails, 
  counts = {}, 
  activeFolder, 
  onChangeFolder, 
  onSelectEmail, 
  onOpenCompose, 
  onRefresh, 
  loading, 
  onToggleStar 
}) {
  const { lang, t } = useLanguage();
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  const folders = [
    { id: 'inbox', label: t('folderAll'), count: counts.inbox || 0, color: 'bg-emerald-600 text-white' },
    { id: 'unread', label: t('folderUnread'), count: counts.unread || 0, color: 'bg-teal-600 text-white font-bold' },
    { id: 'sent', label: t('folderSent'), count: counts.sent || 0, color: 'bg-teal-700 text-white font-bold' },
    { id: 'starred', label: t('folderStarred'), count: counts.starred || 0, color: 'bg-yellow-500 text-slate-950 font-bold' },
    { id: 'read', label: t('folderRead'), count: counts.read || 0, color: 'bg-blue-600 text-white' },
    { id: 'draft', label: t('folderDrafts'), count: counts.draft || 0, color: 'bg-purple-600 text-white' },
    { id: 'spam', label: t('folderSpam'), count: counts.spam || 0, color: 'bg-red-600 text-white' },
    { id: 'trash', label: t('folderTrash'), count: counts.trash || 0, color: 'bg-slate-600 text-white' },
  ];

  const handleQuickListen = (e, email) => {
    e.stopPropagation();
    playChime('click');
    
    if (activeSpeakingId === email.id) {
      stopSpeaking();
      setActiveSpeakingId(null);
      return;
    }

    setActiveSpeakingId(email.id);
    const intro = lang === 'ta' 
      ? `${email.sender_name || 'அனுப்புநர்'} கடிதம்: ${email.subject}.` 
      : (lang === 'hi' 
        ? `${email.sender_name || 'प्रेषक'} का पत्र: ${email.subject}।` 
        : `Message from ${email.sender_name || 'sender'}: ${email.subject}.`);

    speakTextFemale(`${intro} ${email.body_text}`, lang, () => {
      setActiveSpeakingId(null);
    });
  };

  return (
    <div className="pb-28">
      
      {/* Horizontal Emoji Folder Carousel (Clean single symbols, no double icons) */}
      <div className="p-2 sm:p-3 bg-white dark:bg-slate-900 border-b-2 border-slate-300/80 dark:border-slate-800 sticky top-16 sm:top-20 z-10 shadow-md shadow-slate-200/50 dark:shadow-none transition-colors">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {folders.map((f) => {
            const isActive = activeFolder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  playChime('click');
                  onChangeFolder(f.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  isActive
                    ? `${f.color} shadow-md`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{f.label}</span>
                {f.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}>
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => { playChime('click'); onRefresh(); }}
            disabled={loading}
            className="p-2 ml-auto text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            title={t('refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Email Card Stream */}
      <div className="p-3 sm:p-4 space-y-3">
        {emails.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-16 h-16 mx-auto mb-3.5 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-600 flex items-center justify-center text-3xl">
              📭
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base mb-1">
              {t('noEmails')}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              {t('noEmailsSub')}
            </p>
          </div>
        ) : (
          emails.map((email) => {
            const isSpeakingThis = activeSpeakingId === email.id;
            const isGovOrBank = email.sender.includes('gov.in') || 
                                email.sender.includes('bank') || 
                                email.sender.includes('kisan') || 
                                email.sender.includes('sbi');
            const isSpam = email.folder === 'spam';

            return (
              <div
                key={email.id}
                onClick={() => {
                  playChime('click');
                  onSelectEmail(email);
                }}
                className={`p-4 rounded-3xl border-2 transition-all cursor-pointer shadow-md shadow-slate-200/60 dark:shadow-none active:scale-[0.99] ${
                  isSpam
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                    : !email.is_read
                    ? 'bg-emerald-50/40 dark:bg-slate-800/90 border-emerald-400/80 dark:border-emerald-500/60 shadow-emerald-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-300/80 dark:border-slate-800 hover:border-emerald-400'
                }`}
              >
                {/* Header Row: Sender & Star */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black shrink-0 shadow-xs ${
                      isSpam
                        ? 'bg-red-500 text-white'
                        : 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white'
                    }`}>
                      {isSpam ? '🚨' : (email.sender_name || email.sender).charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm truncate ${!email.is_read ? 'font-black text-slate-950 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                          {email.sender_name || email.sender}
                        </span>
                        {!email.is_read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {email.sender}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playChime('click');
                        onToggleStar(email.id);
                      }}
                      className="p-1 text-slate-300 hover:text-yellow-500"
                    >
                      <Star className={`w-4 h-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                    <span className="text-[11px] text-slate-400">
                      {new Date(email.received_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Subject & Preview */}
                <div className="mb-3 pl-1">
                  <h4 className={`text-sm leading-snug line-clamp-1 ${!email.is_read ? 'font-black text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                    {email.subject}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {email.body_text}
                  </p>
                </div>

                {/* Bottom Row: Category Pill & Audio Listen Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    {isSpam ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{t('spamNotice')}</span>
                      </span>
                    ) : isGovOrBank ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{t('verifiedNotice')}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {email.is_read ? t('folderRead') : t('folderUnread')}
                      </span>
                    )}
                  </div>

                  {/* Immediate Female Voice Assistant Listen Button */}
                  <button
                    onClick={(e) => handleQuickListen(e, email)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                      isSpeakingThis
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200'
                    }`}
                  >
                    {isSpeakingThis ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>{t('stopSpeaking')}</span>
                      </>
                    ) : (
                      <>
                        <Mic2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                        <span>{t('listen')}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) for Mobile Compose (Deep Teal / Emerald, No Orange, Single Pen Icon) */}
      <button
        onClick={() => {
          playChime('click');
          onOpenCompose();
        }}
        className="fixed bottom-6 right-6 z-20 flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold rounded-3xl shadow-2xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all text-sm select-none"
      >
        <PenSquare className="w-5 h-5 text-white" />
        <span>{t('compose')}</span>
      </button>

    </div>
  );
}
