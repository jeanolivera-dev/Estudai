
import { GenerateContentResponse } from "@google/genai";
import type { EducationalMaterial, ModelChoice, Section, ListaSection, TextoSection, ExemploSection, DestaqueSection, PerguntaReflexivaSection, CodigoSection } from '../types';
import { ai, API_KEY, fileToBase64 } from './geminiUtils';

const PROMPT_TEXT = `
Você é um assistente de IA altamente especializado na criação de material didático detalhado e bem estruturado em PT-BR a partir de documentos PDF.
Analise o conteúdo do arquivo PDF fornecido e transforme-o em um guia educacional rico, interativo e com exemplos de código sempre organizados em seções exclusivas do tipo "codigo".

O resultado DEVE ser um ÚNICO objeto JSON. Não inclua NENHUM texto fora do objeto JSON, nem mesmo marcadores de markdown como \`\`\`json.
O objeto JSON deve seguir ESTRITAMENTE A SEGUINTE ESTRUTURA:
{
  "titulo": "string", // Título geral do material didático
  "topicos": [
    {
      "id": "string", // Identificador único para o tópico (ex: "1", "2.1", "tema-a")
      "titulo": "string", // Título do tópico específico
      "objetivos": [
        "string" // Lista de objetivos de aprendizado para este tópico
      ],
      "secoes": [
        {
          "tipo": "texto",
          "titulo": "string (opcional)",
          "conteudo": "string (markdown permitido)"
        },
        {
          "tipo": "exemplo",
          "titulo": "string (opcional)",
          "conteudo": "string (markdown permitido, pode ser um cenário, caso de uso, etc.)"
        },
        {
          "tipo": "destaque",
          "conteudo": "string (uma frase ou parágrafo curto para enfatizar um ponto chave)"
        },
        {
          "tipo": "lista",
          "titulo": "string (opcional)",
          "itens": ["string"]
        },
        {
          "tipo": "pergunta_reflexiva",
          "conteudo": "string (uma pergunta para estimular o pensamento crítico do aluno)"
        },
        {
          "tipo": "codigo",
          "titulo": "string (opcional, ex: 'Exemplo de Função Python')",
          "conteudo": "string (CÓDIGO PURO, ex: 'def hello():\\n  print(\"Hello World\")\\n')",
          "linguagem": "string (opcional, ex: 'python', 'javascript')"
        }
      ]
    }
  ]
}

EXEMPLO DE OBJETO JSON ESPERADO (ABREVIADO):
{
  "titulo": "Introdução à Programação com Python",
  "topicos": [
    {
      "id": "1",
      "titulo": "O que é Programação?",
      "objetivos": [
        "Entender o conceito de algoritmo.",
        "Compreender a diferença entre linguagem de programação e linguagem natural."
      ],
      "secoes": [
        {
          "tipo": "texto",
          "titulo": "Introdução",
          "conteudo": "Programação é a arte de escrever instruções que dizem ao computador o que fazer. Essas instruções são escritas em linguagens específicas, como Python, Java, etc. Markdown pode ser usado aqui para **negrito** ou _itálico_."
        },
        {
          "tipo": "exemplo",
          "titulo": "Algoritmo no cotidiano",
          "conteudo": "Imagine que você quer fazer café. Os passos que você segue (colocar o pó, ferver a água, misturar, servir) são um algoritmo!"
        }
      ]
    }
  ]
}

REGRAS JSON ESTRITAS E CRÍTICAS:
1.  O resultado DEVE ser UM ÚNICO objeto JSON válido. NENHUM texto fora deste objeto JSON.
2.  Use aspas duplas (e.g., "\\"chave\\"") para todas as chaves e para todos os valores de string.
3.  Strings que contenham caracteres especiais (aspas duplas, barras invertidas, novas linhas) DEVEM ter esses caracteres devidamente escapados (e.g., \\"\\\\\\"", \\"\\\\\\\\\\", \\"\\\\n\\").
4.  VÍRGULAS:
    *   Entre pares chave-valor em um objeto (exceto após o último par).
    *   Entre elementos em um array (exceto após o último elemento).
    *   NUNCA use vírgulas finais (trailing commas) após o último elemento de um array ou o último par chave-valor de um objeto.
5.  GARANTA que todos os colchetes \`[]\` e chaves \`{}\` sejam corretamente abertos, fechados e aninhados.
6.  Verifique novamente a sintaxe do JSON antes de finalizar a resposta. Qualquer erro de sintaxe tornará a resposta inutilizável.

INSTRUÇÕES IMPORTANTES:
- Gere um 'titulo' geral apropriado para o material.
- Para cada tópico, forneça um 'id' único, um 'titulo' claro, uma lista de 'objetivos' e um array de 'secoes'.
- Adapte os tipos de seção ('texto', 'exemplo', 'destaque', 'lista', 'pergunta_reflexiva', 'codigo') para melhor apresentar a informação.
- IMPORTANTE: **Qualquer trecho de código deve estar exclusivamente dentro de uma seção do tipo "codigo"**. Nunca inclua trechos de código em seções de texto ou exemplo.
- O campo 'conteudo' nas seções 'texto', 'exemplo', 'destaque', e 'pergunta_reflexiva' pode usar formatação Markdown simples (negrito, itálico, listas, links).
- Para seções do tipo 'codigo', o campo 'conteudo' DEVE conter o código fonte PURO. A linguagem é opcional mas útil.
- O idioma do material gerado deve ser o mesmo do PDF de entrada, ou português (PT-BR) se o idioma não puder ser determinado.
- Certifique-se de que o conteúdo seja informativo, bem escrito, e adequado para fins educacionais.
- Se o PDF estiver vazio ou não contiver texto relevante, retorne um JSON com um título indicando o problema e um tópico com uma seção explicando que não foi possível gerar o material.
`;

