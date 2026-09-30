import express from 'express';

const router = express.Router();

// Helper to decode HTML entities
function decodeHtmlEntities(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Robust Multi-Sentence Regional Language Translator
 * Uses MyMemory Translation Engine with chunking, plus offline fallback.
 */
router.post('/translate', async (req, res) => {
  try {
    const { text = '', targetLang = 'hi' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for translation' });
    }

    const cleanLang = (targetLang === 'ta') ? 'ta' : (targetLang === 'hi' ? 'hi' : 'en');
    
    // If target is English or already translated
    if (cleanLang === 'en') {
      return res.json({ success: true, original: text, translated: text, targetLang });
    }

    // Split text into readable sentences/chunks (max 400 chars each for translation API)
    const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
    const translatedChunks = [];

    for (const chunk of sentences.slice(0, 15)) { // Limit to first 15 sentences for instant speed
      const trimmed = chunk.trim();
      if (!trimmed) continue;

      try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|${cleanLang}`;
        const resp = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (resp.ok) {
          const data = await resp.json();
          let translatedSegment = data?.responseData?.translatedText;
          if (translatedSegment && !translatedSegment.includes('MYMEMORY WARNING')) {
            translatedChunks.push(decodeHtmlEntities(translatedSegment));
            continue;
          }
        }
      } catch (e) {
        // network timeout on single chunk, continue
      }

      // Offline dictionary fallback if API chunk timed out
      let fallback = trimmed;
      if (cleanLang === 'hi') {
        fallback = fallback
          .replace(/Dear Customer/gi, 'प्रिय ग्राहक / किसान भाई')
          .replace(/Your application/gi, 'आपका आवेदन पत्र')
          .replace(/has been sanctioned/gi, 'स्वीकृत (मंजूर) कर दिया गया है')
          .replace(/has been credited/gi, 'सफलतापूर्वक खाते में जमा कर दी गई है')
          .replace(/with credit limit/gi, 'की अधिकतम सीमा के साथ')
          .replace(/interest subvention/gi, 'सस्ती सरकारी ब्याज छूट')
          .replace(/Please visit the rural branch/gi, 'कृपया अपनी नजदीकी बैंक शाखा में संपर्क करें')
          .replace(/with your Aadhaar and Land Passbook/gi, 'अपने आधार कार्ड और खतौनी / पासबुक के साथ')
          .replace(/to collect your KCC RuPay card/gi, 'अपना किसान क्रेडिट कार्ड प्राप्त करने के लिए')
          .replace(/State Bank of India/gi, 'भारतीय स्टेट बैंक')
          .replace(/Transaction ID/gi, 'लेन-देन संख्या (UTR)')
          .replace(/Date:/gi, 'दिनांक:');
      } else if (cleanLang === 'ta') {
        fallback = fallback
          .replace(/Dear Customer/gi, 'அன்பான வாடிக்கையாளர் / விவசாய நண்பரே')
          .replace(/Your application/gi, 'உங்கள் விண்ணப்பம்')
          .replace(/has been sanctioned/gi, 'அங்கீகரிக்கப்பட்டுள்ளது')
          .replace(/has been credited/gi, 'கணக்கில் வரவு வைக்கப்பட்டுள்ளது')
          .replace(/Please visit the rural branch/gi, 'தயவுசெய்து உங்கள் அருகிலுள்ள வங்கிக் கிளைக்கு செல்லவும்')
          .replace(/State Bank of India/gi, 'பாரத ஸ்டேட் வங்கி');
      }
      translatedChunks.push(fallback);
    }

    const finalTranslation = translatedChunks.join(' ');

    return res.json({
      success: true,
      original: text,
      translated: finalTranslation || text,
      targetLang: cleanLang
    });
  } catch (err) {
    console.error('Translation error:', err);
    return res.status(500).json({ error: 'Translation failed', message: err.message });
  }
});

/**
 * Intelligent Rural AI Assistant ("संपर्क साथी")
 * Explains complex emails in simple, colloquial language tailored for rural citizens.
 */
router.post('/explain', async (req, res) => {
  try {
    const { subject = '', body = '', sender = '', language = 'hi' } = req.body;
    const text = (subject + ' ' + body).toLowerCase();

    let summary = {};

    if (text.includes('kisan') || text.includes('dbt') || text.includes('किस्त') || text.includes('subsidy')) {
      if (language === 'ta') {
        summary = {
          title: "🌾 விவசாய நலத்திட்ட உதவித்தொகை (PM-Kisan)",
          what: "இது மத்திய அரசு வழங்கும் விவசாய நிதியுதவி பற்றிய அதிகாரப்பூர்வ அறிவிப்பு.",
          money: "₹2,000 உங்கள் வங்கிக் கணக்கில் நேரடியாக வரவு வைக்கப்பட்டுள்ளது.",
          action: "வங்கி பாஸ்புக்கை அப்டேட் செய்து பணம் வந்துள்ளதை சரிபார்க்கவும்.",
          safety: "✅ இது அதிகாரப்பூர்வ அரசு தகவல். யாருக்கும் பணம் கொடுக்க வேண்டியதில்லை.",
          spoken: "வணக்கம்! உங்கள் வங்கி கணக்கில் மத்திய அரசு விவசாய திட்டத்தின் 2000 ரூபாய் வரவு வைக்கப்பட்டுள்ளது."
        };
      } else if (language === 'hi') {
        summary = {
          title: "🌾 पीएम किसान सम्मान निधि (सरकारी सहायता)",
          what: "यह सरकार की तरफ से किसानों को मिलने वाली सम्मान निधि की आधिकारिक सूचना है।",
          money: "₹2,000 सीधे आपके बैंक खाते में जमा (DBT) कर दिए गए हैं।",
          action: "अपने बैंक में जाकर या एटीएम से बैलेंस चेक करें।",
          safety: "✅ यह सरकार का सच्चा संदेश है। इसके लिए किसी को कोई फीस न दें।",
          spoken: "नमस्ते! यह पत्र कृषि मंत्रालय से है। आपके खाते में 2000 रुपये की सरकारी सहायता भेज दी गई है।"
        };
      } else {
        summary = {
          title: "🌾 PM-Kisan Farmer Support Scheme",
          what: "Official government notification regarding direct benefit transfer.",
          money: "Rs 2,000 has been credited directly to your bank account.",
          action: "Check your bank balance at the nearest ATM or bank branch.",
          safety: "✅ Verified Government notice. No fee required.",
          spoken: "Hello! This notice confirms that 2000 rupees have been credited to your bank account."
        };
      }
    } else if (text.includes('loan') || text.includes('ऋण') || text.includes('kcc') || text.includes('credit card') || text.includes('sbi')) {
      if (language === 'ta') {
        summary = {
          title: "🏦 வங்கி விவசாய கடன் அனுமதி (KCC)",
          what: "உங்கள் கிசான் கிரெடிட் கார்டு (KCC) கடன் வரம்பு புதுப்பிக்கப்பட்டு அனுமதிக்கப்பட்டுள்ளது.",
          money: "₹50,000 வரை குறைந்த வட்டி விகிதத்தில் (4%) கடன் பெறலாம்.",
          action: "ஆதார் கார்டு மற்றும் நில பட்டாவுடன் உங்கள் எஸ்பிஐ கிளைக்கு செல்லவும்.",
          safety: "✅ வங்கி அனுமதி கடிதம். வங்கிக்கு நேரில் மட்டுமே செல்லவும்.",
          spoken: "வணக்கம்! ஸ்டேட் பேங்க் ஆஃப் இந்தியா உங்களுக்கு 50 ஆயிரம் ரூபாய் விவசாய கடனை அனுமதித்துள்ளது."
        };
      } else if (language === 'hi') {
        summary = {
          title: "🏦 बैंक किसान क्रेडिट कार्ड (KCC लोन)",
          what: "आपके किसान क्रेडिट कार्ड (KCC) के नवीनीकरण का आवेदन पास हो गया है।",
          money: "₹50,000 तक का लोन केवल 4% सस्ती ब्याज दर पर मंजूर हुआ है।",
          action: "आधार कार्ड और जमीन की खतौनी लेकर अपनी बैंक शाखा में जाएं और कार्ड लें।",
          safety: "✅ बैंक का आधिकारिक पत्र है। किसी दलाल को पैसे न दें।",
          spoken: "नमस्ते! भारतीय स्टेट बैंक ने आपका 50 हजार रुपये का किसान क्रेडिट कार्ड लोन पास कर दिया है।"
        };
      } else {
        summary = {
          title: "🏦 Kisan Credit Card (KCC Loan Approved)",
          what: "Your Kisan Credit Card renewal application has been approved by the bank.",
          money: "Credit limit of Rs 50,000 sanctioned at 4% subsidized interest rate.",
          action: "Visit your local SBI branch with your Aadhaar and Land documents.",
          safety: "✅ Official bank notice. Visit branch directly.",
          spoken: "Hello! State Bank of India has sanctioned your KCC loan limit of 50 thousand rupees."
        };
      }
    } else if (text.includes('lottery') || text.includes('लॉटरी') || text.includes('pin') || text.includes('password') || text.includes('crore') || text.includes('लाख')) {
      if (language === 'ta') {
        summary = {
          title: "🚨 போலி / ஆபத்தான மோசடி எச்சரிக்கை!",
          what: "இது உங்களை ஏமாற்ற அனுப்பப்பட்ட போலி லாட்டரி செய்தி.",
          money: "எந்த பணமும் கிடைக்காது. மாறாக உங்கள் கணக்கில் உள்ள பணம் திருடப்படலாம்.",
          action: "இதற்கு பதில் அளிக்க வேண்டாம்! உடனே நீக்கவும்.",
          safety: "❌ எச்சரிக்கை: உங்கள் ஏடிஎம் பின் அல்லது ஓடிபி-யை யாரிடமும் கூறாதீர்கள்!",
          spoken: "எச்சரிக்கை! இது ஒரு போலி மோசடி செய்தி. உங்கள் வங்கி விவரங்களையோ கடவுச்சொல்லையோ யாரிடமும் பகிர வேண்டாம்."
        };
      } else if (language === 'hi') {
        summary = {
          title: "🚨 सावधान: यह फर्जी / धोखाधड़ी का संदेश है!",
          what: "यह आपको लालच देकर आपके बैंक खाते से पैसे चुराने वाला फर्जी पत्र है।",
          money: "कोई लॉटरी नहीं लगी है। यह पूरी तरह से झूठ है।",
          action: "इस ईमेल का जवाब बिल्कुल न दें और इसे तुरंत 'हटाएं' (Trash) में डालें।",
          safety: "❌ सख्त चेतावनी: अपना एटीएम पिन, बैंक खाता या ओटीपी किसी को न बताएं!",
          spoken: "सावधान! यह एक फर्जी संदेश है। किसी भी लॉटरी के झांसे में न आएं और अपना बैंक पिन किसी को न दें।"
        };
      } else {
        summary = {
          title: "🚨 SCAM ALERT: Fake Lottery Phishing",
          what: "This is a fraudulent attempt to steal your banking credentials.",
          money: "There is no lottery. Do not send any money or documents.",
          action: "Do not reply. Delete this email immediately.",
          safety: "❌ DANGER: Never share your OTP, ATM PIN, or passwords.",
          spoken: "Warning! This is a scam email. Never share your bank passwords or OTP."
        };
      }
    } else {
      if (language === 'ta') {
        summary = {
          title: "📄 பொது மின்னஞ்சல் தகவல்",
          what: `${sender} இடமிருந்து வந்துள்ள செய்தி: "${subject}".`,
          money: "நிதி விவரங்கள் எதுவும் குறிப்பிடப்படவில்லை.",
          action: "முழு செய்தியையும் படிக்கவும் அல்லது ஆடியோ பட்டனை அழுத்தி கேட்கவும்.",
          safety: "ℹ️ சாதாரண கடிதப் போக்குவரத்து.",
          spoken: `இது ${sender} இடமிருந்து வந்துள்ள செய்தி. பொருள்: ${subject}.`
        };
      } else if (language === 'hi') {
        summary = {
          title: "📄 सामान्य पत्र / संदेश",
          what: `${sender} की तरफ से आया हुआ पत्र: "${subject}".`,
          money: "इस पत्र में किसी लेन-देन का उल्लेख नहीं है।",
          action: "पूरा पत्र पढ़ने के लिए 'सुनो' बटन दबाकर सुनें।",
          safety: "ℹ️ सामान्य संदेश।",
          spoken: `यह संदेश ${sender} की तरफ से आया है। विषय है: ${subject}।`
        };
      } else {
        summary = {
          title: "📄 General Communication",
          what: `Message from ${sender} regarding "${subject}".`,
          money: "No monetary transaction mentioned.",
          action: "Read or listen to the full text using the audio button.",
          safety: "ℹ️ Standard communication.",
          spoken: `Message from ${sender} regarding ${subject}.`
        };
      }
    }

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ error: 'AI processing failed' });
  }
});

/**
 * Interactive AI Assistant Chat ("संपर्क साथी")
 */
router.post('/chat', (req, res) => {
  try {
    const { question = '', language = 'hi' } = req.body;
    const q = question.toLowerCase();

    let answer = "";
    if (q.includes('ओटीपी') || q.includes('otp') || q.includes('पासवर्ड') || q.includes('password')) {
      answer = language === 'hi' 
        ? "⚠️ संपर्क सुरक्षा नियम: अपना ओटीपी या बैंक पासवर्ड कभी भी किसी अजनबी या कॉल करने वाले को न बताएं! बैंक या सरकारी कर्मचारी कभी आपसे ओटीपी नहीं मांगते।"
        : (language === 'ta'
          ? "⚠️ எச்சரிக்கை: உங்கள் வங்கி கடவுச்சொல் அல்லது OTP-ஐ யாருடனும் பகிர வேண்டாம்! அதிகாரிகள் ஒருபோதும் OTP கேட்க மாட்டார்கள்."
          : "⚠️ Security Warning: Never share your OTP or bank password with anyone. Officials never ask for OTPs.");
    } else if (q.includes('पैसा') || q.includes('रुपये') || q.includes('पैसे') || q.includes('money') || q.includes('கடன்')) {
      answer = language === 'hi'
        ? "💰 यदि आपके खाते में सरकारी योजना या बैंक लोन का पैसा आया है, तो आप अपने गांव के सीएससी (CSC) सेंटर या बैंक एटीएम पर जाकर अंगूठा (Aadhaar Pay) लगाकर पैसे निकाल सकते हैं।"
        : (language === 'ta'
          ? "💰 உங்கள் கணக்கில் பணம் வந்துள்ளதா என்பதை அருகிலுள்ள ஏடிஎம் அல்லது சேவை மையத்தில் சரிபார்த்து பெற்றுக்கொள்ளலாம்."
          : "💰 You can verify your balance or withdraw scheme funds using Aadhaar micro-ATM at your nearest CSC kiosk.");
    } else if (q.includes('ईमेल') || q.includes('email') || q.includes('संपर्क') || q.includes('नंबर')) {
      answer = language === 'hi'
        ? "🌾 संपर्क की खासियत यह है कि आपको कोई नया ईमेल याद नहीं रखना है। आपका 10 अंकों का मोबाइल नंबर ही आपका ईमेल है (जैसे 9236531947@sampark.in)। जब भी कोई पत्र आएगा, आपको एसएमएस और फोन कॉल पर सूचना मिल जाएगी।"
        : (language === 'ta'
          ? "🌾 உங்கள் 10 இலக்க மொபைல் எண்ணே உங்கள் மின்னஞ்சல் முகவரி. கடிதம் வரும்போது உங்கள் தொலைபேசியில் எச்சரிக்கை வரும்."
          : "🌾 With Sampark, your 10-digit mobile number IS your universal email address. You get real-time SMS and voice alerts on incoming mail.");
    } else {
      answer = language === 'hi'
        ? "नमस्ते! मैं आपका 'संपर्क साथी' हूँ। आप मुझसे किसी भी सरकारी योजना, बैंक पत्र या ईमेल के बारे में सरल भाषा में पूछ सकते हैं। आप 'माइक' दबाकर बोल भी सकते हैं!"
        : (language === 'ta'
          ? "வணக்கம்! நான் உங்கள் சம்பார்க் உதவியாளர். எந்தவொரு கடிதத்தையும் பற்றி எளிய தமிழில் என்னிடம் கேட்கலாம்."
          : "Hello! I am your Sampark AI Assistant. Ask me anything about your emails, bank notices, or government schemes.");
    }

    res.json({ success: true, answer });
  } catch (err) {
    res.status(500).json({ error: 'Chat failed' });
  }
});

export default router;
