import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentFile } from '../types';
import { UploadCloud, FileText, CheckCircle2, ShieldAlert, Sparkles, MessageSquare, Send, Bot, User, Trash2 } from 'lucide-react';
import { translations } from '../translations';

interface DocumentVaultProps {
  documents: DocumentFile[];
  onUpload: (type: string, fileDataUrlUrl?: string) => Promise<void>;
  onDelete: (id: string) => void;
  selectedLang: 'en' | 'hi' | 'mr' | 'ta' | 'te';
  onNavigateToDiscovery?: () => void;
}

const LOCALIZED_DOC_TYPES = {
  en: {
    "Aadhaar": "Aadhaar Card",
    "PAN": "PAN Card",
    "Income Certificate": "Income Certificate",
    "Domicile Certificate": "Domicile Certificate",
    "Caste Certificate": "Caste Certificate",
    "Land Records": "Land Records / RoR",
    "Bank Passbook": "Bank Passbook",
    "Mark Sheets": "Mark Sheets / Education Proof",
    "Disability Certificate": "Disability Certificate"
  },
  hi: {
    "Aadhaar": "आधार कार्ड",
    "PAN": "पैन कार्ड",
    "Income Certificate": "आय प्रमाण पत्र",
    "Domicile Certificate": "मूल निवास प्रमाण पत्र",
    "Caste Certificate": "जाति प्रमाण पत्र",
    "Land Records": "भूमि राजस्व और खसरा खतौनी",
    "Bank Passbook": "बैंक पासबुक",
    "Mark Sheets": "शैक्षणिक प्रमाण पत्र",
    "Disability Certificate": "विकलांगता प्रमाण पत्र"
  },
  mr: {
    "Aadhaar": "आधार कार्ड",
    "PAN": "पॅन कार्ड",
    "Income Certificate": "उत्पन्नाचा दाखला",
    "Domicile Certificate": "रहिवासी दाखला",
    "Caste Certificate": "जातीचा दाखला",
    "Land Records": "७/१२ जमिनीचा उतारा / खाते उतारा",
    "Bank Passbook": "बँक पासबुक",
    "Mark Sheets": "शैक्षणिक कागदपत्रे",
    "Disability Certificate": "अपंगत्व प्रमाणपत्र"
  },
  ta: {
    "Aadhaar": "ஆதார் அட்டை",
    "PAN": "பான் அட்டை",
    "Income Certificate": "வருமான சான்றிதழ்",
    "Domicile Certificate": "இருப்பிட சான்றிதழ்",
    "Caste Certificate": "சாதி சான்றிதழ்",
    "Land Records": "நில ஆவணங்கள் / பட்டா",
    "Bank Passbook": "வங்கி கணக்கு புத்தகம்",
    "Mark Sheets": "மதிப்பெண் சான்றிதழ்",
    "Disability Certificate": "மாற்றுத்திறனாளி சான்றிதழ்"
  },
  te: {
    "Aadhaar": "ఆధార్ కార్డు",
    "PAN": "పాన్ కార్డు",
    "Income Certificate": "ఆదాయ ధృవీకరణ పత్రం",
    "Domicile Certificate": "స్థానికత ధృవీకరణ పత్రం",
    "Caste Certificate": "కుల ధృవీకరణ పత్రం",
    "Land Records": "భూమి రికార్డులు / పట్టాదారు పాస్బుక్",
    "Bank Passbook": "బ్యాంకు పాస్ బుక్",
    "Mark Sheets": "మార్కుల జాబితా",
    "Disability Certificate": "వికలాంగుల ధృవీకరణ పత్రం"
  }
};

