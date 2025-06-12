import type { EducationalMaterial, Topic, ModelChoice } from '../types';
import { generateEducationalMaterialText } from './geminiTextService';
import { generateIllustrativeImage } from './geminiImageService';
import { API_KEY } from './geminiUtils'; // GENERIC_IMAGE_URLS and related functions are no longer used here

export const generateEducationalMaterial = async (
  pdfFile: File, 
  modelName: ModelChoice,
  generateAiImages: boolean // Parameter to control AI image generation
): Promise<EducationalMaterial> => {
  if (!API_KEY || API_KEY === "MISSING_API_KEY") {
    throw new Error("A chave da API Gemini não está configurada. Por favor, configure a variável de ambiente API_KEY.");
  }

  try {
    const textualMaterial = await generateEducationalMaterialText(pdfFile, modelName); 
    
    const topicsWithImages: Topic[] = [];
    // resetGenericImageIndex(); // No longer needed

    for (const topic of textualMaterial.topicos) {
      const imagePrompt = topic.titulo.substring(0, 200); // Max prompt length for safety
      let imageUrl: string | null = null;

      if (generateAiImages) { // Check the flag before attempting AI generation
        imageUrl = await generateIllustrativeImage(imagePrompt);
        if (!imageUrl) {
            console.log(`Falha ao gerar imagem AI para o tópico: "${topic.titulo}". Nenhuma imagem será exibida.`);
        }
      } else {
        console.log(`Geração de imagem AI desabilitada para o tópico: "${topic.titulo}". Nenhuma imagem será exibida.`);
      }
      
      // If imageUrl is still null (either AI generation was skipped or failed), it remains null.
      // No fallback to GENERIC_IMAGE_URLS.
      
      topicsWithImages.push({ ...topic, imageUrl: imageUrl });
    }
    
    return { ...textualMaterial, topicos: topicsWithImages };

  } catch (error) {
    console.error("Erro ao gerar material didático (orquestrador):", error);
    if (error instanceof Error) {
        if (error.message.includes("API retornou um formato de dados inesperado") || 
            error.message.includes("A chave da API Gemini não está configurada") ||
            error.message.includes("Falha na comunicação com a API Gemini")) {
            throw error; 
        }
        throw new Error(`Falha na orquestração da geração de material: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido durante a geração do material didático.");
  }
};