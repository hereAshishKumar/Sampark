import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'sampark.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Rich Seed Data with All Mail Categories
const initialData = {
  users: [
    {
      phone: "9236531947",
      email: "9236531947@sampark.in",
      name: "Ashish (नागरिक)",
      language: "hi",
      created_at: new Date().toISOString()
    }
  ],
  otps: {},
  emails: [
    {
      id: "gov-scheme-001",
      user_phone: "9236531947",
      sender: "updates@dbt-kisan.gov.in",
      sender_name: "🏛️ कृषि मंत्रालय (PM-Kisan)",
      recipient: "9236531947@sampark.in",
      subject: "17वीं किस्त जारी: DBT सहायता ₹2000 आपके खाते में अंतरित",
      body_text: "प्रिय किसान भाई,\n\nप्रधानमंत्री किसान सम्मान निधि योजना के तहत 17वीं किस्त की राशि ₹2000 आपके बैंक खाते (SBI खाता सं. XXXX1947) में सफलता पूर्वक भेज दी गई है।\n\nयदि आपके खाते में राशि नहीं आई है तो अपनी नजदीकी CSC शाखा या पंचायत मित्र से संपर्क करें।\n\n- कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार",
      body_html: "<div style='font-family:sans-serif;'><h2 style='color:#15803d;'>🏛️ कृषि एवं किसान कल्याण मंत्रालय</h2><p>प्रिय किसान भाई,</p><p>प्रधानमंत्री किसान सम्मान निधि योजना के तहत <strong>17वीं किस्त की राशि ₹2000</strong> आपके बैंक खाते (खाता सं. <strong>XXXX1947</strong>) में सफलता पूर्वक अंतरित कर दी गई है।</p><p>यदि कोई समस्या हो तो अपनी पंचायत में संपर्क करें।</p><br/><p>भारत सरकार</p></div>",
      received_at: new Date(Date.now() - 900000).toISOString(), // 15 mins ago
      is_read: false,
      is_starred: true,
      folder: "inbox",
      category: "government"
    },
    {
      id: "bank-loan-002",
      user_phone: "9236531947",
      sender: "loans@sbi.co.in",
      sender_name: "🏦 भारतीय स्टेट बैंक (SBI)",
      recipient: "9236531947@sampark.in",
      subject: "किसान क्रेडिट कार्ड (KCC): ₹50,000 की ऋण सीमा स्वीकृत",
      body_text: "Dear Customer,\n\nYour application for Kisan Credit Card (KCC) renewal with credit limit Rs 50,000 has been sanctioned with 4% interest subvention.\n\nPlease visit the rural branch with your Aadhaar and Land Passbook to collect your KCC RuPay card.\n\n- State Bank of India, Rural Branch",
      body_html: "<div style='font-family:sans-serif;'><h2 style='color:#0369a1;'>🏦 State Bank of India</h2><p>Dear Customer,</p><p>Your application for <strong>Kisan Credit Card (KCC) renewal with limit Rs 50,000</strong> has been sanctioned with <strong>4% interest subvention</strong>.</p><p>Please visit the rural branch with your Aadhaar and Land Passbook to collect your KCC RuPay card.</p></div>",
      received_at: new Date(Date.now() - 3600000).toISOString(),
      is_read: true,
      is_starred: true,
      folder: "inbox",
      category: "bank"
    },
    {
      id: "welcome-email-003",
      user_phone: "9236531947",
      sender: "team@sampark.in",
      sender_name: "🌾 संपर्क सहायता केंद्र (Sampark)",
      recipient: "9236531947@sampark.in",
      subject: "संपर्क में आपका स्वागत है! आपका मोबाइल नंबर ही आपका ईमेल है",
      body_text: "नमस्ते आशीष जी,\n\nसंपर्क सेवा में आपका हार्दिक स्वागत है। आपका ईमेल पता: 9236531947@sampark.in है।\n\nयहाँ आप किसी भी बैंक, सरकारी योजना या कंपनी से ईमेल प्राप्त कर सकते हैं। आप ईमेल को 'सुनो' बटन दबाकर सुन भी सकते हैं।\n\n- संपर्क टीम",
      body_html: "<h3>नमस्ते आशीष जी,</h3><p><strong>संपर्क</strong> सेवा में आपका स्वागत है। आपका ईमेल: <code>9236531947@sampark.in</code></p><p>ईमेल सुनने के लिए <strong>सुनो</strong> बटन दबाएं।</p>",
      received_at: new Date(Date.now() - 7200000).toISOString(),
      is_read: true,
      is_starred: false,
      folder: "inbox",
      category: "general"
    },
    {
      id: "spam-fake-004",
      user_phone: "9236531947",
      sender: "lottery-win@unknown-overseas.xyz",
      sender_name: "🚨 अनजान प्रेषक (धोखाधड़ी का खतरा)",
      recipient: "9236531947@sampark.in",
      subject: "चेतावनी: आपने ₹25,00,000 की लॉटरी जीती है! तुरंत बैंक खाता दें",
      body_text: "बधाई हो! आपका नंबर ₹25 लाख की लकी ड्रॉ लॉटरी में चुना गया है। इनाम पाने के लिए तुरंत अपना बैंक पासवर्ड और एटीएम पिन भेजें।\n(सावधान: यह धोखाधड़ी का संदेश है)",
      body_html: "<div style='color:#b91c1c; border:2px dashed #ef4444; padding:15px;'><h3 style='color:#dc2626;'>⚠️ संदिग्ध धोखाधड़ी संदेश (Spam Alert)</h3><p>आपने ₹25 लाख की लॉटरी जीती है! तुरंत पिन भेजें।</p><p><strong>संपर्क सुरक्षा चेतावनी: अपना बैंक पिन या ओटीपी किसी को न दें!</strong></p></div>",
      received_at: new Date(Date.now() - 14400000).toISOString(),
      is_read: true,
      is_starred: false,
      folder: "spam",
      category: "spam"
    },
    {
      id: "draft-kisan-005",
      user_phone: "9236531947",
      sender: "9236531947@sampark.in",
      sender_name: "Ashish (नागरिक)",
      recipient: "dso-ration@up.gov.in",
      subject: "राशन कार्ड में नाम सुधार हेतु आवेदन",
      body_text: "सेवा में, जिला पूर्ति अधिकारी। महोदय, मेरे राशन कार्ड में माता जी का नाम अशुद्ध दर्ज है। कृपया इसे संशोधित करने की कृपा करें।",
      body_html: "<p>सेवा में, जिला पूर्ति अधिकारी। महोदय, मेरे राशन कार्ड में माता जी का नाम अशुद्ध दर्ज है। कृपया इसे संशोधित करने की कृपा करें।</p>",
      received_at: new Date(Date.now() - 86400000).toISOString(),
      is_read: true,
      is_starred: false,
      folder: "draft",
      category: "draft"
    },
    {
      id: "trash-old-006",
      user_phone: "9236531947",
      sender: "offers@ruralbazaar.in",
      sender_name: "🛒 ग्रामीण बाजार ऑफर",
      recipient: "9236531947@sampark.in",
      subject: "खाद और बीज पर 10% की मौसमी छूट समाप्त हो चुकी है",
      body_text: "प्रिय किसान, आपकी मौसमी छूट की अवधि समाप्त हो चुकी है। नए ऑफर के लिए जुड़े रहें।",
      body_html: "<p>प्रिय किसान, आपकी मौसमी छूट समाप्त हो चुकी है।</p>",
      received_at: new Date(Date.now() - 172800000).toISOString(),
      is_read: true,
      is_starred: false,
      folder: "trash",
      category: "trash"
    }
  ],
  telephony_logs: [
    {
      id: "log-init-01",
      type: "SMS",
      to: "+919236531947",
      from: "SAMPARK",
      content: "संपर्क अलर्ट: PM-Kisan से नया ईमेल प्राप्त हुआ: '17वीं किस्त जारी: DBT सहायता ₹2000'",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: "delivered"
    }
  ]
};

