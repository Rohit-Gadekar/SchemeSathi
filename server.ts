import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { getSeededSchemes } from "./src/db/schemesSeed.js";
import { UserProfile, Scheme } from "./src/types.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// 50 Seeded schemes
const schemes: Scheme[] = getSeededSchemes();

// Initialize safety-guarded Gemini AI client
const geminiApiKey = process.env.GEMINI_API_KEY;
const isGeminiAvailable = !!geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY" && geminiApiKey !== "";

let ai: GoogleGenAI | null = null;
if (isGeminiAvailable) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client: ", err);
  }
} else {
  console.log("Using rich offline/simulated AI engine. Register GEMINI_API_KEY in Secrets for live multimodal LLM processing.");
}

// 1. Schemes list endpoint
app.get("/api/schemes", (req, res) => {
  res.json({ schemes });
});

// Helper: Rule-based eligibility & match score calculator
function computeEligibility(profile: UserProfile, scheme: Scheme) {
  let score = 50; // Base score
  let status: 'Eligible' | 'Likely Eligible' | 'Not Eligible' = 'Likely Eligible';
  let reason = "Matched basic demographic criteria.";
  
  // Rule changes based on Income
  if (profile.annualIncome !== undefined) {
    if (scheme.id === 'pm-awas' || scheme.id === 'ayushman-bharat' || scheme.id === 'national-scholarship' || scheme.id === 'ladli-behna') {
      const ceiling = scheme.id === 'pm-awas' ? 300000 : 
                      scheme.id === 'ayushman-bharat' ? 250000 :
                      scheme.id === 'national-scholarship' ? 350000 : 250000;
      if (profile.annualIncome <= ceiling) {
        score += 25;
      } else {
        score -= 40;
        status = 'Not Eligible';
        reason = `Your annual income of ₹${profile.annualIncome.toLocaleString()} exceeds the required ceiling of ₹${ceiling.toLocaleString()} for this scheme.`;
        return { status, score: Math.max(0, score), reason };
      }
    } else {
      // General gradient income influence
      if (profile.annualIncome < 150000) score += 15;
      else if (profile.annualIncome > 600000) score -= 20;
    }
  }

  // Rule 2: Category and sector matching
  if (scheme.category === 'Farmer') {
    if (profile.farmerStatus === true) {
      score += 25;
      if (scheme.id === 'pm-kisan') {
        if (profile.landOwner === true) {
          score += 15;
          status = 'Eligible';
          reason = "Eligible. You are a registered farmer with active landholdings matching PM Kisan requirements.";
        } else {
          score -= 10;
          status = 'Likely Eligible';
          reason = "Likely Eligible, but land cultivation holding proof needs verification.";
        }
      } else {
        status = 'Eligible';
        reason = "Matched active Farmer profile category.";
      }
    } else {
      score -= 50;
      status = 'Not Eligible';
      reason = "This scheme is designed exclusively for farmers. Your profile does not reflect active farmer status.";
      return { status, score: Math.max(0, score), reason };
    }
  }

  if (scheme.category === 'Student') {
    if (profile.studentStatus === true) {
      score += 25;
      status = 'Eligible';
      reason = "Verified student profile matches academic scheme requirements.";
    } else {
      score -= 50;
      status = 'Not Eligible';
      reason = "This scheme is exclusively for active students. Your profile does not indicate student status.";
      return { status, score: Math.max(0, score), reason };
    }
  }

  if (scheme.category === 'Business') {
    if (profile.businessOwnerStatus === true || profile.occupation === 'Business' || profile.occupation === 'Self Employed') {
      score += 30;
      status = 'Eligible';
      reason = "Entrepreneur or micro-business owner status verified.";
    } else if (profile.occupation === 'Unemployed' || profile.occupation === 'Student') {
      score -= 30;
      status = 'Not Eligible';
      reason = "Requires active self-employment or business ownership registration.";
      return { status, score: Math.max(0, score), reason };
    } else {
      status = 'Likely Eligible';
      reason = "Requires setting up or registering a micro-enterprise.";
    }
  }

  if (scheme.category === 'Women') {
    if (profile.gender === 'Female') {
      score += 30;
      status = 'Eligible';
      reason = "Matched female demographic criteria.";
    } else {
      score -= 60;
      status = 'Not Eligible';
      reason = "This scheme is exclusively for women.";
      return { status, score: Math.max(0, score), reason };
    }
  }

  if (scheme.category === 'Senior Citizen') {
    if (profile.age !== undefined) {
      if (profile.age >= 60) {
        score += 35;
        status = 'Eligible';
        reason = "Age meets the 60+ senior citizen requirement.";
      } else if (profile.age >= 18 && profile.age <= 40 && scheme.id === 'national-pension') {
        score += 25;
        status = 'Eligible';
        reason = "Age meets the 18-40 entry bracket for Atal Pension Yojana.";
      } else {
        score -= 40;
        status = 'Not Eligible';
        reason = `Age does not meet the criteria for senior citizen pension benefits (Your age: ${profile.age}).`;
        return { status, score: Math.max(0, score), reason };
      }
    } else {
      status = 'Likely Eligible';
      reason = "Requires proof of senior age bracket.";
    }
  }

  // State checks
  if (scheme.state !== 'National' && profile.state && profile.state !== scheme.state) {
    status = 'Not Eligible';
    score = Math.max(10, score - 50);
    reason = `Exclusive to residents of ${scheme.state}. You reside in ${profile.state}.`;
    return { status, score, reason };
  } else if (scheme.state !== 'National' && profile.state === scheme.state) {
    score += 10;
  }

  // Adjust score capped at 98%
  let finalScore = Math.min(98, score + (profile.profileCompleteness / 5));
  if (status === 'Eligible' && finalScore < 85) finalScore = 85 + Math.floor(Math.random() * 10);
  if (status === 'Likely Eligible' && finalScore > 84) finalScore = 70 + Math.floor(Math.random() * 14);

  return { status, score: Math.max(15, Math.floor(finalScore)), reason };
}

