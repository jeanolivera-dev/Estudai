import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200 selection:bg-sky-500 selection:text-white">
      <Header />
      
      <main
        id="conteudo-principal"
        role="main"
        className="flex-grow w-full flex flex-col items-center px-4 py-10 sm:py-12 space-y-10"
      >
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
