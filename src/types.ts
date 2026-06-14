export interface UserProfile {
  id: string;
  fullName?: string;
  address?: string;
  aadhaarNumber?: string;
  bankDetails?: string;
  age?: number;
  gender?: string;
  state?: string;
  district?: string;
  occupation?: string;
  annualIncome?: number;
  educationLevel?: string;
  disabilityStatus?: boolean;
  farmerStatus?: boolean;
  landOwner?: boolean;
  casteCategory?: string;
  studentStatus?: boolean;
  businessOwnerStatus?: boolean;
  profileCompleteness: number; // 0 to 100
}

export interface Scheme {
  id: string;
  name: string;
  category: string;
  benefits: string;
  benefitsValue: number; // Annual value in INR
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  applicationProcess: string;
  deadline: string;
  estimatedTimeline: string;
  state: string; // e.g. "National", "Maharashtra"
  matchScore?: number;
}

export interface DocumentFile {
  id: string;
  type: string; // "Aadhaar" | "PAN" | "Income Certificate" | "Domicile Certificate" | "Caste Certificate" | "Land Records" | "Bank Passbook" | "Mark Sheets" | "Disability Certificate"
  name: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'failed';
  extractedData?: {
    name?: string;
    dob?: string;
    address?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    bankDetails?: string;
    income?: string;
    customLandHolding?: string;
  };
}

export interface ApplicationPacket {
  id: string;
  schemeId: string;
  schemeName: string;
  status: 'draft' | 'ready' | 'submitted';
  formData: {
    applicantName: string;
    address: string;
    aadhaar: string;
    income: string;
    bankDetails: string;
    [key: string]: string;
  };
  missingDocuments: string[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
