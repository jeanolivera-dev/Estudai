
import { GoogleGenAI } from "@google/genai";

export const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY não configurada. Verifique suas variáveis de ambiente.");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" });

export const GENERIC_IMAGE_URLS = [
  "https://source.unsplash.com/WE_Kv_ZB1l0", 
  "https://source.unsplash.com/My06S-Wg_zc", 
  "https://source.unsplash.com/5fNmWej4tAA", 
  "https://source.unsplash.com/4-EeTnaC1S4", 
  "https://source.unsplash.com/lsyl3kpQgIU", 
  "https://source.unsplash.com/505eectW54k"
];

export let genericImageIndex = 0;
export const incrementGenericImageIndex = () => {
    genericImageIndex++;
};
export const resetGenericImageIndex = () => {
    genericImageIndex = 0;
};


export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
