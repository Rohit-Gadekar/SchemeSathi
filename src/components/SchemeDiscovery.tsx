import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scheme, UserProfile } from '../types';
import { Search, Filter, Sparkles, AlertCircle, CheckCircle, HelpCircle, ChevronDown, ChevronUp, FileText, Calendar, Compass, ShieldCheck } from 'lucide-react';
import { translations } from '../translations';

interface SchemeDiscoveryProps {
  profile: UserProfile;
  onSelectScheme: (scheme: Scheme) => void;
  selectedSchemeId?: string;
  uploadedTypes: string[];
  selectedLang: 'en' | 'hi' | 'mr' | 'ta' | 'te';
  onNavigateToVault?: () => void;
}

export default function SchemeDiscovery({ profile, onSelectScheme, selectedSchemeId, uploadedTypes, selectedLang, onNavigateToVault }: SchemeDiscoveryProps) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Eligibility & translation state
  const [loadingElig, setLoadingElig] = useState<string | null>(null);
  const [eligResults, setEligResults] = useState<Record<string, { status: string; score: number; reason: string; aiGenerated?: boolean }>>({});
  
  const [langLoad, setLangLoad] = useState<string | null>(null);
  const [simplifyResults, setSimplifyResults] = useState<Record<string, Record<string, { q1: string; a1: string; q2: string; a2: string; q3: string; a3: string; q4: string; a4: string }>>>({});
  const [activeLang, setActiveLang] = useState<Record<string, 'en' | 'hi' | 'mr' | 'ta' | 'te'>>({});

  // Categories list based on our target audience
  const categories = ['All', 'Farmer', 'Student', 'Women', 'Senior Citizen', 'Business', 'Low-income'];

  const t = translations[selectedLang].discovery;

  useEffect(() => {
    fetch("/api/schemes")
      .then(res => res.json())
      .then(data => {
        setSchemes(data.schemes || []);
      })
      .catch(err => {
        console.error("Failed to load schemes: ", err);
      });
  }, []);

  // Compute readiness score (0-100)
  const computeReadinessScore = (scheme: Scheme) => {
    let score = 0;
    
    // 1. Profile completeness (up to 40 pts)
    score += Math.round(profile.profileCompleteness * 0.4);

    // 2. Document completeness matching required documents (up to 40 pts)
    const required = scheme.requiredDocuments;
    if (required.length > 0) {
      const matchDocs = required.filter(doc => uploadedTypes.includes(doc));
      score += Math.round((matchDocs.length / required.length) * 40);
    } else {
      score += 40;
    }

    // 3. Eligibility fit status (up to 20 pts)
    const fit = eligResults[scheme.id]?.status || 'Likely Eligible';
    if (fit === 'Eligible') score += 20;
    else if (fit === 'Likely Eligible') score += 12;
    else score += 2;

    return Math.min(100, score);
  };

  const handleCardExpand = async (schemeId: string) => {
    if (expandedId === schemeId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(schemeId);
    if (!activeLang[schemeId]) {
      setActiveLang(prev => ({ ...prev, [schemeId]: selectedLang }));
    }

    // Trigger Eligibility verification api call
    if (!eligResults[schemeId]) {
      setLoadingElig(schemeId);
      try {
        const res = await fetch("/api/eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, schemeId })
        });
        const data = await res.json();
        setEligResults(prev => ({ ...prev, [schemeId]: data }));
      } catch (err) {
        console.error("Eligibility check failed: ", err);
      } finally {
        setLoadingElig(null);
      }
    }

    // Trigger base translation fetch matching selected level
    await handleLangFetch(schemeId, selectedLang);
  };

  const handleLangFetch = async (schemeId: string, lang: 'en' | 'hi' | 'mr' | 'ta' | 'te') => {
    setActiveLang(prev => ({ ...prev, [schemeId]: lang }));
    
    if (simplifyResults[schemeId] && simplifyResults[schemeId][lang]) {
      return;
    }

    setLangLoad(schemeId);
    try {
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemeId, language: lang })
      });
      const data = await res.json();
      setSimplifyResults(prev => ({
        ...prev,
        [schemeId]: {
          ...(prev[schemeId] || {}),
          [lang]: data
        }
      }));
    } catch (err) {
      console.error("Language load failed:", err);
    } finally {
      setLangLoad(null);
    }
  };

  // Standard local calculations for matching score preview in list
  const getPreMatchScore = (scheme: Scheme) => {
    let score = 50;
    if (profile.farmerStatus && scheme.category === 'Farmer') score += 40;
    if (profile.studentStatus && scheme.category === 'Student') score += 40;
    if (profile.businessOwnerStatus && scheme.category === 'Business') score += 35;
    if (profile.gender === 'Female' && scheme.category === 'Women') score += 42;
    if (profile.age && profile.age >= 60 && scheme.category === 'Senior Citizen') score += 45;
    if (profile.annualIncome) {
      if (profile.annualIncome < 150000) score += 8;
      if (profile.annualIncome > 500000 && (scheme.id === 'pm-awas' || scheme.id === 'ayushman-bharat')) score -= 45;
    }
    if (profile.state && scheme.state !== 'National' && profile.state !== scheme.state) score -= 40;
    
    return Math.max(12, Math.min(98, score));
  };

  // Filter schemes
  const filteredSchemes = schemes.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || 
                          s.category.toLowerCase().includes(q) || 
                          s.benefits.toLowerCase().includes(q);
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="schemes-discovery-panel" className="h-[calc(100vh-140px)] flex flex-col font-sans">
      {/* Top filter toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-white/10 mb-6 bg-[#141414] p-4 rounded-xl border border-white/5">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input 
            id="scheme-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1A] border border-white/5 rounded-xl text-white outline-none focus:border-[#D4AF37]/50 placeholder-white/30 text-sm transition-all"
          />
          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-3.5" />
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar pb-1.5 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-white/30 shrink-0 mr-1 hidden sm:block" />
          {categories.map(cat => {
            const translatedCat = t.categories[cat as keyof typeof t.categories] || cat;
            return (
              <button
                id={`filter-cat-${cat.toLowerCase().replace(' ', '-')}`}
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border shrink-0 ${
                  activeCategory === cat 
                  ? 'bg-white/5 text-[#D4AF37] border-[#D4AF37]/30' 
                  : 'text-white/45 border-transparent hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                {translatedCat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Schemes */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {filteredSchemes.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-[#141414] border border-dashed border-white/10">
            <Compass className="w-12 h-12 text-white/20 mx-auto mb-3 animate-spin duration-[6s]" />
            <p className="text-white/70 font-medium">{t.noSchemes}</p>
            <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">{t.noSchemesDesc}</p>
          </div>
        ) : (
          filteredSchemes.map(s => {
            const preMatch = getPreMatchScore(s);
            const isExpanded = expandedId === s.id;
            const elig = eligResults[s.id];
            const activeL = activeLang[s.id] || 'en';
            const translation = simplifyResults[s.id]?.[activeL];
            const readiness = computeReadinessScore(s);

            return (
              <motion.div
                layout="position"
                key={s.id}
                id={`scheme-card-${s.id}`}
                className={`p-5 rounded-2xl transition-all border relative overflow-hidden ${
                  selectedSchemeId === s.id 
                  ? 'bg-[#141414] border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/5' 
                  : isExpanded 
                    ? 'bg-[#141414] border-white/10' 
                    : 'bg-[#141414]/90 border-white/5 hover:border-white/10 hover:bg-[#141414]'
                }`}
              >
                {/* Match Score Indicator Gauge */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold text-[#D4AF37]">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  {preMatch}% {t.matchScore}
                </div>

                {/* Primary Card View */}
                <div 
                  className="cursor-pointer flex items-start gap-4 select-none pr-28"
                  onClick={() => handleCardExpand(s.id)}
                >
                  <div className={`p-3 rounded-xl shrink-0 ${
                    s.category === 'Farmer' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' :
                    s.category === 'Student' ? 'bg-blue-500/10 text-blue-400' :
                    s.category === 'Women' ? 'bg-pink-500/10 text-pink-400' :
                    s.category === 'Senior Citizen' ? 'bg-purple-500/10 text-purple-400' :
                    s.category === 'Business' ? 'bg-teal-500/10 text-teal-400' : 'bg-white/5 text-white/50'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex gap-2 items-center mb-1.5 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/40">
                        {t.categories[s.category as keyof typeof t.categories] || s.category}
                      </span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">
                        {s.state === 'National' ? t.nationalScheme : t.stateScheme}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-light text-white group-hover:text-[#D4AF37] leading-snug">{s.name}</h3>
                    <p className="text-xs text-white/60 font-sans mt-2.5 line-clamp-2 leading-relaxed">{s.benefits}</p>

                    <div className="flex items-center gap-4 mt-4 font-sans text-[10px] text-white/40 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        {t.annualBenefit} <strong className="text-[#D4AF37] font-semibold">₹{s.benefitsValue.toLocaleString()}/yr</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {t.deadline} {s.deadline === 'Ongoing' && selectedLang !== 'en' ? (selectedLang === 'hi' ? 'जारी' : selectedLang === 'mr' ? 'सुरू' : selectedLang === 'ta' ? 'செயலில்' : selectedLang === 'te' ? 'కొనసాగుతోంది' : 'Ongoing') : s.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail Panel with Simplifier & Eligibility engine */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-white/5 overflow-hidden font-sans"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Left column: AI Simplifier (Step 4) */}
                        <div className="md:col-span-8 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-sans font-semibold tracking-wider text-[#D4AF37] uppercase">{t.simplifiedTitle}</h4>
                            {/* Multilingual Selector */}
                            <div className="flex flex-wrap gap-1.5 justify-end">
                              {(['en', 'hi', 'mr', 'ta', 'te'] as const).map(lang => (
                                <button
                                  id={`btn-lang-${s.id}-${lang}`}
                                  key={lang}
                                  onClick={() => handleLangFetch(s.id, lang)}
                                  className={`px-2.5 py-1 text-[9px] font-semibold rounded cursor-pointer uppercase tracking-wider transition-all ${
                                    activeL === lang 
                                    ? 'bg-[#D4AF37] text-black font-semibold' 
                                    : 'bg-[#1A1A1A] text-white/40 hover:text-white border border-white/5'
                                  }`}
                                >
                                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : lang === 'mr' ? 'मराठी' : lang === 'ta' ? 'தமிழ்' : 'తెలుగు'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {langLoad === s.id ? (
                            <div className="text-center py-6 text-xs text-white/40 animate-pulse flex flex-col items-center gap-2">
                              <Sparkles className="w-5 h-5 text-[#D4AF37] animate-spin" />
                              Translating and simplifying details...
                            </div>
                          ) : translation ? (
                            <div className="space-y-4 text-xs leading-relaxed bg-[#1A1A1A] p-5 rounded-xl border border-white/5">
                              <div>
                                <h5 className="font-serif text-sm text-white mb-1">❓ {translation.q1}</h5>
                                <p className="text-white/60 font-light">{translation.a1}</p>
                              </div>
                              <div>
                                <h5 className="font-serif text-sm text-white mb-1">🎯 {translation.q2}</h5>
                                <p className="text-white/60 font-light">{translation.a2}</p>
                              </div>
                              <div>
                                <h5 className="font-serif text-sm text-white mb-1">💰 {translation.q3}</h5>
                                <p className="text-white/60 font-light">{translation.a3}</p>
                              </div>
                              <div>
                                <h5 className="font-serif text-sm text-white mb-1">📂 {translation.q4}</h5>
                                <div className="text-white/60 font-light whitespace-pre-line mt-1">{translation.a4}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-white/30 italic p-3">Failed loading translations.</div>
                          )}
                        </div>

                        {/* Right column: Eligibility verdict & document checklists (Step 3, 7, Feature 7) */}
                        <div className="md:col-span-4 space-y-4 flex flex-col justify-between">
                          <div className="space-y-4">
                            {/* Readiness score gauge */}
                            <div className="p-4 bg-[#1A1A1A] border border-white/5 rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t.readinessScore}</span>
                                <span className={`text-xs font-semibold ${
                                  readiness >= 80 ? 'text-[#D4AF37]' : readiness >= 50 ? 'text-blue-400' : 'text-amber-500'
                                }`}>{readiness}/100 Pts</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    readiness >= 80 ? 'bg-[#D4AF37]' : readiness >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${readiness}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-white/30 mt-2.5 font-sans leading-relaxed">Measures profile completeness, eligibility matching accuracy, and uploaded vault verify state.</p>
                            </div>

                            {/* Eligibility Verdict Card */}
                            <div className={`p-4 rounded-xl border ${
                              loadingElig === s.id ? 'bg-[#1A1A1A] border-white/5 animate-pulse' :
                              !elig ? 'bg-[#1A1A1A]/50 border-transparent' :
                              elig.status === 'Eligible' ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20' :
                              elig.status === 'Likely Eligible' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-[#D4AF37]/5 border-[#D4AF37]/10'
                            }`}>
                              <h5 className="text-[10px] font-semibold text-white/40 tracking-wider uppercase mb-2">{t.eligStatus}</h5>
                              
                              {loadingElig === s.id ? (
                                <div className="text-xs text-white/30">{t.eligLoading}</div>
                              ) : elig ? (
                                <div>
                                  <div className="flex items-center gap-1.5 text-xs mb-1.5">
                                    {elig.status === 'Eligible' ? (
                                      <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                                    ) : elig.status === 'Likely Eligible' ? (
                                      <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                                    ) : (
                                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                    )}
                                    <strong className={
                                      elig.status === 'Eligible' ? 'text-[#D4AF37]' : 
                                      elig.status === 'Likely Eligible' ? 'text-blue-400' : 'text-amber-400'
                                    }>{elig.status === 'Eligible' && selectedLang !== 'en' ? (selectedLang === 'hi' ? 'योग्य' : selectedLang === 'mr' ? 'पात्र' : selectedLang === 'ta' ? 'தகுதி' : selectedLang === 'te' ? 'అర్హులు' : 'Eligible') : elig.status === 'Likely Eligible' && selectedLang !== 'en' ? (selectedLang === 'hi' ? 'पूर्णतः संभव' : selectedLang === 'mr' ? 'दाट शक्यता' : selectedLang === 'ta' ? 'தகுதி வாய்ப்பு' : selectedLang === 'te' ? 'అర్హత అవకాశం' : 'Likely Eligible') : elig.status}</strong>
                                    {elig.aiGenerated && (
                                      <span className="text-[9px] px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded font-semibold scale-90">AI</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-white/60 leading-normal font-light">{elig.reason}</p>
                                </div>
                              ) : (
                                <div className="text-xs text-white/30">Awaiting trigger.</div>
                              )}
                            </div>

                            {/* Missing document checklist detector */}
                            <div className="p-4 bg-[#1A1A1A] border border-white/5 rounded-xl text-xs">
                              <h5 className="text-[10px] font-semibold text-white/40 tracking-wider uppercase mb-3">{t.documentsMatch}</h5>
                              <div className="space-y-2">
                                {s.requiredDocuments.map((doc, dIdx) => {
                                  const uploaded = uploadedTypes.includes(doc);
                                  return (
                                    <div key={dIdx} className="flex items-center justify-between">
                                      <span className="text-white/70 font-light">{doc}</span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold uppercase tracking-wider ${
                                        uploaded 
                                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' 
                                        : 'bg-red-500/10 text-red-400 border border-red-500/15'
                                      }`}>
                                        {uploaded ? (selectedLang === 'hi' ? '✓ सुरक्षित' : selectedLang === 'mr' ? '✓ सत्य' : selectedLang === 'ta' ? '✓ உள்ளது' : selectedLang === 'te' ? '✓ సురక్షితం' : '✓ Secured') : (selectedLang === 'hi' ? '✗ अपूर्ण' : selectedLang === 'mr' ? '✗ गहाळ' : selectedLang === 'ta' ? '✗ இல்லை' : selectedLang === 'te' ? '✗ లేదు' : '✗ Missing')}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              {s.requiredDocuments.some(doc => !uploadedTypes.includes(doc)) && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onNavigateToVault && onNavigateToVault(); }}
                                  className="w-full mt-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-sans text-[10px] uppercase tracking-wider font-bold transition-colors border border-white/10 cursor-pointer"
                                >
                                  {selectedLang === 'hi' ? 'दस्तावेज़ अपलोड करें' : selectedLang === 'mr' ? 'दस्तऐवज अपलोड करा' : selectedLang === 'ta' ? 'ஆவணங்களை பதிவேற்றவும்' : selectedLang === 'te' ? 'పత్రాలను అప్‌లోడ్ చేయండి' : 'Upload Missing Documents in Vault'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Quick fill action trigger */}
                          <button
                            id={`btn-select-scheme-${s.id}`}
                            onClick={() => onSelectScheme(s)}
                            className="w-full mt-4 py-3 bg-[#D4AF37] hover:bg-[#FFDF73] text-black rounded-lg font-sans text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {selectedSchemeId === s.id ? t.activeSelection : t.selectPrefill}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