export const generateEducationalMaterialText = async (
  pdfFile: File, 
  modelName: ModelChoice
): Promise<Omit<EducationalMaterial, 'topicos'> & { topicos: Omit<EducationalMaterial['topicos'][0], 'imageUrl'>[] }> => {
  if (!API_KEY || API_KEY === "MISSING_API_KEY") {
    throw new Error("A chave da API Gemini não está configurada. Por favor, configure a variável de ambiente API_KEY.");
  }

  const base64Pdf = await fileToBase64(pdfFile);

  const pdfFilePart = {
    inlineData: {
      mimeType: 'application/pdf',
      data: base64Pdf,
    },
  };

  const textInputPart = {
      text: PROMPT_TEXT
  };
  
  const textResponse: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: [ { parts: [textInputPart, pdfFilePart] } ],
      config: {
          responseMimeType: "application/json",
      }
  });

  console.log("Raw API Text Response from Gemini:", textResponse.text); // Log raw response

  let jsonString = textResponse.text.trim();
  
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonString.match(fenceRegex);
  if (match && match[1]) {
    jsonString = match[1].trim();
  }

  let parsedData: Omit<EducationalMaterial, 'topicos'> & { topicos: Omit<EducationalMaterial['topicos'][0], 'imageUrl'>[] };
  
  try {
    const rawParsedData = JSON.parse(jsonString); 

    if (!rawParsedData || typeof rawParsedData.titulo !== 'string' || !Array.isArray(rawParsedData.topicos)) {
      console.error("Formato JSON inválido - 'titulo' não é string ou 'topicos' não é array na raiz:", rawParsedData);
      throw new Error("A API retornou um formato de dados inesperado para o material textual (estrutura raiz inválida).");
    }

    parsedData = {
        titulo: rawParsedData.titulo,
        topicos: [] 
    };

    const validatedTopics: Omit<EducationalMaterial['topicos'][0], 'imageUrl'>[] = [];

    for (const topic of rawParsedData.topicos) {
        if (
            topic &&
            typeof topic.id === 'string' &&
            typeof topic.titulo === 'string' &&
            Array.isArray(topic.objetivos) &&
            Array.isArray(topic.secoes)
        ) {
            if (!topic.objetivos.every((obj: any) => typeof obj === 'string')) {
                console.warn(`Tópico '${topic.titulo}' (ID: ${topic.id}) possui 'objetivos' inválidos (não é array de strings). Ignorando este tópico.`);
                continue; 
            }

            const validSections: Section[] = [];
            for (const secao of topic.secoes as Section[]) { 
                if (!secao || typeof secao.tipo !== 'string') {
                    console.warn(`Seção inválida (sem 'tipo' ou 'tipo' não é string) no tópico '${topic.titulo}' (ID: ${topic.id}). Ignorando esta seção. Seção:`, secao);
                    continue; 
                }

                let isValidSection = true;
                switch (secao.tipo) {
                    case 'lista':
                        const listaSec = secao as ListaSection;
                        if (!Array.isArray(listaSec.itens) || !listaSec.itens.every(item => typeof item === 'string')) {
                            console.warn(`Seção 'lista' inválida (título: ${listaSec.titulo || 'N/A'}) no tópico '${topic.titulo}'. Itens não são array de strings. Seção:`, listaSec);
                            isValidSection = false;
                        }
                        break;
                    case 'texto':
                    case 'exemplo':
                    case 'destaque':
                    case 'pergunta_reflexiva':
                    case 'codigo':
                        const contentSection = secao as TextoSection | ExemploSection | DestaqueSection | PerguntaReflexivaSection | CodigoSection;
                        if (typeof contentSection.conteudo !== 'string') {
                            console.warn(`Seção '${contentSection.tipo}' inválida (título: ${contentSection.titulo || 'N/A'}) no tópico '${topic.titulo}'. Conteúdo não é string. Seção:`, contentSection);
                            isValidSection = false;
                        }
                        if (secao.tipo === 'codigo' && (secao as CodigoSection).linguagem !== undefined && typeof (secao as CodigoSection).linguagem !== 'string') {
                             console.warn(`Seção 'codigo' inválida (título: ${contentSection.titulo || 'N/A'}) no tópico '${topic.titulo}'. Campo 'linguagem' não é string. Seção:`, contentSection);
                            isValidSection = false;
                        }
                        break;
                    default:
                        const unknownSecao: any = secao;
                        console.warn(`Tipo de seção desconhecido '${unknownSecao.tipo}' no tópico '${topic.titulo}' (título da seção: ${unknownSecao.titulo || 'N/A'}). Ignorando esta seção. Seção:`, unknownSecao);
                        isValidSection = false;
                }

                if (isValidSection) {
                    validSections.push(secao);
                }
            }
            validatedTopics.push({ ...topic, secoes: validSections });

        } else if (topic && typeof (topic as any).tipo === 'string' && (topic as any).conteudo !== undefined) {
            console.warn(
                `Objeto de seção encontrado no nível de tópico (tipo: ${(topic as any).tipo}, título: ${(topic as any).titulo || 'N/A'}). Ignorando este item. Conteúdo preview:`,
                typeof (topic as any).conteudo === 'string' ? (topic as any).conteudo.substring(0, 100) + "..." : "[Conteúdo não é string]"
            );
        } else {
            console.error(
                "Item no array 'topicos' não é um tópico válido (faltando id, titulo, objetivos ou secoes) nem uma seção reconhecível. Ignorando. Item:",
                topic 
            );
        }
    } 

    parsedData.topicos = validatedTopics;

    if (parsedData.topicos.length === 0 && rawParsedData.topicos.length > 0) {
        console.warn("Nenhum tópico válido permaneceu após a validação. O material pode estar completamente malformado ou todos os tópicos/seções foram filtrados. Verifique os logs de aviso/erro anteriores.");
    }

  } catch (e) {
    console.error("Falha ao parsear ou validar JSON da resposta da API de texto:", e);
    console.error("String JSON recebida (limpa de fences, se houver):", jsonString);
    const errorMessage = e instanceof Error ? e.message : "Erro desconhecido ao processar a resposta da API de texto.";
    throw new Error(`Erro ao processar a resposta da API de texto: ${errorMessage}. Verifique o console para a string JSON e detalhes.`);
  }
  return parsedData;
};
