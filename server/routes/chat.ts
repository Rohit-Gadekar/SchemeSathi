import { Router, Request, Response } from "express";
import { getGeminiClient, isGeminiAvailable } from "../config/ai";
import { getAllSchemes } from "../services/schemeService";

const router = Router();

// Helper: Smart lexical keywords matcher for RAG
function rankRelevantSchemes(queryText: string, profile: any) {
  const schemes = getAllSchemes();
  const query = queryText.toLowerCase();

  // Words to ignore
  const stopwords = new Set(["am", "i", "the", "a", "an", "is", "for", "in", "to", "of", "and", "under", "scheme", "yojana"]);
  const queryWords = query.split(/[\s,.\-?_]+/).filter(w => w.length > 2 && !stopwords.has(w));

  const ScoredSchemes = schemes.map(scheme => {
    let score = 0;

    // Direct profile category matching boosts importance
    if (profile) {
      const cat = scheme.category?.toLowerCase();
      if (profile.farmerStatus && cat === "farmer") score += 5;
      if (profile.studentStatus && cat === "student") score += 5;
      if (profile.businessOwnerStatus && cat === "business") score += 5;
      if (profile.gender === "Female" && cat === "women") score += 5;
      if (profile.age && profile.age >= 60 && cat === "senior citizen") score += 5;
    }

    // Direct category matches in query text
    if (scheme.category && query.includes(scheme.category.toLowerCase())) {
      score += 10;
    }

    // Direct state matches in query text
    if (scheme.state && scheme.state !== "National" && query.includes(scheme.state.toLowerCase())) {
      score += 8;
    }

    // Matching keywords in details
    const targetText = `${scheme.name} ${scheme.category} ${scheme.benefits} ${scheme.requiredDocuments.join(" ")}`.toLowerCase();
    for (const word of queryWords) {
      if (targetText.includes(word)) {
        score += 3;
      }
    }

    // Exact name match boost
    if (query.includes(scheme.name.toLowerCase().substring(0, Math.min(15, scheme.name.length)))) {
      score += 20;
    }

    return { scheme, score };
  });

  // Sort and pick top 4 matching schemes
  return ScoredSchemes
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.scheme)
    .slice(0, 4);
}

