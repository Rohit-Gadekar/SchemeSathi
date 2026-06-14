import { Scheme } from "../types";

export const BASE_SCHEMES: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM Kisan Samman Nidhi Yojana",
    category: "Farmer",
    benefits: "Direct income support of ₹6,000 per year in three equal installments to small and marginal farmer families.",
    benefitsValue: 6000,
    eligibilityCriteria: [
      "Must be a citizen of India",
      "Must be a practicing farmer",
      "Must be a landholder who owns cultivable land in their name"
    ],
    requiredDocuments: ["Aadhaar Card", "Land Records / Land Ownership Document", "Bank Passbook", "Mobile Number"],
    applicationProcess: "Register online via the PM-Kisan portal, authenticate using Aadhaar e-KYC, and submit land holding details.",
    deadline: "Dec 31, 2026",
    estimatedTimeline: "15 - 30 days",
    state: "National"
  },
  {
    id: "pm-awas",
    name: "Pradhan Mantri Awas Yojana (PMAY-U/G)",
    category: "Low-income",
    benefits: "Financial assistance of up to ₹1.2 Lakh (Rural) or Interest subsidy of up to 2.67 Lakh (Urban) for self-construction of houses.",
    benefitsValue: 120000,
    eligibilityCriteria: [
      "Annual household income must be below ₹3,00,000 (EWS) or up to ₹6,00,000 (LIG)",
      "Applicant family must not own a pucca house in any part of India",
      "Must not have received central assistance under any other housing scheme"
    ],
    requiredDocuments: ["Aadhaar Card", "PAN Card", "Income Certificate", "Domicile Certificate", "Affidavit of no pucca house", "Bank Passbook"],
    applicationProcess: "Apply online or via Common Service Centre (CSC) with income proof, identity details, and geo-tagged site images.",
    deadline: "Mar 31, 2027",
    estimatedTimeline: "45 - 90 days",
    state: "National"
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat PM-JAY",
    category: "Low-income",
    benefits: "Cashless health cover of up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization.",
    benefitsValue: 500000,
    eligibilityCriteria: [
      "Must belong to families identified by Socio-Economic Caste Census (SECC)",
      "No limit on family size, age or gender",
      "Annual household income must be under ₹2,50,000"
    ],
    requiredDocuments: ["Aadhaar Card", "Ration Card (NFSA)", "Income Certificate", "Caste Certificate (if applicable)"],
    applicationProcess: "Verify eligibility at hospital helpdesk, present Golden Card/Aadhaar/Ration Card, complete biometric validation.",
    deadline: "Ongoing",
    estimatedTimeline: "Instant (Golden Card generation)",
    state: "National"
  },
  {
    id: "sukanya-samriddhi",
    name: "Sukanya Samriddhi Yojana (SSY)",
    category: "Women",
    benefits: "High-interest savings account (currently ~8.2%) with tax deduction benefits for securing a girl child's education and marriage.",
    benefitsValue: 15000,
    eligibilityCriteria: [
      "Girl child must be an Indian resident",
      "Must open account before the girl child reaches 10 years of age",
      "Max two accounts per household (one for each girl child)"
    ],
    requiredDocuments: ["Girl Child Birth Certificate", "Guardian Aadhaar Card", "Guardian PAN Card", "Domicile Certificate"],
    applicationProcess: "Complete applications at local post office or authorized bank branch with age proof and deposit slip.",
    deadline: "Ongoing",
    estimatedTimeline: "3 - 7 days",
    state: "National"
  },
  {
    id: "mudra-loan",
    name: "Pradhan Mantri Mudra Yojana (PMMY)",
    category: "Business",
    benefits: "Collateral-free business loans up to ₹10 Lakh in three categories: Shishu (up to ₹50k), Kishor (up to ₹5L), and Tarun (up to ₹10L).",
    benefitsValue: 500000,
    eligibilityCriteria: [
      "Must be an Indian entrepreneur/proprietor, small business, or partnership company",
      "Must have a valid business registration / PAN",
      "Must be engaged in manufacturing, trading, or service sectors"
    ],
    requiredDocuments: ["Business Registration Proof", "PAN Card", "Aadhaar Card", "Bank Statements (last 6 months)", "Project Report / Business Plan", "Caste Certificate (if applying for subsidised categories)"],
    applicationProcess: "Apply online via UdyamiMitra portal or visit public sector banks with business plan and quotes for machinery.",
    deadline: "Ongoing",
    estimatedTimeline: "10 - 20 days",
    state: "National"
  },
  {
    id: "national-scholarship",
    name: "National Means-Cum-Merit Scholarship (NMMSS)",
    category: "Student",
    benefits: "Scholarship of ₹12,000 per annum to meritorious students from economically weaker sections to arrest their drop-out.",
    benefitsValue: 12000,
    eligibilityCriteria: [
      "Must be an Indian student enrolled in class IX onwards",
      "Must secure at least 55% marks in class VIII exam",
      "Annual parental income must not exceed ₹3,50,000"
    ],
    requiredDocuments: ["Mark Sheet of Class VIII / Previous Exam", "Income Certificate", "Caste Certificate (if applicable)", "Bank Passbook", "Aadhaar Card", "School Bonafide Certificate"],
    applicationProcess: "Register on the National Scholarship Portal (NSP), submit class VIII mark sheets, school certificate and bank info.",
    deadline: "Oct 31, 2026",
    estimatedTimeline: "30 - 60 days",
    state: "National"
  },
  {
    id: "ladli-behna",
    name: "Mukhyamantri Majhi Ladli Behna Yojana",
    category: "Women",
    benefits: "Direct monthly transfer of ₹1,500 (total ₹18,000/year) to eligible women of Maharashtra for health, nutrition, and self-reliance.",
    benefitsValue: 18000,
    eligibilityCriteria: [
      "Must be a married, widowed, divorced, or single female resident of Maharashtra",
      "Age must be between 21 and 65 years",
      "Annual family income must be less than ₹2,50,000"
    ],
    requiredDocuments: ["Aadhaar Card", "Domicile Certificate / School Leaving Certificate of Maharashtra", "Income Certificate / Yellow or Orange Ration Card", "Bank Passbook Linked to Aadhaar", "Self-Declaration Form"],
    applicationProcess: "Apply online through Narishakti Doot App, submit form to Anganwadi Sevika or local Ward Office.",
    deadline: "Dec 31, 2026",
    estimatedTimeline: "10 - 15 days",
    state: "Maharashtra"
  },
  {
    id: "national-pension",
    name: "Atal Pension Yojana (APY)",
    category: "Senior Citizen",
    benefits: "Guaranteed minimum pension of ₹1,000 to ₹5,000 per month after age 60, based on subscriber contribution.",
    benefitsValue: 36000,
    eligibilityCriteria: [
      "Must be an Indian citizen",
      "Age must be between 18 and 40 years",
      "Must have a savings bank account"
    ],
    requiredDocuments: ["Aadhaar Card", "Bank Account Details", "Mobile Number", "Nominee Registration details"],
    applicationProcess: "Visit your bank branch where savings account is active, fill APY registration form, set up auto-debit for contribution.",
    deadline: "Ongoing",
    estimatedTimeline: "2 - 5 days",
    state: "National"
  },
  {
    id: "pm-swanidhi",
    name: "PM Street Vendor's AtmaNirbhar Nidhi",
    category: "Business",
    benefits: "Collateral-free working capital loan up to ₹10,000 (1st tranche), ₹20,000 (2nd tranche), and ₹50,000 (3rd tranche) with 7% interest subsidy.",
    benefitsValue: 10000,
    eligibilityCriteria: [
      "Must be a street vendor or hawker vending in urban areas before March 24, 2020",
      "Must hold Vending Certificate or Identity Card from local Urban Local Body (ULB)"
    ],
    requiredDocuments: ["Aadhaar Card", "Voter ID Card", "Certificate of Vending / LOR (Letter of Recommendation)", "Bank Passbook"],
    applicationProcess: "Apply via PMSVANidhi online portal or PM Swanidhi app with LOR from local municipal body.",
    deadline: "Ongoing",
    estimatedTimeline: "7 - 14 days",
    state: "National"
  },
  {
    id: "disability-pension",
    name: "Indira Gandhi National Disability Pension Scheme (IGNDPS)",
    category: "Senior Citizen",
    benefits: "Monthly pension of ₹300 per month (below age 80) and ₹500 per month (80 years and above) to severely disabled individuals.",
    benefitsValue: 6000,
    eligibilityCriteria: [
      "Indian resident aged between 18 and 79 years",
      "Must be living below the poverty line (BPL)",
      "Must have severe or multiple disabilities with 80% or more disability degree"
    ],
    requiredDocuments: ["Disability Certificate (80%+ degree)", "BPL Card", "Aadhaar Card", "Bank Passbook", "Passport Sized Photograph"],
    applicationProcess: "Submit application to local Gram Panchayat / Block Development Officer, or apply online via State Pension Portal.",
    deadline: "Ongoing",
    estimatedTimeline: "30 - 45 days",
    state: "National"
  }
];

