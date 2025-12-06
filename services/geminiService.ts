import { GoogleGenAI, Type, Schema } from "@google/genai";
import { OptimizeResponse, CVInputType, ToneType, BulletStyle, LanguageOption, InterviewAnalysis, JobCultureAnalysis, ATSReport, CareerRoadmap, PortfolioStyle, TechChallenge, CodeReview } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemPrompt = (language: LanguageOption) => `
ACTÚA COMO: Un experto mundial en Reclutamiento, Marca Personal, Compensación y Networking.

TU OBJETIVO: Generar un KIT DE APLICACIÓN 360° analizando CV y Oferta (JD).

CONFIGURACIÓN DE IDIOMA:
${language === 'Auto' ? 'El idioma de salida debe ser EL MISMO que el de la Descripción de la Oferta (JD).' : `FUERZA TODO el contenido de salida (CV, Carta, Análisis, etc.) a estar estrictamente en: ${language.toUpperCase()}.`}

TAREAS:
1. **ANÁLISIS**: 
   - Calcula el "matchScore" global.
   - Calcula el "matchBreakdown" (Técnico, Experiencia, Educación, Soft Skills) de 0 a 100.
   - Identifica "Hard Killers".
   - CLASIFICA las keywords.
   - CREA un "Plan de Acción" con 3 pasos concretos para mejorar el perfil fuera del CV (ej: certificaciones, portfolio, etc).
2. **CV ATS**: Reescribe perfil y experiencia integrando keywords.
3. **CARTA**: Persuasiva y breve.
4. **ENTREVISTA**: 3 preguntas difíciles + tips.
5. **NETWORKING**: LinkedIn & Email.
6. **SALARIO**: Estima rango salarial y guion.
7. **ELEVATOR PITCH**: Crea un guion hablado de 30-45 segundos.

ESTRUCTURA JSON:
- matchScore
- matchBreakdown (technical, experience, education, softSkills)
- analysis (hardSkills, softSkills, actionPlan)
- optimizedCV
- coverLetter
- interviewQuestions
- networking
- salary
- elevatorPitch
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    matchScore: { type: Type.INTEGER },
    matchBreakdown: {
      type: Type.OBJECT,
      properties: {
        technical: { type: Type.INTEGER, description: "Match score for hard skills and tools (0-100)" },
        experience: { type: Type.INTEGER, description: "Match score for years of experience and relevance (0-100)" },
        education: { type: Type.INTEGER, description: "Match score for degrees and certifications (0-100)" },
        softSkills: { type: Type.INTEGER, description: "Match score for culture fit and soft skills (0-100)" },
      },
      required: ["technical", "experience", "education", "softSkills"]
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        hardKillers: { type: Type.ARRAY, items: { type: Type.STRING } },
        hardSkillsMatched: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Technical skills, tools, software" },
        softSkillsMatched: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Behavioral skills, leadership" },
        actionPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 concrete steps to improve chances" }
      },
      required: ["strengths", "missingKeywords", "hardKillers", "hardSkillsMatched", "softSkillsMatched", "actionPlan"],
    },
    optimizedCV: {
      type: Type.OBJECT,
      properties: {
        personalInfo: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            linkedin: { type: Type.STRING },
            avatar: { type: Type.STRING },
          },
          required: ["name"],
        },
        professionalSummary: { type: Type.STRING },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        workExperience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              date: { type: Type.STRING },
              location: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["company", "role", "bullets"],
          },
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              institution: { type: Type.STRING },
              degree: { type: Type.STRING },
              date: { type: Type.STRING },
            },
            required: ["institution", "degree"],
          },
        },
      },
      required: ["personalInfo", "professionalSummary", "skills", "workExperience", "education"],
    },
    coverLetter: { type: Type.STRING },
    interviewQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          tip: { type: Type.STRING },
        },
        required: ["question", "tip"],
      },
    },
    networking: {
      type: Type.OBJECT,
      properties: {
        linkedinHeadline: { type: Type.STRING },
        linkedinAbout: { type: Type.STRING },
        recruiterEmailSubject: { type: Type.STRING },
        recruiterEmailBody: { type: Type.STRING },
      },
      required: ["linkedinHeadline", "linkedinAbout", "recruiterEmailSubject", "recruiterEmailBody"],
    },
    salary: {
      type: Type.OBJECT,
      properties: {
        estimatedRange: { type: Type.STRING },
        currency: { type: Type.STRING },
        seniorityLevel: { type: Type.STRING },
        marketDemand: { type: Type.STRING },
        negotiationScript: { type: Type.STRING },
      },
      required: ["estimatedRange", "currency", "seniorityLevel", "marketDemand", "negotiationScript"],
    },
    elevatorPitch: { type: Type.STRING },
  },
  required: ["matchScore", "analysis", "optimizedCV", "coverLetter", "interviewQuestions", "networking", "salary", "elevatorPitch"],
};

export const optimizeCV = async (
  cvData: { type: CVInputType; content: string }, 
  jobDescription: string,
  language: LanguageOption = 'Auto'
): Promise<OptimizeResponse> => {
  try {
    const parts: any[] = [];

    parts.push({
      text: `
      --- JOB DESCRIPTION ---
      ${jobDescription}
      
      --- INSTRUCTIONS ---
      Analyze the CV provided below.
      Output the JSON structure defined.
      Ensure strict adherence to the output language requested: ${language}.
      `
    });

    if (cvData.type === 'pdf') {
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: cvData.content
        }
      });
    } else {
      parts.push({
        text: `--- ORIGINAL CV TEXT ---\n${cvData.content}`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: parts },
      config: {
        systemInstruction: getSystemPrompt(language),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text received from Gemini.");

    return JSON.parse(text) as OptimizeResponse;
  } catch (error) {
    console.error("Error optimizing CV:", error);
    throw error;
  }
};

export const rewriteSection = async (text: string, tone: ToneType): Promise<string> => {
  try {
    const toneInstructions = {
      confident: "Usa un lenguaje poderoso, orientado a logros, directo y seguro de sí mismo.",
      casual: "Usa un tono conversacional, cercano, moderno (estilo Startup), menos rígido pero profesional.",
      executive: "Usa un lenguaje formal, estratégico, sofisticado y orientado a resultados de alto nivel."
    };

    const prompt = `
    Reescribe el siguiente texto para que tenga un tono: ${tone.toUpperCase()}.
    ${toneInstructions[tone]}
    Mantén la misma información, solo cambia el estilo.
    Devuelve SOLO el texto reescrito sin comillas ni explicaciones.
    
    TEXTO ORIGINAL:
    "${text}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.7,
      },
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error rewriting text:", error);
    return text;
  }
};

