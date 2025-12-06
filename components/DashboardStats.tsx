import React from 'react';
import { AlertOctagon, Layers, BarChart3 } from 'lucide-react';
import { OptimizeResponse } from '../types';

interface DashboardStatsProps {
  matchScore: number;
  analysis: OptimizeResponse['analysis'];
  careerProgress?: {
    cvOptimized: boolean;
    letterReviewed: boolean;
    interviewPracticed: boolean;
    networkingOpened: boolean;
    jobsSearched: boolean;
  };
  cultureAnalysis?: OptimizeResponse['cultureAnalysis'];
  matchBreakdown?: OptimizeResponse['matchBreakdown'];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ matchScore, analysis, matchBreakdown }) => {
  const hasHardKillers = analysis.hardKillers && analysis.hardKillers.length > 0;
  const hardSkills = analysis.hardSkillsMatched || [];
  const softSkills = analysis.softSkillsMatched || [];

  // Configuración del círculo SVG
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (matchScore / 100) * circumference;

  return (
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* 1. Score Gauge Card (FIXED) */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/20 flex flex-col items-center justify-center text-center">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full blur-[40px] opacity-20 pointer-events-none"></div>
          
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">ATS Match Score</span>
          
          {/* SVG Container */}
          <div className="relative w-40 h-40 mb-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                  {/* Track Circle */}
                  <circle 
                    cx="64" cy="64" r={radius} 
                    stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-slate-800" 
                  />
                  {/* Progress Circle */}
                  <circle 
                    cx="64" cy="64" r={radius} 
                    stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${matchScore >= 80 ? 'text-emerald-400' : matchScore >= 50 ? 'text-amber-400' : 'text-red-400'} transition-all duration-1000 ease-out`}
                  />
              </svg>
              
              {/* Centered Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black tracking-tighter leading-none">{matchScore}</span>
                  <span className="text-sm text-slate-400 font-medium">%</span>
              </div>
          </div>
          
          {/* Badge Label */}
          <div className="mt-1">
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : matchScore >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {matchScore >= 80 ? 'Excelente' : matchScore >= 50 ? 'Mejorable' : 'Crítico'}
              </span>
          </div>
      </div>

      {/* 2. Breakdown Bars (Layout Fixed) */}
      {matchBreakdown && (
          <div className="space-y-3 w-full">
              <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" /> Desglose de Puntos
              </h4>
              <div className="grid gap-3">
                {[
                    { l: 'Técnico', v: matchBreakdown.technical, c: 'bg-blue-500' },
                    { l: 'Experiencia', v: matchBreakdown.experience, c: 'bg-purple-500' },
                    { l: 'Soft Skills', v: matchBreakdown.softSkills, c: 'bg-pink-500' },
                    { l: 'Educación', v: matchBreakdown.education, c: 'bg-emerald-500' },
                ].map((item, i) => (
                    <div key={i} className="group w-full">
                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                            <span>{item.l}</span>
                            <span>{item.v}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.c} transition-all duration-1000`} style={{ width: `${item.v}%` }}></div>
                        </div>
                    </div>
                ))}
              </div>
          </div>
      )}

      {/* 3. Action Plan (Mini) */}
      {analysis.actionPlan.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full">
              <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2 mb-3">
                  <Layers className="w-3.5 h-3.5 text-blue-600" /> Pasos a Seguir
              </h4>
              <ul className="space-y-2.5">
                  {analysis.actionPlan.slice(0, 3).map((step, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600 leading-snug">
                          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">{i+1}</span>
                          <span className="break-words">{step}</span>
                      </li>
                  ))}
              </ul>
          </div>
      )}

      {/* 4. Killers & Flags */}
      {hasHardKillers && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 w-full">
             <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
             <div className="min-w-0">
                 <h4 className="text-xs font-bold text-red-800 uppercase mb-1">Alertas Críticas</h4>
                 <div className="flex flex-wrap gap-1">
                     {analysis.hardKillers.map((k, i) => (
                         <span key={i} className="px-1.5 py-0.5 bg-white text-red-700 rounded text-[10px] font-bold border border-red-100 truncate max-w-full">{k}</span>
                     ))}
                 </div>
             </div>
          </div>
      )}

      {/* 5. Skills Cloud (Wrap Fixed) */}
      <div className="w-full">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Skills Detectadas</h4>
          <div className="flex flex-wrap gap-1.5 mb-2">
              {hardSkills.slice(0, 6).map((k, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-semibold">{k}</span>
              ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
              {softSkills.slice(0, 4).map((k, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-semibold">{k}</span>
              ))}
          </div>
      </div>

    </div>
  );
};