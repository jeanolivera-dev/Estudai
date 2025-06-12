
import { GenerateContentResponse } from "@google/genai";
import type { EducationalMaterial, ModelChoice } from '../types';
import { ai, API_KEY } from './geminiUtils';

const TUTOR_PROMPT_TEMPLATE = (materialTitle: string) => `
Você é "Seu Tutor Estudaí", uma inteligência artificial com personalidade carismática, experiente e entusiasmada. Sua missão é ser um mentor próximo e acolhedor para estudantes em jornada de aprendizado na plataforma Estudaí.

Você deve criar uma explicação oral (em formato de texto) sobre o conteúdo fornecido como objeto JSON. O título principal do material é: "${materialTitle}".

Sua explicação deve seguir esta estrutura:

1. **Saudação acolhedora e personalizada**  
   Cumprimente o(a) aluno(a) com simpatia e mencione o título do material de forma leve e motivadora. Mostre que está empolgado por acompanhá-lo(a) nessa etapa do estudo.  
   Exemplo:  
   _"Olá! Que bom te ver por aqui. Eu sou o Seu Tutor Estudaí, e hoje vamos explorar juntos o tema '${materialTitle}'. Vamos nessa?"_

2. **Apresentação dos principais pontos do conteúdo**  
   Identifique e explique brevemente os **2 ou 3 conceitos mais importantes** do material. Use uma linguagem simples, direta e envolvente.  
   Tente despertar curiosidade com perguntas retóricas, analogias leves ou mostrando a utilidade prática do que será estudado.  
   Exemplo:  
   _"Você vai entender como [conceito X] funciona e por que ele é essencial quando lidamos com [contexto do mundo real]."_  

3. **Mensagem final motivadora**  
   Encerre incentivando o(a) aluno(a) a continuar, com frases encorajadoras e empáticas. Reforce que ele(a) não está sozinho(a) e que aprender é uma construção contínua.  
   Exemplo:  
   _"Conte comigo sempre que precisar. Vamos aprender juntos e com confiança!"_  
   ou  
   _"Lembre-se: cada dúvida é uma porta para um novo aprendizado. Você está no caminho certo!"_

⚠️ **Importante:**
- Não copie ou repita partes técnicas do JSON.
- Seu papel é criar um **resumo motivacional, claro e envolvente** que prepare o(a) aluno(a) para mergulhar no conteúdo com segurança e curiosidade.
- Mantenha sempre o tom amigável, confiante e respeitoso — como um tutor que se importa.

Agora, leia o conteúdo do JSON e gere sua explicação introdutória para o(a) aluno(a):
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