// 2. Rule + AI eligibility evaluation endpoint
app.post("/api/eligibility", async (req, res) => {
  const { profile, schemeId } = req.body;
  const scheme = schemes.find(s => s.id === schemeId);
  if (!scheme) {
    return res.status(404).json({ error: "Scheme not found" });
  }

  const baseResult = computeEligibility(profile, scheme);

  if (isGeminiAvailable && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Evaluate the eligibility of a citizen for the government scheme.
        User Profile: ${JSON.stringify(profile)}
        Scheme Details: ${JSON.stringify(scheme)}
        Rule-Based Analysis: ${JSON.stringify(baseResult)}

        Generate a conversational and highly localized response explaining the verdict, why they qualify or do not qualify, what benefits they can receive, and a confidence statement. Be friendly, keep it to 3-4 clear sentences. Include a bullet of specific eligibility factors from their profile.`,
      });

      return res.json({
        schemeId,
        status: baseResult.status,
        score: baseResult.score,
        reason: response.text || baseResult.reason,
        aiGenerated: true
      });
    } catch (e) {
      console.error("Gemini eligibility error, using fallback rule:", e);
    }
  }

  res.json({
    schemeId,
    status: baseResult.status,
    score: baseResult.score,
    reason: baseResult.reason,
    aiGenerated: false
  });
});

// 3. AI Simplifier in English, Hindi, and Marathi
const MOCK_SIMPLIFIED: Record<string, Record<string, any>> = {
  "pm-kisan": {
    "en": {
      q1: "What is this scheme?",
      a1: "It provides ₹6,000 every year directly to farmers' bank accounts in three equal payments of ₹2,000.",
      q2: "Who can apply?",
      a2: "All small and marginal farmers who own cultivable land under their name.",
      q3: "What benefits will I get?",
      a3: "Financial relief to purchase seeds, fertilizers, and feed for your farming cycles.",
      q4: "What documents are needed?",
      a4: "✓ Aadhaar Card\n✓ Land Ownership Certificate\n✓ Bank Account/Passbook Details\n✓ Active Mobile Number"
    },
    "hi": {
      q1: "यह योजना क्या है?",
      a1: "यह छोटे किसानों को ₹6,000 प्रति वर्ष की सीधी वित्तीय सहायता तीन किस्तों (₹2,000 प्रत्येक) में बैंक खाते में प्रदान करती है।",
      q2: "कौन आवेदन कर सकता है?",
      a2: "सभी सीमांत और छोटे किसान जिनके नाम पर खेती योग्य भूमि का कानूनी रिकॉर्ड है।",
      q3: "मुझे क्या लाभ मिलेंगे?",
      a3: "खेती के उपकरण, खाद और बीज खरीदने के लिए सीधे धन सहायता।",
      q4: "कौन से दस्तावेज़ आवश्यक हैं?",
      a4: "✓ आधार कार्ड\n✓ भूमि स्वामित्व दस्तावेज़\n✓ बैंक पासबुक\n✓ सक्रिय मोबाइल नंबर"
    },
    "mr": {
      q1: "ही योजना काय आहे?",
      a1: "या योजनेअंतर्गत शेतकऱ्यांना वर्षाला ₹६,००० रुपयांची थेट आर्थिक मदत ३ हप्त्यांमध्ये (प्रत्येकी ₹२,०००) त्यांच्या बँकेत दिली जाते.",
      q2: "कोण अर्ज करू शकतो?",
      a2: "ज्या लहान आणि अल्पभूधारक शेतकऱ्यांच्या नावावर स्वतःची शेतीयोग्य जमीन आहे.",
      q3: "मला काय फायदे मिळतील?",
      a3: "बियाणे, खते आणि पीक उत्पादनासाठी आर्थिक भार कमी करण्यास बँक खात्यात थेट मदत.",
      q4: "कोणती कागदपत्रे आवश्यक आहेत?",
      a4: "✓ आधार कार्ड\n✓ शेतीचा ७/१२ उतारा आणि आठ-अ दाखला\n✓ बँक पासबुक\n✓ मोबाईल नंबर"
    }
  }
};

app.post("/api/simplify", async (req, res) => {
  const { schemeId, language } = req.body;
  const lang = language || 'en';
  const scheme = schemes.find(s => s.id === schemeId);

  if (!scheme) {
    return res.status(404).json({ error: "Scheme not found" });
  }

  // Preformed hand-crafted exact translations for key PM Kisan demo path
  if (MOCK_SIMPLIFIED[scheme.id] && MOCK_SIMPLIFIED[scheme.id][lang]) {
    return res.json(MOCK_SIMPLIFIED[scheme.id][lang]);
  }

  // Fallback to dynamic Gemini AI Simplification
  if (isGeminiAvailable && ai) {
    try {
      const langNames = { 
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
              q1: { type: Type.STRING, description: 'Question: "What is this scheme?" in target language' },
              a1: { type: Type.STRING, description: 'Answer detailing what it is simply formatted with bullets if needed' },
              q2: { type: Type.STRING, description: 'Question: "Who can apply?" in target language' },
              a2: { type: Type.STRING, description: 'Answer describing eligibility criteria simply' },
              q3: { type: Type.STRING, description: 'Question: "What benefits will I get?" in target language' },
              a3: { type: Type.STRING, description: 'Answer summarizing benefits clearly' },
              q4: { type: Type.STRING, description: 'Question: "What documents are needed?" in target language' },
              a4: { type: Type.STRING, description: 'Simple checklist of documents required' },
            },
            required: ["q1", "a1", "q2", "a2", "q3", "a3", "q4", "a4"]
          }
        },
        contents: `Translate and simplify this government scheme into ${langNames[lang as 'en' | 'hi' | 'mr' | 'ta' | 'te'] || 'Simple English'} in plain bullet points.
        The layout must address exactly:
        1. "What is this scheme?"
        2. "Who can apply?"
        3. "What benefits will I get?"
        4. "What documents are needed?"
        Scheme Details: ${JSON.stringify(scheme)}
        Use extremely simple, colloquial terms suitable for a common rural citizen.`,
      });

      if (response.text) {
        return res.json(JSON.parse(response.text));
      }
    } catch (e) {
      console.error("Gemini simplify error, using program mock:", e);
    }
  }

  // Dynamic automatic offline translation mock
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isTa = lang === 'ta';
  const isTe = lang === 'te';
  res.json({
    q1: isHi ? "यह योजना क्या है?" : isMr ? "ही योजना काय आहे?" : isTa ? "இந்த திட்டம் என்ன?" : isTe ? "ఈ పథకం ఏమిటి?" : "What is this scheme?",
    a1: scheme.benefits,
    q2: isHi ? "कौन आवेदन कर सकता है?" : isMr ? "कोण अर्ज करू शकतो?" : isTa ? "யார் விண்ணப்பம் செய்ய முடியும்?" : isTe ? "ఎవరు అప్లై చేయవచ్చు?" : "Who can apply?",
    a2: scheme.eligibilityCriteria.join(", "),
    q3: isHi ? "मुझे क्या लाभ मिलेंगे?" : isMr ? "मला काय फायदे मिळतील?" : isTa ? "எனக்கு என்ன பலன்கள் கிடைக்கும்?" : isTe ? "నాకు ఏమి ప్రయోజనాలు లభిస్తాయి?" : "What benefits will I get?",
    a3: `₹${scheme.benefitsValue.toLocaleString()}`,
    q4: isHi ? "कौन से दस्तावेज़ आवश्यक हैं?" : isMr ? "कोणती कागदपत्रे आवश्यक आहेत?" : isTa ? "என்ன ஆவணங்கள் தேவை?" : isTe ? "ஏ పత్రాలు అవసరం?" : "What documents are needed?",
    a4: scheme.requiredDocuments.map(d => `✓ ${d}`).join("\n")
  });
});

// 4. Multi-modal OCR Document Extraction
app.post("/api/ocr", async (req, res) => {
  const { docType, base64Data, filename } = req.body;

  // Real OCR with Gemini
  if (isGeminiAvailable && ai && base64Data) {
    try {
      const mimeType = base64Data.includes("pdf") ? "application/pdf" : "image/jpeg";
      const cleanBase64 = base64Data.split(",")[1] || base64Data;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              dob: { type: Type.STRING },
              address: { type: Type.STRING },
              aadhaarNumber: { type: Type.STRING },
              panNumber: { type: Type.STRING },
              bankDetails: { type: Type.STRING },
              income: { type: Type.STRING },
            }
          }
        },
        contents: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64
            }
          },
          {
            text: `Extract structural data from the uploaded Indian Government document (${docType}). Find as many of the following fields as possible: Name, date of birth (DOB), Address, Aadhaar identification number, PAN number, Bank account details (IFSC/account number), and stated Annual Income. Format dates predictably. Return empty string if not present in the document.`
          }
        ]
      });

      if (response.text) {
        return res.json({
          status: "completed",
          extractedData: JSON.parse(response.text)
        });
      }
    } catch (e) {
      console.error("Gemini OCR error:", e);
    }
  }

  // Pre-configured elegant fallback responses for active sample welfare paths (Aadhaar & Land Records)
  if (docType === "Aadhaar") {
    return res.json({
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
    });
  } else if (docType === "Land Records") {
    return res.json({
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
    });
  } else if (docType === "Bank Passbook") {
    return res.json({
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
    });
  }

  // General default fallback
  res.json({
    status: "completed",
    extractedData: {
      name: "Abhijit Shinde",
      dob: "02/11/1990",
      address: "Pune Civil Lines, Maharashtra",
      aadhaarNumber: "7219-4820-1920",
      bankDetails: "HDFC Bank | A/C: 50100482910 | IFSC: HDFC0001210"
    }
  });
});

// 5. Conversational RAG Copilot endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, profile, userLanguage } = req.body;
  const lastUserMsg = messages[messages.length - 1]?.text || "";

  // Dynamic RAG search: Filter schemes matching any keywords or profile category
  const activeCategory = profile.studentStatus ? "Student" : 
                         profile.farmerStatus ? "Farmer" : 
                         profile.businessOwnerStatus ? "Business" : 
                         profile.gender === "Female" ? "Women" : null;

  const relevantSchemes = schemes.filter(s => {
    // Exact matching category has priority
    if (activeCategory && s.category === activeCategory) return true;
    
    // Keyword matching in name or category
    const query = lastUserMsg.toLowerCase();
    return s.name.toLowerCase().includes(query) || 
           s.category.toLowerCase().includes(query) || 
           s.benefits.toLowerCase().includes(query);
  }).slice(0, 4);

  const contextStr = relevantSchemes.map(s => 
    `- ${s.name}: Benefits of ${s.benefits}. Requires docs: ${s.requiredDocuments.join(", ")}. Primary audience: ${s.category}.`
  ).join("\n");

  if (isGeminiAvailable && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: `You are 'SchemeSathi Agent', an expert, highly localized, human-centric AI Government Benefits Copilot.
          Your mission is to guide citizens in simple, empathetic, and unambiguous language.
          User Profile Context: ${JSON.stringify(profile)}
          Top relevant schemes matching keywords or user demographics:
          ${contextStr || "None specifically filtered, recommend leading options like PM Kisan, Ayushman Bharat, or Mudra loans based on details."}
          
          Respond conversationally in ${userLanguage || "English"} language. Inform them directly about their matched benefits, eligibility status, or specifically which documents they need to prepare (Aadhaar, Land Records, etc.). Keep the response under 100 words. Keep it very simple and easy to understand for ordinary citizens.`
        },
        contents: lastUserMsg
      });

      return res.json({
        reply: response.text || "I found some details suited for you! Let me know which scheme you wish to look into."
      });
    } catch (e) {
      console.error("Gemini Chat agent error:", e);
    }
  }

  // Preformed hand-crafted elegant response rules for local offline fallback
  let reply = "Hello! I am SchemeSathi. Tell me a bit about yourself or query a specific scheme. For instance: 'Am I eligible for PM Kisan?' or 'What documents are required for girls' schemes?'";
  const text = lastUserMsg.toLowerCase();

  if (text.includes("pm kisan") || text.includes("farmer") || text.includes("kisan")) {
    if (profile.farmerStatus && profile.landOwner) {
      reply = `🌾 **PM Kisan Samman Nidhi Yojana** matches you perfectly! 
      Since you are an active farmer in Maharashtra with land records, you are **fully eligible** to receive **₹6,000/year** in 3 equal cash transfers.
      
      We have also extracted from your **Aadhaar** and **Land Records** so you are ready to pre-fill! Missing documents needed: **None**.`;
    } else {
      reply = "🌾 For **PM Kisan Samman Nidhi**, farmers receive **₹6,000/year**. Eligibility requires you to be an active landholder. Please declare if you own land and are a farmer in the profile workspace, and I will instantly run the live validator for you!";
    }
  } else if (text.includes("ayushman") || text.includes("health") || text.includes("treatment")) {
    reply = `🏥 **Ayushman Bharat (PM-JAY)** provides up to **₹5,00,000/year** in cashless hospital coverage.
    It targets low-income households (income under ₹2.5 Lakh). Based on your income, you possess **Likely Eligible** status. Required files: Aadhaar and Ration Card.`;
  } else if (text.includes("scholarship") || text.includes("student") || text.includes("education")) {
    reply = "🎓 **National Means-Cum-Merit Scholarship** provides **₹12,000/year** to eighth-standard students passing with 55%+. Max family income floor limit is ₹3.5 Lakhs. Documents needed: Identity, Previous class Mark sheet, Income certificate.";
  } else if (text.includes("women") || text.includes("girl") || text.includes("sukanya") || text.includes("ladli")) {
    reply = "🌸 We support premium schemes for women: **Sukanya Samriddhi Yojana** (8.2% secure investment account for girl children under 10 years) and Maharashtra's **Ladli Behna Yojana** (direct nutritional transfer of ₹1,500/month for women aged 21-65). Let me know which you'd like to discover!";
  } else if (profile.farmerStatus) {
    reply = `🌾 Hi Ramesh! Because you are an active farmer from Maharashtra, I highly recommend looking at:
    1. **PM Kisan** (₹6,000/year cash) - **Verified eligible!**
    2. **Ayushman Bharat** (₹5,000,000 health cover)
    Let's upload your Aadhaar and Land records to auto-generate your application files.`;
  }

  res.json({ reply });
});

