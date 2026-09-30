import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speakTextFemale, stopSpeaking } from '../utils/speech';
import { 
  Smartphone, MessageSquare, PhoneCall, PhoneOff, PhoneIncoming, 
  X, Sparkles, Send, ShieldAlert, CheckCircle2, Radio 
} from 'lucide-react';

export default function TelephonyDrawer({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('sms'); // 'sms' | 'call' | 'logs'
  const [messages, setMessages] = useState([]);
  const [callActive, setCallActive] = useState(false);
  const [callState, setCallState] = useState('idle'); // 'idle' | 'ringing' | 'connected'
  const [latestCallSummary, setLatestCallSummary] = useState('');
  const [manualPhone, setManualPhone] = useState('9876543210');
  const [manualText, setManualText] = useState('');

  // Connect to backend Server-Sent Events (SSE) for real-time alerts
  useEffect(() => {
    let eventSource;
    try {
      eventSource = new EventSource('/api/telephony/events');
      
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          
          if (payload.type === 'SMS_RECEIVED') {
            setMessages((prev) => [payload.data, ...prev]);
            // If drawer is open, auto switch to SMS
            setActiveTab('sms');
          } else if (payload.type === 'INCOMING_CALL') {
            setLatestCallSummary(payload.data.content);
            setCallState('ringing');
            setActiveTab('call');
          }
        } catch (err) {
          console.warn('Error parsing SSE:', err);
        }
      };

      eventSource.onerror = () => {
        // SSE reconnection handles itself
      };
    } catch (e) {
      console.warn('SSE not supported or connection error:', e);
    }

    // Load initial logs
    fetch('/api/telephony/logs')
      .then(res => res.json())
      .then(data => {
        if (data.logs) {
          setMessages(data.logs.filter(l => l.type === 'SMS'));
        }
      })
      .catch(() => {});

    return () => {
      eventSource?.close();
    };
  }, []);

  if (!isOpen) return null;

  const handleAnswerCall = () => {
    setCallState('connected');
    const speech = lang === 'ta' 
      ? `வணக்கம்! சம்பார்க் தொலைபேசி சேவைக்கு வரவேற்கிறோம். உங்களிடம் புதிய செய்திகள் உள்ளன. கேட்க 1 ஐ அழுத்தவும்.`
      : (lang === 'hi' 
        ? `नमस्ते! संपर्क वॉयस सेवा में आपका स्वागत है। आपके पास नया ईमेल संदेश आया है। संदेश सुनने के लिए 1 दबाएं।` 
        : `Welcome to Sampark voice assistant. You have new emails. Press 1 to listen.`);

    speakTextFemale(speech, lang);
  };

  const handlePressKeypad = (digit) => {
    if (digit === '1') {
      const summary = latestCallSummary || (lang === 'ta' 
        ? 'சமீபத்திய செய்தி: ஸ்டேட் பாங்க் ஆப் இந்தியாவிலிருந்து உங்கள் கணக்கில் ஐந்து ஆயிரம் ரூபாய் வரவு வைக்கப்பட்டுள்ளது.'
        : (lang === 'hi'
          ? 'नवीनतम संदेश: भारतीय स्टेट बैंक से ₹5,000 की सब्सिडी आपके खाते में अंतरित की गई है।'
          : 'Latest message: Subsidy of 5,000 rupees has been credited to your bank account.'));
      speakTextFemale(summary, lang);
    } else {
      speakTextFemale(lang === 'ta' ? 'தவறான தேர்வு. முதன்மை மெனுவிற்கு 1 ஐ அழுத்தவும்.' : (lang === 'hi' ? 'अमान्य विकल्प। मुख्य मेनू के लिए 1 दबाएं।' : 'Invalid option. Press 1 for main menu.'), lang);
    }
  };

  const handleHangup = () => {
    stopSpeaking();
    setCallState('idle');
  };

  const handleSendManualSms = async (e) => {
    e.preventDefault();
    if (!manualText) return;
    try {
      const res = await fetch('/api/telephony/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: manualPhone, message: manualText })
      });
      const data = await res.json();
      if (data.success) {
        setManualText('');
      }
    } catch (err) {}
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 text-slate-100 shadow-2xl border-l border-slate-800 flex flex-col">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>{lang === 'ta' ? 'தொலைபேசி சேவை மையம்' : lang === 'hi' ? 'लाइव टेलीफोनी स्टेशन' : 'Live Telephony Station'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === 'ta' ? 'SMS மற்றும் IVR அழைப்பு சிமுலேட்டர்' : lang === 'hi' ? 'एसएमएस व फोन कॉल सिमुलेटर' : 'SMS & IVR Voice Gateway Simulator'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/80 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === 'sms'
              ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{lang === 'ta' ? 'SMS விழிப்பூட்டல்' : lang === 'hi' ? 'एसएमएस अलर्ट' : 'SMS Alerts'} ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('call')}
          className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === 'call'
              ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{lang === 'ta' ? 'தொலைபேசி அழைப்பு' : lang === 'hi' ? 'वॉयस कॉल' : 'Voice Call'} {callState === 'ringing' && '🔔'}</span>
        </button>
      </div>

      {/* Tab 1: SMS Feed */}
      {activeTab === 'sms' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 text-[11px] text-emerald-200/90 leading-relaxed">
            {lang === 'ta' ? 'புதிய மின்னஞ்சல் வரும்போது குடிமகனின் தொலைபேசிக்கு இந்த தானியங்கி எச்சரிக்கை அனுப்பப்படும்.' : lang === 'hi' ? 'जब कोई ईमेल आता है, तो नागरिक के मोबाइल पर यह स्वचालित एसएमएस अलर्ट भेजा जाता है।' : 'Automated SMS alert dispatched to the citizen when a new email arrives.'}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {lang === 'ta' ? 'SMS எதுவும் பெறப்படவில்லை.' : lang === 'hi' ? 'कोई एसएमएस प्राप्त नहीं हुआ है।' : 'No SMS alerts received yet.'}
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={msg.id || idx} className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-400 font-mono">
                      {msg.from || 'SAMPARK'}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {msg.content}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>To: {msg.to}</span>
                    <span className="text-emerald-400 uppercase font-semibold">
                      ✓ {msg.status || 'delivered'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Manual test dispatch bar */}
          <form onSubmit={handleSendManualSms} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={lang === 'ta' ? 'சோதனை SMS எழுதவும்...' : lang === 'hi' ? 'परीक्षण एसएमएस लिखें...' : 'Type test SMS message...'}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: IVR Interactive Phone Call */}
      {activeTab === 'call' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          {callState === 'idle' && (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                <PhoneCall className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-slate-200">
                {lang === 'ta' ? 'IVR குரல் அழைப்பு சேவை' : lang === 'hi' ? 'IVR वॉयस कॉल सेवा' : 'IVR Voice Call Service'}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {lang === 'ta' ? 'புதிய மின்னஞ்சல் வரும்போது முதியோர் மற்றும் கிராமப்புற பயனர்களுக்கான தொலைபேசி அழைப்பு சேவை.' : lang === 'hi' ? 'अशिक्षित व बुजुर्ग नागरिकों के लिए, ईमेल प्राप्त होने पर स्वचालित फोन कॉल आती है।' : 'Automated voice phone call alerts for rural and elderly citizens.'}
              </p>
              <button
                onClick={() => {
                  setCallState('ringing');
                  setLatestCallSummary(lang === 'ta' ? 'வணக்கம், உங்களிடம் புதிய செய்தி உள்ளது.' : lang === 'hi' ? 'नमस्ते, आपके पास 1 नया संदेश है।' : 'Hello, you have 1 new message.');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {lang === 'ta' ? 'அழைப்பு சோதனை' : lang === 'hi' ? 'कॉल का परीक्षण करें' : 'Test Inbound Call'}
              </button>
            </div>
          )}

          {callState === 'ringing' && (
            <div className="space-y-6 animate-pulse">
              <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <PhoneIncoming className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-white">
                  {lang === 'ta' ? 'உள்வரும் அழைப்பு' : lang === 'hi' ? 'इनकमिंग कॉल' : 'Incoming Call'}
                </h4>
                <p className="text-xs text-emerald-400 mt-1 font-mono">
                  +91 8000-SAMPARK ({t('appName')})
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleAnswerCall}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{lang === 'ta' ? 'பதில் அளிக்கவும்' : lang === 'hi' ? 'कॉल उठाएं' : 'Answer Call'}</span>
                </button>
                <button
                  onClick={handleHangup}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>{lang === 'ta' ? 'அழைப்பை முடிக்கவும்' : lang === 'hi' ? 'कॉल काटें' : 'End Call'}</span>
                </button>
              </div>
            </div>
          )}

          {callState === 'connected' && (
            <div className="space-y-4 w-full">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>

              <div className="text-emerald-400 text-xs font-mono">
                {lang === 'ta' ? '00:14 • அழைப்பு இயங்குகிறது' : lang === 'hi' ? '00:14 • कॉल जारी है' : '00:14 • Call In Progress'}
              </div>

              <div className="p-3 bg-slate-800 rounded-xl text-xs text-emerald-300 font-semibold border border-slate-700">
                💡 {lang === 'ta' ? 'செய்தியைக் கேட்க 1 ஐ அழுத்தவும்' : lang === 'hi' ? 'संदेश सुनने के लिए 1 दबाएं' : 'Press 1 to hear the message'}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                  <button
                    key={k}
                    onClick={() => handlePressKeypad(k)}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-white font-bold text-sm border border-slate-700 transition-all active:scale-90"
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button
                onClick={handleHangup}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs active:scale-95 transition-all"
              >
                {lang === 'ta' ? 'அழைப்பை முடிக்கவும்' : lang === 'hi' ? 'कॉल काटें' : 'End Call'}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
