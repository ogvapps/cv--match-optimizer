import React, { useState } from 'react';
import { Linkedin, Mail, Check, Copy } from 'lucide-react';
import { NetworkingData } from '../types';

interface NetworkingViewProps {
  networking: NetworkingData;
}

export const NetworkingView: React.FC<NetworkingViewProps> = ({ networking }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 my-8 space-y-6">
        
        {/* LinkedIn Section */}
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <div className="bg-[#0077b5] p-4 flex items-center gap-3 text-white">
                <Linkedin className="w-6 h-6" />
                <h2 className="font-bold text-lg">Optimización LinkedIn</h2>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Headline (Titular)</h3>
                        <button onClick={() => copyToClipboard(networking.linkedinHeadline, 'li-head')} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 font-medium">
                            {copiedField === 'li-head' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copiar
                        </button>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 font-medium">
                        {networking.linkedinHeadline}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">About (Acerca de)</h3>
                        <button onClick={() => copyToClipboard(networking.linkedinAbout, 'li-about')} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 font-medium">
                            {copiedField === 'li-about' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copiar
                        </button>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {networking.linkedinAbout}
                    </div>
                </div>
            </div>
        </div>

        {/* Cold Email Section */}
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 p-4 flex items-center gap-3 text-white">
                <Mail className="w-6 h-6" />
                <h2 className="font-bold text-lg">Email al Reclutador</h2>
            </div>
            <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500 italic">Envía esto al Hiring Manager o Reclutador para destacar entre los aplicantes automáticos.</p>
                
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 p-3 border-b border-slate-200 flex gap-2 items-center">
                        <span className="text-slate-500 text-sm font-medium w-16">Asunto:</span>
                        <input readOnly value={networking.recruiterEmailSubject} className="bg-transparent flex-1 text-sm font-medium text-slate-800 outline-none" />
                        <button onClick={() => copyToClipboard(networking.recruiterEmailSubject, 'em-sub')} className="text-slate-400 hover:text-blue-600">
                           {copiedField === 'em-sub' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="p-4 relative">
                        <textarea readOnly value={networking.recruiterEmailBody} className="w-full h-48 resize-none outline-none text-slate-700 text-sm leading-relaxed" />
                        <button onClick={() => copyToClipboard(networking.recruiterEmailBody, 'em-body')} className="absolute top-4 right-4 text-slate-400 hover:text-blue-600 p-1 bg-white/80 rounded shadow-sm border border-slate-100">
                           {copiedField === 'em-body' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
  );
};