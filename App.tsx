import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from './components/FileUpload';
import EducationalMaterialDisplay from './components/EducationalMaterialDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { generateEducationalMaterial } from './services/geminiService';
import type { EducationalMaterial, ModelSpeed } from './types';
import { MODEL_OPTIONS } from './types';
import { IconAlertTriangle, IconCheckCircle2, IconZap, IconSparkles } from './components/icons';
import MainLayout from './layout/MainLayout';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [educationalMaterial, setEducationalMaterial] = useState<EducationalMaterial | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(0);
  const [modelSpeed, setModelSpeed] = useState<ModelSpeed>('fast');
  const [useAiIllustrations, setUseAiIllustrations] = useState<boolean>(true); // New state for AI illustrations

  const ESTIMATED_TOTAL_TIME_SECONDS_FOR_95_PERCENT = modelSpeed === 'pro' ? 180 : 120; 

  useEffect(() => {
    let intervalId: number | undefined = undefined;

    if (isLoading) {
      setElapsedTime(0);
      setSimulatedProgress(0);

      intervalId = window.setInterval(() => {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + 1;
          setSimulatedProgress(() => {
            const progress = (newTime / ESTIMATED_TOTAL_TIME_SECONDS_FOR_95_PERCENT) * 95;
            return Math.min(progress, 95); 
          });
          return newTime;
        });
      }, 1000);
    } else {
      if (educationalMaterial) { 
        setSimulatedProgress(100);
      }
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isLoading, educationalMaterial, error, ESTIMATED_TOTAL_TIME_SECONDS_FOR_95_PERCENT]);


  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setEducationalMaterial(null); 
    setError(null); 
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Por favor, selecione um arquivo PDF primeiro.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEducationalMaterial(null);
    
    const selectedModelIdentifier = MODEL_OPTIONS[modelSpeed];

    try {
      // Pass the useAiIllustrations state to the generation service
      const material = await generateEducationalMaterial(selectedFile, selectedModelIdentifier, useAiIllustrations);
      setEducationalMaterial(material);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
      console.error("Detailed error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetState = () => {
    setSelectedFile(null);
    setEducationalMaterial(null);
    setError(null);
    setElapsedTime(0);
    setSimulatedProgress(0);
    setModelSpeed('fast');
    setUseAiIllustrations(true); // Reset AI illustration choice
  };

  const modelSelectorButtonClasses = (isActive: boolean) =>
    `flex-1 sm:flex-none px-6 py-3 text-sm sm:text-base font-medium rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2`;

  return (
    <MainLayout>
        {!educationalMaterial && (
          <>
            <motion.div 
                initial={{ opacity:0, scale: 0.90 }} 
                animate={{ opacity:1, scale: 1}}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full flex justify-center" 
            >
                <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="max-w-xl w-full px-4 flex flex-col sm:flex-row gap-3 mt-6 mb-2"
            >
              <button
                onClick={() => setModelSpeed('fast')}
                disabled={isLoading}
                className={`${modelSelectorButtonClasses(modelSpeed === 'fast')} 
                            ${modelSpeed === 'fast' ? 'bg-sky-500 text-white focus:ring-sky-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 focus:ring-slate-500'}`}
                aria-pressed={modelSpeed === 'fast'}
              >
                <IconZap className="w-5 h-5" />
                <span>Rápido (Flash)</span>
              </button>
              <button
                onClick={() => setModelSpeed('pro')}
                disabled={isLoading}
                className={`${modelSelectorButtonClasses(modelSpeed === 'pro')} 
                            ${modelSpeed === 'pro' ? 'bg-purple-600 text-white focus:ring-purple-500' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 focus:ring-slate-500'}`}
                aria-pressed={modelSpeed === 'pro'}
              >
                <IconSparkles className="w-5 h-5" />
                <span>Avançado (Pro)</span>
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="max-w-xl w-full px-4 text-center"
            >
              <p className="text-sm text-slate-500 italic">
                O modelo "Rápido" é otimizado para velocidade. O "Avançado" pode oferecer maior qualidade, mas leva mais tempo. <br />
                Quanto maior o PDF, mais genéricas tendem a ser as respostas. Para resultados mais precisos, prefira arquivos mais enxutos.
              </p>
            </motion.div>

            {/* AI Illustrations Toggle Switch */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
              className="flex items-center justify-center space-x-3 mt-4 mb-2 max-w-xl w-full px-4"
            >
              <label htmlFor="ai-illustrations-toggle" className="text-slate-300 text-sm sm:text-base font-medium cursor-pointer">
                Gerar Ilustrações com IA
              </label>
              <button
                type="button"
                role="switch"
                id="ai-illustrations-toggle"
                aria-checked={useAiIllustrations}
                onClick={() => !isLoading && setUseAiIllustrations(!useAiIllustrations)}
                disabled={isLoading}
                className={`${
                  useAiIllustrations ? 'bg-sky-500' : 'bg-slate-600'
                } relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="sr-only">Ativar ou desativar geração de ilustrações por IA</span>
                <span
                  aria-hidden="true"
                  className={`${
                    useAiIllustrations ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </motion.div>
          </>
        )}

        {selectedFile && !educationalMaterial && !isLoading && (
          <motion.button
            initial={{ opacity:0, y: 10 }}
            animate={{ opacity:1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile}
            className="px-10 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-3 transform hover:scale-105 active:scale-95"
          >
            <IconCheckCircle2 className="w-6 h-6" />
            <span>Gerar Material Didático</span>
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, transition: {duration: 0.2} }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-lg" 
            >
              <LoadingSpinner 
                message="Analisando PDF, gerando seu material e ilustrações..." 
                elapsedTime={elapsedTime}
                progress={simulatedProgress}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, transition: {duration: 0.2} }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-6 p-5 bg-red-900/60 border border-red-700 text-red-300 rounded-lg shadow-xl w-full max-w-2xl flex items-start space-x-4"
              role="alert"
            >
              <IconAlertTriangle className="w-7 h-7 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-lg text-red-200">Erro ao Processar</p>
                <p className="text-md">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {educationalMaterial && (
          <div className="w-full">
            <EducationalMaterialDisplay material={educationalMaterial} />
             <motion.button
                initial={{ opacity:0, y: 20 }}
                animate={{ opacity:1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                onClick={resetState}
                className="mt-16 mx-auto block px-8 py-3 bg-slate-700 text-slate-200 font-medium rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
                Gerar Novo Material
            </motion.button>
          </div>
        )}
    </MainLayout>
  );
};

export default App;