export const regenerateBullet = async (bullet: string, style: BulletStyle): Promise<string> => {
  try {
    const styleInstructions = {
      result_oriented: "Reescribe esto enfocándote en LOGROS CUANTIFICABLES, métricas y resultados de impacto (usando verbos de acción fuertes).",
      shorter: "Hazlo más breve, conciso y directo (Punchy), eliminando palabras de relleno.",
      professional_fix: "Corrige la gramática, mejora el fraseo profesional y hazlo sonar más 'senior'."
    };

    const prompt = `
    Transforma el siguiente 'Bullet Point' de un CV según este estilo: ${style.toUpperCase()}.
    INSTRUCCIÓN: ${styleInstructions[style]}
    
    BULLET ORIGINAL: "${bullet.replace(/<[^>]*>/g, '')}"
    
    Devuelve SOLO el nuevo texto del bullet, sin comillas.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }] },
      config: { temperature: 0.7 },
    });

    return response.text?.trim() || bullet;
  } catch (error) {
    console.error("Error regenerating bullet:", error);
    return bullet;
  }
};

export const findRelevantJobs = async (role: string, location: string): Promise<{ text: string; sourceLinks: { title: string; url: string }[] }> => {
  try {
    const prompt = `
      Busca exactamente 5 ofertas de trabajo REALES y ACTIVAS (publicadas preferiblemente en la última semana) para el puesto de "${role}" en "${location || 'Remoto'}".
      
      Usa Google Search para encontrar ofertas en LinkedIn, Indeed, Glassdoor, o sitios de empresas.
      
      IMPORTANTE:
      - NO inventes ofertas. Deben ser reales.
      - Presenta la información en un formato de lista claro usando Markdown.
      - Para cada oferta incluye: Título, Empresa, Ubicación y un resumen de 1 línea.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // standard flash supports tools
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleSearch: {} }],
        // No responseSchema or responseMimeType when using googleSearch
      },
    });

    // Extract grounding chunks manually
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceLinks = groundingChunks
      .map((chunk: any) => chunk.web ? { title: chunk.web.title, url: chunk.web.uri } : null)
      .filter((item: any) => item !== null);

    // Remove duplicates based on URL
    const uniqueLinks = Array.from(new Set(sourceLinks.map((a: any) => a.url)))
        .map(url => sourceLinks.find((a: any) => a.url === url)!);

    return {
      text: response.text || "No se encontraron ofertas.",
      sourceLinks: uniqueLinks
    };
  } catch (error) {
    console.error("Error finding jobs:", error);
    throw error;
  }
};

