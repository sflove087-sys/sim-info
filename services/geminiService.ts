
import { GoogleGenAI, Type } from "@google/genai";
import type { NidInfo } from '../types';

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve((reader.result as string).split(',')[1]);
      } else {
        resolve(''); // or reject
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export const extractNidInfo = async (frontImage: File, backImage: File): Promise<NidInfo | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    throw new Error("API key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const frontImagePart = await fileToGenerativePart(frontImage);
  const backImagePart = await fileToGenerativePart(backImage);

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The person's full name in Bengali as written on the card." },
      fatherName: { type: Type.STRING, description: "The person's father's name in Bengali as written on the card." },
      motherName: { type: Type.STRING, description: "The person's mother's name in Bengali as written on the card." },
      dateOfBirth: { type: Type.STRING, description: "The person's date of birth. Format it as YYYY-MM-DD." },
      nidNumber: { type: Type.STRING, description: "The National ID number, which can be 10, 13 or 17 digits long." },
      address: { type: Type.STRING, description: "The person's full address as written on the back of the card, including village, post office, upazila, and district, all in Bengali in a single string." },
    },
    required: ["name", "fatherName", "motherName", "dateOfBirth", "nidNumber", "address"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: "You are an expert at reading Bangladeshi National ID cards. Extract the information from the provided front and back images. Format the date of birth as YYYY-MM-DD. Provide the response in JSON format conforming to the provided schema. Ensure all textual data is in Bengali script as it appears on the card." },
          frontImagePart,
          backImagePart,
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonStr = response.text.trim();
    if (!jsonStr) {
        console.error("Gemini API returned an empty response.");
        return null;
    }
    const data = JSON.parse(jsonStr);
    return data as NidInfo;

  } catch (error) {
    console.error("Error calling or parsing Gemini API response:", error);
    return null;
  }
};


export const detectAndCropNid = async (imageFile: File): Promise<File | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is missing.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      is_card_present: { type: Type.BOOLEAN },
      bounding_box: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER, description: "X coordinate of the top-left corner (from 0 to 1)" },
          y: { type: Type.NUMBER, description: "Y coordinate of the top-left corner (from 0 to 1)" },
          width: { type: Type.NUMBER, description: "Width of the card (from 0 to 1)" },
          height: { type: Type.NUMBER, description: "Height of the card (from 0 to 1)" },
        },
      },
    },
  };
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: "Analyze this image to detect if a rectangular ID card is present. If it is, provide its bounding box coordinates (x, y, width, height) as normalized values from 0 to 1. If no card is clearly visible, set 'is_card_present' to false." },
          imagePart
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonStr = response.text.trim();
    const data = JSON.parse(jsonStr);

    if (!data.is_card_present || !data.bounding_box) {
      return null;
    }
    
    const { x, y, width, height } = data.bounding_box;

    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Could not get canvas context');

            const sourceX = x * image.naturalWidth;
            const sourceY = y * image.naturalHeight;
            const sourceWidth = width * image.naturalWidth;
            const sourceHeight = height * image.naturalHeight;

            canvas.width = sourceWidth;
            canvas.height = sourceHeight;

            ctx.drawImage(
              image,
              sourceX, sourceY, sourceWidth, sourceHeight,
              0, 0, sourceWidth, sourceHeight
            );
            
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], imageFile.name, { type: 'image/png' }));
                } else {
                    reject('Failed to create blob');
                }
            }, 'image/png', 1);
        };
        image.onerror = reject;
        image.src = URL.createObjectURL(imageFile);
    });

  } catch (error) {
    console.error("Error in detectAndCropNid:", error);
    return null;
  }
};
