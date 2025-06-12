
import React from 'react';
import { motion } from 'framer-motion';
import { IconBrainCircuit } from '../components/icons';

const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full pt-12 pb-10 bg-slate-900 text-white"
    >
      <div className="max-w-5xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <IconBrainCircuit className="w-14 h-14 text-sky-500" />
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent"
          >
            Estudaí
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto"
        >
          Transforme PDFs em materiais de estudo organizados, perspicazes e visualmente atraentes com ilustrações geradas por IA.
        </motion.p>
      </div>
    </motion.header>
  );
};

export default Header;