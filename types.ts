
// Base para todas as seções, garantindo que 'tipo' esteja presente.
export interface SectionBase {
  tipo: string;
  titulo?: string; // Título opcional para a maioria das seções
}

export interface TextoSection extends SectionBase {
  tipo: 'texto';
  conteudo: string;
}

export interface ExemploSection extends SectionBase {
  tipo: 'exemplo';
  conteudo: string;
}

export interface DestaqueSection extends SectionBase {
  tipo: 'destaque';
  // 'titulo' não é comum para destaque, mas pode ser adicionado se necessário
  conteudo: string;
}

export interface ListaSection extends SectionBase {
  tipo: 'lista';
  itens: string[];
}

export interface PerguntaReflexivaSection extends SectionBase {
  tipo: 'pergunta_reflexiva';
  // 'titulo' não é comum para pergunta reflexiva
  conteudo: string;
}

export interface CodigoSection extends SectionBase {
  tipo: 'codigo';
  conteudo: string; // O conteúdo será o código puro
  linguagem?: string; // Opcional, para especificar a linguagem
}

// União de todos os tipos de seção possíveis
export type Section = 
  | TextoSection 
  | ExemploSection 
  | DestaqueSection 
  | ListaSection 
  | PerguntaReflexivaSection 
  | CodigoSection;

export interface Topic {
  id: string;
  titulo: string;
  objetivos: string[];
  secoes: Section[];
  imageUrl?: string; 
}

export interface EducationalMaterial {
  titulo: string;
  topicos: Topic[];
}

// Model Selection
export const MODEL_OPTIONS = {
  fast: 'gemini-2.5-flash-preview-04-17', // Updated model
  pro: 'gemini-2.5-pro-preview-06-05',
} as const;

export type ModelSpeed = keyof typeof MODEL_OPTIONS;
export type ModelChoice = typeof MODEL_OPTIONS[ModelSpeed];


// Ensure process.env.API_KEY is declared for TypeScript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY?: string;
    }
  }
}