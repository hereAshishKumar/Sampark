import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  hi: {
    appName: "संपर्क",
    tagline: "आपका डिजिटल डाकघर",
    
    // Folders (Strictly single language, no brackets)
    folderAll: "📥 सभी पत्र",
    folderUnread: "📩 नए पत्र",
    folderRead: "📖 पढ़े गए पत्र",
    folderStarred: "⭐ जरूरी पत्र",
    folderDrafts: "📝 कच्चे पत्र",
    folderSpam: "🚨 फर्जी संदेश",
    folderTrash: "🗑️ कचरा पेटी",
    folderSent: "📤 भेजे गए पत्र",
    
    inbox: "इनबॉक्स",
    compose: "नया पत्र लिखें",
    refresh: "ताज़ा करें",
    phoneSimulator: "फोन सिम्युलेटर",
    aiAssistant: "संपर्क साथी",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    logout: "लॉगआउट",
    myEmail: "आपका ईमेल पता:",
    welcomeUser: "नमस्ते",
    noEmails: "इस डिब्बे में कोई पत्र नहीं है।",
    noEmailsSub: "नया संदेश आने पर वह यहाँ दिखाई देगा और आपको फोन पर भी सूचना मिलेगी।",
    
    // Audio & Dictation
    listen: "सुनें",
    listenFemale: "महिला आवाज में सुनें",
    speaking: "सुना रहे हैं...",
    stopSpeaking: "रोकें",
    speakToType: "बोलकर लिखें",
    listeningMic: "बोलिए, सुन रहे हैं...",
    
    // Translator & AI
    translateBtn: "हिंदी में अनुवाद करें",
    originalBtn: "मूल पत्र देखें",
    aiExplainBtn: "सरल भाषा में समझें",
    aiExplaining: "विश्लेषण हो रहा है...",
    aiTitle: "संपर्क साथी",
    aiTagline: "सरल ग्रामीण भाषा में आपकी सहायता",
    
    // Actions
    fromLabel: "प्रेषक:",
    toLabel: "प्राप्तकर्ता का पता:",
    subjectLabel: "विषय:",
    bodyLabel: "संदेश लिखें:",
    subjectPlaceholder: "विषय लिखें (जैसे: ऋण आवेदन)",
    bodyPlaceholder: "अपना संदेश यहाँ लिखें या ऊपर दिए माइक पर क्लिक करके बोलें...",
    sendingText: "भेजा जा रहा है...",
    sendBtn: "भेजें",
    cancelBtn: "रद्द करें",
    printBtn: "प्रिंट निकालें",
    deleteBtn: "हटाएं",
    spamBtn: "फर्जी घोषित करें",
    starBtn: "जरूरी बनाएं",
    unstarBtn: "जरूरी से हटाएं",
    unreadBadge: "नया",
    backBtn: "वापस जाएं",
    
    // Login & Verification (Strictly pure Hindi)
    loginTitle: "मोबाइल से आसान लॉगिन",
    loginSubtitle: "कोई पासवर्ड याद रखने की जरूरत नहीं है। आपका फोन नंबर ही आपका ईमेल पता है।",
    phoneInputLabel: "अपना दस अंकों का मोबाइल नंबर लिखें",
    sendOtpSms: "एसएमएस द्वारा कोड पाएं",
    sendOtpVoiceCall: "फोन कॉल पर कोड सुनें",
    listenOtpAloud: "आवाज में कोड सुनें",
    otpInputLabel: "छह अंकों का कोड दर्ज करें",
    verifyOtpBtn: "सत्यापित करके आगे बढ़ें",
    quickDemoOtp: "त्वरित परीक्षण कोड",
    resendOtp: "दोबारा कोड भेजें",
    changeNumber: "नंबर बदलें",
    keypadToggleShow: "बड़ा कीपैड खोलें",
    keypadToggleHide: "कीपैड छिपाएं",
    clearKeypad: "साफ करें",
    
    // Safety & Meta
    verifiedNotice: "प्रमाणित सरकारी अथवा बैंक पत्र",
    spamNotice: "संदिग्ध फर्जी पत्र",
    activeAlerts: "अलर्ट सेवा सक्रिय है",
    activeCitizenAccount: "सक्रिय नागरिक खाता",
    smsAlertActive: "एसएमएस व फोन अलर्ट चालू",
    searchPlaceholder: "पत्र खोजें...",
    noEmailSelected: "कोई पत्र चयनित नहीं है",
    noEmailSelectedDesc: "बाएं सूची से कोई भी पत्र चुनें, अथवा नया पत्र लिखने के लिए ऊपर दिए गए बटन पर क्लिक करें।",
    femaleVoiceName: "महिला सहायक"
  },
  ta: {
    appName: "சம்பார்க்",
    tagline: "உங்கள் டிஜிட்டல் அஞ்சலகம்",
    
    // Folders (Strictly pure Tamil, no brackets)
    folderAll: "📥 அனைத்து கடிதங்கள்",
    folderUnread: "📩 புதிய கடிதங்கள்",
    folderRead: "📖 படித்த கடிதங்கள்",
    folderStarred: "⭐ முக்கிய கடிதங்கள்",
    folderDrafts: "📝 வரைவு கடிதங்கள்",
    folderSpam: "🚨 போலி செய்திகள்",
    folderTrash: "🗑️ குப்பைத் தொட்டி",
    folderSent: "📤 அனுப்பியவை",
    
    inbox: "இன்பாக்ஸ்",
    compose: "புதிய கடிதம் எழுதவும்",
    refresh: "புதுப்பிக்கவும்",
    phoneSimulator: "தொலைபேசி சிமுலேட்டர்",
    aiAssistant: "சம்பார்க் உதவியாளர்",
    darkMode: "இரவு பயன்முறை",
    lightMode: "பகல் பயன்முறை",
    logout: "வெளியேறவும்",
    myEmail: "உங்கள் முகவரி:",
    welcomeUser: "வணக்கம்",
    noEmails: "இங்கு கடிதங்கள் எதுவும் இல்லை.",
    noEmailsSub: "புதிய செய்தி வரும்போது இங்கே தோன்றும் மற்றும் தொலைபேசியில் அறிவிக்கப்படும்.",
    
    listen: "கேளுங்கள்",
    listenFemale: "பெண் குரலில் கேளுங்கள்",
    speaking: "பேசுகிறது...",
    stopSpeaking: "நிறுத்தவும்",
    speakToType: "பேசி எழுதவும்",
    listeningMic: "பேசவும்...",
    
    translateBtn: "தமிழில் மொழிபெயர்க்கவும்",
    originalBtn: "அசல் செய்தியைப் பார்க்கவும்",
    aiExplainBtn: "எளிய முறையில் புரிந்து கொள்ளுங்கள்",
    aiExplaining: "ஆராய்கிறது...",
    aiTitle: "சம்பார்க் உதவியாளர்",
    aiTagline: "எளிய கிராமப்புற உதவி",
    
    // Actions
    fromLabel: "அனுப்புநர்:",
    toLabel: "பெறுநர் முகவரி:",
    subjectLabel: "பொருள்:",
    bodyLabel: "செய்தி எழுதவும்:",
    subjectPlaceholder: "பொருள் உள்ளிடவும் (எ.கா: கடன் விண்ணப்பம்)",
    bodyPlaceholder: "உங்கள் செய்தியை இங்கே உள்ளிடவும் அல்லது பேசி தட்டச்சு செய்யவும்...",
    sendingText: "அனுப்பப்படுகிறது...",
    sendBtn: "அனுப்பவும்",
    cancelBtn: "ரத்து செய்யவும்",
    printBtn: "அச்சிடவும்",
    deleteBtn: "நீக்கவும்",
    spamBtn: "போலி என குறிக்கவும்",
    starBtn: "முக்கியமானது",
    unstarBtn: "முக்கியத்துவத்தை நீக்கவும்",
    unreadBadge: "புதியது",
    backBtn: "பின்செல்லவும்",
    
    loginTitle: "எளிதான மொபைல் உள்நுழைவு",
    loginSubtitle: "கடவுச்சொல் தேவையில்லை. உங்கள் மொபைல் எண்ணே உங்கள் அஞ்சல் முகவரி.",
    phoneInputLabel: "உங்கள் பத்து இலக்க மொபைல் எண்ணை உள்ளிடவும்",
    sendOtpSms: "SMS மூலம் குறியீடு பெறவும்",
    sendOtpVoiceCall: "அழைப்பில் குறியீட்டைக் கேட்கவும்",
    listenOtpAloud: "குரலில் குறியீட்டைக் கேட்கவும்",
    otpInputLabel: "ஆறு இலக்க குறியீட்டை உள்ளிடவும்",
    verifyOtpBtn: "சரிபார்த்து திறக்கவும்",
    quickDemoOtp: "மாதிரி குறியீடு",
    resendOtp: "மீண்டும் அனுப்பவும்",
    changeNumber: "எண் மாற்றவும்",
    keypadToggleShow: "பெரிய விசைப்பலகை",
    keypadToggleHide: "விசைப்பலகையை மறைக்கவும்",
    clearKeypad: "அழிக்கவும்",
    
    verifiedNotice: "உறுதிப்படுத்தப்பட்ட அரசு அல்லது வங்கி கடிதம்",
    spamNotice: "சந்தேகத்திற்கிடமான போலி செய்தி",
    activeAlerts: "எச்சரிக்கை சேவை இயக்கத்தில் உள்ளது",
    activeCitizenAccount: "செயலில் உள்ள குடிமகன் கணக்கு",
    smsAlertActive: "SMS மற்றும் அழைப்பு எச்சரிக்கை இயக்கத்தில் உள்ளது",
    searchPlaceholder: "கடிதங்களைத் தேடவும்...",
    noEmailSelected: "கடிதம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை",
    noEmailSelectedDesc: "இடது பட்டியலிலிருந்து கடிதத்தைத் தேர்ந்தெடுக்கவும், அல்லது புதிய கடிதம் எழுத மேலே உள்ள பொத்தானைக் கிளிக் செய்யவும்.",
    femaleVoiceName: "பெண் உதவியாளர்"
  },
  en: {
    appName: "Sampark",
    tagline: "Your Digital Post",
    
    // Folders (Strictly pure English, no brackets)
    folderAll: "📥 All Mail",
    folderUnread: "📩 Unread Mail",
    folderRead: "📖 Read Mail",
    folderStarred: "⭐ Starred Mail",
    folderDrafts: "📝 Drafts",
    folderSpam: "🚨 Spam Mail",
    folderTrash: "🗑️ Trash",
    folderSent: "📤 Sent Mail",
    
    inbox: "Inbox",
    compose: "Compose New Mail",
    refresh: "Refresh",
    phoneSimulator: "Phone Simulator",
    aiAssistant: "Sampark Guide",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    logout: "Logout",
    myEmail: "Your Email Address:",
    welcomeUser: "Welcome",
    noEmails: "No emails in this section.",
    noEmailsSub: "New incoming messages will appear here and notify your phone.",
    
    listen: "Listen",
    listenFemale: "Listen with Female Assistant",
    speaking: "Speaking...",
    stopSpeaking: "Stop",
    speakToType: "Speak to Type",
    listeningMic: "Listening...",
    
    translateBtn: "Translate to Your Language",
    originalBtn: "View Original Mail",
    aiExplainBtn: "Explain in Simple Words",
    aiExplaining: "Analyzing...",
    aiTitle: "Sampark Guide",
    aiTagline: "Simple assistance for rural citizens",
    
    // Actions
    fromLabel: "From:",
    toLabel: "Recipient Address:",
    subjectLabel: "Subject:",
    bodyLabel: "Message Content:",
    subjectPlaceholder: "Enter subject (e.g., Crop Loan Application)",
    bodyPlaceholder: "Write your message here or click the microphone to speak...",
    sendingText: "Sending...",
    sendBtn: "Send Mail",
    cancelBtn: "Cancel",
    printBtn: "Print Mail",
    deleteBtn: "Delete",
    spamBtn: "Mark as Spam",
    starBtn: "Star Message",
    unstarBtn: "Remove Star",
    unreadBadge: "New",
    backBtn: "Go Back",
    
    loginTitle: "Easy Mobile Login",
    loginSubtitle: "No passwords needed. Your phone number is your universal email address.",
    phoneInputLabel: "Enter your 10-digit mobile number",
    sendOtpSms: "Get Code via SMS",
    sendOtpVoiceCall: "Hear Code via Phone Call",
    listenOtpAloud: "Speak Code Aloud",
    otpInputLabel: "Enter 6-digit verification code",
    verifyOtpBtn: "Verify and Open Mailbox",
    quickDemoOtp: "Quick Demo Code",
    resendOtp: "Resend Code",
    changeNumber: "Change Number",
    keypadToggleShow: "Show Large Keypad",
    keypadToggleHide: "Hide Keypad",
    clearKeypad: "Clear",
    
    verifiedNotice: "Verified Government or Bank Notice",
    spamNotice: "Suspicious Spam Message",
    activeAlerts: "Alert service is active",
    activeCitizenAccount: "Active Citizen Account",
    smsAlertActive: "SMS & Phone Alerts Active",
    searchPlaceholder: "Search mail...",
    noEmailSelected: "No Mail Selected",
    noEmailSelectedDesc: "Select an email from the left list, or click the compose button above to write a letter.",
    femaleVoiceName: "Female Voice Assistant"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('sampark_lang') || 'hi';
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('sampark_dark') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sampark_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('sampark_dark', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, darkMode, toggleDarkMode, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
