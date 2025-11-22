
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SOWAnalysisResult, TrafficLight } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const RULEBOOKS_CONTEXT = `
GLOBAL COMPLIANCE RULES:
1. All Suppliers must have a valid ABN.
2. GST must be explicitly separated.
3. Governing Law must be Australian (VIC/NSW).

CLIENT SPECIFIC:
1. Liability Cap: Minimum $20M AUD.
2. Payment Terms: Max 30 days.
3. Modern Slavery: Must reference Modern Slavery Act 2018.
4. IP: All IP vests in Client.

MARKET RATES:
- Senior Test Analyst: $800 - $1100
`;

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    clientName: { type: Type.STRING },
    projectScope: { type: Type.STRING },
    complianceScore: { type: Type.NUMBER },
    overallStatus: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
    summary: { type: Type.STRING },
    missingClauses: { type: Type.ARRAY, items: { type: Type.STRING } },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["GREEN", "YELLOW", "RED"] },
          issue: { type: Type.STRING },
          recommendation: { type: Type.STRING },
          clauseReference: { type: Type.STRING }
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
          flag: { type: Type.STRING }
        },
        required: ["role", "sowRate", "marketMin", "marketMax", "status", "flag"]
      }
    }
  },
  required: ["clientName", "complianceScore", "overallStatus", "findings", "rates", "summary"]
};

export const analyzeSOW = async (base64Pdf: string): Promise<SOWAnalysisResult> => {
  try {
    const model = "gemini-3-pro-preview"; 
    const prompt = `You are an expert SOW Compliance Officer. Analyze against:\n${RULEBOOKS_CONTEXT}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "application/pdf", data: base64Pdf } }] }],
      config: { responseMimeType: "application/json", responseSchema: analysisSchema }
    });

    return JSON.parse(response.text || '{}') as SOWAnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

interface GenerationResult {
  description: string;
  deliverables: string;
}

const generationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING },
    deliverables: { type: Type.STRING }
  },
  required: ["description", "deliverables"]
};

export const generateSOWContent = async (company: string, division: string, role: string): Promise<GenerationResult> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Generate professional SOW content for:\nCompany: ${company}\nDivision: ${division}\nRole: ${role}\n\nProvide a "Description of Services" and bulleted "Key Deliverables". Tone: Contractual.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", responseSchema: generationSchema }
    });

    return JSON.parse(response.text || '{}') as GenerationResult;
  } catch (error) {
    console.error("Generation failed", error);
    return {
      description: `Standard professional services for ${role} at ${company}.`,
      deliverables: `- Status Reports\n- Technical Deliverables\n- Final Handover`
    };
  }
};
