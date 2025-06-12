
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EducationalMaterial } from '../types';
import TopicCard from './TopicCard';
import { IconBrainCircuit, IconMic, IconLoader, IconAlertTriangle } from './icons';
import { generateTutorExplanation } from '../services/geminiTutorService';
import { convertTextToSpeech } from '../services/geminiAudioService';
import type { TextToSpeechResult } from '../services/geminiAudioService';

interface EducationalMaterialDisplayProps {
  material: EducationalMaterial;
}

// Helper function to convert Base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Failed to decode base64 string:", e);
    throw new Error("Invalid Base64 string provided for audio data.");
  }
}

// Helper function to create a WAV header
function createWavHeader(
  dataLength: number,
  numChannels: number,
  sampleRate: number,
  bitsPerSample: number
): Uint8Array {
  const headerBuffer = new ArrayBuffer(44);
  const view = new DataView(headerBuffer);

  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;

  // RIFF identifier
  view.setUint8(0, 'R'.charCodeAt(0));
  view.setUint8(1, 'I'.charCodeAt(0));
  view.setUint8(2, 'F'.charCodeAt(0));
  view.setUint8(3, 'F'.charCodeAt(0));
  // RIFF chunk size (36 + dataLength)
  view.setUint32(4, 36 + dataLength, true);
  // WAVE identifier
  view.setUint8(8, 'W'.charCodeAt(0));
  view.setUint8(9, 'A'.charCodeAt(0));
  view.setUint8(10, 'V'.charCodeAt(0));
  view.setUint8(11, 'E'.charCodeAt(0));
  // FMT sub-chunk identifier
  view.setUint8(12, 'f'.charCodeAt(0));
  view.setUint8(13, 'm'.charCodeAt(0));
  view.setUint8(14, 't'.charCodeAt(0));
  view.setUint8(15, ' '.charCodeAt(0));
  // FMT chunk size (16 for PCM)
  view.setUint32(16, 16, true);
  // Audio format (1 for PCM)
  view.setUint16(20, 1, true);
  // Number of channels
  view.setUint16(22, numChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint32(28, byteRate, true);
  // Block align (NumChannels * BitsPerSample/8)
  view.setUint16(32, blockAlign, true);
  // Bits per sample
  view.setUint16(34, bitsPerSample, true);
  // DATA sub-chunk identifier
  view.setUint8(36, 'd'.charCodeAt(0));
  view.setUint8(37, 'a'.charCodeAt(0));
  view.setUint8(38, 't'.charCodeAt(0));
  view.setUint8(39, 'a'.charCodeAt(0));
  // DATA chunk size (dataLength)
  view.setUint32(40, dataLength, true);

  return new Uint8Array(headerBuffer);
}


const EducationalMaterialDisplay: React.FC<EducationalMaterialDisplayProps> = ({ material }) => {
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [tutorStatusMessage, setTutorStatusMessage] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleCallTutor = async () => {
    setIsTutorLoading(true);
    setTutorError(null);
    setTutorStatusMessage("Preparando para chamar o tutor...");

    // Revoke previous object URL if it exists to prevent memory leaks
    if (audioRef.current && audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
    }

    try {
      setTutorStatusMessage("Gerando explicação do tutor...");
      const tutorText = await generateTutorExplanation(material);

      setTutorStatusMessage("Convertendo explicação para áudio...");
      const { audioBase64, mimeType: originalMimeType }: TextToSpeechResult = await convertTextToSpeech(tutorText);
      
      setTutorStatusMessage("Processando dados de áudio...");
      const audioBytes = base64ToUint8Array(audioBase64);
      let audioBlob: Blob;
      let effectiveMimeType = originalMimeType;

      // Check if audio is L16 PCM and needs WAV conversion
      // Gemini TTS for L16 typically uses rate=24000, 16 bits, 1 channel
      if (originalMimeType.toLowerCase().startsWith('audio/l16') || originalMimeType.toLowerCase().startsWith('audio/x-raw-int')) {
        console.log(`Original MIME type is ${originalMimeType}, attempting WAV conversion.`);
        const sampleRate = 24000; // Common for Gemini L16 output
        const bitsPerSample = 16;  // Common for L16
        const numChannels = 1;     // Typically mono for TTS
        
        const wavHeader = createWavHeader(audioBytes.length, numChannels, sampleRate, bitsPerSample);
        const wavBytes = new Uint8Array(wavHeader.length + audioBytes.length);
        wavBytes.set(wavHeader, 0);
        wavBytes.set(audioBytes, wavHeader.length);
        
        audioBlob = new Blob([wavBytes], { type: 'audio/wav' });
        effectiveMimeType = 'audio/wav';
        console.log("Converted to WAV format.");
      } else {
        audioBlob = new Blob([audioBytes], { type: originalMimeType });
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setTutorStatusMessage("Reproduzindo áudio...");
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.load(); // Ensure the new source is loaded
        audioRef.current.play().then(() => {
             setTutorStatusMessage(''); // Clear message on successful playback start
        }).catch(playError => {
            console.error("Erro ao tentar reproduzir áudio:", playError);
            if (playError instanceof DOMException && playError.name === 'NotSupportedError') {
                 setTutorError(`Formato de áudio (${effectiveMimeType}) não suportado ou dados inválidos. Verifique o console.`);
            } else {
                 setTutorError("Seu navegador impediu a reprodução automática do áudio ou ocorreu um erro. Por favor, clique no play se disponível, ou verifique as configurações do navegador.");
            }
            setTutorStatusMessage('');
        });
      }
    } catch (err) {
      console.error("Erro no processo do tutor:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido com o tutor.";
      setTutorError(errorMessage);
      setTutorStatusMessage('');
    } finally {
      setIsTutorLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto px-4"
    >
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-sky-900/50 rounded-full mb-6 border border-sky-700">
           <IconBrainCircuit className="w-14 h-14 text-sky-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            {material.titulo}
        </h1>
        <p className="text-xl text-slate-400">Seu material didático gerado por IA está pronto!</p>
      </header>

      <div className="my-8 flex flex-col items-center space-y-3">
        <button
          onClick={handleCallTutor}
          disabled={isTutorLoading}
          className="flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          aria-live="polite"
          aria-busy={isTutorLoading}
        >
          {isTutorLoading ? (
            <>
              <IconLoader className="w-5 h-5 mr-2 animate-spin" />
              <span>{tutorStatusMessage || "Processando..."}</span>
            </>
          ) : (
            <>
              <IconMic className="w-5 h-5 mr-2" />
              <span>Chamar o Tutor</span>
            </>
          )}
        </button>
        <AnimatePresence>
        {tutorError && (
            <motion.div
                key="tutorError"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 p-3 bg-red-900/70 border border-red-700 text-red-300 rounded-md shadow-lg w-full max-w-md text-sm flex items-start space-x-2"
                role="alert"
            >
                <IconAlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{tutorError}</span>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
      
      {/* Styled container for the audio player */}
      <div className="w-full max-w-md mx-auto mt-6 mb-4 p-3 bg-slate-700 rounded-xl shadow-xl border border-slate-600">
        <audio 
          ref={audioRef} 
          className="w-full" // Audio element takes full width of its new parent
          controls 
          preload="auto" 
        />
      </div>

      <div className="space-y-10">
        {material.topicos.map((topic, index) => (
          <TopicCard key={topic.id || index} topic={topic} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default EducationalMaterialDisplay;
