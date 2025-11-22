import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SOWAnalysisResult, TrafficLight } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Analysis Logic (Existing) ---
const RULEBOOKS_CONTEXT = `
GLOBAL COMPLIANCE RULES:
1. All Suppliers must have a valid ABN.
2. GST must be explicitly separated.
3. Governing Law must be Australian (VIC/NSW).

CLIENT SPECIFIC (Transurban/Corporate):
1. Liability Cap: Minimum $20M AUD.
2. Payment Terms: Max 30 days.
3. Modern Slavery: Must reference Modern Slavery Act 2018.
4. IP: All IP vests in Client.

MARKET RATES (AUD Daily):
- Senior Test Analyst: $800 - $1100
- Scrum Master: $1000 - $1400
- Delivery Lead: $1100 - $1500
- Site Nurse: $600 - $900
`;

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    clientName: { type: Type.STRING, description: "Name of the client entity" },
    projectScope: { type: Type.STRING, description: "Brief summary of the scope of work" },
    complianceScore: { type: Type.NUMBER, description: "Overall compliance score from 0 to 100" },
    overallStatus: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
    summary: { type: Type.STRING, description: "Executive summary of the review" },
    missingClauses: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of mandatory clauses that are missing"
    },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
          issue: { type: Type.STRING },
          recommendation: { type: Type.STRING },
          clauseReference: { type: Type.STRING, description: "Reference to the specific clause in the SOW, or 'Missing'" }
        },
        required: ["category", "status", "issue", "recommendation"]
      }
    },
    rates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          sowRate: { type: Type.NUMBER },
          marketMin: { type: Type.NUMBER },
          marketMax: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
          flag: { type: Type.STRING, description: "Analysis of the rate (e.g. 'Within Market', 'High', 'Excessive')" }
        },
        required: ["role", "sowRate", "marketMin", "marketMax", "status", "flag"]
      }
    }
  },
  required: ["clientName", "complianceScore", "overallStatus", "findings", "rates", "summary"]
};

export const analyzeSOW = async (base64Pdf: string): Promise<SOWAnalysisResult> => {
  try {
    // Using Gemini 3.0 Pro Preview with Thinking for complex contract analysis
    const model = "gemini-3-pro-preview"; 
    const prompt = `
      You are an expert SOW Compliance Officer and Legal Auditor.
      
      Your task is to analyze the provided Statement of Work (SOW) PDF against the following RULEBOOKS and MARKET RATES.
      
      CONTEXT - RULEBOOKS & RATES:
      ${RULEBOOKS_CONTEXT}

      INSTRUCTIONS:
      1. Extract the Client Name and Scope.
      2. Perform a deep compliance check against the Rules. 
         - If a clause is missing (e.g. Modern Slavery), flag it as RED.
         - If a value is non-compliant (e.g. Liability Cap < $20M), flag as RED or YELLOW depending on severity.
      3. Extract roles and daily rates. Compare them against the Market Rates provided in context.
         - If SOW Rate > Max Market Rate, flag as YELLOW or RED.
      4. Calculate an overall Compliance Score (0-100).
      5. Provide specific recommendations for every issue found.

      Analyze the document now.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Pdf
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        // Enable Thinking Mode for complex reasoning tasks
        thinkingConfig: { thinkingBudget: 32768 } 
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini");

    return JSON.parse(jsonText) as SOWAnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

// --- Generation Logic (New) ---

interface GenerationResult {
  description: string;
  deliverables: string;
}

const generationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING, description: "Detailed description of services for the role" },
    deliverables: { type: Type.STRING, description: "Bulleted list of key deliverables" }
  },
  required: ["description", "deliverables"]
};

export const generateSOWContent = async (
  company: string, 
  division: string, 
  role: string
): Promise<GenerationResult> => {
  try {
    const model = "gemini-2.5-flash"; // Faster model for generation

    const prompt = `
      You are an expert SOW Drafter.
      Create a professional "Description of Services" and a list of "Key Deliverables" for the following context:
      
      Company: ${company}
      Business Division: ${division}
      Role Title: ${role}
      
      Tone: Professional, contractual, and specific to the industry of the company (e.g. Mining for BHP, Finance for CBA).
      Output must be compliant with standard Australian enterprise contracts.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: generationSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini");

    return JSON.parse(jsonText) as GenerationResult;

  } catch (error) {
    console.error("Generation failed:", error);
    // Fallback mock data if API fails or key invalid
    return {
      description: `Professional services for ${role} within the ${division} division. Includes stakeholder management, technical execution, and regular reporting.`,
      deliverables: "- Monthly Status Reports\n- Strategic Plan\n- Technical Documentation\n- Handover Artifacts"
    };
  }
};
