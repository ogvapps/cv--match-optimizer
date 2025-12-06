import React, { useState, useEffect } from 'react';
import { OptimizeResponse, CareerRoadmap } from '../types';
import { generateCareerRoadmap } from '../services/geminiService';
import { Map, Flag, ArrowRight, CheckCircle2, BookOpen, Layers, Clock, Loader2, Award } from 'lucide-react';

interface CareerRoadmapViewProps {
    cvContent: OptimizeResponse['optimizedCV'];
    analysis: OptimizeResponse['analysis'];
    jobDescription: string;
}

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({ cvContent, analysis, jobDescription }) => {
    const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRoadmap = async () => {
            setLoading(true);
            try {
                const data = await generateCareerRoadmap(cvContent, analysis, jobDescription);
                setRoadmap(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (!roadmap) {
            fetchRoadmap();
        }
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-blue-600 p-4 rounded-full text-white shadow-xl">
                        <Map className="w-8 h-8 animate-pulse" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Diseñando tu Plan de Carrera...</h3>
                <p className="text-slate-500 mt-2 text-center max-w-sm">
                    Gemini está analizando tus brechas de habilidades para crear una ruta de aprendizaje personalizada.
                </p>
            </div>
        );
    }

    if (!roadmap) return null;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 my-8 space-y-8 animate-in slide-in-from-bottom-6">
            
            {/* Header / Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-blue-300 font-bold uppercase tracking-wider text-xs mb-2">
                            <Flag className="w-4 h-4" /> Análisis de Brechas (Gap Analysis)
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Tu Ruta hacia el éxito</h2>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="text-slate-400 text-xs block">Nivel Actual</span>
                                <span className="font-semibold text-white">{roadmap.currentLevel}</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500" />
                            <div className="bg-blue-600/20 px-3 py-1.5 rounded-lg border border-blue-500/30">
                                <span className="text-blue-200 text-xs block">Nivel Objetivo</span>
                                <span className="font-semibold text-blue-100">{roadmap.targetLevel}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm max-w-xs">
                        <p className="text-slate-300 text-sm leading-relaxed italic">"{roadmap.gapAnalysis}"</p>
                        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-400">
                            <Clock className="w-3.5 h-3.5" /> Tiempo estimado: {roadmap.estimatedTime}
                        </div>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-8 md:pl-0">
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -ml-[1px]"></div>

                <div className="space-y-12">
                    {roadmap.steps.map((step, idx) => (
                        <div key={idx} className={`relative flex flex-col md:flex-row gap-8 items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                            
                            {/* Timeline Dot */}
                            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-blue-600 shadow-lg z-10 flex items-center justify-center">
                                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 w-full md:w-auto pl-8 md:pl-0">
                                <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group ${idx % 2 === 0 ? 'md:mr-12' : 'md:ml-12'}`}>
                                    
                                    {/* Priority Badge */}
                                    <span className={`absolute top-4 right-4 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                                        ${step.priority === 'High' ? 'bg-red-50 text-red-600' : step.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}
                                    `}>
                                        Prioridad {step.priority}
                                    </span>

                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-2">
                                        {step.weekRange}
                                    </span>
                                    
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{step.description}</p>
                                    
                                    <div className="space-y-4">
                                        {/* Action Items */}
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Acciones Clave
                                            </h4>
                                            <ul className="space-y-1.5">
                                                {step.actionItems.map((item, i) => (
                                                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 shrink-0"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Resources */}
                                        <div className="flex flex-wrap gap-2">
                                            {step.resources.map((res, i) => (
                                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-default">
                                                    <BookOpen className="w-3 h-3" />
                                                    {res}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Spacer for alternating layout */}
                            <div className="flex-1 hidden md:block"></div>
                        </div>
                    ))}
                    
                    {/* Final Success State */}
                    <div className="relative flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white shadow-xl z-10 flex items-center justify-center animate-bounce">
                            <Award className="w-6 h-6" />
                        </div>
                        <div className="mt-4 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-lg text-sm font-bold text-center border border-emerald-100">
                            ¡Meta Alcanzada: {roadmap.targetLevel}!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
