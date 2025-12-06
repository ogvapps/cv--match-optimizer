import React, { useState } from 'react';
import { MessageSquare, Volume2, Mic, Square, Sparkles, Loader2 } from 'lucide-react';
import { InterviewQuestion, InterviewAnalysis } from '../types';
import { analyzeInterviewAudio } from '../services/geminiService';

interface InterviewCoachProps {
  questions: InterviewQuestion[];
}

export const InterviewCoach: React.FC<InterviewCoachProps> = ({ questions }) => {
  // Static Recording State
  const [recordingId, setRecordingId] = useState<string | null>(null); 
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordings, setRecordings] = useState<Record<string, { url: string, blob: Blob }>>({});
  const [analysis, setAnalysis] = useState<Record<string, InterviewAnalysis>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // --- Static Analysis Helpers ---
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async (id: string) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setRecordings(prev => ({ ...prev, [id]: { url, blob } }));
        };
        recorder.start();
        setMediaRecorder(recorder);
        setRecordingId(id);
    } catch (e) { alert("Necesitamos acceso al micrófono."); }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setRecordingId(null);
        setMediaRecorder(null);
    }
  };

  const handleAnalyze = async (id: string, question: string) => {
    const recording = recordings[id];
    if (!recording) return;
    setAnalyzingId(id);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(recording.blob);
        reader.onloadend = async () => {
            const base64data = (reader.result as string).split(',')[1];
            const result = await analyzeInterviewAudio(base64data, question);
            setAnalysis(prev => ({ ...prev, [id]: result }));
            setAnalyzingId(null);
        };
    } catch (e) { setAnalyzingId(null); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 my-8">
        <div className="bg-white rounded-xl shadow border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-blue-600" />
                Coach de Entrevistas AI
            </h2>
            
            <p className="text-slate-600 mb-8">
                Practica tus respuestas en voz alta. Graba tu audio y obtén feedback instantáneo de la IA sobre tu claridad, confianza y contenido.
            </p>
            <div className="space-y-8">
                {questions.map((q, i) => {
                    const qId = `q${i}`;
                    const hasAnalysis = !!analysis[qId];
                    const isAnalyzing = analyzingId === qId;
                    return (
                        <div key={i} className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex gap-3 leading-snug">
                                    <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0">{i + 1}</span>
                                    {q.question}
                                </h3>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => speakText(q.question)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200" title="Escuchar pregunta">
                                        <Volume2 className="w-5 h-5" />
                                    </button>
                                    
                                    {recordingId === qId ? (
                                        <button onClick={stopRecording} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-all animate-pulse" title="Detener grabación">
                                            <Square className="w-5 h-5 fill-current" />
                                        </button>
                                    ) : (
                                        <button onClick={() => startRecording(qId)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200" title="Grabar respuesta">
                                            <Mic className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {recordings[qId] && (
                                <div className="mb-4 bg-white p-3 rounded-xl border border-slate-200 animate-in fade-in flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <audio src={recordings[qId].url} controls className="h-8 flex-grow" />
                                        <button onClick={() => {
                                            const newRecs = {...recordings};
                                            delete newRecs[qId];
                                            setRecordings(newRecs);
                                            const newAn = {...analysis};
                                            delete newAn[qId];
                                            setAnalysis(newAn);
                                        }} className="text-xs text-red-500 hover:text-red-700 underline">Borrar</button>
                                    </div>
                                    
                                    {!hasAnalysis && (
                                        <button 
                                            onClick={() => handleAnalyze(qId, q.question)}
                                            disabled={isAnalyzing}
                                            className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                        >
                                            {isAnalyzing ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Analizando respuesta...</>
                                            ) : (
                                                <><Sparkles className="w-4 h-4" /> Analizar con IA</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                            {hasAnalysis && (
                                <div className="mt-4 bg-white rounded-xl border border-indigo-100 shadow-sm p-4 animate-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reporte de IA</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-semibold text-slate-600">Score:</span>
                                            <span className={`text-lg font-black ${analysis[qId].score >= 8 ? 'text-green-500' : analysis[qId].score >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                                                {analysis[qId].score}/10
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                        <div className="bg-slate-50 p-3 rounded-lg"><span className="block text-xs font-bold text-slate-500 mb-1">Claridad</span><p className="text-slate-700 leading-snug">{analysis[qId].clarity}</p></div>
                                        <div className="bg-slate-50 p-3 rounded-lg"><span className="block text-xs font-bold text-slate-500 mb-1">Confianza</span><p className="text-slate-700 leading-snug">{analysis[qId].confidence}</p></div>
                                        <div className="bg-slate-50 p-3 rounded-lg"><span className="block text-xs font-bold text-slate-500 mb-1">Contenido</span><p className="text-slate-700 leading-snug">{analysis[qId].content}</p></div>
                                    </div>
                                    <div className="bg-indigo-50 p-3 rounded-lg flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                                        <div><span className="block text-xs font-bold text-indigo-800 mb-0.5">Tip de Mejora</span><p className="text-indigo-700 text-sm">{analysis[qId].feedback}</p></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};