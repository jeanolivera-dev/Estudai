import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Topic, Section } from '../types';
import { 
  IconLightbulb, 
  IconFileText, 
  IconCode, 
  IconListChecks, 
  IconQuote, 
  IconHelpCircle,
  IconCheckCircle2
} from './icons';
import type { ReactMarkdownProps } from 'react-markdown';

// Define CodeProps based on ReactMarkdownProps to ensure correct typing for the custom code component
type ActualCodeProps = React.ComponentProps<NonNullable<ReactMarkdownProps['components']['code']>>;

interface TopicCardProps {
  topic: Topic;
  index: number;
}

const SectionRenderer: React.FC<{ secao: Section; topicId: string; sectionIndex: number }> = ({ secao, topicId, sectionIndex }) => {
  const sectionKey = `${topicId}-secao-${sectionIndex}-${secao.tipo}`;
  const proseClasses = "prose prose-slate prose-invert max-w-none text-slate-300 prose-headings:text-sky-300 prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-strong:text-slate-100 prose-code:text-slate-300 prose-code:bg-slate-700 prose-code:p-1 prose-code:rounded prose-pre:bg-slate-900/70 prose-pre:text-slate-200 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1";

  switch (secao.tipo) {
    case 'texto':
      return (
        <div key={sectionKey} className="py-2">
          {secao.titulo && <h4 className="text-lg font-semibold text-sky-300 mb-2">{secao.titulo}</h4>}
          <div className={proseClasses}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{secao.conteudo}</ReactMarkdown>
          </div>
        </div>
      );
    case 'exemplo':
      return (
        <div key={sectionKey} className="my-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          {secao.titulo && <h4 className="text-md font-semibold text-cyan-400 mb-2 flex items-center"><IconFileText className="w-5 h-5 mr-2 flex-shrink-0" /> {secao.titulo}</h4>}
          <div className={`${proseClasses} text-sm`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{secao.conteudo}</ReactMarkdown>
          </div>
        </div>
      );
    case 'destaque':
      return (
        <div key={sectionKey} className="my-4 p-4 bg-sky-800/60 rounded-lg border-l-4 border-sky-500 shadow-md">
          <div className="flex items-start">
            <IconQuote className="w-5 h-5 mr-3 text-sky-400 flex-shrink-0 mt-1" />
            <p className="text-slate-100 italic">{secao.conteudo}</p>
          </div>
        </div>
      );
    case 'lista':
      return (
        <div key={sectionKey} className="py-2">
          {secao.titulo && <h4 className="text-md font-semibold text-sky-300 mb-2 flex items-center"><IconListChecks className="w-5 h-5 mr-2 flex-shrink-0" />{secao.titulo}</h4>}
          <ul className="list-disc list-inside pl-4 text-slate-300 space-y-1 marker:text-sky-400">
            {secao.itens.map((item, i) => <li key={i} className="text-slate-300">{item}</li>)}
          </ul>
        </div>
      );
    case 'pergunta_reflexiva':
      return (
        <div key={sectionKey} className="my-3 p-4 bg-teal-800/40 rounded-lg border border-teal-700">
          <div className="flex items-start">
            <IconHelpCircle className="w-6 h-6 mr-3 text-teal-400 flex-shrink-0 mt-0.5" />
            <p className="text-teal-200 italic">{secao.conteudo}</p>
          </div>
        </div>
      );
    case 'codigo':
      const markdownCode = `\`\`\`${secao.linguagem || ''}\n${secao.conteudo}\n\`\`\``;
      return (
        <div key={sectionKey} className="py-2">
          {secao.titulo && <h4 className="text-md font-semibold text-sky-300 mb-2 flex items-center"><IconCode className="w-5 h-5 mr-2 flex-shrink-0" /> {secao.titulo}</h4>}
          <div className={`${proseClasses} prose-pre:shadow-lg`}>
             <ReactMarkdown remarkPlugins={[remarkGfm]}
                components={{
                  code: (props: ActualCodeProps) => {
                    const { node, inline, className, children, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={okaidia as { [key: string]: React.CSSProperties }}
                        language={match[1]}
                        PreTag="pre"
                        {...rest}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...rest}>
                        {children}
                      </code>
                    );
                  }
                }}
             >{markdownCode}</ReactMarkdown>
          </div>
        </div>
      );
    default:
      const unknownSecao = secao as any;
      if (unknownSecao.conteudo) {
          return (
              <div key={sectionKey} className={`${proseClasses} py-2`}>
                  {unknownSecao.titulo && <h4 className="text-md font-semibold text-yellow-400 mt-0 mb-1">Conteúdo (tipo desconhecido: {unknownSecao.tipo}): {unknownSecao.titulo}</h4>}
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{unknownSecao.conteudo}</ReactMarkdown>
              </div>
          );
      }
      return <p key={sectionKey} className="text-red-400">Tipo de seção desconhecido ou conteúdo ausente: {(secao as any).tipo}</p>;
  }
};


const TopicCard: React.FC<TopicCardProps> = ({ topic, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-700 overflow-hidden"
    >
      <div className="flex items-start sm:items-center mb-5 pb-4 border-b border-slate-700">
        <IconLightbulb className="w-8 h-8 text-yellow-400 mr-4 flex-shrink-0 mt-1 sm:mt-0" />
        <h3 className="text-2xl lg:text-3xl font-semibold text-sky-400">{topic.titulo}</h3>
      </div>

      {topic.imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden border border-slate-700 aspect-video bg-slate-700/50 flex items-center justify-center shadow-lg">
          <img 
            src={topic.imageUrl} 
            alt={`Ilustração para ${topic.titulo}`} 
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105" 
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              imgElement.style.display = 'none'; 
              const parent = imgElement.parentElement;
              if (parent && !parent.querySelector('.placeholder-icon')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'w-full h-full flex items-center justify-center bg-slate-700 placeholder-icon';
                // Using a simpler, more robust SVG for error placeholder
                placeholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-off text-slate-500"><path d="M21.13 21.13 3 3"/><path d="m21 3-3.124 3.124M3 21l8.831-8.831M15.559 12.032l.888-.888a2.121 2.121 0 1 1 3 3l-.888.888"/><path d="M12.032 15.559l-.888.888a2.121 2.121 0 1 1-3-3l.888-.888"/><path d="M6.5 17.5.5 11.5c0-2.5 2-4 4-4 .5 0 1 .5 1.5 1M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7c0-.52.08-1.02.24-1.5"/></svg>`;
                parent.appendChild(placeholder);
              }
            }}
          />
        </div>
      )}
      {/* Removed the explicit placeholder for !topic.imageUrl as per user request */}
      
      {topic.objetivos && topic.objetivos.length > 0 && (
        <div className="mb-6 p-4 bg-slate-700/40 rounded-lg border border-slate-600/70">
          <h4 className="text-xl font-semibold text-sky-300 mb-3 flex items-center">
            <IconListChecks className="w-6 h-6 mr-3 text-green-400 flex-shrink-0" />
            Objetivos de Aprendizagem
          </h4>
          <ul className="space-y-1.5 pl-1">
            {topic.objetivos.map((obj, i) => (
              <li key={`${topic.id}-obj-${i}`} className="flex items-start">
                <IconCheckCircle2 className="w-4 h-4 mr-3 mt-1 text-green-500 flex-shrink-0" />
                <span className="text-slate-300">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-5">
        {topic.secoes.map((secao, idx) => (
          <SectionRenderer key={`${topic.id}-secao-${idx}`} secao={secao} topicId={topic.id} sectionIndex={idx} />
        ))}
      </div>
    </motion.div>
  );
};

export default TopicCard;
