# Estudaí: Gerador de Material Didático com IA

Estudaí é uma aplicação web que utiliza a API Gemini do Google para transformar arquivos PDF em materiais didáticos estruturados e visualmente atraentes. O usuário faz o upload de um PDF, escolhe entre um modelo de IA "Rápido" (Flash) ou "Avançado" (Pro), e a IA o processa, gerando tópicos de estudo, objetivos de aprendizagem, seções de conteúdo diversificado e ilustrações para cada tópico. Adicionalmente, oferece um "Tutor IA" que fornece explicações em áudio sobre o material gerado.

## ✨ Funcionalidades

*   **Upload de PDF:** Permite que o usuário envie um arquivo PDF para processamento.
*   **Seleção de Modelo de IA para Conteúdo:** O usuário pode escolher entre:
    *   **Rápido (Flash):** `gemini-2.5-flash-preview-04-17` - otimizado para velocidade.
    *   **Avançado (Pro):** `gemini-2.5-pro-preview-06-05` - pode oferecer maior qualidade e capacidade de processamento, mas com maior tempo de resposta.
*   **Geração de Conteúdo Estruturado:** A IA analisa o PDF e cria:
    *   Um título geral para o material.
    *   Tópicos de estudo distintos.
    *   Objetivos de aprendizagem para cada tópico.
    *   Múltiplas seções de conteúdo dentro de cada tópico, incluindo:
        *   `texto`: Explicações detalhadas.
        *   `exemplo`: Cenários práticos ou casos de uso.
        *   `destaque`: Pontos chave para ênfase.
        *   `lista`: Informações em formato de lista.
        *   `pergunta_reflexiva`: Questões para estimular o pensamento crítico.
        *   `codigo`: Blocos de código com syntax highlighting (usando `react-syntax-highlighter`).
*   **Geração de Imagens Ilustrativas com IA (Opcional):**
    *   Para cada tópico principal, a IA pode gerar uma imagem relevante (usando o modelo `imagen-3.0-generate-002`) para enriquecer o material.
    *   O usuário pode optar por habilitar ou desabilitar esta funcionalidade.
    *   Se a geração de imagens AI estiver desabilitada ou falhar, nenhuma imagem ilustrativa específica será exibida para o tópico.
*   **Tutor IA com Áudio (Text-to-Speech):**
    *   Um botão "Chamar o Tutor" permite ao usuário ouvir uma explicação resumida e motivacional do material gerado.
    *   O texto da explicação é gerado pelo modelo `gemini-2.5-flash-preview-04-17`.
    *   O texto é convertido em áudio usando o modelo TTS `gemini-2.5-flash-preview-tts` (voz 'Kore').
    *   Inclui conversão de áudio L16 PCM para formato WAV para melhor compatibilidade.
*   **Interface Moderna e Responsiva:** Construída com React, Tailwind CSS e Framer Motion para uma experiência de usuário fluida.
*   **Feedback de Carregamento:** Exibe um spinner de carregamento com tempo decorrido e progresso simulado.
*   **Tratamento de Erros:** Apresenta mensagens de erro claras.
*   **Visualização Estilizada:** O material gerado é exibido em cards bem formatados.

## 🚀 Tecnologias Utilizadas

*   **Frontend:**
    *   React 19.1.0
    *   TypeScript
    *   Tailwind CSS
    *   Framer Motion
    *   Lucide React (ícones)
    *   React Markdown
    *   React Syntax Highlighter
*   **API:**
    *   Google Gemini API (`@google/genai`):
        *   **Geração de Texto:** `gemini-2.5-flash-preview-04-17` (Opção "Rápido"), `gemini-2.5-pro-preview-06-05` (Opção "Avançado")
        *   **Geração de Imagem:** `imagen-3.0-generate-002`
        *   **Text-to-Speech (TTS):** `gemini-2.5-flash-preview-tts`
*   **Build/Dev Tools:**
    *   ESM (ECMAScript Modules) via import maps no `index.html`.

## ⚙️ Setup e Instalação

1.  **Clone o repositório (se aplicável).**
2.  **Variável de Ambiente para API Key:**
    Este projeto **requer** uma API Key do Google Gemini. Configure-a como `process.env.API_KEY`.
    *   A forma como esta variável é disponibilizada depende do seu ambiente de desenvolvimento/hospedagem (ex: Glitch, Vite, etc.).
    *   O código acessa `process.env.API_KEY` diretamente.

3.  **Dependências:**
    As dependências são carregadas via import maps definidos no arquivo `index.html`. Nenhuma instalação explícita com `npm install` ou `yarn` é necessária se você estiver usando um ambiente que suporte import maps nativamente ou através de um polyfill.

## 🏃 Como Executar

1.  Garanta que a variável de ambiente `API_KEY` esteja configurada e acessível ao seu ambiente de execução.
2.  Abra `index.html` em um navegador moderno que suporte módulos ES6 e import maps (ou use um servidor de desenvolvimento local que os processe).

## 📂 Estrutura do Projeto

```
.
├── components/
│   ├── EducationalMaterialDisplay.tsx
│   ├── FileUpload.tsx
│   ├── icons.tsx
│   ├── LoadingSpinner.tsx
│   └── TopicCard.tsx
├── layout/
│   ├── Footer.tsx
│   ├── Header.tsx
│   └── MainLayout.tsx
├── services/
│   ├── geminiAudioService.ts
│   ├── geminiImageService.ts
│   ├── geminiService.ts          # Orquestrador principal
│   ├── geminiTextService.ts
│   ├── geminiTutorService.ts
│   └── geminiUtils.ts
├── App.tsx
├── index.html
├── index.tsx
├── metadata.json
├── Readme.md
└── types.ts
```

## 🤖 Uso da API Gemini

*   A API Key é acessada a partir de `process.env.API_KEY` (configurado em `services/geminiUtils.ts`).
*   **Geração de Texto:** `services/geminiTextService.ts` envia o PDF (codificado em base64) e um prompt detalhado para o modelo Gemini selecionado pelo usuário. `responseMimeType: "application/json"` é usado para esperar uma resposta JSON estruturada.
*   **Geração de Imagem:** `services/geminiImageService.ts` usa o modelo `imagen-3.0-generate-002` para gerar ilustrações baseadas nos títulos dos tópicos.
*   **Geração de Explicação do Tutor:** `services/geminiTutorService.ts` gera um texto de explicação usando `gemini-2.5-flash-preview-04-17`.
*   **Conversão Texto-para-Fala (TTS):** `services/geminiAudioService.ts` converte o texto do tutor em áudio usando `gemini-2.5-flash-preview-tts`.
*   **Tratamento de Erros:** Implementado nos serviços para capturar e relatar falhas da API. A geração de imagens retorna `null` em caso de falha, e o frontend lida com a ausência de imagem.

## 🎨 Pontos de Customização

*   **Prompts da IA:**
    *   Para geração de material didático: `PROMPT_TEXT` em `services/geminiTextService.ts`.
    *   Para explicação do tutor: `TUTOR_PROMPT_TEMPLATE` em `services/geminiTutorService.ts`.
*   **Estilos:** Primariamente definidos com Tailwind CSS diretamente nos componentes React e no `index.html`.
*   **Temas do Syntax Highlighter:** O estilo `okaidia` é usado em `components/TopicCard.tsx`. Pode ser alterado para outros temas disponíveis em `react-syntax-highlighter`.
*   **Voz do TTS:** Atualmente configurada para 'Kore' em `services/geminiAudioService.ts`. Pode ser alterada para outras vozes suportadas pelo modelo TTS.