// Feature 2: Audio Analysis
export const analyzeInterviewAudio = async (audioBase64: string, question: string): Promise<InterviewAnalysis> => {
    try {
        const prompt = `
        Analiza esta respuesta de audio para una entrevista de trabajo.
        Pregunta de la entrevista: "${question}"
        
        Evalúa:
        1. Claridad y tono de voz.
        2. Confianza.
        3. Calidad del contenido de la respuesta.
        
        Devuelve un JSON con este formato:
        {
          "score": number (1-10),
          "clarity": string (comentario breve),
          "confidence": string (comentario breve),
          "content": string (comentario breve),
          "feedback": string (1 tip concreto para mejorar)
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: "audio/webm", data: audioBase64 } }
                ]
            },
            config: {
                responseMimeType: "application/json",
            }
        });

        const text = response.text;
        if (!text) throw new Error("No analysis generated");
        return JSON.parse(text) as InterviewAnalysis;

    } catch (error) {
        console.error("Audio analysis failed", error);
        throw error;
    }
};

// Feature 3: Smart Diff
export const generateSmartDiff = async (originalText: string, optimizedText: string): Promise<string> => {
    try {
        const prompt = `
        Compara estos dos textos (Original vs Optimizado).
        Genera una salida HTML que muestre las diferencias.
        - Usa <span class="bg-red-100 text-red-700 line-through px-1">texto</span> para lo eliminado del original.
        - Usa <span class="bg-green-100 text-green-700 font-bold px-1">texto</span> para lo añadido/cambiado en el optimizado.
        - Mantén el texto sin cambios normal.
        
        TEXTO ORIGINAL:
        ${originalText}
        
        TEXTO OPTIMIZADO:
        ${optimizedText}
        
        Devuelve SOLO el HTML resultante.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] }
        });

        return response.text || optimizedText;
    } catch (error) {
        console.error("Diff generation failed", error);
        return optimizedText;
    }
};

// Feature: Red Flags Analysis
export const analyzeJobCulture = async (jobDescription: string): Promise<JobCultureAnalysis> => {
    try {
        const prompt = `
        Analiza esta oferta de trabajo buscando "Red Flags" (señales de toxicidad, burnout, salario bajo) y "Green Flags" (buena cultura, beneficios reales).
        
        Oferta:
        "${jobDescription.substring(0, 3000)}"
        
        Busca frases como "trabajo bajo presión", "somos una familia", "salario emocional", etc.
        
        Devuelve un JSON:
        {
          "toxicScore": number (0 = Seguro, 100 = Muy Tóxico),
          "redFlags": string[] (Lista de alertas encontradas),
          "greenFlags": string[] (Lista de aspectos positivos),
          "verdict": string (Toxic, Risky, Safe, Excellent),
          "explanation": string (Breve resumen de por qué)
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json" }
        });
        
        if (!response.text) throw new Error("No culture analysis generated");
        return JSON.parse(response.text) as JobCultureAnalysis;

    } catch (error) {
        console.error("Job culture analysis failed", error);
        return {
            toxicScore: 0,
            redFlags: [],
            greenFlags: [],
            verdict: "Unknown",
            explanation: "No se pudo analizar la cultura."
        };
    }
}

// Feature: ATS Simulation
export const simulateATSParse = async (cvContent: OptimizeResponse['optimizedCV']): Promise<ATSReport> => {
    try {
        const prompt = `
        ACT AS: Legacy Applicant Tracking System (ATS) Parser (e.g., Taleo, Workday v1).
        
        TASK: Parse the following CV JSON content as if you were a strict, old robotic system.
        Analyze for "Parsing Errors" (readability issues, complex structures).
        Extract key fields.
        
        CV CONTENT:
        ${JSON.stringify(cvContent).substring(0, 15000)}
        
        OUTPUT JSON:
        {
            "readabilityScore": number (0-100),
            "parsedData": {
                "candidateName": string | null,
                "email": string | null,
                "skillsCount": number,
                "mostRecentRole": string | null,
                "totalExperienceYears": number
            },
            "parsingErrors": string[] (List specific technical reasons why a robot might fail, e.g., "Non-standard date format", "Columns detected", "Missing contact info"),
            "keywordMatches": {
                "found": string[] (Top 5 keywords found),
                "missing": string[] (Top 3 standard keywords missing for this role type)
            },
            "rawTextExtraction": string (A simulation of how the text looks after stripping all formatting, max 200 chars)
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json" }
        });

        if (!response.text) throw new Error("No ATS report generated");
        return JSON.parse(response.text) as ATSReport;
    } catch (error) {
        console.error("ATS Simulation failed", error);
        throw error;
    }
};

