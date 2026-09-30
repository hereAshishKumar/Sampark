import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import Header from './components/Header';
import OtpAuthModal from './components/OtpAuthModal';
import MobileInbox from './components/MobileInbox';
import DesktopInbox from './components/DesktopInbox';
import ComposeModal from './components/ComposeModal';
import EmailViewer from './components/EmailViewer';
import TelephonyDrawer from './components/TelephonyDrawer';
import AiAssistantModal from './components/AiAssistantModal';
import LoginSuccessSplash from './components/LoginSuccessSplash';
import { playChime } from './utils/speech';

export default function App() {
  const { user, token, loading: authLoading } = useAuth();
  const { lang, t, darkMode } = useLanguage();

  const [emails, setEmails] = useState([]);
  const [counts, setCounts] = useState({});
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeInitial, setComposeInitial] = useState({ to: '', subject: '' });
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [splashData, setSplashData] = useState(null);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch emails for logged in citizen with folder filter
  const fetchEmails = async (folder = activeFolder) => {
    if (!token) return;
    setLoadingEmails(true);
    try {
      const res = await fetch(`/api/emails?folder=${folder}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEmails(data.emails || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.warn('Error fetching emails:', err);
    } finally {
      setLoadingEmails(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchEmails(activeFolder);
      const interval = setInterval(() => fetchEmails(activeFolder), 6000);
      return () => clearInterval(interval);
    }
  }, [user, token, activeFolder]);

  const handleChangeFolder = (folder) => {
    setActiveFolder(folder);
    setSelectedEmail(null);
    fetchEmails(folder);
  };

  const handleSelectEmail = async (email) => {
    if (!email) {
      setSelectedEmail(null);
      return;
    }
    setSelectedEmail(email);

    // Mark as read in backend
    try {
      await fetch(`/api/emails/${email.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: true } : e));
      setCounts(prev => ({
        ...prev,
        unread: Math.max(0, (prev.unread || 1) - 1),
        read: (prev.read || 0) + 1
      }));
    } catch (e) {}
  };

  const handleToggleStar = async (id) => {
    playChime('click');
    try {
      const res = await fetch(`/api/emails/${id}/star`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.email) {
        setEmails(prev => prev.map(e => e.id === id ? { ...e, is_starred: data.email.is_starred } : e));
        if (selectedEmail?.id === id) {
          setSelectedEmail(prev => ({ ...prev, is_starred: data.email.is_starred }));
        }
        setCounts(prev => ({
          ...prev,
          starred: (prev.starred || 0) + (data.email.is_starred ? 1 : -1)
        }));
      }
    } catch (e) {}
  };

  const handleMoveFolder = async (id, targetFolder) => {
    playChime('click');
    try {
      await fetch(`/api/emails/${id}/folder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ folder: targetFolder })
      });
      fetchEmails(activeFolder);
      if (selectedEmail?.id === id) {
        setSelectedEmail(null);
      }
    } catch (e) {}
  };

  const handleReply = (email) => {
    setComposeInitial({
      to: email.sender,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`
    });
    setComposeOpen(true);
  };

  const handleDelete = async (id) => {
    playChime('click');
    try {
      await fetch(`/api/emails/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmails(activeFolder);
      if (selectedEmail?.id === id) {
        setSelectedEmail(null);
      }
    } catch (e) {}
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-400 font-bold gap-3">
        <div className="w-24 h-24 rounded-2xl bg-white p-2.5 border border-white/30 flex items-center justify-center animate-pulse shadow-xl shadow-emerald-500/20 overflow-hidden">
          <img src="/logo-clean.png" alt="संपर्क" className="w-full h-auto object-contain" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-slate-300">
          {lang === 'ta' ? 'சம்பார்க் ஏற்றப்படுகிறது...' : lang === 'hi' ? 'संपर्क लोड हो रहा है...' : 'Sampark is loading...'}
        </span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors`}>
      
      {/* Post-Login Celebration Splash Screen with Animated Glowing Logo */}
      {splashData && (
        <LoginSuccessSplash
          userName={splashData.name}
          userEmail={splashData.email}
          onComplete={() => setSplashData(null)}
        />
      )}

      <Header
        onToggleSimulator={() => setSimulatorOpen(!simulatorOpen)}
        simulatorOpen={simulatorOpen}
        onOpenAi={() => setAiAssistantOpen(true)}
        isMobile={isMobile}
      />

      <div className="flex-1">
        {!user ? (
          <OtpAuthModal onLoginSuccess={(data) => setSplashData(data)} />
        ) : (
          <>
            {isMobile ? (
              // Mobile View
              selectedEmail ? (
                <div className="p-3 max-w-lg mx-auto">
                  <EmailViewer
                    email={selectedEmail}
                    onBack={() => setSelectedEmail(null)}
                    onReply={handleReply}
                    onDelete={handleDelete}
                    onToggleStar={handleToggleStar}
                    onMoveFolder={handleMoveFolder}
                  />
                </div>
              ) : (
                <div className="max-w-lg mx-auto">
                  <MobileInbox
                    emails={emails}
                    counts={counts}
                    activeFolder={activeFolder}
                    onChangeFolder={handleChangeFolder}
                    onSelectEmail={handleSelectEmail}
                    onOpenCompose={() => {
                      setComposeInitial({ to: '', subject: '' });
                      setComposeOpen(true);
                    }}
                    onRefresh={() => fetchEmails(activeFolder)}
                    loading={loadingEmails}
                    onToggleStar={handleToggleStar}
                  />
                </div>
              )
            ) : (
              // Desktop View
              <DesktopInbox
                emails={emails}
                counts={counts}
                activeFolder={activeFolder}
                onChangeFolder={handleChangeFolder}
                selectedEmail={selectedEmail}
                onSelectEmail={handleSelectEmail}
                onOpenCompose={() => {
                  setComposeInitial({ to: '', subject: '' });
                  setComposeOpen(true);
                }}
                onRefresh={() => fetchEmails(activeFolder)}
                loading={loadingEmails}
                onReply={handleReply}
                onDelete={handleDelete}
                onToggleStar={handleToggleStar}
                onMoveFolder={handleMoveFolder}
              />
            )}
          </>
        )}
      </div>

      {/* Compose Email Modal */}
      <ComposeModal
        isOpen={composeOpen}
        onClose={() => {
          setComposeOpen(false);
          setComposeInitial({ to: '', subject: '' });
        }}
        onSent={() => {
          fetchEmails(activeFolder);
          setComposeInitial({ to: '', subject: '' });
        }}
        initialTo={composeInitial.to}
        initialSubject={composeInitial.subject}
      />

      {/* Live Telephony Simulator Drawer */}
      <TelephonyDrawer
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      {/* AI Assistant Modal (Sampark Saathi) */}
      <AiAssistantModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
    </div>
  );
}
