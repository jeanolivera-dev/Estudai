import React from 'react';
import { IconLoader } from './icons';

interface LoadingSpinnerProps {
  message?: string;
  elapsedTime?: number;
  progress?: number;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Processando...',
  elapsedTime = 0,
  progress = 0,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-10 w-full text-slate-300"
      role="status"
      aria-live="polite"
    >
      <IconLoader className="w-16 h-16 animate-spin text-sky-500" aria-hidden="true" />

      <p className="mt-6 text-xl font-semibold tracking-tight text-center">{message}</p>

      <div className="w-full max-w-md mt-6 space-y-3" aria-label="Indicador de progresso">
        <div className="flex justify-between text-sm font-mono text-slate-400">
          <span>Tempo decorrido: {formatTime(elapsedTime)}</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner" role="presentation">
          <div
            className="bg-sky-500 h-3 rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
