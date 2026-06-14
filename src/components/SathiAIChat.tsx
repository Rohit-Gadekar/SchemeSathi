import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ChatMessage } from '../types';
import { 
  Send, Bot, User, RefreshCw, CheckCircle, Smartphone, AlertCircle, 
  HelpCircle, Mic, MicOff, Volume2, VolumeX, Languages 
} from 'lucide-react';

interface SathiAIChatProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onProfileChange: (newProfile: UserProfile) => void;
  selectedLang: 'en' | 'hi' | 'mr' | 'ta' | 'te';
  setSelectedLang: (lang: 'en' | 'hi' | 'mr' | 'ta' | 'te') => void;
  onNextStep?: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', langTag: 'en-IN', welcome: "Hello! Welcome to SchemeSathi." },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', langTag: 'hi-IN', welcome: "नमस्ते! योजनासाथी में आपका स्वागत है।" },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', langTag: 'mr-IN', welcome: "नमस्कार! योजनासाथी मध्ये आपले स्वागत आहे।" },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', langTag: 'ta-IN', welcome: "வணக்கம்! ஸ்கீம்சாதிக்கு உங்களை வரவேற்கிறோம்।" },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', langTag: 'te-IN', welcome: "నమస్కారం! స్కీమ్‌సాతీకి స్వాగతం।" }
] as const;

