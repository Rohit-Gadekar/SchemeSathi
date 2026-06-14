import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, UserCheck, TrendingUp, HelpCircle } from 'lucide-react';

interface LandingPageProps {
  onStart: (quickDemo: boolean) => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div id="landing-page" className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-[#F5F5F5] px-4 py-16 relative overflow-hidden">
      {/* Background radial gold light gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-white/2 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-4xl w-full text-center relative z-10 flex flex-col items-center">
        {/* Citizen Portal Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-sans mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          SCHEMESATHI CITIZEN PORTAL
        </motion.div>

        {/* Brand Name & Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-5xl md:text-8xl font-light tracking-tight text-[#F5F5F5] mb-6"
        >
          Scheme<span className="text-[#D4AF37] relative">Sathi</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/60 text-lg md:text-xl max-w-2xl mb-12 font-sans font-light leading-relaxed tracking-wide"
        >
          An AI-powered &ldquo;TurboTax&rdquo; copilot for Indian government benefits. Discover eligibility, cross-verify documents with offline AI OCR, and pre-fill applications instantly.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full max-w-md mb-16"
        >
          {/* Direct selection buttons */}
          <button
            id="btn-quick-demo"
            onClick={() => onStart(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-sans text-xs uppercase tracking-[0.15em] font-semibold bg-[#D4AF37] text-black hover:bg-[#FFDF73] transition-all flex items-center justify-center gap-2.5 group cursor-pointer shadow-lg shadow-[#D4AF37]/5"
          >
            Try with Example Profile
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>

          {/* Custom Onboarding Button */}
          <button
            id="btn-custom-start"
            onClick={() => onStart(false)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-sans text-xs uppercase tracking-[0.15em] font-medium bg-[#141414] hover:bg-[#222222] text-[#F5F5F5] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Enter your Profile
          </button>
        </motion.div>

        {/* Trust features grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl text-left border-t border-white/10 pt-10"
        >
          <div className="p-6 rounded-2xl bg-[#141414]/80 border border-white/5 backdrop-blur-sm shadow-xl">
            <div className="p-3 w-max rounded-xl bg-white/5 text-[#D4AF37] mb-4 border border-white/5">
              <ShieldCheck className="w-5 h-5 light-accent" />
            </div>
            <h3 className="font-serif text-lg font-light text-white mb-2">Secure Vault</h3>
            <p className="text-xs text-white/50 leading-relaxed font-sans font-light">Sovereign document control with secure OCR extraction and zero-retention storage.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#141414]/80 border border-white/5 backdrop-blur-sm shadow-xl">
            <div className="p-3 w-max rounded-xl bg-white/5 text-[#D4AF37] mb-4 border border-white/5">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-light text-white mb-2">98% Match Math</h3>
            <p className="text-xs text-white/50 leading-relaxed font-sans font-light">Multi-layered deterministic eligibility check combined with active AI reasoning.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#141414]/80 border border-white/5 backdrop-blur-sm shadow-xl">
            <div className="p-3 w-max rounded-xl bg-white/5 text-[#D4AF37] mb-4 border border-white/5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-light text-white mb-2">Easy Auto-Fill</h3>
            <p className="text-xs text-white/50 leading-relaxed font-sans font-light">Prepare and fill out government applications automatically using your verified profile details.</p>
          </div>
        </motion.div>
      </div>

      {/* Footer credits */}
      <div className="mt-16 text-center text-[10px] tracking-[0.2em] text-white/30 uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
        SchemeSathi - Empowering Rural, Farmer, and Student Welfare
      </div>
    </div>
  );
}