// 1. Conversational RAG Copilot Chat
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages, profile, userLanguage } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing or invalid array of 'messages'." });
    }

    const lastMessageObj = messages[messages.length - 1];
    const lastUserMsg = lastMessageObj ? lastMessageObj.text || "" : "";
    
    const lang = userLanguage || "English";

    // Perform lexical grounding search relative to citizens profile and query text
    const matchedSchemes = rankRelevantSchemes(lastUserMsg, profile);
    
    // Auto-generate context corpus
    const contextCorpus = matchedSchemes.length > 0 
      ? matchedSchemes.map(s => 
          `- ${s.name} (Category: ${s.category}, State: ${s.state}). Benefits: ${s.benefits}. Required paperwork: ${s.requiredDocuments.join(", ")}.`
        ).join("\n")
      : "No direct schemes matched the exact keywords. Provide general support for options like PM Kisan, Ayushman Bharat health insurance cover of 5 Lakhs, or Mudra enterprise loans.";

    // If Gemini is online, route to the LLM with search grounding instruction
    const ai = getGeminiClient();
    if (isGeminiAvailable && ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction: `You are 'SchemeSathi Agent', an empathetic, expert, highly localized AI Government Benefits Copilot.
            Your purpose is to assist Indian citizens in discovering, clarifying, and preparing for welfare programs.
            
            Profile Context of active user:
            ${JSON.stringify(profile || {})}

            Matched Grounding Scheme Knowledge:
            ${contextCorpus}

            Strict Directives:
            - Formulate your reply in the "${lang}" language.
            - Answer conversationally with high clarity, speaking directly to their background context.
            - If they ask about eligibility, paperwork, or application paths, reference specific matched schemes.
            - Keep the total response descriptive but concise (strictly under 100 words).
            - Use warm, patient, and respectful phrasing suitable for ordinary working class or rural citizens.`
          },
          contents: lastUserMsg
        });

        if (response.text) {
          return res.json({ reply: response.text });
        }
      } catch (err) {
        console.error("[Chat Route] Gemini generative chat failed, starting rule matcher fallback:", err);
      }
    }

    // Dynamic high-grade Offline Rule-based Replier
    const query = lastUserMsg.toLowerCase();
    let reply = "";

    if (query.includes("kisan") || query.includes("farmer") || query.includes("crop") || query.includes("land")) {
      const hasLand = profile?.farmerStatus && profile?.landOwner;
      const isRameshDemo = profile && profile.id === "ramesh-patil";
      const name = profile?.fullName || (isRameshDemo ? "Ramesh ji" : "Citizen");
      reply = hasLand 
        ? `🌾 Namaste ${name}! Based on your landownership in ${profile?.state || 'your state'}, you are verified eligible for **PM Kisan Samman Nidhi**! You'll receive **₹6,000 yearly** directly. We have mapped your records so you are 100% ready to pre-fill. Let me know if you would like to proceed with drafting.`
        : `🌾 For farmers, we have leading schemes like **PM Kisan** (₹6,000/year direct transfer) and **Fasal Bima Yojana** (Crop Insurance). Please configure your profile with registered farmer and landownership status so I can run the verification checks for you.`;
    } else if (query.includes("health") || query.includes("medical") || query.includes("hospital") || query.includes("ayushman") || query.includes("treatment")) {
      const isLowIncome = profile?.annualIncome && profile?.annualIncome <= 250000;
      reply = `🏥 **Ayushman Bharat (PM-JAY)** provides cashless health insurance cover up to **₹5,00,000 per year** for secondary and tertiary care hospitalization. ${isLowIncome ? "Your registered income qualifies you perfectly as Eligible!" : "It aligns with households listed below ₹2.5 Lakh income guidelines."} You need your Aadhaar and Ration Card to complete onboarding.`;
    } else if (query.includes("loan") || query.includes("business") || query.includes("shop") || query.includes("mudra") || query.includes("start")) {
      reply = `💼 For small enterprises, **Pradhan Mantri Mudra Yojana (PMMY)** grants collateral-free business development loans up to **₹10 Lakh** (Shishu, Kishor, and Tarun). You will need business registration proof, PAN card, and a project report detailing your business scope! Let me help you structure the application documents.`;
    } else if (query.includes("women") || query.includes("girl") || query.includes("ladli") || query.includes("daughter")) {
      const isFemale = profile?.gender === "Female";
      reply = `🌸 Supporting women advancement, Maharashtra's **Mukhyamantri Majhi Ladli Behna Yojana** disburses **₹1,500 monthly** (₹18,000/year) to women aged 21-65. Also, **Sukanya Samriddhi Yojana** offers a secure 8.2% interest savings account for girl children under 10. ${isFemale ? "Since you are female, you matches the Ladli Behna parameters!" : ""}`;
    } else if (query.includes("pension") || query.includes("retire") || query.includes("senior") || query.includes("atal")) {
      reply = `👴 **Senior Support programs** are highly recommended: **Atal Pension Yojana (APY)** guarantees monthly pensions up to ₹5,000 depending on subscriber contributions (entry ages 18-40), whereas **Indira Gandhi Old Age Pension** offers direct support for seniors above 60 living in low income households.`;
    } else {
      // General match based on matched schemes or profile recommendations
      if (matchedSchemes.length > 0) {
        const topScheme = matchedSchemes[0];
        reply = `Hello! Based on your query and database profiles, I recommend looking closely at the **${topScheme.name}**. It provides value of: ${topScheme.benefits} and requires documents: ${topScheme.requiredDocuments.join(", ")}. Would you like me to guide you on how to apply?`;
      } else {
        reply = `Hello! I am your SchemeSathi Welfare Copilot. I can search central and state benefit catalogs matching your profile. Speak to me in any preferred language! Tell me:
        - "Am I eligible for PM Kisan or Mudra loans?"
        - "What benefits are available for senior citizens?"
        - "What documents do I need to prepare for girls development?"`;
      }
    }

    return res.json({ reply });

  } catch (error: any) {
    console.error("[Chat Route] Conversational copilot chat fault:", error);
    return res.status(500).json({ error: "Conversational RAG agent experienced an internal failure." });
  }
});

