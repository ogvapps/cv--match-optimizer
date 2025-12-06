
export interface WorkExperience {
  company: string;
  role: string;
  date: string;
  location: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  date: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  avatar?: string; // New field for profile picture
}

export interface InterviewQuestion {
  question: string;
  tip: string;
}

export interface InterviewAnalysis {
  score: number;
  clarity: string;
  confidence: string;
  content: string;
  feedback: string;
}

export interface NetworkingData {
  linkedinHeadline: string;
  linkedinAbout: string;
  recruiterEmailSubject: string;
  recruiterEmailBody: string;
}

export interface SalaryData {
  estimatedRange: string;
  currency: string;
  seniorityLevel: string;
  marketDemand: string; // "High", "Medium", "Low"
  negotiationScript: string;
}

export interface JobCultureAnalysis {
  toxicScore: number; // 0 to 100
  redFlags: string[];
  greenFlags: string[];
  verdict: string; // "Toxic", "Risky", "Safe", "Excellent"
  explanation: string;
}

export interface MatchBreakdown {
  technical: number; // 0-100
  experience: number; // 0-100
  education: number; // 0-100
  softSkills: number; // 0-100
}

export interface ATSReport {
  readabilityScore: number; // 0-100
  parsedData: {
    candidateName: string | null;
    email: string | null;
    skillsCount: number;
    mostRecentRole: string | null;
    totalExperienceYears: number;
  };
  parsingErrors: string[]; // e.g. "Complex layout detected", "Unreadable font"
  keywordMatches: {
    found: string[];
    missing: string[];
  };
  rawTextExtraction: string; // How the text looks to the robot
}

export interface RoadmapStep {
  weekRange: string; // e.g., "Semana 1-2"
  title: string; // e.g., "Fundamentos de Docker"
  description: string;
  actionItems: string[]; // Checklist
  resources: string[]; // e.g., "Documentación oficial", "Curso de Udemy"
  priority: 'High' | 'Medium' | 'Low';
}

export interface CareerRoadmap {
  currentLevel: string;
  targetLevel: string;
  gapAnalysis: string; // Summary of what is missing
  steps: RoadmapStep[];
  estimatedTime: string; // "3 meses"
}

export interface TechChallenge {
  title: string;
  difficulty: 'Junior' | 'Mid' | 'Senior';
  description: string;
  requirements: string[];
  starterCode: string; // Boilerplate
  language: string; // e.g., "JavaScript", "Python"
}

export interface CodeReview {
  isCorrect: boolean;
  score: number; // 0-100
  timeComplexity: string; // "O(n)"
  feedback: string;
  bugs: string[];
  betterSolution: string; // Code snippet
}

export interface OptimizeResponse {
  matchScore: number;
  matchBreakdown?: MatchBreakdown; // New granular scoring
  analysis: {
    strengths: string[];
    missingKeywords: string[];
    hardKillers: string[];
    hardSkillsMatched: string[]; // Tech, tools, languages
    softSkillsMatched: string[]; // Leadership, communication
    actionPlan: string[]; // 3 concrete steps to improve
  };
  optimizedCV: {
    personalInfo: PersonalInfo;
    professionalSummary: string;
    skills: string[];
    workExperience: WorkExperience[];
    education: Education[];
  };
  coverLetter: string;
  interviewQuestions: InterviewQuestion[];
  networking: NetworkingData;
  salary: SalaryData;
  elevatorPitch: string;
  cultureAnalysis?: JobCultureAnalysis; // Optional as it loads async
  atsReport?: ATSReport; // Optional
  careerRoadmap?: CareerRoadmap; // Optional
  // Note: Tech challenge is generated on demand, not in initial response
}

export type CVInputType = 'text' | 'pdf';
export type ToneType = 'confident' | 'casual' | 'executive';
export type BulletStyle = 'result_oriented' | 'shorter' | 'professional_fix';
export type LanguageOption = 'Auto' | 'Spanish' | 'English' | 'French' | 'German' | 'Portuguese';
export type InterviewerPersona = 'hr_friendly' | 'tech_lead' | 'startup_founder' | 'behavioral_expert';
export type PortfolioStyle = 'modern_spa' | 'developer_terminal' | 'creative_grid';

export interface OptimizeRequest {
  cvData: {
    type: CVInputType;
    content: string;
  };
  jobDescription: string;
  language: LanguageOption;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  jobTitle: string;
  data: OptimizeResponse;
}