const MULTILINGUAL_QUESTIONS = {
  en: [
    { field: 'age', text: "Hello! Welcome to SchemeSathi. I'm your digital guide. First, let's learn about you. How old are you?", placeholder: "e.g., 42" },
    { field: 'gender', text: "Thank you. What is your gender? (Male, Female, or Other)", placeholder: "e.g., Male" },
    { field: 'state', text: "Which state of India do you live in? (e.g., Maharashtra, Karnataka, Uttar Pradesh)", placeholder: "e.g., Maharashtra" },
    { field: 'district', text: "And your district name?", placeholder: "e.g., Pune" },
    { field: 'occupation', text: "What is your primary occupation? (Farmer, Student, Business, Self Employed)", placeholder: "e.g., Farmer" },
    { field: 'annualIncome', text: "What is your family's estimated annual household income in Rupees?", placeholder: "e.g., 150000" },
    { field: 'farmerStatus', text: "Are you practicing farming? (Yes/No)", placeholder: "e.g., Yes" },
    { field: 'landOwner', text: "If farmer, do you own your cultivable land? (Yes/No)", placeholder: "e.g., Yes" },
    { field: 'studentStatus', text: "Are you currently a student? (Yes/No)", placeholder: "e.g., No" },
    { field: 'businessOwnerStatus', text: "Do you run a micro-business or a shop? (Yes/No)", placeholder: "e.g., No" },
    { field: 'disabilityStatus', text: "Do you have any physical or severe disability? (Yes/No)", placeholder: "e.g., No" },
    { field: 'casteCategory', text: "What is your social caste category? (General, OBC, SC, ST)", placeholder: "e.g., General" },
    { field: 'educationLevel', text: "Excellent! What is your highest level of education?", placeholder: "e.g., 10th Pass, Graduate" }
  ],
  hi: [
    { field: 'age', text: "नमस्ते! योजनासाथी में आपका स्वागत है। मैं आपका डिजिटल सहायक हूँ। सबसे पहले, अपने बारे में बताएं। आपकी उम्र कितनी है?", placeholder: "जैसे, 42" },
    { field: 'gender', text: "धन्यवाद। आपका लिंग क्या है? (पुरुष, महिला, या अन्य)", placeholder: "जैसे, पुरुष" },
    { field: 'state', text: "आप भारत के किस राज्य में रहते हैं? (जैसे, महाराष्ट्र, कर्नाटक, उत्तर प्रदेश)", placeholder: "जैसे, महाराष्ट्र" },
    { field: 'district', text: "और आपके जिले का नाम क्या है?", placeholder: "जैसे, पुणे" },
    { field: 'occupation', text: "आपका मुख्य व्यवसाय क्या है? (किसान, छात्र, व्यवसायी, स्वरोजगार)", placeholder: "जैसे, किसान" },
    { field: 'annualIncome', text: "आपके परिवार की अनुमानित वार्षिक आय रुपये में कितनी है?", placeholder: "जैसे, 150000" },
    { field: 'farmerStatus', text: "क्या आप खेती करते हैं? (हाँ/नहीं)", placeholder: "जैसे, हाँ" },
    { field: 'landOwner', text: "यदि आप किसान हैं, तो क्या आपके पास खुद की कृषि भूमि है? (हाँ/नहीं)", placeholder: "जैसे, हाँ" },
    { field: 'studentStatus', text: "क्या आप वर्तमान में एक छात्र हैं? (हाँ/नहीं)", placeholder: "जैसे, नहीं" },
    { field: 'businessOwnerStatus', text: "क्या आप कोई छोटा व्यवसाय या दुकान चलाते हैं? (हाँ/नहीं)", placeholder: "जैसे, नहीं" },
    { field: 'disabilityStatus', text: "क्या आपको कोई शारीरिक या गंभीर विकलांगता है? (हाँ/नहीं)", placeholder: "जैसे, नहीं" },
    { field: 'casteCategory', text: "आपकी सामाजिक जाति श्रेणी क्या है? (General, OBC, SC, ST)", placeholder: "जैसे, General" },
    { field: 'educationLevel', text: "बहुत बढ़िया! आपकी उच्चतम शिक्षा क्या है?", placeholder: "जैसे, 10वीं पास, स्नातक" }
  ],
  mr: [
    { field: 'age', text: "नमस्कार! योजनासाथी मध्ये आपले स्वागत आहे. मी आपला डिजिटल मार्गदर्शक आहे. सर्वप्रथम, आपल्याबद्दल जाणून घेऊया. आपले वय किती आहे?", placeholder: "उदा. 42" },
    { field: 'gender', text: "धन्यवाद. आपले लिंग काय आहे? (पुरुष, स्त्री, किंवा इतर)", placeholder: "उदा. पुरुष" },
    { field: 'state', text: "आपण भारताच्या कोणत्या राज्यात राहता? (उदा. महाराष्ट्र, कर्नाटक, उत्तर प्रदेश)", placeholder: "उदा. महाराष्ट्र" },
    { field: 'district', text: "आणि आपल्या जिल्ह्याचे नाव काय आहे?", placeholder: "उदा. पुणे" },
    { field: 'occupation', text: "आपला मुख्य व्यवसाय काय आहे? (शेतकरी, विद्यार्थी, व्यवसाय, स्वयंरोजगार)", placeholder: "उदा. शेतकरी" },
    { field: 'annualIncome', text: "तुमच्या कुटुंबाचे अंदाजे वार्षिक उत्पन्न रुपयात किती आहे?", placeholder: "उदा. 150000" },
    { field: 'farmerStatus', text: "आपण शेती करता का? (होय/नाही)", placeholder: "उदा. होय" },
    { field: 'landOwner', text: "आपण शेतकरी असल्यास, आपल्याकडे स्वतःची शेतीयोग्य जमीन आहे का? (होय/नाही)", placeholder: "उदा. होय" },
    { field: 'studentStatus', text: "आपण सध्या विद्यार्थी आहात का? (होय/नाही)", placeholder: "उदा. नाही" },
    { field: 'businessOwnerStatus', text: "आपण एखादा छोटा व्यवसाय किंवा दुकान चालवता का? (होय/नाही)", placeholder: "उदा. नाही" },
    { field: 'disabilityStatus', text: "आपल्याला शारीरिक किंवा तीव्र अपंगत्व आहे का? (होय/नाही)", placeholder: "उदा. नाही" },
    { field: 'casteCategory', text: "आपला सामाजिक प्रवर्ग काय आहे? (General, OBC, SC, ST)", placeholder: "उदा. General" },
    { field: 'educationLevel', text: "उत्कृष्ट! आपले सर्वोच्च शिक्षण काय आहे?", placeholder: "उदा. 10वी पास, पदवीधर" }
  ],
  ta: [
    { field: 'age', text: "வணக்கம்! ஸ்கீம்சாதிக்கு உங்களை வரவேற்கிறோம். நான் உங்கள் டிஜிட்டல் உதவியாளர். முதலில், உங்களைப் பற்றி தெரிந்துகொள்வோம். உங்கள் வயது என்ன?", placeholder: "எ.கா, 42" },
    { field: 'gender', text: "நன்றி. உங்கள் பாலினம் என்ன? (ஆண், பெண், அல்லது மற்றவை)", placeholder: "எ.கா, ஆண்" },
    { field: 'state', text: "நீங்கள் இந்தியாவின் எந்த மாநிலத்தில் வசிக்கிறீர்கள்? (எ.கா, மகாராஷ்டிரா, கர்நாடகா, உத்தரபிரதேசம்)", placeholder: "எ.கா, மகாராஷ்டிரா" },
    { field: 'district', text: "மற்றும் உங்கள் மாவட்டத்தின் பெயர் என்ன?", placeholder: "எ.கா, புனே" },
    { field: 'occupation', text: "உங்களது முதன்மை தொழில் என்ன? (விவசாயி, மாணவர், வணிகம், சுயதொழில்)", placeholder: "எ.கா, விவசாயி" },
    { field: 'annualIncome', text: "உங்கள் குடும்பத்தின் மதிப்பிடப்பட்ட ஆண்டு வருமானம் ரூபாயில் எவ்வளவு?", placeholder: "எ.கா, 150000" },
    { field: 'farmerStatus', text: "நீங்கள் விவசாயம் செய்கிறீர்களா? (ஆம்/இல்லை)", placeholder: "எ.கா, ஆம்" },
    { field: 'landOwner', text: "விவசாயியாக இருந்தால், சாகுபடி செய்யக்கூடிய நிலம் உங்களுக்கு சொந்தமாக இருக்கிறதா? (ஆம்/இல்லை)", placeholder: "எ.கா, ஆம்" },
    { field: 'studentStatus', text: "நீங்கள் தற்போது மாணவரா? (ஆம்/இல்லை)", placeholder: "எ.கா, இல்லை" },
    { field: 'businessOwnerStatus', text: "நீங்கள் ஒரு சிறு தொழில் அல்லது கடை நடத்துகிறீர்களா? (ஆம்/இல்லை)", placeholder: "எ.கா, இல்லை" },
    { field: 'disabilityStatus', text: "உங்களுக்கு ஏதேனும் உடல் அல்லது கடுமையான குறைபாடு உள்ளதா? (ஆம்/இல்லை)", placeholder: "எ.கா, இல்லை" },
    { field: 'casteCategory', text: "உங்கள் சமூக சாதிப்பிரிவு என்ன? (General, OBC, SC, ST)", placeholder: "எ.கா, General" },
    { field: 'educationLevel', text: "மிக நன்று! உங்கள் அதிகபட்ச கல்வி தகுதி என்ன?", placeholder: "எ.கா, 10-ஆம் வகுப்பு, பட்டதாரி" }
  ],
  te: [
    { field: 'age', text: "నమస్కారం! స్కీమ్‌సాతీకి స్వాగతం. నేను మీ డిజిటల్ గైడ్‌ని. మొదట, మీ గురించి తెలుసుకుందాం. మీ వయస్సు ఎంత?", placeholder: "ఉదాహరణకు, 42" },
    { field: 'gender', text: "ధన్యవాదాలు. మీ లింగం ఏమిటి? (పురుషుడు, స్త్రీ, లేదా ఇతరులు)", placeholder: "ఉదాహరణకు, పురుషుడు" },
    { field: 'state', text: "మీరు భారతదేశంలోని ఏ రాష్ట్రంలో నివసిస్తున్నారు? (ఉదాహరణకు, మహారాష్ట్ర, కర్ణాటక, ఉత్తర ప్రదేశ్)", placeholder: "ఉదాహరణకు, మహారాష్ట్ర" },
    { field: 'district', text: "మరియు మీ జిల్లా పేరు ఏమిటి?", placeholder: "ఉదాహరణకు, పూణే" },
    { field: 'occupation', text: "మీ ప్రాథమిక వృత్తి ఏమిటి? (రైతు, విద్యార్థి, వ్యాపారం, స్వయం ఉపాధి)", placeholder: "ఉదాహరణకు, రైతు" },
    { field: 'annualIncome', text: "మీ కుటుంబ వార్షిక ఆదాయం రూపాయలలో సుమారుగా ఎంత?", placeholder: "ఉదాహరణకు, 150000" },
    { field: 'farmerStatus', text: "మీరు వ్యవసాయం చేస్తున్నారా? (అవును/కాదు)", placeholder: "ఉదాహరణకు, అవును" },
    { field: 'landOwner', text: "రైతు అయితే, వ్యవసాయం చేయడానికి మీకు సొంత భూమి ఉందా? (అవును/కాదు)", placeholder: "ఉదాహరణకు, అవును" },
    { field: 'studentStatus', text: "మీరు ప్రస్తుతం విద్యార్థినా? (అవును/కాదు)", placeholder: "ఉదాహరణకు, కాదు" },
    { field: 'businessOwnerStatus', text: "మీరు ఏదైనా చిన్న వ్యాపారం లేదా షాప్ నడుపుతున్నారా? (అవును/కాదు)", placeholder: "ఉదాహరణకు, కాదు" },
    { field: 'disabilityStatus', text: "మీకు ఏదైనా శారీరక లేదా తీవ్రమైన వైకల్యం ఉందా? (అవును/కాదు)", placeholder: "ఉదాహరణకు, కాదు" },
    { field: 'casteCategory', text: "మీ సామాజిక కుల వర్గం ఏమిటి? (General, OBC, SC, ST)", placeholder: "ఉదాహరణకు, General" },
    { field: 'educationLevel', text: "చాలా బాగుంది! మీ అత్యున్నత విద్యా అర్హత ఏమిటి?", placeholder: "ఉదాహరణకు, 10వ తరగతి, డిగ్రీ" }
  ]
};

