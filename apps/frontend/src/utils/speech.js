/**
 * Web Speech API & Interactive Audio Utilities
 * Includes TTS, Female Voice Assistant, STT, and tactile Web Audio chimes.
 */

// Gentle tactile chime using browser Web Audio API
export function playChime(type = 'click') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {}
}

// Helper to find a female regional voice
function findFemaleVoice(langCode) {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const regionalVoices = voices.filter(v => v.lang.startsWith(langCode.slice(0, 2)));

  // Try to find voice with known female names
  const femaleKeywords = ['female', 'swara', 'lekha', 'aditi', 'kalpana', 'zira', 'samantha', 'victoria', 'karen', 'geeta', 'shruti'];
  const femaleVoice = regionalVoices.find(v => 
    femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
  );

  return femaleVoice || regionalVoices[0] || null;
}

// Speak text aloud using browser Text-to-Speech (General)
export function speakText(text, lang = 'hi', onEnd = () => {}) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  let langCode = 'hi-IN';
  if (lang === 'ta') langCode = 'ta-IN';
  if (lang === 'en') langCode = 'en-IN';

  utterance.lang = langCode;
  utterance.rate = 0.92;
  utterance.pitch = 1.0;

  const voice = findFemaleVoice(langCode);
  if (voice) utterance.voice = voice;

  utterance.onend = () => onEnd();
  utterance.onerror = () => onEnd();

  window.speechSynthesis.speak(utterance);
}

// Female Voice Assistant Reader (Specially tuned for clear, melodic female voice)
export function speakTextFemale(text, lang = 'hi', onEnd = () => {}) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  let langCode = 'hi-IN';
  if (lang === 'ta') langCode = 'ta-IN';
  if (lang === 'en') langCode = 'en-IN';

  utterance.lang = langCode;
  utterance.rate = 0.90; // Gentle, clear speed for rural comprehension
  utterance.pitch = 1.25; // Female vocal pitch tuning

  const femaleVoice = findFemaleVoice(langCode);
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  utterance.onend = () => onEnd();
  utterance.onerror = () => onEnd();

  window.speechSynthesis.speak(utterance);
}

// Voice OTP reader - Speaks digits slowly with female cadence
export function speakOtpDigits(code, lang = 'hi', onEnd = () => {}) {
  if (!code) return;
  const digits = code.toString().split('').join(' . . ');
  let phrase = '';
  if (lang === 'ta') {
    phrase = `உங்கள் சம்பார்க் உள்நுழைவு குறியீடு: ${digits}.`;
  } else if (lang === 'hi') {
    phrase = `आपका संपर्क सत्यापन कोड है: ${digits}।`;
  } else {
    phrase = `Your Sampark verification code is: ${digits}.`;
  }
  speakTextFemale(phrase, lang, onEnd);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Speech-to-text dictation
export function startVoiceDictation(lang = 'hi', onResult = () => {}, onEnd = () => {}, onError = () => {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    onError('Not supported');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  
  let langCode = 'hi-IN';
  if (lang === 'ta') langCode = 'ta-IN';
  if (lang === 'en') langCode = 'en-IN';
  recognition.lang = langCode;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => onError(event.error);
  recognition.onend = () => onEnd();

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    onError(err.message);
    return null;
  }
}