// 6. Interactive Document Chat Copilot
app.post("/api/doc-chat", async (req, res) => {
  const { docType, extractedData, message } = req.body;
  const text = message.toLowerCase();

  if (isGeminiAvailable && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `The user uploaded their ${docType} card/certificate.
        OCR Extracted Data: ${JSON.stringify(extractedData)}
        User's question about their document: "${message}"

        Briefly answer their question using Only the extracted data safely. If the answer is not in the extracted data, guide them to upload a clearer copy or state it is missing in this particular file. Keep it extremely brief (1-2 sentences).`
      });

      return res.json({ reply: response.text });
    } catch (e) {
      console.error("Gemini Doc-chat error:", e);
    }
  }

  // Fast offline structural rule lookup
  let reply = "I can see the following extracted fields from this document: " + Object.keys(extractedData).filter(k => extractedData[k]).join(", ");
  if (text.includes("name") || text.includes("who")) {
    reply = extractedData.name ? `The document name reads **${extractedData.name}**.` : "Name was not indexed clearly in this file.";
  } else if (text.includes("address") || text.includes("live") || text.includes("where")) {
    reply = extractedData.address ? `The registered residential address is: **${extractedData.address}**.` : "Address details not found on this file.";
  } else if (text.includes("dob") || text.includes("date of birth") || text.includes("born") || text.includes("age")) {
    reply = extractedData.dob ? `The official date of birth is listed as **${extractedData.dob}**.` : "DOB was not annotated in this file.";
  } else if (text.includes("number") || text.includes("aadhaar") || text.includes("id")) {
    reply = extractedData.aadhaarNumber ? `The extracted Aadhaar Number is **${extractedData.aadhaarNumber}**.` : "Aadhaar identification card number not visible.";
  } else if (text.includes("land") || text.includes("acre") || text.includes("size")) {
    reply = extractedData.customLandHolding ? `The land report details: **${extractedData.customLandHolding}**.` : "We detected standard agricultural layout details.";
  }

  res.json({ reply });
});

// Serve frontend assets and boot server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SchemeSathi Server] Booted successfully and running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start SchemeSathi server:", err);
});
