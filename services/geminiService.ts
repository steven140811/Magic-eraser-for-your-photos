import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Removes watermarks from an image using Gemini 2.5 Flash Image.
 * @param base64Image The base64 string of the image (without the data prefix).
 * @param mimeType The mime type of the image.
 * @returns The base64 string of the processed image.
 */
export const removeWatermark = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = getAiClient();
  
  // Clean the base64 string if it contains the data prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: "Remove all watermarks, logos, timestamps, and text overlays from this image. Reconstruct the background behind them seamlessly to look natural. Do not alter the main subject or the overall style of the image. Output only the modified image.",
          },
        ],
      },
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error("No image data received from the model.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
