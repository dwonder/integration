import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY || ''; // In a real app, manage this securely
  // Fallback for demo purposes if env is missing in this specific sandbox
  if (!apiKey) {
    console.warn("API_KEY is missing. Gemini features will run in mock mode or fail.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAssistantResponse = async (
  query: string, 
  context?: string
): Promise<string> => {
  try {
    const ai = getClient();
    const systemInstruction = `You are an expert Air Cargo Manifest AI Assistant for Bayward Agents. 
    You help users navigate the National Single Window (NSW) integration.
    You understand IATA XML standards (XFFM, XFWB).
    
    If the user asks about error codes:
    - Fault 0: Success
    - Fault 4: Missing Mandatory Details
    
    If the user asks to generate XML, provide a valid IATA XFFM or XFWB snippet based on their description.
    Keep answers concise and professional.
    ${context ? `Current Context: ${context}` : ''}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I apologize, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently offline. Please check your API Key configuration.";
  }
};

export const generateSampleManifestData = async (): Promise<string> => {
   try {
    const ai = getClient();
    const prompt = `Generate a sample Air Cargo Manifest.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            messageId: { type: Type.STRING },
            flightNumber: { type: Type.STRING, description: "e.g. SQ-123" },
            date: { type: Type.STRING, description: "YYYY-MM-DD" },
            departurePort: { type: Type.STRING, description: "3 letter IATA" },
            arrivalPort: { type: Type.STRING, description: "3 letter IATA" },
            departureDate: { type: Type.STRING, description: "ISO string" },
            arrivalDate: { type: Type.STRING, description: "ISO string" },
            totalPieces: { type: Type.NUMBER },
            totalWeight: { type: Type.NUMBER },
          },
          required: ["messageId", "flightNumber", "date", "departurePort", "arrivalPort", "departureDate", "arrivalDate", "totalPieces", "totalWeight"]
        }
      }
    });

    return response.text || "{}";
   } catch (error) {
     return JSON.stringify({
        messageId: "FFM-" + Math.floor(Math.random() * 1000),
        flightNumber: "BW-999",
        date: new Date().toISOString().split('T')[0],
        departurePort: "SIN",
        arrivalPort: "LOS",
        departureDate: new Date().toISOString(),
        arrivalDate: new Date().toISOString(),
        totalPieces: 50,
        totalWeight: 1500.50
     });
   }
};