// Feature: Career Roadmap
export const generateCareerRoadmap = async (currentCV: OptimizeResponse['optimizedCV'], analysis: OptimizeResponse['analysis'], jobDescription: string): Promise<CareerRoadmap> => {
    try {
        const prompt = `
        ACT AS: Senior Technical Career Coach and Mentor.
        
        OBJECTIVE: Create a strategic "Gap Analysis & Learning Roadmap" to help the candidate get the specific job described below.
        
        CONTEXT:
        - Candidate Skills: ${currentCV.skills.join(', ')}
        - Missing Keywords: ${analysis.missingKeywords.join(', ')}
        - Job Description (Summary): ${jobDescription.substring(0, 1000)}
        
        TASK:
        1. Analyze the gap between current state and target state.
        2. Create a step-by-step roadmap (3-4 steps) to close the gap.
        3. Suggest specific resources (Projects, Courses, Certs).
        
        OUTPUT JSON:
        {
            "currentLevel": string (e.g., "Mid-Level Frontend Dev"),
            "targetLevel": string (e.g., "Senior Full Stack with Cloud"),
            "gapAnalysis": string (2 sentences explaining the main gap),
            "estimatedTime": string (e.g., "8 Weeks"),
            "steps": [
                {
                    "weekRange": string (e.g., "Weeks 1-2"),
                    "title": string (e.g., "Mastering AWS Basics"),
                    "description": string (Why this matters),
                    "actionItems": string[] (3 actionable tasks, e.g., "Build a lambda function", "Pass Cloud Practitioner mock"),
                    "resources": string[] (2 suggestions, e.g., "FreeCodeCamp AWS Course", "AWS Docs"),
                    "priority": "High" | "Medium" | "Low"
                }
            ]
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json" }
        });

        if (!response.text) throw new Error("No Roadmap generated");
        return JSON.parse(response.text) as CareerRoadmap;

    } catch (error) {
        console.error("Roadmap generation failed", error);
        throw error;
    }
};

// Feature: Portfolio Website Generator
export const generatePortfolioCode = async (cvContent: OptimizeResponse['optimizedCV'], style: PortfolioStyle, accentColor: string, customInstruction: string = ""): Promise<string> => {
    try {
        const styleInstructions = {
            modern_spa: `
                STYLE: "Premium SaaS / Linear App Vibe". 
                - Vibe: Ultra-modern, gradients, glassmorphism (backdrop-blur-xl), dark/light mode toggle feel.
                - Font: 'Inter', sans-serif.
                - Animations: Use <style> block to add keyframes for fade-in-up, floating cards, and infinite marquee for skills.
                - Details: Subtle borders (border-white/10), glow effects.
            `,
            developer_terminal: `
                STYLE: "Hacker / Cyberpunk / Matrix".
                - Vibe: Dark mode default, neon green/pink accents, monospace font.
                - Font: 'Fira Code', monospace.
                - Animations: Typing effect for the hero title. Blinking cursor.
                - Layout: Looks like an IDE or Terminal window.
            `,
            creative_grid: `
                STYLE: "Awwwards / Bento Grid".
                - Vibe: Asymmetrical grid layout, large typography, heavy use of rounded corners (rounded-3xl).
                - Font: 'Space Grotesk' or 'Outfit'.
                - Interactions: Hover effects scale up cards (hover:scale-[1.02]).
                - Colors: Pastel background, vibrant cards.
            `
        };

        const prompt = `
        ACT AS: Awwwards-Winning Creative Developer & UX Designer.
        TASK: Create a SINGLE-FILE HTML portfolio (index.html) for this candidate.
        
        *** CANDIDATE INFO ***
        Name: ${cvContent.personalInfo.name}
        Headline: ${cvContent.professionalSummary.substring(0, 200)}...
        Skills: ${JSON.stringify(cvContent.skills)}
        Experience: ${JSON.stringify(cvContent.workExperience)}
        
        *** CUSTOM USER INSTRUCTION (Very Important) ***
        "${customInstruction}"
        (If the user asks for specific colors, sections, or vibe, PRIORITIZE this above the style preset).
        
        *** DESIGN SPECS (${style.toUpperCase()}) ***
        ${styleInstructions[style]}
        Accent Color: ${accentColor}
        
        *** MANDATORY FEATURES ***
        1. **Hero Section:** Big bold text, CTA button "Download CV", and a creative visual element (CSS shape or gradient).
        2. **Skills Marquee:** An infinite scrolling horizontal list of skills (CSS animation).
        3. **Experience Timeline:** Vertical line with dots, showing roles chronologically.
        4. **Projects Grid:** MOCK 3 projects based on their experience (e.g. if they know React, make a "SaaS Dashboard" project card). Use placeholders from https://placehold.co/600x400.
        5. **Testimonials:** MOCK 2 testimonials based on their Soft Skills (e.g. "Great leader", "Fast learner").
        6. **Contact Form:** A visual form (inputs for name, email, message) - just HTML/CSS.
        
        *** TECH STACK ***
        - Tailwind CSS (CDN).
        - FontAwesome (CDN).
        - Google Fonts (Import relevant fonts).
        
        OUTPUT RULES:
        - Return ONLY the raw HTML code starting with <!DOCTYPE html>.
        - EMBED CSS: Put all custom animations (@keyframes) in a <style> tag in the head.
        - RESPONSIVE: Must look perfect on Mobile (p-4, stack columns) and Desktop.
        - NO Markdown blocks. Just the code.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: {
                temperature: 0.6,
                // maxOutputTokens: 8192, // Removed to avoid potential thinking budget issues if defaults change, and rely on model defaults.
            }
        });

        let html = response.text || "";
        html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '');
        return html;

    } catch (error) {
        console.error("Portfolio generation failed", error);
        throw error;
    }
};