export default function DocumentVault({ documents, onUpload, onDelete, selectedLang, onNavigateToDiscovery }: DocumentVaultProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState('Aadhaar');
  const [ocrLoading, setOcrLoading] = useState(false);
  
  // Document chat state
  const [activeChatDoc, setActiveChatDoc] = useState<DocumentFile | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([]);
  const [docChatLoading, setDocChatLoading] = useState(false);

  const t = translations[selectedLang].vault;

  const documentTypes = [
    "Aadhaar", 
    "PAN", 
    "Income Certificate", 
    "Domicile Certificate", 
    "Caste Certificate", 
    "Land Records", 
    "Bank Passbook", 
    "Mark Sheets", 
    "Disability Certificate"
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setOcrLoading(true);
      await onUpload(selectedType);
      setOcrLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOcrLoading(true);
      await onUpload(selectedType);
      setOcrLoading(false);
    }
  };

  const triggerOcrDemo = async (type: string) => {
    setOcrLoading(true);
    await onUpload(type);
    setOcrLoading(false);
  };

  const handleSendDocMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatDoc) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setDocChatLoading(true);

    try {
      const res = await fetch("/api/doc-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: activeChatDoc.type,
          extractedData: activeChatDoc.extractedData || {},
          message: userText
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Error indexing document contents." }]);
    } finally {
      setDocChatLoading(false);
    }
  };

  const openDocChat = (doc: DocumentFile) => {
    setActiveChatDoc(doc);
    setChatMessages([
      { sender: 'bot', text: `Hello! I have loaded your extracted **${doc.type}**. Ask me any field details, like "What is my address?" or "Tell me my document number".` }
    ]);
  };

  return (
    <div id="vault-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Left section: drag/drop upload and trigger demo files (Step 5) */}
      <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-5 bg-[#141414] p-6 rounded-2xl border border-white/10 overflow-y-auto font-sans">
        <div>
          <h2 className="font-serif text-lg font-light text-white">{t.title}</h2>
          <p className="text-xs text-white/40 font-sans">{t.subtitle}</p>
        </div>

        {/* Dropdown TypeSelector */}
        <div className="font-sans">
          <label className="text-xs text-white/40 block mb-1.5 font-semibold uppercase tracking-wider">{t.selectType}</label>
          <select
            id="vault-type-selector"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-white outline-none focus:border-[#D4AF37]/50 text-sm transition-all"
          >
            {documentTypes.map(typeCode => {
              const strLabel = LOCALIZED_DOC_TYPES[selectedLang][typeCode as keyof (typeof LOCALIZED_DOC_TYPES)['en']] || typeCode;
              return (
                <option key={typeCode} value={typeCode}>{strLabel}</option>
              );
            })}
          </select>
        </div>

        {/* Drag Drop Box Area */}
        <div
          id="vault-drag-drop"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive 
            ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]' 
            : 'border-white/5 hover:border-white/15 bg-white/2 text-white/50'
          }`}
          onClick={() => document.getElementById('file-upload-input')?.click()}
        >
          <UploadCloud className="w-10 h-10 mb-3 text-[#D4AF37]" />
          <p className="text-xs font-semibold text-white/90">{t.dragDrop}</p>
          <p className="text-[10px] text-white/30 mt-1 font-sans">Supports PNG, JPEG, PDF up to 10MB</p>
          <div className="mt-3.5 text-[10px] uppercase tracking-wider font-semibold px-4 py-2 bg-[#1A1A1A] text-white/70 rounded-lg border border-white/5 hover:text-white transition-colors">{selectedLang === 'hi' ? 'कंप्यूटर से चुनें' : selectedLang === 'mr' ? 'संगणकावरून निवडा' : selectedLang === 'ta' ? 'கணினியில் தேர்வு செய்யவும்' : selectedLang === 'te' ? 'కంప్యూటర్ నుండి ఎంచుకోండి' : 'Select on computer'}</div>
          <input 
            id="file-upload-input"
            type="file" 
            className="hidden"
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.pdf"
          />
        </div>

        {/* Ready-to-use Sample Proofs */}
        <div className="space-y-2 border-t border-white/5 pt-4 font-sans">
          <h4 className="text-[10px] font-sans font-semibold text-[#D4AF37] tracking-wider uppercase">EXAMPLE SAMPLE CARDS</h4>
          <p className="text-[10px] text-white/40 mb-2">Try this out instantly using these pre-loaded sample document cards:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-demo-aadhaar"
              onClick={() => triggerOcrDemo('Aadhaar')}
              className="py-2.5 px-3 bg-[#1A1A1A] hover:bg-[#222222] text-[11px] text-white/60 hover:text-white border border-white/5 rounded-lg text-left truncate cursor-pointer transition-all font-light"
            >
              📄 Aadhaar Card
            </button>
            <button
              id="btn-demo-land"
              onClick={() => triggerOcrDemo('Land Records')}
              className="py-2.5 px-3 bg-[#1A1A1A] hover:bg-[#222222] text-[11px] text-white/60 hover:text-white border border-white/5 rounded-lg text-left truncate cursor-pointer transition-all font-light"
            >
              📄 Land Record
            </button>
            <button
              id="btn-demo-passbook"
              onClick={() => triggerOcrDemo('Bank Passbook')}
              className="py-2.5 px-3 bg-[#1A1A1A] hover:bg-[#222222] text-[11px] text-white/60 hover:text-white border border-white/5 rounded-lg text-left truncate col-span-2 cursor-pointer transition-all font-light"
            >
              📄 Bank Passbook Statement
            </button>
          </div>
        </div>
      </div>

      {/* Central portion: Grid of uploaded documents with detailed field viewers (Step 6) */}
      <div className="lg:col-span-12 xl:col-span-5 flex flex-col bg-[#141414] p-6 rounded-2xl border border-white/10 overflow-y-auto font-sans">
        <div className="mb-4">
          <h2 className="font-serif text-lg font-light text-white font-serif">{selectedLang === 'hi' ? 'दस्तावेज़ तिजोरी' : selectedLang === 'mr' ? 'तुमची दस्तऐवज बँक' : selectedLang === 'ta' ? 'ஆவணக் காப்பகம்' : selectedLang === 'te' ? 'మీ పత్రాల వాల్ట్' : 'Your Document Vault'}</h2>
          <p className="text-xs text-white/40 font-sans">Your files are encrypted and private to you</p>
        </div>

        {ocrLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-pulse py-12">
            <Sparkles className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" />
            <span className="text-sm text-white/90 font-medium font-sans">Reading your document details...</span>
            <span className="text-[10px] text-white/30 mt-1">Extracting name, address, numbers to help fill forms</span>
          </div>
        )}

        {!ocrLoading && documents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 border border-dashed border-white/10 rounded-xl p-6 bg-white/2">
            <FileText className="w-10 h-10 text-white/10 mb-3" />
            <span className="text-xs text-white/50 font-medium">{t.noDocs}</span>
            <span className="text-[10px] text-white/30 mt-1">Upload files or click any shortcut cards to pre-populate.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map(doc => (
              <div 
                key={doc.id}
                className="p-4 rounded-xl border border-white/5 bg-[#1A1A1A] font-sans relative overflow-hidden shadow-lg"
              >
                {/* Actions tray */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <button 
                    id={`btn-chat-doc-${doc.id}`}
                    onClick={() => openDocChat(doc)}
                    className="p-1.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded hover:bg-[#D4AF37]/20 cursor-pointer text-xs"
                    title="Doc Search Chat"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    id={`btn-del-doc-${doc.id}`}
                    onClick={() => onDelete(doc.id)}
                    className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 cursor-pointer text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Doc Name details */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-white/5 text-[#D4AF37] border border-white/5 rounded-lg text-[10px] font-semibold shrink-0 uppercase tracking-wider">
                    DOC
                  </div>
                  <div className="pr-16">
                    <h4 className="text-sm font-semibold text-white/90">{doc.type}</h4>
                    <p className="text-[9px] text-white/30 font-mono mt-0.5 uppercase tracking-wider">Scanned: {doc.uploadDate}</p>
                  </div>
                </div>

                {/* Extracted fields drawer UI */}
                {doc.extractedData && (
                  <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-1 gap-2 text-xs font-sans">
                    <div className="text-[9px] font-sans font-semibold tracking-wider text-[#D4AF37] uppercase">CONFIRMED DETAILS FOUND</div>
                    {Object.entries(doc.extractedData).map(([key, val]) => {
                      if (!val) return null;
                      return (
                        <div key={key} className="flex justify-between items-start gap-4 p-2 bg-[#141414] rounded-lg border border-white/2">
                          <span className="text-white/40 uppercase tracking-wider text-[9px] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-right text-white/80 font-medium">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {documents.length > 0 && onNavigateToDiscovery && (
          <div className="mt-4 pt-4 border-t border-white/5 shrink-0">
            <button
              onClick={onNavigateToDiscovery}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#FFDF73] text-black rounded-lg font-sans text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center cursor-pointer shadow-md"
            >
              {selectedLang === 'hi' ? 'योजनाओं में वापस लौटें' : selectedLang === 'mr' ? 'योजनांवर परत जा' : selectedLang === 'ta' ? 'திட்டங்களுக்குத் திரும்பு' : selectedLang === 'te' ? 'పథకాలకు తిరిగి వెళ్ళండి' : 'Check Eligibility Again'}
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Interactive Chat-With-Doc Interface (Feature 4) */}
      <div className="lg:col-span-12 xl:col-span-3 flex flex-col bg-[#141414] p-6 rounded-2xl border border-white/10 h-full pb-4 justify-between font-sans">
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <div className="pb-3 border-b border-white/5 mb-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-[#D4AF37] tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> DOCUMENT CHATAGENT
            </div>
            <p className="text-[10px] text-white/40 font-sans mt-0.5">Ask questions directly about active metadata</p>
          </div>

          {activeChatDoc ? (
            <div className="flex flex-col flex-1 h-full justify-between">
              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto space-y-3 p-1 max-h-[290px]">
                {chatMessages.map((msg, mIdx) => (
                  <div key={mIdx} className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''} text-xs`}>
                    <div className={`p-1 w-6 h-6 rounded shrink-0 flex items-center justify-center font-bold ${
                      msg.sender === 'user' ? 'bg-[#D4AF37] text-black' : 'bg-[#1A1A1A] text-[#D4AF37] border border-white/5'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    <div className={`p-2.5 rounded-xl ${
                      msg.sender === 'user' ? 'bg-[#D4AF37]/10 text-white border border-[#D4AF37]/15' : 'bg-[#1A1A1A] text-white/80'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {docChatLoading && (
                  <div className="flex gap-2 text-xs">
                    <div className="p-1 w-6 h-6 rounded bg-[#1A1A1A] text-[#D4AF37] flex items-center justify-center">
                      <Bot className="w-3 h-3 animate-bounce" />
                    </div>
                    <div className="text-white/40 p-2.5 italic">Reading card context...</div>
                  </div>
                )}
              </div>

              {/* Chat action box */}
              <form onSubmit={handleSendDocMessage} className="mt-3 flex gap-1.5 pt-2">
                <input 
                  id="vault-doc-chat-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="e.g., What is my DOB?"
                  className="flex-1 px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-xl text-white outline-none focus:border-[#D4AF37]/50 text-xs"
                />
                <button 
                  id="btn-vault-doc-chat-send"
                  type="submit" 
                  className="p-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#FFDF73] text-black shadow cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <MessageSquare className="w-8 h-8 text-white/10 mb-2 animate-bounce" />
              <span className="text-[11px] text-white/50 font-medium">Select a document in the middle column first.</span>
              <span className="text-[9px] text-white/35 mt-1 block leading-relaxed">Click the speech bubble icon on any uploaded card to begin talking with it.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
