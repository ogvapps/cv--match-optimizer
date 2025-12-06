import React, { useState } from 'react';
import { Timer, Volume2, Copy, Check, CheckCircle } from 'lucide-react';

interface PitchViewProps {
  pitch: string;
}

export const PitchView: React.FC<PitchViewProps> = ({ pitch }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 my-8 space-y-6">
         <div className="bg-indigo-600 text-white rounded-xl p-8 shadow-lg relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Timer className="w-6 h-6" /> 
                    Tu Elevator Pitch
                </h2>
                <p className="text-indigo-100 mb-6 max-w-lg">
                    Tienes 30 segundos para impresionar. Este guion está diseñado para responder a "Háblame de ti" de forma memorable.
                </p>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <p className="text-lg md:text-xl font-medium leading-relaxed font-serif">
                        "{pitch || "Generando pitch..."}"
                    </p>
                </div>

                <div className="mt-6 flex gap-3">
                    <button onClick={() => speakText(pitch)} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors">
                        <Volume2 className="w-4 h-4" /> Escuchar
                    </button>
                    <button onClick={() => copyToClipboard(pitch, 'pitch')} className="bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-800 transition-colors border border-indigo-500">
                        {copiedField === 'pitch' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copiar
                    </button>
                </div>
             </div>
             
             {/* Decorative bg elements */}
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500 rounded-full opacity-50 blur-3xl"></div>
         </div>

         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-2">¿Por qué funciona este pitch?</h3>
             <ul className="space-y-2 text-sm text-slate-600">
                 <li className="flex gap-2">
                     <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                     <span>Conecta tu pasado relevante directamente con esta oferta.</span>
                 </li>
                 <li className="flex gap-2">
                     <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                     <span>Incluye un logro numérico o tangible para dar credibilidad.</span>
                 </li>
                 <li className="flex gap-2">
                     <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                     <span>Termina mostrando entusiasmo genuino por la empresa.</span>
                 </li>
             </ul>
         </div>
    </div>
  );
};