import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { playChime } from '../utils/speech';
import EmailViewer from './EmailViewer';
import { 
  Inbox, Send, Star, Trash2, Search, PenSquare, 
  RefreshCw, Smartphone, ShieldCheck, Mail, Volume2, 
  AlertTriangle, FileText, CheckCircle2 
} from 'lucide-react';

export default function DesktopInbox({ 
  emails, 
  counts = {}, 
  activeFolder, 
  onChangeFolder, 
  selectedEmail, 
  onSelectEmail, 
  onOpenCompose, 
  onRefresh, 
  loading, 
  onReply, 
  onDelete, 
  onToggleStar, 
  onMoveFolder 
}) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    { id: 'inbox', label: t('folderAll'), count: counts.inbox || 0, badgeColor: 'bg-emerald-600 text-white', activeStyle: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-l-4 border-emerald-600 font-bold' },
    { id: 'unread', label: t('folderUnread'), count: counts.unread || 0, badgeColor: 'bg-emerald-500 text-white font-bold', activeStyle: 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 border-l-4 border-emerald-500 font-bold' },
    { id: 'starred', label: t('folderStarred'), count: counts.starred || 0, badgeColor: 'bg-amber-400 text-slate-950 font-bold', activeStyle: 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-l-4 border-amber-500 font-bold' },
    { id: 'read', label: t('folderRead'), count: counts.read || 0, badgeColor: 'bg-blue-500 text-white', activeStyle: 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-l-4 border-blue-500 font-bold' },
    { id: 'draft', label: t('folderDrafts'), count: counts.draft || 0, badgeColor: 'bg-purple-500 text-white', activeStyle: 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border-l-4 border-purple-500 font-bold' },
    { id: 'spam', label: t('folderSpam'), count: counts.spam || 0, badgeColor: 'bg-red-500 text-white', activeStyle: 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-l-4 border-red-500 font-bold' },
    { id: 'trash', label: t('folderTrash'), count: counts.trash || 0, badgeColor: 'bg-slate-500 text-white', activeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-l-4 border-slate-500 font-bold' },
    { id: 'sent', label: t('folderSent'), count: counts.sent || 0, badgeColor: 'bg-teal-500 text-white', activeStyle: 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border-l-4 border-teal-500 font-bold' }
  ];

  const filteredEmails = emails.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.subject.toLowerCase().includes(q) ||
      e.sender.toLowerCase().includes(q) ||
      e.body_text.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-300/40 dark:shadow-none border-2 border-slate-300/80 dark:border-slate-800 overflow-hidden grid grid-cols-12 min-h-[750px] transition-colors">
        
        {/* Left Sidebar: Feature Section (Col 3) with Soft Blurry Shadow Border */}
        <aside className="col-span-3 border-r-2 border-slate-300/90 dark:border-slate-800 shadow-[6px_0_20px_-3px_rgba(0,0,0,0.08)] dark:shadow-none bg-slate-100/70 dark:bg-slate-950/40 p-4 flex flex-col justify-between relative z-20">
          <div>
            {/* Compose Button */}
            <button
              onClick={() => {
                playChime('click');
                onOpenCompose();
              }}
              className="w-full mb-6 py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm transition-all active:scale-98"
            >
              <span className="text-xl">✏️</span>
              <span>{t('compose')}</span>
            </button>

            {/* Folder Navigation */}
            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const isActive = activeFolder === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playChime('click');
                      onChangeFolder(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? item.activeStyle
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <span className="truncate pr-1">{item.label}</span>
                    {item.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${item.badgeColor}`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Citizen Identity Card */}
          <div className="p-4 bg-white dark:bg-slate-800 border-2 border-slate-200/90 dark:border-slate-700 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <img src="/favicon.png" alt="संपर्क" className="w-4 h-4 object-contain" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('activeCitizenAccount')}</span>
            </div>
            <div className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate">
              {user?.email}
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('smsAlertActive')}</span>
              </span>
            </div>
          </div>
        </aside>

        {/* Central Email List: Inbox Section (Col 4) with Soft Blurry Shadow Border */}
        <section className="col-span-4 border-r-2 border-slate-300/90 dark:border-slate-800 shadow-[6px_0_20px_-3px_rgba(0,0,0,0.07)] dark:shadow-none flex flex-col h-full bg-slate-50/70 dark:bg-slate-950/20 relative z-10">
          
          {/* Search bar & Refresh with Clean Separator */}
          <div className="p-3 border-b-2 border-slate-200/90 dark:border-slate-800 flex items-center gap-2 bg-white/90 dark:bg-slate-900 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            <button
              onClick={() => { playChime('click'); onRefresh(); }}
              disabled={loading}
              title={t('refresh')}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Email Item Rows with Crisp Dividers */}
          <div className="flex-1 overflow-y-auto divide-y-2 divide-slate-200/70 dark:divide-slate-800">
            {filteredEmails.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                {t('noEmails')}
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const isSpam = email.folder === 'spam';

                return (
                  <div
                    key={email.id}
                    onClick={() => {
                      playChime('click');
                      onSelectEmail(email);
                    }}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                        : isSpam
                        ? 'bg-red-50/30 dark:bg-red-950/20 hover:bg-red-50/60'
                        : !email.is_read
                        ? 'bg-white dark:bg-slate-900 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        : 'bg-slate-50/40 dark:bg-slate-950/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 font-normal text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-xs truncate ${!email.is_read ? 'font-bold text-slate-950 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {email.sender_name || email.sender}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {email.is_starred && (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(email.received_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className={`text-xs truncate mb-1 ${!email.is_read ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                      {email.subject}
                    </div>

                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {email.body_text}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Pane: Reading Pane (Col 5) */}
        <main className="col-span-5 flex flex-col h-full bg-white dark:bg-slate-900">
          {selectedEmail ? (
            <EmailViewer
              email={selectedEmail}
              onBack={() => onSelectEmail(null)}
              onReply={onReply}
              onDelete={onDelete}
              onToggleStar={onToggleStar}
              onMoveFolder={onMoveFolder}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-3xl mb-3 shadow-xs">
                📬
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1">
                {t('noEmailSelected')}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {t('noEmailSelectedDesc')}
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
