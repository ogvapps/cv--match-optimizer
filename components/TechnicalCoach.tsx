import React, { useState } from 'react';
import { Terminal, Play, Code, CheckCircle, AlertTriangle, Cpu, RefreshCw, Loader2, BookOpen } from 'lucide-react';
import { TechChallenge, CodeReview } from '../types';
import { generateTechChallenge, reviewCodeChallenge } from '../services/geminiService';

interface TechnicalCoachProps {
    jobDescription: string;
    skills: string[];
}

export const TechnicalCoach: React.FC<TechnicalCoachProps> = ({ jobDescription, skills }) => {
    const [challenge, setChallenge] = useState<TechChallenge | null>(null);
    const [userCode, setUserCode] = useState('');
    const [review, setReview] = useState<CodeReview | null>(null);
    const [loading, setLoading] = useState(false);
    const [reviewing, setReviewing] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setReview(null);
        try {
            const data = await generateTechChallenge(jobDescription, skills);
            setChallenge(data);
            setUserCode(data.starterCode);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!challenge) return;
        setReviewing(true);
        try {
            const data = await reviewCodeChallenge(challenge, userCode);
            setReview(data);
        } catch (e) {
            console.error(e);
        } finally {
            setReviewing(false);
        }
    };

    if (!challenge && !loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900 rounded-xl text-white min-h-[400px]">
                <div className="bg-blue-600 p-4 rounded-full mb-6 shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                    <Terminal className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Simulador de Prueba Técnica</h2>
                <p className="text-slate-400 max-w-md mb-8">
                    La IA generará un reto de programación realista basado en la descripción del trabajo y tus habilidades. Practica el "Live Coding" sin presión.
                </p>
                <button 
                    onClick={handleGenerate}
                    className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
                >
                    <Play className="w-4 h-4" /> Iniciar Prueba
                </button>
            </div>
        );
    }

    if (loading) {
        return (
             <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900 rounded-xl text-white min-h-[400px]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-xl font-bold">Analizando Stack Tecnológico...</h3>
                <p className="text-slate-400 mt-2">Generando reto personalizado...</p>
             </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 my-8 space-y-6">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 rounded-xl flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${challenge?.difficulty === 'Senior' ? 'bg-red-500' : challenge?.difficulty === 'Mid' ? 'bg-yellow-500 text-slate-900' : 'bg-green-500'}`}>
                            {challenge?.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{challenge?.language}</span>
                    </div>
                    <h2 className="text-2xl font-bold">{challenge?.title}</h2>
                </div>
                <button onClick={handleGenerate} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Nuevo Reto
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Problem Description */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" /> Descripción del Problema
                        </h3>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            {challenge?.description}
                        </p>
                        
                        <h4 className="font-semibold text-sm text-slate-900 mb-2 uppercase tracking-wide">Requerimientos</h4>
                        <ul className="space-y-2">
                            {challenge?.requirements.map((req, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Feedback View (Only after submission) */}
                    {review && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-purple-600" /> Análisis de IA
                                </h3>
                                <div className="text-right">
                                    <span className={`text-2xl font-black ${review.score >= 80 ? 'text-green-600' : review.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {review.score}/100
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${review.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {review.isCorrect ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                    {review.isCorrect ? "Solución Correcta" : "Solución Incorrecta"}
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">{review.feedback}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                    <span className="text-xs font-bold text-slate-500 block mb-1">Complejidad</span>
                                    <span className="font-mono text-sm text-blue-600">{review.timeComplexity}</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                    <span className="text-xs font-bold text-slate-500 block mb-1">Bugs / Mejoras</span>
                                    <span className="font-mono text-sm text-red-600">{review.bugs.length} detectados</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Solución Optimizada</h4>
                                <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                                    <pre className="text-xs font-mono text-green-400">
                                        {review.betterSolution}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Code Editor */}
                <div className="flex flex-col h-[600px] bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                    <div className="bg-[#252526] p-2 flex items-center justify-between border-b border-[#333]">
                        <div className="flex items-center gap-2 px-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-xs text-slate-400 ml-2 font-mono">solution.{challenge?.language === 'Python' ? 'py' : 'js'}</span>
                        </div>
                        <button 
                            onClick={handleSubmit}
                            disabled={reviewing}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {reviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                            Ejecutar & Revisar
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <textarea
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            className="w-full h-full bg-[#1e1e1e] text-slate-300 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
                            spellCheck="false"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