// Load or create DB
function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, reinitializing:', err);
    return initialData;
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Database Helper Operations
export const db = {
  // Users
  getUserByPhone(phone) {
    const data = loadDb();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    return data.users.find(u => u.phone === cleanPhone);
  },

  createUser(phone, name = '', language = 'hi') {
    const data = loadDb();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const domain = process.env.DOMAIN || 'sampark.in';
    const email = `${cleanPhone}@${domain}`;
    
    let existing = data.users.find(u => u.phone === cleanPhone);
    if (!existing) {
      existing = {
        phone: cleanPhone,
        email,
        name: name || `Citizen ${cleanPhone}`,
        language: language || 'hi',
        created_at: new Date().toISOString()
      };
      data.users.push(existing);
      saveDb(data);
    }
    return existing;
  },

  updateUserLanguage(phone, language) {
    const data = loadDb();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const user = data.users.find(u => u.phone === cleanPhone);
    if (user) {
      user.language = language;
      saveDb(data);
    }
    return user;
  },

  // OTPs
  saveOtp(phone, code) {
    const data = loadDb();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    data.otps[cleanPhone] = {
      code,
      expires_at: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    saveDb(data);
  },

  verifyOtp(phone, code) {
    const data = loadDb();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const record = data.otps[cleanPhone];
    if (code === '123456') return true; // universal hackathon master code
    if (!record) return false;
    if (Date.now() > record.expires_at) {
      delete data.otps[cleanPhone];
      saveDb(data);
      return false;
    }
    if (record.code === code) {
      delete data.otps[cleanPhone];
      saveDb(data);
      return true;
    }
    return false;
  },

  // Emails
  getEmailsForUser(phone, filter = 'inbox') {
    const data = loadDb();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    let list = data.emails.filter(e => e.user_phone === cleanPhone);

    if (filter === 'unread') {
      list = list.filter(e => !e.is_read && e.folder !== 'trash' && e.folder !== 'spam');
    } else if (filter === 'read') {
      list = list.filter(e => e.is_read && e.folder !== 'trash' && e.folder !== 'spam');
    } else if (filter === 'starred') {
      list = list.filter(e => e.is_starred && e.folder !== 'trash');
    } else if (filter === 'spam') {
      list = list.filter(e => e.folder === 'spam');
    } else if (filter === 'draft') {
      list = list.filter(e => e.folder === 'draft');
    } else if (filter === 'trash') {
      list = list.filter(e => e.folder === 'trash');
    } else if (filter === 'sent') {
      list = list.filter(e => e.folder === 'sent');
    } else {
      // default inbox
      list = list.filter(e => e.folder === 'inbox');
    }

    return list.sort((a, b) => new Date(b.received_at) - new Date(a.received_at));
  },

  getEmailById(id) {
    const data = loadDb();
    return data.emails.find(e => e.id === id);
  },

  markAsRead(id) {
    const data = loadDb();
    const email = data.emails.find(e => e.id === id);
    if (email) {
      email.is_read = true;
      saveDb(data);
    }
    return email;
  },

  toggleStar(id) {
    const data = loadDb();
    const email = data.emails.find(e => e.id === id);
    if (email) {
      email.is_starred = !email.is_starred;
      saveDb(data);
    }
    return email;
  },

  moveFolder(id, folder) {
    const data = loadDb();
    const email = data.emails.find(e => e.id === id);
    if (email) {
      email.folder = folder;
      saveDb(data);
    }
    return email;
  },

  saveIncomingEmail(emailObj) {
    const data = loadDb();
    data.emails.unshift({
      is_starred: false,
      folder: 'inbox',
      ...emailObj
    });
    saveDb(data);
    return emailObj;
  },

  deleteEmail(id) {
    const data = loadDb();
    // Move to trash if in inbox, permanently delete if in trash
    const email = data.emails.find(e => e.id === id);
    if (email) {
      if (email.folder === 'trash') {
        data.emails = data.emails.filter(e => e.id !== id);
      } else {
        email.folder = 'trash';
      }
      saveDb(data);
    }
  },

  // Telephony Logs
  addTelephonyLog(log) {
    const data = loadDb();
    data.telephony_logs.unshift(log);
    if (data.telephony_logs.length > 50) {
      data.telephony_logs.pop();
    }
    saveDb(data);
    return log;
  },

  getTelephonyLogs() {
    const data = loadDb();
    return data.telephony_logs;
  }
};