const TRANSLATED_UI = {
  en: {
    title: "Citizen Profile",
    subtitle: "Review or modify details in real time",
    filled: "Filled",
    age: "Age",
    gender: "Gender",
    state: "State",
    district: "District",
    occupation: "Occupation",
    annualIncome: "Annual Income (₹)",
    socialChecks: "Social & Status Checks",
    isFarmer: "Is Farmer",
    isFarmerSub: "Active agricultural practitioner",
    landholder: "Landowner",
    landholderSub: "Owns land legally in state register",
    isStudent: "Is Student",
    isStudentSub: "Enrolled in school or university",
    isBusiness: "Is Business Owner",
    isBusinessSub: "Maintains shop, MSME, or startup",
    isDisabled: "Has Disability Certificate",
    isDisabledSub: "Registered physical/mental disability certificate",
    botTitle: "Sathi AI Assistant",
    botSubtitle: "ONLINE • READY TO GUIDE",
    resetBtn: "Reset Chat",
    select: "Select",
    speakBtnPrompt: "Ask assistant in English...",
    micTooltip: "Click to speak",
    listening: "Listening...",
    autoReadText: "Auto Speak responses"
  },
  hi: {
    title: "नागरिक प्रोफ़ाइल",
    subtitle: "वास्तविक समय में विवरण देखें या बदलें",
    filled: "भरा हुआ",
    age: "उम्र",
    gender: "लिंग",
    state: "राज्य",
    district: "जिला",
    occupation: "व्यवसाय",
    annualIncome: "वार्षिक आय (₹)",
    socialChecks: "सामाजिक और व्यक्तिगत श्रेणियां",
    isFarmer: "क्या आप किसान हैं?",
    isFarmerSub: "सक्रिय रूप से खेती करने वाले",
    landholder: "क्या भूमि मालिक हैं?",
    landholderSub: "सरकारी रिकॉर्ड में भूमि आपके नाम है",
    isStudent: "क्या छात्र हैं?",
    isStudentSub: "स्कूल या कॉलेज में पढ़ रहे हैं",
    isBusiness: "क्या छोटे व्यवसायी हैं?",
    isBusinessSub: "दुकान, एमएसएमई या स्टार्टअप मालिक",
    isDisabled: "क्या दिव्यांगता प्रमाण पत्र है?",
    isDisabledSub: "पंजीकृत दिव्यांगता प्रमाण पत्र धारक",
    botTitle: "साथी एआई सहायक",
    botSubtitle: "ऑनलाइन • मदद के लिए तैयार",
    resetBtn: "चैट रीसेट करें",
    select: "चुनें",
    speakBtnPrompt: "सहायक से हिंदी में पूछें...",
    micTooltip: "बोलने के लिए क्लिक करें",
    listening: "सुन रहा हूँ...",
    autoReadText: "ऑटो-आवाज सक्षम करें"
  },
  mr: {
    title: "नागरिक प्रोफाइल",
    subtitle: "त्वरितपणे तुमची माहिती तपासा किंवा बदला",
    filled: "भरलेले",
    age: "वय",
    gender: "लिंग",
    state: "राज्य",
    district: "जिल्हा",
    occupation: "व्यवसाय",
    annualIncome: "वार्षिक उत्पन्न (₹)",
    socialChecks: "सामाजिक आणि इतर प्रवर्ग",
    isFarmer: "शेतकरी आहात का?",
    isFarmerSub: "सक्रिय शेतकरी",
    landholder: "जमीन मालक आहात का?",
    landholderSub: "७/१२ उताऱ्यावर नाव आहे",
    isStudent: "विद्यार्थी आहात का?",
    isStudentSub: "शाळा किंवा कॉलेजमध्ये शिकत असलेले",
    isBusiness: "व्यावसायिक आहात का?",
    isBusinessSub: "दुकान किंवा छोटा व्यवसाय असलेले",
    isDisabled: "दिव्यांग प्रमाणपत्र आहे का?",
    isDisabledSub: "नोंदणीकृत दिव्यांग प्रमाणपत्र असलेले",
    botTitle: "साथी एआय मदतनीस",
    botSubtitle: "ऑनलाइन • मदतीसाठी सज्ज",
    resetBtn: "चॅट पुन्हा सुरू करा",
    select: "निवडा",
    speakBtnPrompt: "मदतनीसाला मराठीत विचारा...",
    micTooltip: "बोलण्यासाठी क्लिक करा",
    listening: "ऐकत आहे...",
    autoReadText: "ऑटो-आवाज सुरू करा"
  },
  ta: {
    title: "குடிமகன் விவரக்குறிப்பு",
    subtitle: "விவரங்களை உடனுக்குடன் சரிபார்க்கவும் அல்லது மாற்றவும்",
    filled: "பூர்த்தி செய்யப்பட்டது",
    age: "வயது",
    gender: "பாலினம்",
    state: "மாநிலம்",
    district: "மாவட்டம்",
    occupation: "தொழில்",
    annualIncome: "ஆண்டு வருமானம் (₹)",
    socialChecks: "சமூக மற்றும் பிற விவரங்கள்",
    isFarmer: "விவசாயியா?",
    isFarmerSub: "விவசாயம் செய்பவர்",
    landholder: "நில உரிமையாளரா?",
    landholderSub: "பதிவு செய்யப்பட்ட நிலம் உள்ளது",
    isStudent: "மாணவரா?",
    isStudentSub: "பள்ளியில் அல்லது கல்லூரியில் படிப்பவர்",
    isBusiness: "சிறு தொழிலதிபரா?",
    isBusinessSub: "கடை அல்லது தொழில் நடத்துபவர்",
    isDisabled: "மாற்றுத்திறனாளி சான்றிதழ் உள்ளதா?",
    isDisabledSub: "பதிவுசெய்யப்பட்ட சான்றிதழ் உள்ளவர்",
    botTitle: "ஸாத்தி எஐ உதவியாளர்",
    botSubtitle: "ஆன்லைன் • உதவத் தயார்",
    resetBtn: "அமைப்பை மீண்டும் தொடங்கு",
    select: "தேர்வு செய்",
    speakBtnPrompt: "உதவியாளரிடம் தமிழில் கேளுங்கள்...",
    micTooltip: "பேச கிளிக் செய்யவும்",
    listening: "கேட்கிறது...",
    autoReadText: "தானியங்கி ஒலிபகிர்வு"
  },
  te: {
    title: "నాగరి ప్రొఫైల్",
    subtitle: "మీ వివరాలను తనిఖీ చేయండి లేదా మార్చండి",
    filled: "పూర్తయింది",
    age: "వయస్సు",
    gender: "లింగం",
    state: "రాష్ట్రం",
    district: "జిల్లా",
    occupation: "వృత్తి",
    annualIncome: "వార్షిక ఆదాయం (₹)",
    socialChecks: "సామాజిక మరియు వ్యక్తిగత వివరాలు",
    isFarmer: "రైతులా?",
    isFarmerSub: "వ్యవసాయం చేసేవారు",
    landholder: "భూ యజమానిలా?",
    landholderSub: "వ్యవసాయ భూమి ఉంది",
    isStudent: "విద్యార్థిలా?",
    isStudentSub: "పాఠశால లేదా కాలేజీలో చదువుతున్నారా",
    isBusiness: "వ్యాపారవేత్తలా?",
    isBusinessSub: "చిన్న వ్యాపారం లేదా షాప్ ఉంది",
    isDisabled: "వైకల్యం సర్టిఫికేట్ ఉందా?",
    isDisabledSub: "రిజిస్టర్డ్ వైకల్యం సర్టిఫికేట్ ఉంది",
    botTitle: "సాతీ AI సహాయకుడు",
    botSubtitle: "ఆన్‌లైన్ • సహాయం చేయడానికి సిద్ధం",
    resetBtn: "చాట్ రీసెట్ చేయండి",
    select: "ఎంచుకోండి",
    speakBtnPrompt: "సహాయకుడిని తెలుగులో అడగండి...",
    micTooltip: "మాట్లాడటానికి క్లిక్ చేయండి",
    listening: "వింటున్నాను...",
    autoReadText: "స్వయంచాలక వాయిస్"
  }
};