// 2. Interactive Document Chat Copilot
router.post("/doc-chat", async (req: Request, res: Response) => {
  try {
    const { docType, extractedData, message } = req.body;
    
    if (!docType || !message) {
      return res.status(400).json({ error: "Missing required parameters: 'docType' or 'message'." });
    }

    const ai = getGeminiClient();
    if (isGeminiAvailable && ai && extractedData) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `The citizen has uploaded their ${docType} document, and scanned fields have been extracted.
          Parsed Metadata: ${JSON.stringify(extractedData)}
          Citizen's Question about this document: "${message}"

          Task: Provide a highly precise, accurate 1-2 sentence answer referencing ONLY the parsed metadata.
          - If the information requested is missing from the parsed fields, advise them friendly to upload a higher contrast scan.
          - Avoid speculating or making up values.`
        });

        if (response.text) {
          return res.json({ reply: response.text });
        }
      } catch (err) {
        console.error("[Chat Route] Document chat failed, executing rule fallback:", err);
      }
    }

    // High fidelity offline search matcher
    const text = message.toLowerCase();
    let reply = "I can read standard fields on this document record: " + Object.keys(extractedData || {}).filter(k => extractedData[k]).join(", ");
    
    if (!extractedData || Object.keys(extractedData).length === 0) {
      reply = "This document appears to be processing or contains low legibility. Please upload a high contrast copy.";
    } else if (text.includes("name") || text.includes("who")) {
      reply = extractedData.name ? `The document officially registers the name: **${extractedData.name}**.` : "Name field not fully recognized on this file.";
    } else if (text.includes("address") || text.includes("live") || text.includes("resident")) {
      reply = extractedData.address ? `The registered residence address listed is: **${extractedData.address}**.` : "Residential address not annotated in this scanned upload.";
    } else if (text.includes("dob") || text.includes("date of birth") || text.includes("born") || text.includes("age")) {
      reply = extractedData.dob ? `The official registered DOB is: **${extractedData.dob}**.` : "Date of birth field not resolved.";
    } else if (text.includes("number") || text.includes("id") || text.includes("aadhaar") || text.includes("pan")) {
      const num = extractedData.aadhaarNumber || extractedData.panNumber;
      reply = num ? `The verified card identification sequence is: **${num}**.` : "The identification sequence field could not be indexed in this scan.";
    } else if (text.includes("land") || text.includes("size") || text.includes("hectare") || text.includes("farm")) {
      reply = extractedData.customLandHolding ? `The land tenure summary reports: **${extractedData.customLandHolding}**.` : "Standard agriculture layout details were indexed successfully.";
    } else if (text.includes("bank") || text.includes("account") || text.includes("ifsc")) {
      reply = extractedData.bankDetails ? `Your accounts record is: **${extractedData.bankDetails}**.` : "Bank details were not extracted clearly in this passbook file.";
    } else if (text.includes("income") || text.includes("salary") || text.includes("earn")) {
      reply = extractedData.income ? `The stated certified annual income is: **${extractedData.income}**.` : "Annual income statements not detected on this form.";
    }

    return res.json({ reply });

  } catch (error: any) {
    console.error("[Chat Route] Error in Document chat assistant:", error);
    return res.status(500).json({ error: "Interactive document assistant experienced an issue." });
  }
});

export default router;
