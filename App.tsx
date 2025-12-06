import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ResultCard } from './components/ResultCard';
import { optimizeCV } from './services/geminiService';
import { OptimizeResponse, CVInputType, HistoryItem, LanguageOption } from './types';
import { ArrowRight, Loader2, Wand2, Upload, FileText, X, Clock, Trash2, ChevronRight, Image as ImageIcon, User, Languages, RotateCcw, Linkedin, Sparkles, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  // UI State - 'linkedin' added
  const [inputType, setInputType] = useState<CVInputType | 'linkedin'>('text');
  
  // Data State
  const [cvText, setCvText] = useState('');
  const [cvPdfName, setCvPdfName] = useState<string | null>(null);
  const [cvPdfBase64, setCvPdfBase64] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [jobDesc, setJobDesc] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<LanguageOption>('Auto');
  
  // App State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('cv_optimizer_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    const savedDraft = localStorage.getItem('cv_optimizer_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setCvText(draft.cvText || '');
        setJobDesc(draft.jobDesc || '');
        setTargetLanguage(draft.targetLanguage || 'Auto');
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // Save Draft
  useEffect(() => {
    const draft = { cvText, jobDesc, targetLanguage };
    const timeoutId = setTimeout(() => {
      localStorage.setItem('cv_optimizer_draft', JSON.stringify(draft));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [cvText, jobDesc, targetLanguage]);

  const clearDraft = () => {
    localStorage.removeItem('cv_optimizer_draft');
    setCvText('');
    setJobDesc('');
    setTargetLanguage('Auto');
    setCvPdfName(null);
    setCvPdfBase64(null);
    setAvatar(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const saveToHistory = (data: OptimizeResponse, jobDescFull: string) => {
    const title = jobDescFull.split('\n')[0].substring(0, 40) + (jobDescFull.length > 40 ? '...' : '');
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      jobTitle: title || 'Oferta sin título',
      data: data
    };
    const newHistory = [newItem, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('cv_optimizer_history', JSON.stringify(newHistory));
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult(item.data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('cv_optimizer_history', JSON.stringify(newHistory));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError("Por favor, sube solo archivos PDF.");
      return;
    }
    setError(null);
    setCvPdfName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Content = base64String.split(',')[1];
      setCvPdfBase64(base64Content);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError("Por favor, sube solo archivos de imagen (JPG, PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setCvPdfName(null);
    setCvPdfBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearAvatar = () => {
    setAvatar(null);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDesc.trim()) return;
    if ((inputType === 'text' || inputType === 'linkedin') && !cvText.trim()) return;
    if (inputType === 'pdf' && !cvPdfBase64) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const cvData = {
        type: inputType === 'linkedin' ? 'text' : inputType as CVInputType,
        content: inputType === 'pdf' ? cvPdfBase64! : cvText
      };
      const data = await optimizeCV(cvData, jobDesc, targetLanguage);
      if (avatar) data.optimizedCV.personalInfo.avatar = avatar;
      setResult(data);
      saveToHistory(data, jobDesc);
    } catch (err) {
      setError("Ocurrió un error. Verifica tu archivo o texto.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (!jobDesc.trim()) return false;
    if ((inputType === 'text' || inputType === 'linkedin') && cvText.trim()) return true;
    if (inputType === 'pdf' && cvPdfBase64) return true;
    return false;
  };

  // --- RENDER ---
  
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
           {/* Back to Home Button */}
           <div className="mb-4 flex items-center justify-between">
              <button onClick={() => setResult(null)} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" /> Volver al Editor
              </button>
              <div className="text-sm text-slate-400">
                  Editando: <span className="font-semibold text-slate-700">{history[0]?.jobTitle}</span>
              </div>
           </div>
           
           <ResultCard 
              data={result} 
              originalContent={(inputType === 'text' || inputType === 'linkedin') ? cvText : undefined}
              jobDescription={jobDesc}
           />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Text */}
        <div className="text-center mb-12 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100 mb-2">
            <Sparkles className="w-3 h-3" /> Nueva Versión 2.0
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Consigue el trabajo <br className="hidden md:block" /> con un CV <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Invencible</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Nuestra IA analiza la oferta de trabajo y reescribe tu currículum para superar los filtros ATS y destacar tus habilidades clave.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="relative group">
               
               {/* Clear Draft Button */}
               {(cvText || jobDesc) && (
                  <button 
                    type="button" 
                    onClick={clearDraft}
                    className="absolute -top-10 right-0 text-xs font-medium text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Empezar de cero
                  </button>
               )}

               <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                  
                  {/* Step 1: CV Input */}
                  <div className="p-1">
                      <div className="bg-slate-50/50 rounded-xl p-1 flex mb-4 border border-slate-200/50 mx-6 mt-6">
                        {(['text', 'pdf', 'linkedin'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => { setInputType(type); if(type==='linkedin') setCvText(''); }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${inputType === type ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {type === 'text' && <FileText className="w-4 h-4" />}
                                {type === 'pdf' && <Upload className="w-4 h-4" />}
                                {type === 'linkedin' && <Linkedin className="w-4 h-4" />}
                                <span className="capitalize">{type === 'text' ? 'Texto' : type === 'pdf' ? 'PDF' : 'LinkedIn'}</span>
                            </button>
                        ))}
                      </div>

                      <div className="px-6 pb-6">
                        <div className="flex items-center gap-4 mb-4">
                             {/* Avatar Mini-Uploader */}
                             <div className="relative shrink-0 cursor-pointer group/avatar" onClick={() => avatarInputRef.current?.click()}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border transition-all ${avatar ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 bg-slate-50 group-hover/avatar:border-blue-300'}`}>
                                    {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-400" />}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow border border-slate-100">
                                    <Upload className="w-2.5 h-2.5 text-slate-500" />
                                </div>
                                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                             </div>
                             <div>
                                 <h3 className="text-sm font-semibold text-slate-800">Tu Perfil Profesional</h3>
                                 <p className="text-xs text-slate-500">Sube tu CV actual para que la IA lo analice.</p>
                             </div>
                        </div>

                        {inputType === 'pdf' ? (
                            <div className="h-40 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-4 text-center hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer relative group/drop">
                                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                {cvPdfName ? (
                                    <div className="relative z-20">
                                        <FileText className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-800">{cvPdfName}</p>
                                        <button onClick={(e) => { e.preventDefault(); clearFile(); }} className="mt-2 text-xs text-red-500 hover:underline z-30 relative">Eliminar</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover/drop:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">Arrastra tu PDF aquí</p>
                                        <p className="text-xs text-slate-400 mt-1">o haz clic para explorar</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <textarea
                                value={cvText}
                                onChange={(e) => setCvText(e.target.value)}
                                placeholder={inputType === 'linkedin' ? "Pega aquí todo el contenido de tu perfil de LinkedIn (Ctrl+A, Ctrl+C)..." : "Pega aquí el texto de tu CV..."}
                                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-sm leading-relaxed"
                            />
                        )}
                      </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 mx-6"></div>

                  {/* Step 2: Job Description */}
                  <div className="p-6 bg-slate-50/30">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                             <h3 className="text-sm font-semibold text-slate-800">Oferta de Trabajo (Job Description)</h3>
                             <p className="text-xs text-slate-500">Pega la descripción completa del puesto.</p>
                        </div>
                        <select 
                            value={targetLanguage} 
                            onChange={(e) => setTargetLanguage(e.target.value as LanguageOption)}
                            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                            <option value="Auto">Idioma: Auto</option>
                            <option value="Spanish">Español</option>
                            <option value="English">English</option>
                        </select>
                      </div>
                      <textarea
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        placeholder="Ej: Buscamos un Senior Frontend Developer con experiencia en React..."
                        className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm leading-relaxed"
                      />
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-400 hidden sm:block">
                          <span className="font-semibold text-slate-500">Tip:</span> Sé específico con la oferta para mejor match.
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || !isFormValid()}
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2
                          ${isLoading || !isFormValid() 
                            ? 'bg-slate-300 cursor-not-allowed opacity-70' 
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                          }`}
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {isLoading ? "Analizando..." : "Optimizar Ahora"}
                      </button>
                  </div>
               </div>
            </form>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <X className="w-4 h-4" /> {error}
                </div>
            )}
          </div>

          {/* Right Column: History & Features */}
          <div className="lg:col-span-5 space-y-8">
             {/* Feature Highlights */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                     <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                         <CheckCircle2 className="w-5 h-5" />
                     </div>
                     <h3 className="font-bold text-slate-800 text-sm">ATS Friendly</h3>
                     <p className="text-xs text-slate-500 mt-1">Formatos optimizados para pasar los filtros automáticos.</p>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                     <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                         <Sparkles className="w-5 h-5" />
                     </div>
                     <h3 className="font-bold text-slate-800 text-sm">IA Avanzada</h3>
                     <p className="text-xs text-slate-500 mt-1">Gemini Pro analiza Keywords y Soft Skills.</p>
                 </div>
             </div>

             {/* History */}
             {history.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" /> Historial Reciente
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {history.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => loadFromHistory(item)}
                                className="p-4 hover:bg-blue-50 transition-colors cursor-pointer group flex items-center justify-between"
                            >
                                <div className="min-w-0">
                                    <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700">{item.jobTitle}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{new Date(item.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.data.matchScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {item.data.matchScore}%
                                    </span>
                                    <button onClick={(e) => deleteHistoryItem(e, item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;