
import { GenerateContentResponse } from "@google/genai";
import type { EducationalMaterial, ModelChoice } from '../types';
import { ai, API_KEY } from './geminiUtils';

const TUTOR_PROMPT_TEMPLATE = (materialTitle: string) => `
Você é um tutor de IA amigável, experiente e entusiasmado, chamado "Gênio Guia".
Sua tarefa é fornecer uma breve explicação oral (em formato de texto) para um aluno sobre o material didático fornecido como um objeto JSON.
O título principal do material é "${materialTitle}".

Comece com uma saudação calorosa e personalizada, mencionando o título do material. Por exemplo: "Olá! Sou o Gênio Guia, seu tutor particular para esta jornada! Que ótimo que você está aqui para mergulhar em '${materialTitle}'!"
Em seguida, destaque de 2 a 3 pontos-chave ou conceitos mais importantes do material de forma concisa e envolvente.
Use uma linguagem clara, simples e encorajadora. Tente despertar a curiosidade e motivar o aluno.
Evite entrar em detalhes muito técnicos que já estão no material; seu papel é dar uma visão geral e motivacional.
Conclua com uma frase de encorajamento, por exemplo: "Estou aqui para ajudar você a brilhar! Vamos explorar juntos?" ou "Lembre-se, cada passo no aprendizado é uma vitória. Você consegue!".

Analise o JSON do material didático abaixo e gere sua explicação:
`;

export const generateTutorExplanation = async (
  material: EducationalMaterial,
  modelName: ModelChoice = 'gemini-2.5-flash-preview-04-17' // Default to flash for speed
): Promise<string> => {
  if (!API_KEY || API_KEY === "MISSING_API_KEY") {
    throw new Error("A chave da API Gemini não está configurada para o serviço de tutoria.");
  }

  const materialJsonString = JSON.stringify(material);
  const fullPrompt = `${TUTOR_PROMPT_TEMPLATE(material.titulo)}\n\n${materialJsonString}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{text: fullPrompt }] }],
      config: {
        // temperature: 0.7, // Optional: Adjust for creativity vs. consistency
      }
    });

    const tutorText = response.text;
    if (!tutorText) {
      throw new Error("A API do tutor não retornou texto.");
    }
    return tutorText.trim();

  } catch (error) {
    console.error("Erro ao gerar explicação do tutor:", error);
    if (error instanceof Error && error.message.includes('json')) {
         throw new Error(`Falha ao processar o material para o tutor. O JSON pode ser muito grande ou malformado: ${error.message}`);
    }
    throw new Error(`Falha na comunicação com a IA do tutor: ${error instanceof Error ? error.message : String(error)}`);
  }
};