export default function SathiAIChat({ profile, setProfile, onProfileChange, selectedLang, setSelectedLang, onNextStep }: SathiAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const ONBOARDING_QUESTIONS = MULTILINGUAL_QUESTIONS[selectedLang];
  const ui = TRANSLATED_UI[selectedLang];

  // Warm up and pre-fetch TTS voices on mount safely
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  // Initialize first chat prompt based on preferred language
  useEffect(() => {
    if (messages.length === 0) {
      const startText = ONBOARDING_QUESTIONS[0].text;
      setMessages([
        {
          sender: 'bot',
          text: startText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      if (autoSpeak) {
        speakText(startText);
      }
    }
  }, [selectedLang]);

  // Read out bot reply automatically if autoSpeak is active with premium speech properties
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Clean spoken output of any raw markdown formatting stars
      const cleanString = text.replace(/[*#_`~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanString);
      const activeLang = LANGUAGES.find(l => l.code === selectedLang);
      const targetTag = activeLang ? activeLang.langTag : 'en-IN';
      utterance.lang = targetTag;

      // Scan available voices on client and match for high fidelity natural accents
      const voices = window.speechSynthesis.getVoices();
      let bestVoice = voices.find(v => v.lang === targetTag && (
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Microsoft') || 
        v.name.includes('Heera') || 
        v.name.includes('Sabita')
      ));

      if (!bestVoice) {
        bestVoice = voices.find(v => v.lang.toLowerCase().includes(selectedLang));
      }
      if (!bestVoice) {
        bestVoice = voices.find(v => v.lang.startsWith(selectedLang));
      }

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // Approachable warm pacing for absolute best user comprehension
      utterance.rate = 0.92; // Slightly slower for crisp intelligibility
      utterance.pitch = 1.02; // Warm, friendly pitch tone
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Listen feature via Web Speech API
  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice inputs are not supported on this browser. Try Chrome, Edge or Safari.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    const activeLang = LANGUAGES.find(l => l.code === selectedLang);
    recognition.lang = activeLang ? activeLang.langTag : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsRecording(true);

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      if (text) {
        setInputValue(text);
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const calculateCompleteness = (p: UserProfile): number => {
    const fields: (keyof UserProfile)[] = [
      'age', 'gender', 'state', 'district', 'occupation', 
      'annualIncome', 'educationLevel', 'disabilityStatus', 
      'farmerStatus', 'casteCategory', 'studentStatus', 'businessOwnerStatus'
    ];
    let filled = 0;
    fields.forEach(f => {
      if (p[f] !== undefined && p[f] !== "") filled++;
    });
    return Math.round((filled / fields.length) * 100);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const input = inputValue;
    setInputValue('');
    setIsBotTyping(true);

    // Process field update based on current onboarding flow
    const updatedProfile = { ...profile };
    if (currentPromptIndex < ONBOARDING_QUESTIONS.length) {
      const q = ONBOARDING_QUESTIONS[currentPromptIndex];
      const field = q.field as keyof UserProfile;

      // Parse input based on field type
      if (field === 'age') {
        const parsed = parseInt(input);
        updatedProfile.age = isNaN(parsed) ? 35 : parsed;
      } else if (field === 'annualIncome') {
        const parsed = parseInt(input.replace(/[^0-9]/g, ''));
        updatedProfile.annualIncome = isNaN(parsed) ? 120000 : parsed;
      } else if (['disabilityStatus', 'farmerStatus', 'landOwner', 'studentStatus', 'businessOwnerStatus'].includes(field)) {
        const val = input.toLowerCase();
        const bool = val.includes('yes') || val.includes('true') || val.includes('ha') || val.includes('y') || val.includes('हो') || val.includes('हां');
        (updatedProfile as any)[field] = bool;
      } else {
        (updatedProfile as any)[field] = input;
      }

      updatedProfile.profileCompleteness = calculateCompleteness(updatedProfile);
      setProfile(updatedProfile);
      onProfileChange(updatedProfile);

      // Advance onboarding
      const nextIndex = currentPromptIndex + 1;
      setTimeout(() => {
        let replyMsgText = "";
        if (nextIndex < ONBOARDING_QUESTIONS.length) {
          setCurrentPromptIndex(nextIndex);
          replyMsgText = ONBOARDING_QUESTIONS[nextIndex].text;
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: replyMsgText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        } else {
          setCurrentPromptIndex(ONBOARDING_QUESTIONS.length);
          replyMsgText = selectedLang === 'hi'
            ? "🎉 बधाई हो! आपकी नागरिक प्रोफ़ाइल सफलतापूर्वक तैयार हो गई है। आपके अनुकूल सरकारी लाभ देखने के लिए ऊपर 'योजना खोजें' अनुभाग पर जाएं!"
            : selectedLang === 'mr'
            ? "🎉 अभिनंदन! तुमची माहिती संपूर्ण भरली गेली आहे. तुमच्यासाठी योग्य सरकारी योजना पाहण्यासाठी 'योजना शोधा' या टॅबवर जा!"
            : selectedLang === 'ta'
            ? "🎉 வாழ்த்துகள்! உங்கள் காரணி விவரங்கள் அனைத்தும் சேமிக்கப்பட்டுவிட்டது. உங்களுக்கான திட்டங்களைக் காண மேல் உள்ள 'திட்டங்கள் கண்டறிதல்' பக்கத்திற்குச் செல்லவும்!"
            : selectedLang === 'te'
            ? "🎉 అభినందనలు! మీ వివరాలు విజయవంతంగా పూర్తి చేయబడ్డాయి. మీ అర్హతలను మరియు ప్రభుత్వ పథకాలను చూడటానికి పైన ఉన్న 'పథకాల శోధన' బటన్ పై క్లిక్ చేయండి!"
            : "🎉 Hurrah! Your profile matches are fully compiled. Head over to the **Scheme Discovery** section in the tab above to view eligible benefits, or chat with me more about your options!";
            
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: replyMsgText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
        
        setIsBotTyping(false);
        if (autoSpeak) {
          speakText(replyMsgText);
        }
      }, 700);
    } else {
      // Freeform chat agent utilizing backend custom RAG model translation adaptive
      try {
        const activeLangName = LANGUAGES.find(l => l.code === selectedLang)?.name || "English";
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            profile,
            userLanguage: activeLangName
          })
        });
        const data = await res.json();
        const responseReply = data.reply;
        
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: responseReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        if (autoSpeak) {
          speakText(responseReply);
        }
      } catch (err) {
        let fallbackVal = "I experienced a connection lapse, but based on your local profile, you are eligible for several schemes. Ask me about PM Kisan!";
        if (selectedLang === 'hi') {
          fallbackVal = "सर्वर के साथ कुछ समस्या हुई, पर आपके प्रोफाइल के हिसाब से आप कुछ बेहतरीन योजनाओं के हकदार हैं!";
        } else if (selectedLang === 'mr') {
          fallbackVal = "सर्व्हरशी संपर्क होऊ शकला नाही, पण रजीस्ट्रेशच्या आधारे आपण 'पीएम किसान' आणि इतर योजनांसाठी पात्र आहात!";
        } else if (selectedLang === 'ta') {
          fallbackVal = "சேவையக இணைப்பு துண்டிக்கப்பட்டது, ஆனால் உங்கள் சுயவிவர அடிப்படையில், சில சிறந்த திட்டங்களுக்கு நீங்கள் தகுதியானவர்!";
        } else if (selectedLang === 'te') {
          fallbackVal = "సర్వర్ కనెక్టివిటీ లోపం ఎదురైంది, కానీ మీ స్థానిక ప్రొఫైల్ ఆధారంగా మీరు పీఎం కిసాన్ వంటి పలు పథకాలకు అర్హులు!";
        }
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: fallbackVal,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        if (autoSpeak) {
          speakText(fallbackVal);
        }
      } finally {
        setIsBotTyping(false);
      }
    }
  };

  const handleFormChange = (newVal: Partial<UserProfile>) => {
    const updated = { ...profile, ...newVal };
    updated.profileCompleteness = calculateCompleteness(updated);
    setProfile(updated);
    onProfileChange(updated);
  };

  const handleLangToggle = (langCode: 'en' | 'hi' | 'mr' | 'ta' | 'te') => {
    setSelectedLang(langCode);
    const translationOfCurrentQ = MULTILINGUAL_QUESTIONS[langCode][currentPromptIndex]?.text || MULTILINGUAL_QUESTIONS[langCode][0].text;
    
    // Convert previous onboarding message to match selected language instantly
    setMessages(prev => {
      const copy = [...prev];
      if (copy.length > 0 && currentPromptIndex < MULTILINGUAL_QUESTIONS[langCode].length) {
        // Find last bot message and update it
        let lastBotIdx = -1;
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].sender === 'bot') {
            lastBotIdx = i;
            break;
          }
        }
        if (lastBotIdx !== -1) {
          copy[lastBotIdx].text = translationOfCurrentQ;
        }
      }
      return copy;
    });

    if (autoSpeak) {
      speakText(translationOfCurrentQ);
    }
  };

  return (
    <div id="workspace-layout" className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto xl:h-[calc(100vh-220px)]">
      {/* Dynamic Questionnaire Form Panel */}
      <div className="xl:col-span-5 flex flex-col bg-[#141414] border border-white/10 rounded-2xl p-6 h-[480px] xl:h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5 font-sans">
          <div>
            <h2 className="font-serif text-lg font-light text-white">{ui.title}</h2>
            <p className="text-xs text-white/45 font-sans">{ui.subtitle}</p>
          </div>
          {/* Progress Indicator */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-[#D4AF37] font-sans font-semibold tracking-wider">{profile.profileCompleteness}% {ui.filled}</span>
            <div className="w-24 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-[#D4AF37] transition-all duration-300" 
                style={{ width: `${profile.profileCompleteness}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 font-sans text-sm">
          {/* Identity Info */}
          <div className="space-y-3 bg-white/2 p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-[#D4AF37] font-bold tracking-wider uppercase font-mono block mb-1">Identity & Credentials</span>
            <div>
              <label className="text-[10px] text-white/45 block mb-1 font-semibold tracking-wider uppercase font-sans">Full Name (As on Aadhaar)</label>
              <input 
                id="profile-fullname"
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => handleFormChange({ fullName: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors text-xs"
                placeholder={selectedLang === 'hi' ? 'जैसे, रमेश पाटिल' : selectedLang === 'mr' ? 'उदा. रमेश पाटील' : selectedLang === 'ta' ? 'எ.கா, ரமேஷ் பாட்டீல்' : selectedLang === 'te' ? 'ఉదా. రమేష్ పాటిల్' : 'e.g., Ramesh Patil'}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/45 block mb-1 font-semibold tracking-wider uppercase font-sans">Aadhaar ID</label>
                <input 
                  id="profile-aadhaarnumber"
                  type="text"
                  value={profile.aadhaarNumber || ''}
                  onChange={(e) => handleFormChange({ aadhaarNumber: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors text-xs font-mono"
                  placeholder="xxxx-xxxx-xxxx"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/45 block mb-1 font-semibold tracking-wider uppercase font-sans">Bank Account</label>
                <input 
                  id="profile-bankdetails"
                  type="text"
                  value={profile.bankDetails || ''}
                  onChange={(e) => handleFormChange({ bankDetails: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors text-xs font-sans"
                  placeholder="e.g. SBI, A/C: 12345"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-white/45 block mb-1 font-semibold tracking-wider uppercase font-sans">Permanent Address</label>
              <input 
                id="profile-address"
                type="text"
                value={profile.address || ''}
                onChange={(e) => handleFormChange({ address: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors text-xs font-sans"
                placeholder="Village, District, State, PIN"
              />
            </div>
          </div>

          <div className="border-t border-white/5 my-2"></div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 block mb-1 font-semibold tracking-wider uppercase">{ui.age}</label>
              <input 
                id="profile-age"
                type="number"
                value={profile.age || ''}
                onChange={(e) => handleFormChange({ age: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors"
                placeholder={ui.age}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1 font-semibold tracking-wider uppercase">{ui.gender}</label>
              <select 
                id="profile-gender"
                value={profile.gender || ''}
                onChange={(e) => handleFormChange({ gender: e.target.value })}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors cursor-pointer"
              >
                <option value="">{ui.select}</option>
                <option value="Male">{selectedLang === 'hi' ? 'पुरुष' : selectedLang === 'mr' ? 'पुरुष' : selectedLang === 'ta' ? 'ஆண்' : selectedLang === 'te' ? 'పురుషుడు' : 'Male'}</option>
                <option value="Female">{selectedLang === 'hi' ? 'महिला' : selectedLang === 'mr' ? 'स्त्री' : selectedLang === 'ta' ? 'பெண்' : selectedLang === 'te' ? 'స్త్రీ' : 'Female'}</option>
                <option value="Other">{selectedLang === 'hi' ? 'अन्य' : selectedLang === 'mr' ? 'इतर' : selectedLang === 'ta' ? 'மற்றவை' : selectedLang === 'te' ? 'ఇతరులు' : 'Other'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 block mb-1 font-semibold tracking-wider uppercase">{ui.state}</label>
              <input 
                id="profile-state"
                type="text"
                value={profile.state || ''}
                onChange={(e) => handleFormChange({ state: e.target.value })}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors"
                placeholder={ui.state}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1 font-semibold tracking-wider uppercase">{ui.district}</label>
              <input 
                id="profile-district"
                type="text"
                value={profile.district || ''}
                onChange={(e) => handleFormChange({ district: e.target.value })}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors"
                placeholder={ui.district}
              />
            </div>
          </div>

          {/* Income & Occupation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 block mb-1 font-semibold tracking-wider uppercase">{ui.occupation}</label>
              <select 
                id="profile-occupation"
                value={profile.occupation || ''}
                onChange={(e) => handleFormChange({ occupation: e.target.value })}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors cursor-pointer"
              >
                <option value="">{ui.select}</option>
                <option value="Farmer">{selectedLang === 'hi' ? 'किसान' : selectedLang === 'mr' ? 'शेतकरी' : selectedLang === 'ta' ? 'விவசாயி' : selectedLang === 'te' ? 'రైతు' : 'Farmer'}</option>
                <option value="Student">{selectedLang === 'hi' ? 'छात्र (विद्यार्थी)' : selectedLang === 'mr' ? 'विद्यार्थी' : selectedLang === 'ta' ? 'மாணவர்' : selectedLang === 'te' ? 'విద్యార్థి' : 'Student'}</option>
                <option value="Business">{selectedLang === 'hi' ? 'छोटा व्यवसायी' : selectedLang === 'mr' ? 'व्यावसायिक' : selectedLang === 'ta' ? 'வணிகம்' : selectedLang === 'te' ? 'వ్యాపారం' : 'Business Owner'}</option>
                <option value="Self Employed">{selectedLang === 'hi' ? 'स्वरोजगार' : selectedLang === 'mr' ? 'स्वयंरोजगार' : selectedLang === 'ta' ? 'சுயதொழில்' : selectedLang === 'te' ? 'స్వయం ఉపాధి' : 'Self Employed'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1 font-semibold tracking-wider uppercase">{ui.annualIncome}</label>
              <input 
                id="profile-income"
                type="number"
                value={profile.annualIncome || ''}
                onChange={(e) => handleFormChange({ annualIncome: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/5 rounded-lg text-white focus:border-[#D4AF37]/50 outline-none transition-colors"
                placeholder="Families Income"
              />
            </div>
          </div>

          {/* Specific Status Toggles */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs text-white/40 font-bold border-b border-white/5 pb-1 uppercase tracking-[0.1em]">{ui.socialChecks}</h3>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] border border-white/5">
              <div>
                <span className="text-xs text-white block font-semibold">{ui.isFarmer}</span>
                <p className="text-[10px] text-white/40 font-sans">{ui.isFarmerSub}</p>
              </div>
              <input 
                id="profile-toggle-farmer"
                type="checkbox"
                checked={profile.farmerStatus || false}
                onChange={(e) => handleFormChange({ farmerStatus: e.target.checked })}
                className="w-4 h-4 text-[#D4AF37] accent-[#D4AF37] outline-none rounded cursor-pointer"
              />
            </div>

            {profile.farmerStatus && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/25">
                <div>
                  <span className="text-xs text-[#D4AF37] block font-semibold">{ui.landholder}</span>
                  <p className="text-[10px] text-white/50 font-sans">{ui.landholderSub}</p>
                </div>
                <input 
                  id="profile-toggle-landowner"
                  type="checkbox"
                  checked={profile.landOwner || false}
                  onChange={(e) => handleFormChange({ landOwner: e.target.checked })}
                  className="w-4 h-4 accent-[#D4AF37] outline-none cursor-pointer"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] border border-white/5">
              <div>
                <span className="text-xs text-white block font-semibold">{ui.isStudent}</span>
                <p className="text-[10px] text-white/40 font-sans">{ui.isStudentSub}</p>
              </div>
              <input 
                id="profile-toggle-student"
                type="checkbox"
                checked={profile.studentStatus || false}
                onChange={(e) => handleFormChange({ studentStatus: e.target.checked })}
                className="w-4 h-4 text-[#D4AF37] accent-[#D4AF37] outline-none rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A] border border-white/5">
              <div>
                <span className="text-xs text-white block font-semibold">{ui.isBusiness}</span>
                <p className="text-[10px] text-white/40 font-sans">{ui.isBusinessSub}</p>
              </div>
              <input 
                id="profile-toggle-business"
                type="checkbox"
                checked={profile.businessOwnerStatus || false}
                onChange={(e) => handleFormChange({ businessOwnerStatus: e.target.checked })}
                className="w-4 h-4 text-[#D4AF37] accent-[#D4AF37] outline-none rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A1A1A] border border-white/5">
              <div>
                <span className="text-xs text-white block font-semibold">{ui.isDisabled}</span>
                <p className="text-[10px] text-white/40 font-sans">{ui.isDisabledSub}</p>
              </div>
              <input 
                id="profile-toggle-disability"
                type="checkbox"
                checked={profile.disabilityStatus || false}
                onChange={(e) => handleFormChange({ disabilityStatus: e.target.checked })}
                className="w-4 h-4 text-[#D4AF37] accent-[#D4AF37] outline-none rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Button to Proceed */}
        <div className="mt-4 shrink-0">
          {(!profile.age && !profile.state) ? (
            <p className="text-center text-[10px] text-white/40 font-sans mb-2">Fill in your State or Age to discover schemes</p>
          ) : (
            <p className="text-center text-[10px] text-[#D4AF37] font-semibold font-sans mb-2 animate-pulse cursor-default">Profile ready! Let's find your benefits.</p>
          )}
          <button
            onClick={onNextStep}
            disabled={!profile.age && !profile.state}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 ${(!profile.age && !profile.state) ? 'bg-white/5 text-white/30 border border-white/10' : 'bg-[#D4AF37] hover:bg-[#FFDF73] text-black shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]'} font-semibold rounded-xl text-xs uppercase tracking-wider transition-all disabled:cursor-not-allowed cursor-pointer`}
          >
            <span>{selectedLang === 'hi' ? 'योजनाएं खोजें' : selectedLang === 'mr' ? 'योजना शोधा' : selectedLang === 'ta' ? 'திட்டங்களை தேடு' : selectedLang === 'te' ? 'పథకాలను వెతకండి' : 'Discover Matching Schemes'}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      {/* Right Column: Conversational AI Onboarding Bot with Language & Voice Assist */}
      <div className="xl:col-span-7 flex flex-col bg-[#141414] border border-white/10 rounded-2xl h-[550px] xl:h-full pb-4 min-h-0">
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-white/5 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-light text-white">{ui.botTitle}</h3>
              <p className="text-[9px] text-[#D4AF37] tracking-[0.12em] font-sans uppercase">ONLINE • ACTIVE</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-sans">
            {/* Indian Languages Selectors */}
            <div className="flex bg-[#1A1A1A] p-0.5 rounded-lg border border-white/5">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => handleLangToggle(l.code)}
                  className={`px-2.5 py-1 text-[10px] font-medium leading-none rounded-md transition-all cursor-pointer ${
                    selectedLang === l.code 
                      ? 'bg-[#D4AF37] text-black shadow-md font-semibold' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title={l.name}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>

            {/* Read out aloud toggle button */}
            <button
              onClick={() => {
                const updated = !autoSpeak;
                setAutoSpeak(updated);
                // Trigger first text speaker if enabled
                if (updated && messages.length > 0) {
                  speakText(messages[messages.length - 1].text);
                }
              }}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[10px] uppercase font-sans tracking-wider ${
                autoSpeak 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                  : 'bg-white/2 border-white/5 text-white/50 hover:text-white'
              }`}
              title={ui.autoReadText}
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{selectedLang === 'hi' ? 'बोले' : selectedLang === 'mr' ? 'बोला' : selectedLang === 'ta' ? 'குரல் பதில்' : selectedLang === 'te' ? 'వాయిస్ ప్రత్యుత్తరం' : 'Voice Reply'}</span>
            </button>

            {/* Reset Chat */}
            <button 
              id="btn-restart-chat"
              onClick={() => {
                setCurrentPromptIndex(0);
                const startText = ONBOARDING_QUESTIONS[0].text;
                setMessages([
                  {
                    sender: 'bot',
                    text: startText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
                if (autoSpeak) {
                  speakText(startText);
                }
              }}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-3 py-2 text-white/55 hover:text-white bg-[#1A1A1A] border border-white/5 hover:border-white/12 rounded-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Chat Stream Panel */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm font-sans">
          {messages.map((m, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`p-2 rounded-lg h-inner flex items-center justify-center shrink-0 w-8 h-8 font-serif ${m.sender === 'user' ? 'bg-[#D4AF37] text-black font-semibold' : 'bg-[#1A1A1A] text-[#D4AF37] border border-white/5'}`}>
                {m.sender === 'user' ? 'U' : 'S'}
              </div>
              <div className="flex flex-col">
                <div className={`px-4 py-3 rounded-2xl leading-relaxed relative group ${m.sender === 'user' ? 'bg-[#D4AF37]/10 text-white border border-[#D4AF37]/20' : 'bg-[#1A1A1A] text-white/90 border border-white/5'}`}>
                  {m.text}
                  
                  {/* Speaker Button inside target bot messages to read out individually */}
                  {m.sender === 'bot' && (
                    <button 
                      onClick={() => speakText(m.text)}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 bg-[#1F1F1F] rounded-md border border-white/5 text-[#D4AF37] hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer hidden md:flex items-center justify-center"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1 justify-between">
                  <span className={`text-[9px] text-white/30 ${m.sender === 'user' ? 'text-right block w-full' : ''}`}>{m.timestamp}</span>
                  {m.sender === 'bot' && (
                    <button 
                      onClick={() => speakText(m.text)}
                      className="text-[#D4AF37] hover:underline text-[9px] font-medium block md:hidden cursor-pointer"
                    >
                      🔊 Speak
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing bubbles selector */}
          {isBotTyping && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="p-2 rounded-lg bg-[#1A1A1A] text-[#D4AF37] border border-white/5 w-8 h-8 flex items-center justify-center font-serif">
                S
              </div>
              <div className="bg-[#1A1A1A] text-white/40 rounded-2xl px-4 py-3 flex gap-1 items-center border border-white/5">
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Voice Recording Status indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-6 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center justify-between mb-2 font-sans"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{ui.listening}</span>
              </div>
              <button 
                onClick={() => setIsRecording(false)} 
                className="text-[10px] uppercase font-bold text-white/50 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar form */}
        <form onSubmit={handleSendMessage} className="px-6 pt-2 flex gap-2">
          {/* MicroPhone Button input */}
          <button
            type="button"
            onClick={startRecording}
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
              isRecording 
                ? 'bg-red-500 border-red-600 text-white animate-pulse' 
                : 'bg-[#1A1A1A] border-white/5 text-[#D4AF37] hover:text-white hover:bg-white/5'
            }`}
            title={ui.micTooltip}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input 
            id="chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              currentPromptIndex < ONBOARDING_QUESTIONS.length 
                ? `${ONBOARDING_QUESTIONS[currentPromptIndex].placeholder}` 
                : ui.speakBtnPrompt
            }
            className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-white/5 rounded-xl text-white placeholder-white/30 focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 outline-none text-sm transition-all"
          />
          <button 
            id="btn-chat-send"
            type="submit"
            className="p-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#FFDF73] text-black shadow-lg shadow-[#D4AF37]/5 transition-all text-sm font-semibold flex items-center justify-center cursor-pointer animate-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