// Generates 40 additional realistic schemes covering varied sectors, states and groups
export function getSeededSchemes(): Scheme[] {
  const list = [...BASE_SCHEMES];
  
  const states = ["Maharashtra", "Uttar Pradesh", "Bihar", "Gujarat", "Karnataka", "Tamil Nadu", "Rajasthan", "Madhya Pradesh", "Delhi"];
  const subCategories = ["Student", "Farmer", "Women", "Senior Citizen", "Business", "Low-income"];
  
  const schemeNames: Record<string, string[]> = {
    "Student": [
      "Post-Matric Scholarship for SC/ST Students",
      "Pragati Scholarship Scheme for Girl Students (Tech Education)",
      "Pre-Matric Minority Scholarship Scheme",
      "Chief Minister's Merit-Cum-Means Scholarship",
      "Super 30 Coaching Assistance Subsidy",
      "Vidyasaarathi Education Support Grant",
      "National Overseas Scholarship Scheme",
      "Inspire Scholarship for Higher Education"
    ],
    "Farmer": [
      "Pradhan Mantri Fasal Bima Yojana (Crop Insurance)",
      "PM Krishi Sinchayee Yojana (Drip Irrigation Subsidy)",
      "Paramparagat Krishi Vikas Yojana (Organic Farming Incentive)",
      "National Livestock Mission Subsidy",
      "Sub-Mission on Agricultural Mechanization (Tractor Subsidy)",
      "Baliraja Jal Sanjivani Yojana",
      "Fisheries Development Financial Support Scheme",
      "Cold Storage Construction Credit Support"
    ],
    "Women": [
      "Pradhan Mantri Matru Vandana Yojana (Maternity Benefits)",
      "Mahila Samridhi Housing Tax Rebate",
      "Mukhyamantri Kanya Sumangala Scheme",
      "Udyogini Self-Employment Support for Women",
      "Savitribai Phule Education Incentive for Girls",
      "Free Sewing Machine Scheme (Nari Shakti)",
      "Stand Up India Loan for Women Entrepreneurs",
      "Tejaswini Rural Women Empowerment Program"
    ],
    "Senior Citizen": [
      "Pradhan Mantri Vaya Vandana Yojana (Nonspeculative Pension)",
      "Indira Gandhi National Old Age Pension Scheme",
      "Senior Citizen Free Health Checkup Scheme",
      "Elder Line Assistive Device Subsidy",
      "Varishtha Pension Bima Yojana",
      "Senior Citizen Home Renovation Assistance Grant",
      "State Senior Concession Transport Scheme",
      "Dignity Welfare Allowance Program"
    ],
    "Business": [
      "Credit Guarantee Fund Trust for Micro & Small Enterprises (CGTMSE)",
      "Prime Minister's Employment Generation Programme (PMEGP)",
      "MSME Technology Upgradation Subsidy Scheme",
      "Standup India Scheme for SC/ST",
      "National Small Industries Corporation Marketing Grant",
      "Coir Udyami Yojana",
      "Khadi Gramodyog Vikas Yojana Loan",
      "Single-Point Business Registration Grant"
    ],
    "Low-income": [
      "Mukhyamantri Anna Suraksha Yojana (Free Ration Card)",
      "Rashtriya Swasthya Bima Yojana (BPL Support)",
      "Deendayal Antyodaya Yojana (NULM)",
      "E-Shram Card Health Accident Coverage",
      "National Family Benefit Scheme",
      "BPL Free Electricity Connection Scheme",
      "Pradhan Mantri Ujjwala Yojana (Free Gas Cylinder)",
      "Antyodaya Anna Yojana (Highly Subsidized Foodgrains)"
    ]
  };

  const benefitsDesc: Record<string, string[]> = {
    "Student": [
      "Offers annual scholarship grants of ₹8,000 to ₹40,000 to cover education fees, books and study supplies.",
      "Assists in full coaching cost coverage and monthly maintenance allowance of ₹2,500 for state exam preparation."
    ],
    "Farmer": [
      "Covers up to 90% of drip irrigation installation costs or crop failure compensations ranging from ₹10k to ₹50k per hectare.",
      "Gives custom subsidy grants up to ₹3,00,000 on purchase of agricultural tractors and storage units."
    ],
    "Women": [
      "Direct seed funds of ₹10,000 to ₹50,000 for vocational setups and 50% waiver in regional stamp acts.",
      "Guarantees financial nutrition support of ₹6,000 to mothers for pregnancy care and newborn development."
    ],
    "Senior Citizen": [
      "Allows direct social welfare pensions starting from ₹1,000/month after the age of 60.",
      "Supplies assistive devices like hearing aids, spectacles and walking sticks worth ₹5,000 at zero cost."
    ],
    "Business": [
      "Secures zero-guarantee bank loans of and subsidies ranging from 15% to 35% on total enterprise setup cost.",
      "Provides reimbursement of ₹50,000 per patent filing and free stalls in state-led export exhibitions."
    ],
    "Low-income": [
      "Ensures supply of 35kg foodgrains per family per month at highly subsidized rates (Rice @ ₹3/kg, Wheat @ ₹2/kg).",
      "Direct accidental claim insurance cover of ₹2,00,000 and full electricity connection subsidy for households."
    ]
  };

  let extraIndex = 1;
  while (list.length < 50) {
    const cat = subCategories[list.length % subCategories.length];
    const state = extraIndex % 4 === 0 ? "National" : states[extraIndex % states.length];
    const catNames = schemeNames[cat];
    const name = catNames[extraIndex % catNames.length] + ` (${state === "National" ? "Central" : state})`;
    const benefits = benefitsDesc[cat][extraIndex % benefitsDesc[cat].length];
    const benefitsValue = [5000, 10000, 15000, 20000, 25000, 45000, 75000, 120000][extraIndex % 8];
    const requiredDocs = ["Aadhaar Card", "Bank Passbook"];
    if (cat === "Student") requiredDocs.push("Mark Sheets");
    if (cat === "Farmer") requiredDocs.push("Land Records");
    if (cat === "Business") requiredDocs.push("Business Registration Proof");
    if (cat === "Low-income" || benefitsValue > 20000) requiredDocs.push("Income Certificate");
    
    list.push({
      id: `state-scheme-${extraIndex}`,
      name,
      category: cat,
      benefits,
      benefitsValue,
      eligibilityCriteria: [
        `Must be a registered resident of ${state}`,
        `Belongs to the ${cat} category with active validations`,
        `Annual family income must be under ₹${(benefitsValue > 30000 ? 300000 : 200000).toLocaleString()}`
      ],
      requiredDocuments: [...new Set(requiredDocs)],
      applicationProcess: `Submit application package via the official ${state} Benefits Online Portal or local block office.`,
      deadline: `Nov 15, ${2026 + (extraIndex % 2)}`,
      estimatedTimeline: `${10 + (extraIndex % 15)} days`,
      state
    });
    extraIndex++;
  }

  return list;
}
