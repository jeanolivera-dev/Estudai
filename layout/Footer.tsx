
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-16 pt-10 pb-8 text-center text-sm bg-slate-900 border-t border-slate-800 text-slate-500">
      <div className="max-w-4xl mx-auto px-4 space-y-2">
        <p>
          &copy; {new Date().getFullYear()} <strong className="text-slate-300">Estudaí</strong>. Todos os direitos reservados.
        </p>
        <p>
          Desenvolvido com{" "}
          <span className="text-cyan-400 font-medium">React</span>,{" "}
          <span className="text-sky-400 font-medium">Tailwind CSS</span> e{" "}
          <span className="text-emerald-400 font-medium">Gemini API</span>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;