// Feature: Technical Code Challenge
export const generateTechChallenge = async (jobDescription: string, skills: string[]): Promise<TechChallenge> => {
    try {
        const prompt = `
        ACT AS: Senior Technical Hiring Manager (FAANG Level).
        
        OBJECTIVE: Create a relevant "Live Coding Challenge" based on the Job Description provided.
        
        CONTEXT:
        - Job Description: ${jobDescription.substring(0, 1000)}
        - Candidate Skills: ${skills.join(', ')}
        
        TASK:
        Generate a coding challenge that tests a core skill required in the JD (e.g., if JD mentions React, ask for a React Component; if Python, ask for Data Manipulation).
        It should be solvable in 15-20 minutes.
        
        OUTPUT JSON:
        {
            "title": string,
            "difficulty": "Junior" | "Mid" | "Senior",
            "description": string (Clear problem statement),
            "requirements": string[] (List of 3-4 acceptance criteria),
            "starterCode": string (Boilerplate code for the user to start with),
            "language": string (e.g., "JavaScript", "Python", "TypeScript")
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json" }
        });

        if (!response.text) throw new Error("No challenge generated");
        return JSON.parse(response.text) as TechChallenge;

    } catch (error) {
        console.error("Tech challenge generation failed", error);
        throw error;
    }
};

export const reviewCodeChallenge = async (challenge: TechChallenge, userCode: string): Promise<CodeReview> => {
    try {
        const prompt = `
        ACT AS: Senior Tech Lead reviewing a Pull Request / Code Interview.
        
        CHALLENGE:
        ${challenge.description}
        Requirements: ${challenge.requirements.join(', ')}
        
        USER SOLUTION:
        ${userCode}
        
        TASK:
        Review the code for correctness, efficiency, and code style.
        
        OUTPUT JSON:
        {
            "isCorrect": boolean (Does it solve the problem?),
            "score": number (0-100),
            "timeComplexity": string (Estimated Big O),
            "feedback": string (Constructive feedback paragraph),
            "bugs": string[] (List of specific issues or edge cases missed),
            "betterSolution": string (Refactored or ideal code snippet)
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json" }
        });

        if (!response.text) throw new Error("No code review generated");
        return JSON.parse(response.text) as CodeReview;

    } catch (error) {
        console.error("Code review failed", error);
        throw error;
    }
};
