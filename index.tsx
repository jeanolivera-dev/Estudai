
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Assuming types.ts is at the root for global type declarations if needed by index.tsx itself
// import './types'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Elemento root não encontrado no DOM.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
