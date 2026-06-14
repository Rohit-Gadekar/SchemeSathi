import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scheme, DocumentFile, UserProfile } from '../types';
import { FileText, Play, Terminal, CheckCircle2, User, Landmark, Building, MapPin, Sparkles, Smartphone, ShieldCheck, HeartHandshake } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ApplicationAssistantProps {
  scheme: Scheme | null;
  documents: DocumentFile[];
  profile: UserProfile;
  selectedLang: 'en' | 'hi' | 'mr' | 'ta' | 'te';
}

export default function ApplicationAssistant({ scheme, documents, profile, selectedLang }: ApplicationAssistantProps) {
  const [formData, setFormData] = useState({
    applicantName: '',
    address: '',
    aadhaar: '',
    income: '',
    bankDetails: '',
    customLandHolding: '',
    guardianDetails: '',
    businessReg: ''
  });

  const [automationActive, setAutomationActive] = useState(false);
  const [autoCompletePercent, setAutoCompletePercent] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [browserStep, setBrowserStep] = useState(0); // 0: Idle, 1: Navigate, 2: Fill, 3: Upload, 4: Complete/Await
  const [submitted, setSubmitted] = useState(false);

  // Auto-map fields from uploaded documents on load/change
  useEffect(() => {
    if (!scheme) return;

    // Find documents
    const aadhaarDoc = documents.find(d => d.type === "Aadhaar");
    const landDoc = documents.find(d => d.type === "Land Records");
    const passbookDoc = documents.find(d => d.type === "Bank Passbook");
    const incomeDoc = documents.find(d => d.type === "Income Certificate");

    const isRameshDemo = profile.id === "ramesh-patil";

    setFormData({
      applicantName: aadhaarDoc?.extractedData?.name || profile.fullName || (isRameshDemo ? (profile.gender === 'Female' ? "Surekha Patil" : "Ramesh Tukaram Patil") : ""),
      address: aadhaarDoc?.extractedData?.address || profile.address || (isRameshDemo ? "House 204, Village Khed Rural, District Pune, Maharashtra Pin 410505" : (profile.district && profile.state ? `${profile.district}, ${profile.state}` : "")),
      aadhaar: aadhaarDoc?.extractedData?.aadhaarNumber || profile.aadhaarNumber || (isRameshDemo ? "8472-1049-5103" : ""),
      income: incomeDoc?.extractedData?.income || (profile.annualIncome ? `₹${profile.annualIncome.toLocaleString()}` : (isRameshDemo ? '₹1,50,000' : "")),
      bankDetails: passbookDoc?.extractedData?.bankDetails || profile.bankDetails || (isRameshDemo ? "State Bank of India | A/C: 30491024510 | IFSC: SBIN0001842" : ""),
      customLandHolding: landDoc?.extractedData?.customLandHolding || (isRameshDemo ? "Verified Owner, 1.2 Hectares Cultivable" : ""),
      guardianDetails: profile.age && profile.age < 18 ? (isRameshDemo ? "Tukaram Patil (Father)" : "Required for Minor") : "N/A",
      businessReg: profile.businessOwnerStatus ? (isRameshDemo ? "GSTIN-27AABCP1842M1Z0" : "") : "N/A"
    });
  }, [scheme, documents, profile]);

  const runPlaywrightAutomation = () => {
    if (!scheme) return;
    setAutomationActive(true);
    setAutoCompletePercent(0);
    setBrowserStep(1);
    setSubmitted(false);
    setLogs([]);

    const logSteps = [
      { t: 0, text: "✨ Connecting to the state citizen registration portal..." },
      { t: 500, text: "🔒 Establishing a secure encrypted connection..." },
      { t: 1200, text: `📋 Open application form: https://${scheme.state.toLowerCase() || 'national'}.gov.in/apply` },
      { t: 2500, text: "✅ Secure portal reached successfully." },
      { t: 3000, text: "🔍 Locating form fields..." },
      { t: 3800, text: `✍️ Filling in Applicant Name -> "${formData.applicantName}"`, step: 2 },
      { t: 4500, text: `✍️ Filling in Permanent Address -> "${formData.address}"` },
      { t: 5200, text: `✍️ Filling in Aadhaar Number -> "${formData.aadhaar}"` },
      { t: 6000, text: `✍️ Filling in Family Income -> "${formData.income}"` },
      { t: 6800, text: `✍️ Filling in Bank Account Details -> "${formData.bankDetails.split('|')[0]}"` },
      { t: 7500, text: "📎 Uploading your document attachments...", step: 3 },
      { t: 8400, text: "📎 Preparing Aadhaar and Land Record copies..." },
      { t: 9200, text: "🔒 Uploading secured document files..." },
      { t: 10400, text: "✨ Form fields pre-filled perfectly.", step: 4 },
      { t: 11000, text: "👉 Ready for your final safety verification!" },
      { t: 11200, text: "👍 Please click the 'Approve and File' button to submit your application form." }
    ];

    logSteps.forEach(step => {
      setTimeout(() => {
        setLogs(prev => [...prev, step.text]);
        if (step.step) {
          setBrowserStep(step.step);
        }
        // Advance progress percent
        setAutoCompletePercent(prev => Math.min(100, prev + 7));
      }, step.t);
    });

    setTimeout(() => {
      setAutoCompletePercent(100);
    }, 11500);
  };

  const handleFinalSubmit = () => {
    setSubmitted(true);
  };

  const handleDownloadReceipt = () => {
    if (!scheme) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('SCHEMESATHI - OFFICIAL APPLICATION RECEIPT', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Transaction ID: SS-8472-${formData.applicantName ? formData.applicantName.split(' ').pop()?.toUpperCase() : 'CITIZEN'}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 40);
    
    doc.setFontSize(12);
    doc.text('APPLICANT DETAILS:', 20, 50);
    doc.setFontSize(10);
    doc.text(`Name: ${formData.applicantName}`, 20, 56);
    doc.text(`Aadhaar Number: ${formData.aadhaar}`, 20, 62);
    doc.text(`Income Declared: ${formData.income}`, 20, 68);
    doc.text(`Account: ${formData.bankDetails}`, 20, 74);
    
    doc.setFontSize(12);
    doc.text('SCHEME APPLIED:', 20, 84);
    doc.setFontSize(10);
    // Split text into multiple lines for scheme name and benefit to prevent overflow
    const splitSchemeName = doc.splitTextToSize(`Scheme Name: ${scheme.name}`, 170);
    doc.text(splitSchemeName, 20, 90);
    
    const schemeHeight = splitSchemeName.length * 5;
    const splitBenefit = doc.splitTextToSize(`Benefit: ${scheme.benefits}`, 170);
    doc.text(splitBenefit, 20, 90 + schemeHeight);
    
    const benefitHeight = splitBenefit.length * 5;
    
    doc.text('STATUS: SUBMITTED (Pending Verification)', 20, 94 + schemeHeight + benefitHeight);
    
    doc.text('Thank you for using SchemeSathi Portal.', 20, 104 + schemeHeight + benefitHeight);
    
    doc.save(`Receipt_${scheme.id}.pdf`);
  };

  if (!scheme) {
    return (
      <div id="no-scheme-assistant" className="h-[calc(100vh-140px)] flex flex-col items-center justify-center text-center font-sans">
        <FileText className="w-12 h-12 text-white/20 mb-2 animate-bounce" />
        <h3 className="text-lg font-serif font-light text-white">No active scheme compilation</h3>
        <p className="text-xs text-white/40 max-w-sm mt-1 leading-relaxed">Please head to the **Scheme Discovery** tab, expand a scheme card and click &ldquo;Select for Pre-Fill Application&rdquo; to start the auto-fill process!</p>
      </div>
    );
  }

  return (
    <div id="application-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] font-sans">
      {/* Left panel: Extracted Forms Fields editor */}
      <div className="lg:col-span-12 xl:col-span-5 flex flex-col bg-[#141414] p-6 rounded-2xl border border-white/10 overflow-y-auto justify-between font-sans">
        <div>
          <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/5">
            <div className="p-2 rounded bg-white/5 border border-white/5 text-[#D4AF37]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light text-white">AI Application Pre-Fill</h2>
              <p className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-semibold">SCHEME: {scheme.name}</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="text-white/45 block mb-1.5 font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#D4AF37]" /> Full Name (As on Aadhaar)
              </label>
              <input 
                id="form-fill-name"
                type="text"
                value={formData.applicantName}
                onChange={(e) => setFormData(prev => ({ ...prev, applicantName: e.target.value }))}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-white/45 block mb-1.5 font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Permanent Address
              </label>
              <textarea 
                id="form-fill-address"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none resize-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/45 block mb-1.5 font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" /> Aadhaar Identification
                </label>
                <input 
                  id="form-fill-aadhaar"
                  type="text"
                  value={formData.aadhaar}
                  onChange={(e) => setFormData(prev => ({ ...prev, aadhaar: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none text-xs font-mono transition-colors"
                />
              </div>
              <div>
                <label className="text-white/45 block mb-1.5 font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-[#D4AF37]" /> Declared Family Income
                </label>
                <input 
                  id="form-fill-income"
                  type="text"
                  value={formData.income}
                  onChange={(e) => setFormData(prev => ({ ...prev, income: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-white/45 block mb-1.5 font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-[#D4AF37]" /> Bank Passbook Metadata (A/C & IFSC)
              </label>
              <input 
                id="form-fill-bank"
                type="text"
                value={formData.bankDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, bankDetails: e.target.value }))}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none text-xs transition-colors"
              />
            </div>

            {scheme.requiredDocuments.includes("Land Records") && (
              <div>
                <label className="text-white/45 block mb-1.5 font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#D4AF37]" /> Cultivable Land Records Holding
                </label>
                <input 
                  id="form-fill-land"
                  type="text"
                  value={formData.customLandHolding}
                  onChange={(e) => setFormData(prev => ({ ...prev, customLandHolding: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        {/* Trigger Automation control is listed here */}
        <div className="pt-4 mt-6 border-t border-white/5">
          <button
            id="btn-playwright-run"
            onClick={runPlaywrightAutomation}
            disabled={automationActive}
            className={`w-full py-3.5 rounded-xl uppercase tracking-wider font-bold text-xs cursor-pointer select-none transition-all flex items-center justify-center gap-2 shadow-lg ${
              automationActive 
              ? 'bg-[#1A1A1A] text-white/20 border border-white/5 cursor-not-allowed shadow-none' 
              : 'bg-[#D4AF37] hover:bg-[#FFDF73] active:scale-[99%] text-black shadow-[#D4AF37]/10'
            }`}
          >
            <Play className="w-4 h-4" />
            Run Auto-Fill Helper
          </button>
        </div>
      </div>

      {/* Right section: Playwright interactive browser mockup panel */}
      <div className="lg:col-span-12 xl:col-span-7 flex flex-col bg-[#141414] rounded-2xl border border-white/10 h-full overflow-hidden justify-between">
        {/* Mock Browser Header */}
        <div className="bg-[#0D0D0D] border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80"></span>
            <div className="bg-[#1A1A1A] border border-white/5 rounded-lg px-3 py-1 font-mono text-[9px] text-white/40 flex items-center gap-1.5 w-72 h-6 overflow-hidden ml-3 select-none">
              <span className="text-[#D4AF37]">https://</span>
              <span>{scheme.state.toLowerCase() || 'national'}.gov.in/apply/pmkisan/form</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-white/30">Secure Connection</span>
        </div>

        {/* Simulated Government Portal Workspace frame */}
        <div className="flex-1 bg-white/2 p-6 flex items-center justify-center relative min-h-[220px]">
          {/* Animated Matrix Stream background when active */}
          {automationActive && autoCompletePercent < 100 && (
            <div className="absolute inset-0 bg-[#D4AF37]/2 pointer-events-none animate-pulse"></div>
          )}

          {browserStep === 0 ? (
            <div className="text-center font-sans">
              <Terminal className="w-12 h-12 text-white/10 mx-auto mb-2 animate-bounce" />
              <span className="text-xs text-white/40 font-light">Form filling assistant is ready.</span>
              <span className="text-[10px] text-white/30 mt-1 block">Click &ldquo;Run Auto-Fill Helper&rdquo; to fill out the form automatically.</span>
            </div>
          ) : (
            <div className="w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-xl p-5 shadow-2xll relative z-10 font-sans">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-white/70">Unified Scheme Portal</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
              </div>

              {submitted ? (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6 flex flex-col items-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#D4AF37] mb-2 animate-bounce" />
                  <h4 className="text-sm font-semibold text-white mb-1 uppercase tracking-wider">Application Packet Successfully Filed!</h4>
                  <p className="text-[11px] text-white/50 font-sans leading-relaxed mb-4">The application-ready packet has been officially routed to verification departments. Transaction ID: SS-8472-{formData.applicantName ? formData.applicantName.split(' ').pop()?.toUpperCase() : 'CITIZEN'}.</p>
                  
                  <button
                    onClick={handleDownloadReceipt}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-lg text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Download Receipt
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-3 font-sans text-xs">
                  {browserStep >= 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-[#141414] border border-white/5 space-y-2.5">
                      <div className="flex justify-between border-b border-white/5 pb-1.5 font-semibold text-white/40 uppercase text-[9px] tracking-wider">
                        <span>Application Fields Pre-fill Preview</span>
                        <span className="text-[#D4AF37] font-mono">Form Helper</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-2 text-[10px] font-sans">
                        <div>
                          <span className="text-white/30 block uppercase text-[8px] tracking-wider mb-0.5">Citizen Full Name</span>
                          <span className="text-white/80 font-medium">{browserStep >= 2 ? formData.applicantName : 'Typing...'}</span>
                        </div>
                        <div>
                          <span className="text-white/30 block uppercase text-[8px] tracking-wider mb-0.5">UIDAI Aadhaar Key</span>
                          <span className="text-white/80 font-mono">{browserStep >= 2 ? formData.aadhaar : 'Injected security hash...'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-white/30 block uppercase text-[8px] tracking-wider mb-0.5">Extraction Address Segment</span>
                          <span className="text-white/80 truncate block">{browserStep >= 2 ? formData.address : 'Reading...'}</span>
                        </div>
                        <div>
                          <span className="text-white/30 block uppercase text-[8px] tracking-wider mb-0.5">Calculated Revenue Baseline</span>
                          <span className="text-white/80">{browserStep >= 2 ? formData.income : 'Extracting...'}</span>
                        </div>
                        <div>
                          <span className="text-white/30 block uppercase text-[8px] tracking-wider mb-0.5">Financial Escrow Routing</span>
                          <span className="text-white/80 truncate block">{browserStep >= 2 ? formData.bankDetails.split('|')[0] : 'Retrieving...'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {browserStep >= 3 && (
                    <motion.div 
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-3 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg flex items-center justify-between text-[11px] font-semibold"
                    >
                      <div className="flex items-center gap-2 text-[#D4AF37]">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Verified proof copies uploaded successfully
                      </div>
                      <span className="px-2 py-0.5 bg-[#D4AF37] text-black text-[9px] font-mono font-bold rounded">SUCCESS</span>
                    </motion.div>
                  )}

                  {browserStep >= 4 && (
                    <motion.div 
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-center pt-3 border-t border-white/5 mt-4 flex flex-col items-center animate-pulse"
                    >
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-2">
                        <HeartHandshake className="w-4 h-4" />
                        Human confirmation required before submit
                      </div>
                      <button
                        id="btn-manual-confirm"
                        onClick={handleFinalSubmit}
                        className="py-2.5 px-6 font-semibold text-xs tracking-wider uppercase bg-[#D4AF37] hover:bg-[#FFDF73] text-black hover:scale-[102%] rounded-lg cursor-pointer transform transition-all shadow shadow-[#D4AF37]/10"
                      >
                        Approve and File Application
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Terminal logs display */}
        <div className="bg-[#0D0D0D] border-t border-white/10 p-4 h-36 overflow-y-auto font-mono text-[10px] text-white/30 leading-relaxed scroll-smooth flex flex-col-reverse justify-end pr-1 shadow-inner select-none">
          {logs.length === 0 ? (
            <div className="text-white/20 italic">No progress logs available. Click Run Auto-Fill Helper to start.</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, lIdx) => (
                <div key={lIdx} className="flex gap-2">
                  <span className="text-[#D4AF37]/60 font-semibold font-mono">[{lIdx + 1}]</span>
                  <span className="text-white/60 font-mono">{log}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
