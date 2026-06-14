import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Scheme, DocumentFile } from './types';
import { getSeededSchemes } from './db/schemesSeed';
import LandingPage from './components/LandingPage';
import SathiAIChat from './components/SathiAIChat';
import SchemeDiscovery from './components/SchemeDiscovery';
import DocumentVault from './components/DocumentVault';
import ApplicationAssistant from './components/ApplicationAssistant';
import AdvancedFeatures from './components/AdvancedFeatures';
import { translations } from './translations';
import { LayoutDashboard, Compass, UploadCloud, FileText, Settings, ShieldAlert, CheckCircle2, Milestone, WifiOff } from 'lucide-react';
import { useOnlineStatus } from './hooks/useOnlineStatus';

export default function App() {
  const [step, setStep] = useState<'landing' | 'workspace'>('landing');
  const [activeTab, setActiveTab] = useState<'onboarding' | 'discovery' | 'vault' | 'prefill' | 'advanced'>('onboarding');
  const isOnline = useOnlineStatus();

  // Unified global state
  const [profile, setProfile] = useState<UserProfile>({
    id: "patil-123",
    profileCompleteness: 0
  });
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  // Global Language state
  const [globalLang, setGlobalLang] = useState<'en' | 'hi' | 'mr' | 'ta' | 'te'>('en');
  const [hasSelectedLang, setHasSelectedLang] = useState<boolean>(false);

  // Quick setup helper for preset example citizen scenario
  const handleStartApp = (runDemo: boolean) => {
    if (runDemo) {
      // 1. Populate demo profile (Farmer Path)
      setProfile({
        id: "ramesh-patil",
        age: 44,
        gender: "Male",
        state: "Maharashtra",
        district: "Pune",
        occupation: "Farmer",
        annualIncome: 150000,
        farmerStatus: true,
        landOwner: true,
        studentStatus: false,
        businessOwnerStatus: false,
        disabilityStatus: false,
        educationLevel: "10th Pass",
        casteCategory: "General",
        profileCompleteness: 92
      });

      // 2. Prepopulate three secure validated OCR documents in Document Vault
      setDocuments([
        {
          id: "aadhaar-patil",
          type: "Aadhaar",
          name: "ramesh_patil_aadhaar_card.png",
          uploadDate: "June 13, 2026",
          status: "completed",
          extractedData: {
            name: "Ramesh Tukaram Patil",
            dob: "15/08/1982",
            address: "House 204, Village Khed Rural, District Pune, Maharashtra Pin 410505",
            aadhaarNumber: "8472-1049-5103",
            panNumber: "",
            bankDetails: "",
            income: ""
          }
        },
        {
          id: "land-patil",
          type: "Land Records",
          name: "ramesh_patil_712_extract.pdf",
          uploadDate: "June 13, 2026",
          status: "completed",
          extractedData: {
            name: "Ramesh Tukaram Patil",
            dob: "",
            address: "Gat No. 124, Taluka Khed, Pune Rural",
            aadhaarNumber: "",
            panNumber: "",
            bankDetails: "",
            income: "",
            customLandHolding: "Verified Owner, 1.2 Hectares Cultivable"
          }
        },
        {
          id: "bank-patil",
          type: "Bank Passbook",
          name: "ramesh_patil_sbi_statement.png",
          uploadDate: "June 13, 2026",
          status: "completed",
          extractedData: {
            name: "Ramesh T Patil",
            dob: "",
            address: "Khed Rural, Maharashtra",
            aadhaarNumber: "",
            panNumber: "",
            bankDetails: "State Bank of India | A/C: 30491024510 | IFSC: SBIN0001842",
            income: ""
          }
        }
      ]);

      setGlobalLang('en');
      setHasSelectedLang(true);
      // Leap direct to scheme discovery matching PM Kisan
      setActiveTab('discovery');
    } else {
      // Clear states
      setProfile({ id: "fresh-citizen", profileCompleteness: 8 });
      setDocuments([]);
      setSelectedScheme(null);
      setHasSelectedLang(false);
      setActiveTab('onboarding');
    }
    setStep('workspace');
  };

  // Upload/ocr dynamic triggers
  const handleVaultUpload = async (docType: string) => {
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, profile })
      });
      const data = await res.json();
      
      const newDoc: DocumentFile = {
        id: `doc-${Date.now()}`,
        type: docType,
        name: `${docType.toLowerCase().replace(' ', '_')}_raw_scan.png`,
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        status: 'completed',
        extractedData: data.extractedData
      };

      setDocuments(prev => {
        // Prevent duplicate types by replacement
        const filtered = prev.filter(d => d.type !== docType);
        return [...filtered, newDoc];
      });
    } catch (err) {
      console.error("OCR upload request failed: ", err);
    }
  };

  const handleVaultDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleSchemeSelected = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setActiveTab('prefill');
  };

  // Map uploaded types for reactive checklists
  const uploadedTypes = documents.map(d => d.type);

  if (step === 'landing') {
    return <LandingPage onStart={handleStartApp} />;
  }

  // Preflight Language Picker screen for Custom Start
  if (step === 'workspace' && !hasSelectedLang) {
    const defaultT = translations.en.langSelect;
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Background Radial Light Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/5 rounded-full blur-[130px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full bg-[#141414] border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-lg relative z-10 flex flex-col items-center shadow-2xl shadow-[#D4AF37]/2"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[#D4AF37] text-[9px] uppercase tracking-widest font-semibold mb-6">
            <Milestone className="w-3.5 h-3.5 text-[#D4AF37]" />
            {defaultT.badge}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-light text-[#F5F5F5] mb-2 tracking-tight text-center">
            Scheme<span className="text-[#D4AF37]">Sathi</span>
          </h1>
          <p className="text-white/40 text-[11px] uppercase tracking-widest text-center mb-4 leading-relaxed max-w-lg">
            {defaultT.subtitle}
          </p>
          <p className="text-white/60 text-xs text-center mb-8 max-w-md font-sans leading-relaxed">
            {defaultT.desc}
          </p>

          {/* Majestic Interactive Indian Languages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8 font-sans">
            <button
              onClick={() => { setGlobalLang('en'); setHasSelectedLang(true); }}
              className="px-5 py-4 rounded-xl border border-white/5 bg-[#1F1F1F]/40 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/5 transition-all text-left group cursor-pointer flex flex-col justify-between h-20 shadow-md"
            >
              <span className="text-sm font-semibold text-white/90 group-hover:text-[#D4AF37] transition-colors">English</span>
              <span className="text-[9px] text-white/20 tracking-wider font-mono">PRIMARY</span>
            </button>
            <button
              onClick={() => { setGlobalLang('hi'); setHasSelectedLang(true); }}
              className="px-5 py-4 rounded-xl border border-white/5 bg-[#1F1F1F]/40 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/5 transition-all text-left group cursor-pointer flex flex-col justify-between h-20 shadow-md"
            >
              <span className="text-sm font-semibold text-white/90 group-hover:text-[#D4AF37] transition-colors">हिंदी (Hindi)</span>
              <span className="text-[9px] text-white/20 tracking-wider font-mono">उत्तरभारत व सामान्य</span>
            </button>
            <button
              onClick={() => { setGlobalLang('mr'); setHasSelectedLang(true); }}
              className="px-5 py-4 rounded-xl border border-white/5 bg-[#1F1F1F]/40 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/5 transition-all text-left group cursor-pointer flex flex-col justify-between h-20 shadow-md"
            >
              <span className="text-sm font-semibold text-white/90 group-hover:text-[#D4AF37] transition-colors">मराठी (Marathi)</span>
              <span className="text-[9px] text-white/20 tracking-wider font-mono">महाराष्ट्र राज्य</span>
            </button>
            <button
              onClick={() => { setGlobalLang('ta'); setHasSelectedLang(true); }}
              className="px-5 py-4 rounded-xl border border-white/5 bg-[#1F1F1F]/40 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/5 transition-all text-left group cursor-pointer flex flex-col justify-between h-20 shadow-md"
            >
              <span className="text-sm font-semibold text-white/90 group-hover:text-[#D4AF37] transition-colors">தமிழ் (Tamil)</span>
              <span className="text-[9px] text-white/20 tracking-wider font-mono">தமிழ்நாடு</span>
            </button>
            <button
              onClick={() => { setGlobalLang('te'); setHasSelectedLang(true); }}
              className="px-5 py-3 rounded-xl border border-white/5 bg-[#1F1F1F]/40 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/5 transition-all text-left sm:col-span-2 group cursor-pointer flex flex-row items-center justify-between h-14 shadow-md"
            >
              <span className="text-sm font-semibold text-white/90 group-hover:text-[#D4AF37] transition-colors">తెలుగు (Telugu)</span>
              <span className="text-[9px] text-white/20 tracking-wider font-mono">ఆంధ్రప్రదేశ్ & తెలంగాణ</span>
            </button>
          </div>
          
          <button
            onClick={() => setStep('landing')}
            className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-white/20 pb-0.5"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const t = translations[globalLang];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col justify-between">
      {/* Premium Dashboard Header Navigation */}
      <header className="bg-[#0A0A0A] border-b border-white/10 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Logo brand & home link */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setStep('landing')}>
            <div className="p-2 w-9 h-9 rounded-lg border border-[#D4AF37]/30 bg-[#1A1A1A] flex items-center justify-center font-serif text-[#D4AF37] font-semibold text-sm">
              S
            </div>
            <div>
              <h1 className="font-serif text-lg tracking-wider text-[#F5F5F5] leading-none">
                Scheme<span className="text-[#D4AF37]">Sathi</span>
              </h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.12em] mt-1 font-sans">{t.nav.citizenPortal}</p>
            </div>
          </div>

          {/* Navigation Tab selection */}
          <nav className="flex items-center gap-1 bg-[#141414] p-1.5 rounded-xl border border-white/5 overflow-x-auto max-w-full no-scrollbar">
            <button
              id="tab-onboarding"
              onClick={() => setActiveTab('onboarding')}
              className={`px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'onboarding' 
                ? 'bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20' 
                : 'text-white/40 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              {t.nav.onboarding}
            </button>

            <button
              id="tab-discovery"
              onClick={() => setActiveTab('discovery')}
              className={`px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'discovery' 
                ? 'bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20' 
                : 'text-white/40 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              {t.nav.discovery}
            </button>

            <button
              id="tab-vault"
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'vault' 
                ? 'bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20' 
                : 'text-white/40 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {t.nav.vault}
            </button>

            <button
              id="tab-prefill"
              onClick={() => setActiveTab('prefill')}
              className={`px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'prefill' 
                ? 'bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20' 
                : 'text-white/40 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {t.nav.prefill}
            </button>

            <button
              id="tab-advanced"
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'advanced' 
                ? 'bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20' 
                : 'text-white/40 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              {t.nav.portals}
            </button>
          </nav>

          {/* Quick links & exit buttons */}
          <button 
            id="btn-nav-exit"
            onClick={() => setStep('landing')}
            className="text-[10px] uppercase tracking-wider text-white/30 hover:text-white cursor-pointer hidden md:block"
          >
            ← {t.nav.exit}
          </button>
        </div>
      </header>

      {/* Main Container viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {activeTab === 'onboarding' && (
            <SathiAIChat 
              profile={profile} 
              setProfile={setProfile} 
              onProfileChange={(p) => setProfile(p)} 
              selectedLang={globalLang}
              setSelectedLang={setGlobalLang}
              onNextStep={() => setActiveTab('discovery')}
            />
          )}

          {activeTab === 'discovery' && (
            <SchemeDiscovery 
              profile={profile} 
              onSelectScheme={handleSchemeSelected} 
              selectedSchemeId={selectedScheme?.id}
              uploadedTypes={uploadedTypes}
              selectedLang={globalLang}
              onNavigateToVault={() => setActiveTab('vault')}
            />
          )}

          {activeTab === 'vault' && (
            <DocumentVault 
              documents={documents} 
              onUpload={handleVaultUpload} 
              onDelete={handleVaultDelete} 
              selectedLang={globalLang}
              onNavigateToDiscovery={() => setActiveTab('discovery')}
            />
          )}

          {activeTab === 'prefill' && (
            <ApplicationAssistant 
              scheme={selectedScheme} 
              documents={documents} 
              profile={profile} 
              selectedLang={globalLang}
            />
          )}

          {activeTab === 'advanced' && (
            <AdvancedFeatures 
              schemes={getSeededSchemes()} 
              profile={profile} 
              selectedLang={globalLang}
            />
          )}
        </motion.div>
      </main>

      {/* Subtle layout bottom notifications bar */}
      <footer className="bg-[#050505] border-t border-white/10 px-12 py-4 flex items-center justify-between text-[10px] tracking-[0.2em] text-white/30 uppercase shrink-0">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex gap-4 items-center">
            <span>© 2026 SchemeSathi • Direct Citizen Portal</span>
            {!isOnline && (
              <span className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                <WifiOff className="w-3 h-3" /> Offline Match Mode Active
              </span>
            )}
          </div>
          <div className="flex gap-6 items-center">
            <span>{t.nav.exit === "काम थांबवा" ? "डेटाबेस: " : t.nav.exit === "काम छोड़ें" ? "डेटाबेस: " : "Database: "}<strong className="text-white/80">{t.nav.database}</strong></span>
            <span>✨ {t.nav.exit === "काम थांबवा" ? "सेवा स्थिती: " : t.nav.exit === "काम छोड़ें" ? "सेवा स्थिति: " : "Service Status: "}<strong className="text-[#D4AF37]">{t.nav.serviceStatus}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
