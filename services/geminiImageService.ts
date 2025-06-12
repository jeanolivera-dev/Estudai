
import { ai, API_KEY } from './geminiUtils';

export const generateIllustrativeImage = async (promptText: string): Promise<string | null> => {
  if (!API_KEY || API_KEY === "MISSING_API_KEY") {
    console.warn("API_KEY não configurada ou inválida para geração de imagem. Imagem não será gerada, usando fallback se disponível no chamador.");
    return null;
  }
  try {
    const fullPrompt = `Uma ilustração clara e educativa sobre: ${promptText}. Estilo de arte digital, vibrante, moderno e conceitual. Sem texto na imagem.`;
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    console.warn("Nenhuma imagem gerada ou dados de imagem ausentes para o prompt:", promptText);
    return null;
  } catch (error: unknown) {
    let errorMessage = "Erro desconhecido ao gerar imagem.";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    if (typeof errorMessage === 'string' && (errorMessage.includes('429') || errorMessage.toUpperCase().includes('RESOURCE_EXHAUSTED') || errorMessage.toUpperCase().includes('QUOTA'))) {
      console.warn(`Falha ao gerar imagem para "${promptText}" devido a limite de quota (ex: 429 RESOURCE_EXHAUSTED). Usando imagem de fallback se disponível no chamador. Detalhes: ${errorMessage}`);
    } else {
      console.error(`Erro ao gerar imagem para o prompt "${promptText}":`, error);
    }
    return null; // Retorna null para qualquer erro, chamador deve lidar com fallback
  }
};
