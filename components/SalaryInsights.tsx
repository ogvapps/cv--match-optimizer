import React, { useState } from 'react';
import { TrendingUp, MessageSquare, Copy, Check } from 'lucide-react';
import { SalaryData } from '../types';

interface SalaryInsightsProps {
  salary: SalaryData;
}

export const SalaryInsights: React.FC<SalaryInsightsProps> = ({ salary }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 my-8 space-y-6">
        
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center gap-3 mb-4 opacity-90">
                <TrendingUp className="w-6 h-6" />
                <span className="font-semibold uppercase tracking-wider text-sm">Estimación de Mercado</span>
            </div>
            <div className="flex flex-col md:flex-row items-end gap-2">
                <h2 className="text-4xl md:text-5xl font-bold">{salary.estimatedRange}</h2>
                <span className="text-xl md:text-2xl font-medium opacity-80 mb-1.5">{salary.currency} / año</span>
            </div>
            <div className="mt-6 flex gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="block text-xs uppercase opacity-70 mb-1">Seniority</span>
                    <span className="font-bold">{salary.seniorityLevel}</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="block text-xs uppercase opacity-70 mb-1">Demanda</span>
                    <span className="font-bold">{salary.marketDemand}</span>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-bold text-lg">Guion de Negociación</h2>
                </div>
                <button onClick={() => copyToClipboard(salary.negotiationScript, 'salary-script')} className="text-slate-500 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium">
                   {copiedField === 'salary-script' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copiar
                </button>
            </div>
            <div className="p-6">
                 <p className="text-slate-600 italic mb-4 text-sm">Usa este guion cuando te pregunten por tus expectativas salariales:</p>
                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 text-slate-800 text-lg leading-relaxed font-medium relative">
                    <span className="absolute top-2 left-2 text-4xl text-emerald-200 font-serif">"</span>
                    <span className="relative z-10">{salary.negotiationScript}</span>
                    <span className="absolute bottom-[-10px] right-4 text-4xl text-emerald-200 font-serif">"</span>
                </div>
            </div>
        </div>
    </div>
  );
};