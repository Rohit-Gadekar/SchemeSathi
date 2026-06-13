# SchemeSathi (स्कीमसार्थी)

A secure, context-aware, multilingual welfare discovery and application assistant tailored for Indian citizens. SchemeSathi bridges the technological and linguistic barriers that prevent millions of rural/semi-urban citizens from discovering and applying for eligible government schemes.

---

## 📽️ End-to-End Video Walkthrough & Tour
An **Interactive Video Walkthrough & Guided Tour** is integrated directly into the application's **Citizen Analytics & Channels** portal under the **Guided Tour** (वीडियो टूर) tab. It features step-by-step animated workflows, mock narrator voice transcripts, and automatic progression.

---

## 🌟 Key Application Features

### 1. Conversational Multilingual AI Onboarding
* **Conversational Profiling:** Leverages an approachable chat interface to collect essential profiling criteria (age, gender, state, income, farming status, etc.) without intimidating forms.
* **Multilingual Speech Synthesis & Translation:** Fully localized in **five major languages**—English, Hindi (हिंदी), Marathi (मराठी), Tamil (தமிழ்), and Telugu (తెలుగు) with friendly Voice Assist to read out questions and responses.

### 2. High-Accuracy Scheme Discovery & Pre-Matching
* **Dynamic Pre-Match Calculation:** Matches citizen profile details with major national and state welfare schemes in real-time.
* **Simplified Explanations:** Explains complex scheme structures, criteria, and benefits in simple language.
* **Citizen Readiness & Eligibility status gauges:** Scores citizen criteria match out of 100 with predictive eligibility labels.

### 3. Encrypted Document Vault with Sandbox OCR
* **Secure Storage:** Store files like Aadhaar Cards, Land Records (7/12 Extract), and Bank Passbooks securely inside client-side structures.
* **Automated Sandbox OCR Extraction:** Instantly extract text, addresses, state identifiers, and accounts using deterministic mock optical character recognition.

### 4. Direct Form Assistant & Application Pre-Filling
* **Zero-Friction Applications:** Pre-fills complex application form sheets instantly using extracted Document Vault details.
* **Interactive Discrepancy Warnings:** Alerts the user to any typos or mismatching names (e.g., "Ramesh T. Patil" vs "Ramesh Tukaram Patil") between different uploaded documents before submission.

### 5. Advanced Helplines & Admin Monitoring
* **WhatsApp Helpline Emulator:** Allows query messaging via popular chat formats (e.g., checking "PM Kisan" status).
* **Voice Query Assistant:** Real speech recognition (Web Speech API) and vocal synthesis back-up.
* **Live Administration Panel:** Elegant analytical charts tracking monthly registration, submission metrics, and database health.

---

## 🗺️ Step-by-Step End-to-End Workflow

```
[ Step 1: Onboarding ] ──► [ Step 2: Language ] ──► [ Step 3: Vault / OCR ]
   Speak or text options       Select native dial      Aadhaar, Land, & Bank file
                                                       extraction
                                                               │
[ Step 5: Application ] ◄── [ Step 4: Verification ] ◄─────────┘
  One-click pre-fill or     Ready-for-filing score %
  edit & submit records
```

1. **Accessing the Portal:**
   Start as a **Fresh Citizen** or run the **Farmer Demo Profile** (Ramesh Patil) from the landing page.
2. **Onboarding & Speech Dialogue:**
   Engage with *Sathi AI* via text or the interactive speaker. Enter profile details (State of Residence, Agriculture activity, Annual income, and Domicile status).
3. **Refining Document Vault Records:**
   Upload key documents of corresponding categories. Sandboxed OCR immediately populates form-schema fields. 
4. **Discovering Matches:**
   Navigate to "Scheme Discovery", filters are automatically matched. Observe eligibility results instantly.
5. **Form Filing Assistance:**
   Select a scheme (e.g., *PM Kisan*) for pre-filling. The form assistant pre-fills fields including Name, Address, Bank details, and coordinates discrepancy warnings.
6. **Submitting & Tracking:**
   Submit and track registration on the **Helplines & Analytics** dashboard.

---

## 🛠️ Architecture and Stack

* **Frontend:** React 18 / TypeScript
* **Styling & Layout:** Tailwind CSS
* **Animations:** Framer Motion (`motion/react`) for smooth transitions and realistic video play-bar logic
* **Data Visualizations:** Recharts for administrator tracking gauges
* **Icons:** Lucide React
* **Speech Control:** HTML5 Speech Synthesis and Web Speech Recognition API

---

## 🚀 Running and Deploying Locally

### Prerequisites
* Node.js (v18+)
* npm

### Installation
```bash
# Clone the repository
git clone <repository_url>

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Build for Production
```bash
# Generate optimized production output in dist/
npm run build
```
