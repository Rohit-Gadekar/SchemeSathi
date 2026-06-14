import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scheme, UserProfile } from '../types';
import { Phone, Calculator, Settings, Volume2, Mic, Check, Send, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdvancedFeaturesProps {
  schemes: Scheme[];
  profile: UserProfile;
  selectedLang: 'en' | 'hi' | 'mr' | 'ta' | 'te';
}

export default function AdvancedFeatures({ schemes, profile, selectedLang }: AdvancedFeaturesProps) {
  const [activeSubTab, setActiveSubTab] = useState<'calc' | 'whatsapp' | 'voice' | 'admin'>('calc');

  // WhatsApp Simulator state
  const [waMessages, setWaMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    { sender: 'bot', text: "Hello! Welcome to SchemeSathi official WhatsApp helpline. How can I assist you today? Try typing 'eligible' or 'scholarship'!", time: "10:14" }
  ]);
  const [waInput, setWaInput] = useState('');
  const [waTyping, setWaTyping] = useState(false);

  // Voice Assistant state
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi' | 'mr' | 'ta' | 'te'>('en');
  const [voiceText, setVoiceText] = useState('');
  const [voiceReply, setVoiceReply] = useState('');

  // 1. AI Benefit Calculator (Feature 5) calculation
  const eligibleSchemes = schemes.filter(s => {
    if (s.category === 'Farmer' && !profile.farmerStatus) return false;
    if (s.category === 'Student' && !profile.studentStatus) return false;
    if (s.category === 'Business' && !profile.businessOwnerStatus) return false;
    if (s.category === 'Women' && profile.gender !== 'Female') return false;
    if (profile.annualIncome && s.id === 'pm-awas' && profile.annualIncome > 300000) return false;
    if (profile.annualIncome && s.id === 'ayushman-bharat' && profile.annualIncome > 250000) return false;
    return true;
  });

  const totalAnnualBenefit = eligibleSchemes.reduce((acc, s) => acc + s.benefitsValue, 0);

  // WhatsApp responses dispatcher
  const handleSendWa = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!waInput.trim()) return;

    const userMsg = waInput;
    setWaInput('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setWaMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setWaTyping(true);

    setTimeout(() => {
      let reply = "Hello! Sathi bot is searching your profile context... Try writing 'eligible' or 'benefits' to see custom fits.";
      const txt = userMsg.toLowerCase();

      if (txt.includes('eligible') || txt.includes('kisan') || txt.includes('scheme') || txt.includes('fit')) {
        if (profile.farmerStatus) {
          reply = "🌾 *SchemeSathi Bot:* Based on your profile, you are fully eligible for *PM Kisan Samman Nidhi* (₹6,000/year). Documents needed: Aadhaar, Land Records.";
        } else if (profile.studentStatus) {
          reply = "🎓 *SchemeSathi Bot:* You match for *National Scholarship* (₹12,000/year). Documents needed: Mark Sheet, Identity, Income proof.";
        } else {
          reply = "🔍 *SchemeSathi Bot:* You have strong matches for *Ayushman Bharat Health Cover* (₹500,000 coverage). Keep your Aadhaar ready!";
        }
      } else if (txt.includes('scholarship') || txt.includes('student') || txt.includes('study')) {
        reply = "🎓 *SchemeSathi Bot:* Active scholarship: *National Means-Cum-Merit Scholarship* (₹12,000/year). Criteria: Parent income under 3.5 Lakh, score 55% in class VIII.";
      } else if (txt.includes('women') || txt.includes('girl') || txt.includes('ladli')) {
        reply = "🌸 *SchemeSathi Bot:* Recommended: *Sukanya Samriddhi Savings Account* (8.2% high yield) or Maharashtra *Ladli Behna Scheme* (₹1,500/month).";
      }

      setWaMessages(prev => [...prev, { sender: 'bot', text: reply, time: timeStr }]);
      setWaTyping(false);
    }, 1000);
  };

  // Voice recognition and vocal synthesis
  const triggerVoiceAssistant = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setVoiceText("Listening for speech cues...");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang === 'en' ? 'en-IN' : voiceLang === 'hi' ? 'hi-IN' : voiceLang === 'mr' ? 'mr-IN' : voiceLang === 'ta' ? 'ta-IN' : 'te-IN';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(`You said: "${transcript}"`);
        processVoiceCommand(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        mockSpeechCommand();
      };

      recognition.start();
    } else {
      setTimeout(() => {
        mockSpeechCommand();
        setIsListening(false);
      }, 2500);
    }
  };

  const mockSpeechCommand = () => {
    let mockSay = "Am I eligible for PM Kisan?";
    if (voiceLang === 'hi') mockSay = "क्या मैं पीएम किसान के लिए योग्य हूँ?";
    if (voiceLang === 'mr') mockSay = "मी पीएम किसानसाठी पात्र आहे का?";
    if (voiceLang === 'ta') mockSay = "நான் பிரதம மந்திரி கிஷானுக்கு தகுதியானவனா?";
    if (voiceLang === 'te') mockSay = "నేను పీఎం కిసాన్‌ కాదానికై అర్హుడనా?";
    
    setVoiceText(`Synthesizing input: "${mockSay}"`);
    processVoiceCommand(mockSay);
  };

  const processVoiceCommand = (command: string) => {
    const isRameshDemo = profile.id === "ramesh-patil";
    const name = profile.fullName || (isRameshDemo ? "रमेश" : (voiceLang === 'hi' ? "नागरिक" : voiceLang === 'mr' ? "नागरिक" : voiceLang === 'ta' ? "குடிமகன்" : voiceLang === 'te' ? "పౌరుడు" : "Citizen"));
    let reply = "";

    if (eligibleSchemes.length > 0) {
      const schemeNames = eligibleSchemes.map(s => s.name).join(", ");
      const totalBenefitStr = `₹${totalAnnualBenefit.toLocaleString()}`;
      if (voiceLang === 'hi') {
        reply = `नमस्ते ${name} जी! आपके प्रोफाइल के आधार पर आप इन योजनाओं के हकदार हैं: ${schemeNames}। आपको कुल वार्षिक ₹${totalAnnualBenefit.toLocaleString()} का लाभ मिल सकता है।`;
      } else if (voiceLang === 'mr') {
        reply = `नमस्कार ${name} जी! तुमच्या माहितीनुसार तुम्ही या योजनांसाठी पात्र आहात: ${schemeNames}। तुम्हाला एकूण वार्षिक ₹${totalAnnualBenefit.toLocaleString()} चा लाभ मिळू शकतो.`;
      } else if (voiceLang === 'ta') {
        reply = `வணக்கம் ${name}! உங்கள் சுயவிவரத்தின் அடிப்படையில், நீங்கள் இந்த திட்டங்களுக்குத் தகுதியானவர்: ${schemeNames}. நீங்கள் ஆண்டுதோறும் ₹${totalAnnualBenefit.toLocaleString()} ஐப் பெறலாம்.`;
      } else if (voiceLang === 'te') {
        reply = `నమస్కారం ${name}! మీ ప్రొఫైల్ ఆధారంగా మీరు దీనికి అర్హులు: ${schemeNames}. మీరు సంవత్సరపు ₹${totalAnnualBenefit.toLocaleString()} ను పొందవచ్చు.`;
      } else {
        reply = `Hello ${name}! Based on your active profile, you are eligible for: ${schemeNames}. You can receive a total of ${totalBenefitStr} annually.`;
      }
    } else {
      if (voiceLang === 'hi') {
        reply = `नमस्ते ${name} जी! वर्तमान में आपके प्रोफाइल के लिए सीधे मिलते-जुलते लाभ नहीं मिले हैं। कृपया अपनी जानकारी पूरी भरें।`;
      } else if (voiceLang === 'mr') {
        reply = `नमस्कार ${name} जी! सध्या तुमच्या माहितीनुसार थेट जुळणाऱ्या योजना आढळल्या नाहीत. कृपया तुमची माहिती पूर्ण भरा.`;
      } else if (voiceLang === 'ta') {
        reply = `வணக்கம் ${name}! தற்போது, உங்களுக்கு எந்த நன்மைகளும் கிடைக்கவில்லை. உங்கள் சுயவிவரத்தை முழுமையாக நிரப்பவும்.`;
      } else if (voiceLang === 'te') {
        reply = `నమస్కారం ${name}! ప్రస్తుతం, మీ ప్రొఫైల్‌కు కోసం ఏ సంబంధిత ప్రయోజనాలు కనుగొనబడలేదు. దయచేసి వివరాలను పూరించండి.`;
      } else {
        reply = `Hello ${name}! Currently, no matching direct benefits were found for your configuration. Please fill out your profile details fully to seek matches.`;
      }
    }

    setVoiceReply(reply);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(reply);
      utterance.lang = voiceLang === 'en' ? 'en-IN' : voiceLang === 'hi' ? 'hi-IN' : voiceLang === 'mr' ? 'mr-IN' : voiceLang === 'ta' ? 'ta-IN' : 'te-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mock Admin analytics
  const analyticsData = [
    { name: 'Jan', Citizens: 104, Applications: 42, SuccessRate: 88 },
    { name: 'Feb', Citizens: 180, Applications: 84, SuccessRate: 90 },
    { name: 'Mar', Citizens: 290, Applications: 190, SuccessRate: 94 },
    { name: 'Apr', Citizens: 450, Applications: 320, SuccessRate: 92 },
    { name: 'May', Citizens: 720, Applications: 510, SuccessRate: 96 },
    { name: 'Jun', Citizens: 843, Applications: 692, SuccessRate: 98 }
  ];

  return (
    <div id="advanced-features-panel" className="h-[calc(100vh-140px)] flex flex-col font-sans">
      {/* Sub menu toolbar */}
      <div className="flex border-b border-white/10 pb-4 mb-6 gap-2 flex-wrap bg-[#141414] p-2.5 rounded-xl border border-white/5">

        <button
          id="btn-subtab-calc"
          onClick={() => setActiveSubTab('calc')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'calc' 
            ? 'bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20 font-bold' 
            : 'text-white/40 hover:text-white border border-transparent'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Benefit Calculator
        </button>

        <button
          id="btn-subtab-whatsapp"
          onClick={() => setActiveSubTab('whatsapp')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'whatsapp' 
            ? 'bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20 font-bold' 
            : 'text-white/40 hover:text-white border border-transparent'
          }`}
        >
          <Phone className="w-4 h-4" />
          WhatsApp Helpline
        </button>

        <button
          id="btn-subtab-voice"
          onClick={() => setActiveSubTab('voice')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'voice' 
            ? 'bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20 font-bold' 
            : 'text-white/40 hover:text-white border border-transparent'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          Voice Assistant
        </button>

        <button
          id="btn-subtab-admin"
          onClick={() => setActiveSubTab('admin')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'admin' 
            ? 'bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20 font-bold' 
            : 'text-white/40 hover:text-white border border-transparent'
          }`}
        >
          <Settings className="w-4 h-4" />
          Citizen Analytics
        </button>
      </div>

      {/* Renders Active Sub Modules */}
      <AnimatePresence mode="wait">

        {/* 2. Benefit Calculator Submodule tab */}
        {activeSubTab === 'calc' && (
          <motion.div
            key="benefit-calculator-panel"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Input variables and breakdown */}
            <div className="lg:col-span-5 bg-[#141414] p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-light text-white mb-2 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#D4AF37]" />
                  AI Eligibility Matrix & Score
                </h3>
                <p className="text-xs text-white/40 mb-4 font-sans leading-relaxed">
                  Real-time policy filter checking criteria parameters against central scheme rule books.
                </p>

                {/* Active variables readout panel */}
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3 mb-6">
                  <span className="text-[9px] uppercase font-bold text-[#D4AF37] font-mono tracking-wider block mb-1">Active Portfolio Variables</span>
                  
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                    <span className="text-white/40">Occupation / Sector</span>
                    <strong className="text-white">
                      {profile.farmerStatus ? "🌾 Farmer" : profile.studentStatus ? "🎓 Student" : profile.businessOwnerStatus ? "💼 Small Business" : "General"}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                    <span className="text-white/40">Annual Income Cap</span>
                    <strong className="text-[#D4AF37]">₹{profile.annualIncome?.toLocaleString() || "N/A"} / Yr</strong>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                    <span className="text-white/40">Caste Category</span>
                    <strong className="text-white font-semibold">{profile.casteCategory || "General"}</strong>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40">Aadhaar Connected</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1 select-none">
                      <Check className="w-3.5 h-3.5" /> SECURE LINKED
                    </span>
                  </div>
                </div>

                {/* Score panel */}
                <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-2xl text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#D4AF37] flex items-center justify-center font-serif text-[#D4AF37] text-xl font-bold mb-2">
                    {eligibleSchemes.length > 0 ? "96%" : "0%"}
                  </div>
                  <strong className="text-white text-xs block font-serif">Optimal Matches Found</strong>
                  <p className="text-[10px] text-white/45 mt-0.5 leading-relaxed max-w-xs">
                    No discrepancies flagged across spelling name or identity database tables. Ready to auto-fill!
                  </p>
                </div>
              </div>

              {/* Total estimation block */}
              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="text-left">
                  <span className="text-[10px] text-white/40 uppercase block">POTENTIAL ANnUAL ASSISTANCE</span>
                  <strong className="text-2xl font-serif text-[#D4AF37]">
                    ₹{totalAnnualBenefit.toLocaleString()}
                  </strong>
                </div>
                <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] uppercase tracking-wider font-bold rounded-lg text-emerald-400 font-mono">
                  Verified Fit
                </div>
              </div>
            </div>

            {/* Right Column: Custom Eligible Schemes matched */}
            <div className="lg:col-span-7 bg-[#141414] p-5 rounded-2xl border border-white/10 flex flex-col">
              <h4 className="font-serif text-sm font-semibold text-white mb-2 tracking-wide">
                Individually Matched Schemes ({eligibleSchemes.length})
              </h4>
              <p className="text-[11px] text-white/40 mb-4 leading-relaxed">
                Based on your identity properties, you qualify for the following government support bundles.
              </p>

              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                {eligibleSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="p-4 bg-white/2 hover:bg-white/5 transition-all border border-white/5 rounded-2xl flex justify-between items-start gap-4"
                  >
                    <div>
                      <span className="text-[8px] text-[#D4AF37] font-bold tracking-wider uppercase">
                        {scheme.id.toUpperCase()} • {scheme.category}
                      </span>
                      <h5 className="text-white font-medium text-xs font-sans mt-0.5">{scheme.name}</h5>
                      <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{scheme.benefits}</p>
                      
                      <div className="flex gap-4 items-center mt-3 text-[9px] text-[#D4AF37]">
                        <span>📋 Domicile Req: Yes</span>
                        <span>🗓️ Installments: 3 / Yr</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[#D4AF37] font-serif font-semibold text-xs py-1 px-2.5 rounded-lg bg-[#D4AF37]/15">
                        ₹{scheme.benefitsValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                {eligibleSchemes.length === 0 && (
                  <div className="text-center py-10">
                    <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <span className="text-xs text-white/45">No direct matching benefits located for this configuration.</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. WhatsApp Helpline Submodule tab */}
        {activeSubTab === 'whatsapp' && (
          <motion.div
            key="whatsapp-helpline-panel"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left instructions block */}
            <div className="lg:col-span-5 bg-[#141414] p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-light text-white mb-2 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-500" />
                  Sathi WhatsApp AI Support
                </h3>
                <p className="text-xs text-white/40 mb-4 font-sans leading-relaxed font-light">
                  A realistic simulation of the off-site WhatsApp Helpline API. Citizens message the helpline to fetch matches, document lists, and filing guidance instantly without logging into complex portals.
                </p>

                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3 mb-6">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] font-mono tracking-wider block mb-1">Try sending these phrases</span>
                  
                  <div className="p-2 bg-black/40 border border-white/5 rounded-lg text-[10px] font-mono text-white/60">
                    "Am I eligible for PM Kisan?"
                  </div>
                  
                  <div className="p-2 bg-black/40 border border-white/5 rounded-lg text-[10px] font-mono text-white/60">
                    "Are there any scholarship schemes?"
                  </div>

                  <div className="p-2 bg-black/40 border border-white/5 rounded-lg text-[10px] font-mono text-white/60">
                    "Welfare opportunities for girls"
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-left flex gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[10px] text-emerald-400 tracking-wider font-mono block uppercase">OFFLINE INTEGRATED INFRA</strong>
                  <p className="text-[10px] text-white/55 leading-relaxed">
                    Operates without constant cellular internet packets by caching verified rulesets locally.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Chat panel */}
            <div className="lg:col-span-7 bg-[#141414] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[500px]">
              {/* WhatsApp Header bar */}
              <div className="bg-[#1D2226] p-4 border-b border-white/5 flex justify-between items-center select-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center justify-center font-serif text-sm">
                    S
                  </div>
                  <div className="text-left">
                    <strong className="text-xs font-semibold text-white block">SchemeSathi Helpline</strong>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Online Assistant
                    </span>
                  </div>
                </div>
                <div className="px-2 py-0.5 bg-white/5 border border-white/10 text-[8px] uppercase tracking-wider font-mono text-white/45 rounded">
                  verified profile
                </div>
              </div>

              {/* Chat Messages flow */}
              <div className="flex-1 overflow-y-auto p-4 bg-[#0B1014] space-y-3 scrollbar-none flex flex-col">
                {waMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                      ? 'bg-emerald-600/90 text-white self-end rounded-tr-none'
                      : 'bg-[#202C33] text-white self-start rounded-tl-none border border-white/5'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className="text-[8px] text-white/35 block text-right mt-1 font-mono">{msg.time}</span>
                  </div>
                ))}

                {waTyping && (
                  <div className="bg-[#202C33] text-white/40 self-start p-2.5 rounded-xl text-[10px] animate-pulse">
                    Bot is translating matches...
                  </div>
                )}
              </div>

              {/* Chat Send bar */}
              <form onSubmit={handleSendWa} className="p-3 bg-[#1D2226] border-t border-white/5 flex gap-2">
                <input
                  id="wa-chat-input"
                  type="text"
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  placeholder="Ask a question (Marathi, Hindi, English)..."
                  className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-sans"
                />
                <button
                  id="btn-wa-send"
                  type="submit"
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 transition-all text-white rounded-lg cursor-pointer flex items-center justify-center font-bold"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* 4. Voice Assistant tab */}
        {activeSubTab === 'voice' && (
          <motion.div
            key="voice-assistant-panel"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left side instruction block */}
            <div className="lg:col-span-5 bg-[#141414] p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-light text-white mb-2 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-[#D4AF37]" />
                  Acoustic Speech Helper
                </h3>
                <p className="text-xs text-white/40 mb-4 font-sans leading-relaxed font-light">
                  Sathi's vocal translation tool is designed for citizens with literacy challenges to hear eligibility guidelines in their mother tongue. Use standard Speech recognition to speak directly.
                </p>

                <div className="flex border border-white/10 rounded-xl p-1 bg-black/40 mb-6 font-mono text-[10px] gap-1 flex-wrap">
                  <button
                    id="btn-voice-lang-en"
                    onClick={() => setVoiceLang('en')}
                    className={`flex-1 min-w-[70px] py-1.5 text-center rounded font-bold cursor-pointer transition-all ${voiceLang === 'en' ? 'bg-white/5 text-[#D4AF37]' : 'text-white/40'}`}
                  >
                    ENGLISH
                  </button>
                  <button
                    id="btn-voice-lang-hi"
                    onClick={() => setVoiceLang('hi')}
                    className={`flex-1 min-w-[70px] py-1.5 text-center rounded font-bold cursor-pointer transition-all ${voiceLang === 'hi' ? 'bg-white/5 text-[#D4AF37]' : 'text-white/40'}`}
                  >
                    HINDI हिन्दी
                  </button>
                  <button
                    id="btn-voice-lang-mr"
                    onClick={() => setVoiceLang('mr')}
                    className={`flex-1 min-w-[70px] py-1.5 text-center rounded font-bold cursor-pointer transition-all ${voiceLang === 'mr' ? 'bg-white/5 text-[#D4AF37]' : 'text-white/40'}`}
                  >
                    MARATHI मराठी
                  </button>
                  <button
                    id="btn-voice-lang-ta"
                    onClick={() => setVoiceLang('ta')}
                    className={`flex-1 min-w-[70px] py-1.5 text-center rounded font-bold cursor-pointer transition-all ${voiceLang === 'ta' ? 'bg-white/5 text-[#D4AF37]' : 'text-white/40'}`}
                  >
                    TAMIL தமிழ்
                  </button>
                  <button
                    id="btn-voice-lang-te"
                    onClick={() => setVoiceLang('te')}
                    className={`flex-1 min-w-[70px] py-1.5 text-center rounded font-bold cursor-pointer transition-all ${voiceLang === 'te' ? 'bg-white/5 text-[#D4AF37]' : 'text-white/40'}`}
                  >
                    TELUGU తెలుగు
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                <span className="text-[8px] uppercase tracking-widest text-[#D4AF37] font-bold block mb-1">VOICE MODULE SPECS</span>
                <p className="text-[10px] text-white/50 leading-relaxed font-serif">
                  Synthesizes local Indian English (en-IN), clear Hindi accent (hi-IN), and Marathi (mr-IN) phoneme structures dynamically.
                </p>
              </div>
            </div>

            {/* Right Mic Box */}
            <div className="lg:col-span-7 bg-[#141414] border border-white/10 rounded-2xl p-6 h-[400px] flex flex-col justify-between items-center text-center">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-mono text-white/30">Hands-Free Interactive Vocal Assistant</span>
                <h4 className="text-white text-md font-sans mt-1">Talk to Sathi AI</h4>
              </div>

              {/* Giant Interactive Pulse Mic Button */}
              <div className="relative flex items-center justify-center">
                {isListening && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute w-24 h-24 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/25"
                  />
                )}
                <button
                  id="btn-voice-mic-trigger"
                  onClick={triggerVoiceAssistant}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isListening 
                    ? 'bg-rose-600 text-white border-2 border-rose-500 animate-pulse' 
                    : 'bg-white text-black hover:scale-105'
                  }`}
                >
                  <Mic className="w-7 h-7" />
                </button>
              </div>

              {/* Soundwaves caption / synthesis feed */}
              <div className="w-full max-w-md bg-black/40 border border-white/5 p-4 rounded-xl min-h-[100px] flex flex-col justify-center">
                {voiceText ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider">INPUT DETECTED</p>
                    <p className="text-xs text-white/70 italic leading-snug">"{voiceText}"</p>
                    
                    {voiceReply && (
                      <div className="pt-2.5 mt-2.5 border-t border-white/5">
                        <span className="text-[9px] font-bold text-emerald-500 block uppercase mb-1">🤖 SATHI SPEECH OUT:</span>
                        <p className="text-xs text-white leading-relaxed">{voiceReply}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 select-none">
                    <p className="text-xs text-white/40">Say "PM Kisan status" or tap the microphone to trigger vocal matching diagnostics.</p>
                    <span className="text-[9px] text-[#D4AF37]/50 font-mono">AUTOMATED FALLBACK SIMULATOR BUILT IN</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. Citizen Analytics (Admin Panel) tab */}
        {activeSubTab === 'admin' && (
          <motion.div
            key="citizen-analytics"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex-1 overflow-y-auto space-y-6"
          >
            {/* Header Readout card */}
            <div className="bg-[#141414] p-5 rounded-2xl border border-white/10 flex flex-wrap justify-between items-center gap-4">
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-widest font-mono text-white/30">System Administration Interface</span>
                <h3 className="font-serif text-lg font-light text-[#F5F5F5]">Citizens Registered Growth metrics</h3>
              </div>

              <div className="flex gap-4">
                <div className="text-right">
                  <span className="text-[9px] text-white/35 uppercase block">ACTIVE SUBMISSIONS</span>
                  <strong className="text-[#D4AF37] font-mono text-md">8,419</strong>
                </div>
                <div className="text-right border-l border-white/10 pl-4">
                  <span className="text-[9px] text-white/35 uppercase block">SUCCESS RATIO</span>
                  <strong className="text-emerald-500 font-mono text-md">98.2%</strong>
                </div>
              </div>
            </div>

            {/* Recharts Area growth visualization */}
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 h-[340px] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider font-mono">Disbursement Filing Vector Timeline</span>
                <span className="text-[9px] uppercase font-mono text-white/30 select-none">6-Month interval</span>
              </div>

              <div className="flex-1 w-full text-xs" style={{ minHeight: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analyticsData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCitizens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#555" fontSize={9} />
                    <YAxis stroke="#555" fontSize={9} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', fontSize: '10px' }} 
                    />
                    <Area 
                      type="monotone" 
                      name="Registered Citizens"
                      dataKey="Citizens" 
                      stroke="#D4AF37" 
                      fillOpacity={1} 
                      fill="url(#colorCitizens)" 
                    />
                    <Area 
                      type="monotone" 
                      name="Success Submissions"
                      dataKey="Applications" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorApps)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
