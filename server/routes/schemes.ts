import { Router, Request, Response } from "express";
import { getAllSchemes, findSchemeById } from "../services/schemeService";
import { computeEligibility } from "../services/eligibilityService";
import { getGeminiClient, isGeminiAvailable } from "../config/ai";
import { Type } from "@google/genai";

const router = Router();

// 1. Fetch entire benefit catalog list
router.get("/schemes", (req: Request, res: Response) => {
  try {
    const list = getAllSchemes();
    return res.json({ schemes: list });
  } catch (error: any) {
    console.error("[Schemes Route] Error listing schemes:", error);
    return res.status(500).json({ error: "Failed to load benefit catalog." });
  }
});

// 2. Compute Scheme Eligibility (Rule Engine + LLM Booster)
router.post("/eligibility", async (req: Request, res: Response) => {
  try {
    const { profile, schemeId } = req.body;
    if (!profile || !schemeId) {
      return res.status(400).json({ error: "Missing mandatory fields: 'profile' and 'schemeId'." });
    }

    const scheme = findSchemeById(schemeId);
    if (!scheme) {
      return res.status(404).json({ error: `Scheme with ID '${schemeId}' not resolved.` });
    }

    // 1. Calculate base eligibility and scores first using deterministic rules
    const baseResult = computeEligibility(profile, scheme);

    // 2. Elevate with live Gemini contextual natural response if active
    const ai = getGeminiClient();
    if (isGeminiAvailable && ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Evaluate the eligibility of an Indian citizen for the welfare benefit scheme.
          User Profile: ${JSON.stringify(profile)}
          Welfare Scheme Details: ${JSON.stringify(scheme)}
          Deterministic Rule-Based Back-end Audit: ${JSON.stringify(baseResult)}

          Task: Generate a conversational, welcoming, and empathetic response explaining the eligibility status.
          Explain clearly:
          - Whether they meet the direct criteria or what fields match (e.g., landownership, student status, age).
          - Exactly what benefit amount or service value they can receive (e.g., ₹6,000, medical cashless covers).
          - A clear, concise statement of confidence and immediate next step.

          Guidelines:
          - Be encouraging and warm, suitable for supporting a rural or low-income citizen.
          - Keep it concise (strictly 3 to 4 easy-to-understand sentences).
          - Use bullet points for summarizing key matched/missing factors.`,
        });

        if (response.text) {
          return res.json({
            schemeId,
            status: baseResult.status,
            score: baseResult.score,
            reason: response.text,
            aiGenerated: true
          });
        }
      } catch (err) {
        console.error("[Schemes Route] Gemini evaluation failed, falling back to database rule reasons:", err);
      }
    }

    // Fallback response when offline or Gemini fails
    return res.json({
      schemeId,
      status: baseResult.status,
      score: baseResult.score,
      reason: baseResult.reason,
      aiGenerated: false
    });

  } catch (error: any) {
    console.error("[Schemes Route] Error in eligibility validator:", error);
    return res.status(500).json({ error: "Eligibility calculation fault." });
  }
});

// 3. Multi-language Scheme Simplifier (AI & Rich Dynamic Template Localizer)
const LOCALIZATIONS: Record<string, any> = {
  hi: {
    title: "यह योजना क्या है?",
    who: "कौन आवेदन कर सकता है?",
    benefits: "मुझे क्या लाभ मिलेंगे?",
    docs: "कौन से दस्तावेज़ आवश्यक हैं?",
    bullet: "✓ ",
    currency: "₹"
  },
  mr: {
    title: "ही योजना काय आहे?",
    who: "कोण अर्ज करू शकतो?",
    benefits: "मला काय फायदे मिळतील?",
    docs: "कोणती कागदपत्रे आवश्यक आहेत?",
    bullet: "✓ ",
    currency: "₹"
  },
  ta: {
    title: "இந்த திட்டம் என்ன?",
    who: "யார் விண்ணப்பிக்கலாம்?",
    benefits: "எனக்கு என்ன பலன்கள் கிடைக்கும்?",
    docs: "என்ன ஆவணங்கள் தேவை?",
    bullet: "✓ ",
    currency: "₹"
  },
  te: {
    title: "ఈ పథకము ఏమిటి?",
    who: "ఎవరు దరఖాస్తు చేసుకోవచ్చు?",
    benefits: "నాకు వచ్చే ప్రయోజనాలు ఏమిటి?",
    docs: "ఏ పత్రాలు అవసరం?",
    bullet: "✓ ",
    currency: "₹"
  },
  en: {
    title: "What is this scheme?",
    who: "Who can apply?",
    benefits: "What benefits will I get?",
    docs: "What documents are needed?",
    bullet: "✓ ",
    currency: "₹"
  }
};

router.post("/simplify", async (req: Request, res: Response) => {
  try {
    const { schemeId, language } = req.body;
    const langKey = (language || "en").toLowerCase();
    const resolvedLang = LOCALIZATIONS[langKey] ? langKey : "en";
    const loc = LOCALIZATIONS[resolvedLang];

    const scheme = findSchemeById(schemeId);
    if (!scheme) {
      return res.status(404).json({ error: `Scheme with ID '${schemeId}' not resolved.` });
    }

    // Attempt Gemini Content Simplification
    const ai = getGeminiClient();
    if (isGeminiAvailable && ai) {
      try {
        const langNames: Record<string, string> = { 
          en: "Simple English", 
          hi: "Hindi (हिंदी)", 
          mr: "Marathi (मराठी)", 
          ta: "Tamil (தமிழ்)", 
          te: "Telugu (తెలుగు)" 
        };

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                q1: { type: Type.STRING, description: 'Question equivalent to "What is this scheme?" in the target language' },
                a1: { type: Type.STRING, description: 'Simple main description of benefits and purposes' },
                q2: { type: Type.STRING, description: 'Question equivalent to "Who can apply?" in the target language' },
                a2: { type: Type.STRING, description: 'Direct bullet points of eligibility criteria' },
                q3: { type: Type.STRING, description: 'Question equivalent to "What benefits will I get?" in the target language' },
                a3: { type: Type.STRING, description: 'Description of specific sum, coverage, or allowances' },
                q4: { type: Type.STRING, description: 'Question equivalent to "What documents are needed?" in the target language' },
                a4: { type: Type.STRING, description: 'Checklist of necessary legal and personal documents' },
              },
              required: ["q1", "a1", "q2", "a2", "q3", "a3", "q4", "a4"]
            }
          },
          contents: `You are an expert citizen assistant. Your task is to translate and simplify the details of the given government welfare scheme in extremely simple, everyday colloquial terms suitable for a village citizen.
          Target Language: ${langNames[resolvedLang]}
          Required Sections:
          1. "What is this scheme?"
          2. "Who can apply?"
          3. "What benefits will I get?"
          4. "What documents are needed?"

          Scheme Context: ${JSON.stringify(scheme)}`,
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (err) {
        console.error("[Schemes Route] Gemini simplify error, executing local smart localization:", err);
      }
    }

    // Realistic Real-World Offline Fallback Translation & Generation
    // Dynamically generates simplified answers using scheme fields for ANY of the 50 schemes
    const docChecklist = scheme.requiredDocuments.map(d => `${loc.bullet}${d}`).join("\n");
    const formattedBenefits = `${loc.currency}${scheme.benefitsValue.toLocaleString()} ${resolvedLang === 'en' ? 'Annually' : 'वार्षिक'} / ${scheme.benefits}`;

    return res.json({
      q1: loc.title,
      a1: scheme.benefits,
      q2: loc.who,
      a2: scheme.eligibilityCriteria.join(", "),
      q3: loc.benefits,
      a3: formattedBenefits,
      q4: loc.docs,
      a4: docChecklist
    });

  } catch (error: any) {
    console.error("[Schemes Route] Error in simplifier:", error);
    return res.status(500).json({ error: "Failed to simplify scheme data." });
  }
});

export default router;
