
import { GenerateContentResponse } from "@google/genai";
import { ai, API_KEY } from './geminiUtils';

const TTS_MODEL_NAME = "gemini-2.5-flash-preview-tts"; // As per user request

export interface TextToSpeechResult {
  audioBase64: string;
  mimeType: string;
}

export const convertTextToSpeech = async (text: string): Promise<TextToSpeechResult> => {
  if (!API_KEY || API_KEY === "MISSING_API_KEY") {
    throw new Error("A chave da API Gemini não está configurada para o serviço de TTS.");
  }

  if (!text.trim()) {
    throw new Error("O texto para conversão em fala não pode estar vazio.");
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TTS_MODEL_NAME,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // As per user's example, using 'Kore'. 
            // For PT-BR, specific voice names like 'pt-BR-Standard-A' or 'pt-BR-Wavenet-B' might be available,
            // consult Gemini documentation for the `gemini-2.5-flash-preview-tts` model.
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });
    
    const audioPart = response.candidates?.[0]?.content?.parts?.[0];
    const audioData = audioPart?.inlineData?.data;
    const audioMimeType = audioPart?.inlineData?.mimeType;

    if (!audioData || !audioMimeType) {
      console.error("Resposta da API de TTS não contém dados de áudio ou mimeType:", response);
      let debugMessage = "Detalhes da resposta da API:\n";
      if (response && response.candidates && response.candidates.length > 0) {
        debugMessage += `Candidato[0].content.parts: ${JSON.stringify(response.candidates[0].content.parts)}\n`;
      } else {
        debugMessage += "Nenhum candidato ou partes de conteúdo encontradas.\n";
      }
      console.error(debugMessage);
      throw new Error("A API de TTS não retornou dados de áudio válidos ou mimeType. Verifique os logs do console para detalhes da resposta da API.");
    }

    return { audioBase64: audioData, mimeType: audioMimeType };

  } catch (error) {
    console.error("Erro ao converter texto para fala:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("Could not find voice")) {
        throw new Error(`Voz não encontrada para TTS. Verifique o nome da voz ('Kore'). Detalhes: ${errorMessage}`);
    }
    throw new Error(`Falha na conversão de texto para fala: ${errorMessage}`);
  }
};
