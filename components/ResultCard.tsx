import React, { useState, useEffect } from 'react';
import { Printer, Mail, FileText, Mic, Share2, Download, DollarSign, Timer, Sparkles, LayoutTemplate, Columns, Bold, Italic, Underline, ChevronDown, Eye, Bot, Palette, Plus, Trash2, History, PenLine, Globe, Laptop, Map, FileJson, FileType } from 'lucide-react';
import { OptimizeResponse, ToneType } from '../types';
import { rewriteSection, analyzeJobCulture } from '../services/geminiService';
import { exportToDocx, exportToJson } from '../services/exportService';

// Subcomponents
import { DashboardStats } from './DashboardStats';
import { ResumeEditor } from './ResumeEditor';
import { CoverLetterView } from './CoverLetterView';
import { InterviewCoach } from './InterviewCoach';
import { SalaryInsights } from './SalaryInsights';
import { PitchView } from './PitchView';
import { NetworkingView } from './NetworkingView';
import { JobFinder } from './JobFinder';
import { RecruiterChat } from './RecruiterChat';
import { CareerRoadmapView } from './CareerRoadmapView';
import { PortfolioPreview } from './PortfolioPreview';

interface ResultCardProps {
  data: OptimizeResponse;
  originalContent?: string;
  jobDescription?: string;
}

type Theme = 'classic' | 'modern' | 'minimal';
type Layout = 'single' | 'double';
type Tab = 'resume' | 'letter' | 'interview' | 'networking' | 'salary' | 'pitch' | 'jobs' | 'roadmap' | 'portfolio';
type ViewMode = 'preview' | 'analysis' | 'raw';

export interface DesignSettings {
  color: string;
  font: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, originalContent, jobDescription = '' }) => {
  // State
  const [cvContent, setCvContent] = useState(data.optimizedCV);
  const [coverLetter, setCoverLetter] = useState(data.coverLetter);
  const [activeTab, setActiveTab] = useState<Tab>('resume');
  
  // Design State
  const [theme, setTheme] = useState<Theme>('modern');
  const [layout, setLayout] = useState<Layout>('single');
  const [viewMode, setViewMode] = useState<ViewMode>('analysis');
  const [designSettings, setDesignSettings] = useState<DesignSettings>({ color: '#2563eb', font: 'font-sans' });

  // Export Menu State
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sidebar Toggles
  const [showStats, setShowStats] = useState(true);

  // Gamification
  const [careerProgress, setCareerProgress] = useState({
      cvOptimized: true,
      letterReviewed: false,
      interviewPracticed: false,
      networkingOpened: false,
      jobsSearched: false
  });

  const [cultureAnalysis, setCultureAnalysis] = useState<OptimizeResponse['cultureAnalysis']>();

  // Async Analysis
  useEffect(() => {
      if (jobDescription && !cultureAnalysis) {
          analyzeJobCulture(jobDescription).then(setCultureAnalysis);
      }
  }, [jobDescription]);

  // Sync Theme Defaults
  useEffect(() => {
      if (theme === 'classic') setDesignSettings({ color: '#334155', font: 'font-serif' });
      if (theme === 'modern') setDesignSettings({ color: '#2563eb', font: 'font-[Roboto]' });
      if (theme === 'minimal') setDesignSettings({ color: '#000000', font: 'font-[Space_Mono]' });
  }, [theme]);

  // Tab Tracking
  useEffect(() => {
      if (activeTab === 'letter') setCareerProgress(p => ({...p, letterReviewed: true}));
      if (activeTab === 'networking') setCareerProgress(p => ({...p, networkingOpened: true}));
      if (activeTab === 'jobs') setCareerProgress(p => ({...p, jobsSearched: true}));
  }, [activeTab]);

  const handlePrint = () => {
    const prevMode = viewMode;
    setViewMode('preview');
    setShowExportMenu(false);
    setTimeout(() => { window.print(); setViewMode(prevMode); }, 100);
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
        await exportToDocx(cvContent);
    } catch(e) {
        console.error(e);
        alert("Error al generar el documento Word.");
    } finally {
        setIsExporting(false);
        setShowExportMenu(false);
    }
  };

  const handleExportJson = () => {
    exportToJson(cvContent);
    setShowExportMenu(false);
  };

  const navItems = [
    { id: 'resume', label: 'CV Editor', icon: FileText },
    { id: 'letter', label: 'Carta', icon: Mail },
    { id: 'roadmap', label: 'Plan', icon: Map },
    { id: 'portfolio', label: 'Web', icon: Laptop },
    { id: 'interview', label: 'Entrevista', icon: Mic },
    { id: 'salary', label: 'Salario', icon: DollarSign },
    { id: 'networking', label: 'Red', icon: Share2 },
    { id: 'jobs', label: 'Empleos', icon: Globe },
  ];

  const colorPresets = ['#0f172a', '#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706', '#000000'];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[800px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl relative">
      
      {/* 1. Recruiter Chat (Floating) */}
      <RecruiterChat contextData={{ optimizedCV: cvContent, analysis: data.analysis }} jobDescription={jobDescription} />

      {/* 2. Workspace Header (Sticky Navigation) */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-gradient-r">
           {navItems.map((item) => (
             <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                   ${activeTab === item.id 
                     ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                     : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                   }`}
             >
                <item.icon className="w-4 h-4" />
                {item.label}
             </button>
           ))}
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
           {(activeTab === 'resume' || activeTab === 'letter') && (
               <div className="flex bg-slate-100 rounded-lg p-1">
                   {['classic', 'modern', 'minimal'].map((t) => (
                       <button 
                         key={t} 
                         onClick={() => setTheme(t as Theme)}
                         className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${theme === t ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                           {t}
                       </button>
                   ))}
               </div>
           )}
           
           <div className="relative">
               <button 
                 onClick={() => setShowExportMenu(!showExportMenu)}
                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
               >
                 {isExporting ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> : <Download className="w-4 h-4" />}
                 Exportar <ChevronDown className="w-3 h-3" />
               </button>
               
               {showExportMenu && (
                   <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                       <button onClick={handlePrint} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                           <Printer className="w-4 h-4 text-slate-400" />
                           <div>
                               <span className="font-semibold block">PDF Formateado</span>
                               <span className="text-xs text-slate-400">Imprimir como PDF</span>
                           </div>
                       </button>
                       <button onClick={handleExportDocx} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-t border-slate-100">
                           <FileType className="w-4 h-4 text-blue-500" />
                           <div>
                               <span className="font-semibold block">Word (.docx)</span>
                               <span className="text-xs text-slate-400">Editable en Word</span>
                           </div>
                       </button>
                       <button onClick={handleExportJson} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-t border-slate-100">
                           <FileJson className="w-4 h-4 text-amber-500" />
                           <div>
                               <span className="font-semibold block">JSON Resume</span>
                               <span className="text-xs text-slate-400">Schema estándar</span>
                           </div>
                       </button>
                   </div>
               )}
               {showExportMenu && <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)}></div>}
           </div>
        </div>
      </header>

      {/* 3. Main Workspace Grid */}
      <div className="flex flex-1 overflow-hidden relative">
         
         {/* Left Sidebar (Tools) - Only for Resume/Letter */}
         {(activeTab === 'resume' || activeTab === 'letter') && (
             <aside className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-y-auto hidden xl:flex shrink-0 z-10">
                <div className="p-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Herramientas de Diseño</h3>
                    
                    <div className="mb-8">
                        <label className="text-sm font-bold text-slate-700 mb-3 block flex items-center gap-2">
                            <Palette className="w-4 h-4 text-slate-400" /> Color de Acento
                        </label>
                        <div className="grid grid-cols-5 gap-3">
                            {colorPresets.map(c => (
                                <button 
                                    key={c}
                                    onClick={() => setDesignSettings(s => ({...s, color: c}))}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${designSettings.color === c ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-110'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200">
                                <input type="color" className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" onChange={(e) => setDesignSettings(s => ({...s, color: e.target.value}))} />
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="text-sm font-bold text-slate-700 mb-3 block flex items-center gap-2">
                             <LayoutTemplate className="w-4 h-4 text-slate-400" /> Distribución
                        </label>
                        <div className="flex gap-2">
                             <button onClick={() => setLayout('single')} className={`flex-1 p-3 rounded-lg border-2 text-center text-xs font-bold transition-all ${layout === 'single' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
                                 Columna Simple
                             </button>
                             <button onClick={() => setLayout('double')} className={`flex-1 p-3 rounded-lg border-2 text-center text-xs font-bold transition-all ${layout === 'double' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
                                 Con Lateral
                             </button>
                        </div>
                    </div>

                    <div className="mb-8">
                         <label className="text-sm font-bold text-slate-700 mb-3 block flex items-center gap-2">
                             <Eye className="w-4 h-4 text-slate-400" /> Modo de Vista
                         </label>
                         <div className="space-y-2">
                             <button onClick={() => setViewMode('analysis')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${viewMode === 'analysis' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}>
                                 ✨ Modo Análisis (Keywords)
                             </button>
                             <button onClick={() => setViewMode('preview')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${viewMode === 'preview' ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}>
                                 📄 Vista Previa Limpia
                             </button>
                         </div>
                    </div>
                </div>
             </aside>
         )}

         {/* Center Canvas (Scrollable) */}
         <main className="flex-1 overflow-y-auto bg-slate-100/50 relative p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-[210mm] transition-all duration-300">
                {activeTab === 'resume' && (
                    <ResumeEditor 
                        cvContent={cvContent} 
                        setCvContent={setCvContent} 
                        viewMode={viewMode}
                        theme={theme}
                        layout={layout}
                        originalContent={originalContent}
                        designSettings={designSettings}
                    />
                )}
                {activeTab === 'letter' && (
                    <CoverLetterView 
                        coverLetter={coverLetter}
                        setCoverLetter={setCoverLetter}
                        cvContent={cvContent}
                        theme={theme}
                        viewMode={viewMode}
                        designSettings={designSettings}
                    />
                )}
                
                {/* Other Tabs Containers */}
                {activeTab !== 'resume' && activeTab !== 'letter' && (
                    <div className="w-full max-w-5xl mx-auto">
                        {activeTab === 'roadmap' && <CareerRoadmapView cvContent={cvContent} analysis={data.analysis} jobDescription={jobDescription} />}
                        {activeTab === 'portfolio' && <PortfolioPreview cvContent={cvContent} accentColor={designSettings.color} />}
                        {activeTab === 'interview' && <InterviewCoach questions={data.interviewQuestions} />}
                        {activeTab === 'salary' && <SalaryInsights salary={data.salary} />}
                        {activeTab === 'pitch' && <PitchView pitch={data.elevatorPitch} />}
                        {activeTab === 'networking' && <NetworkingView networking={data.networking} />}
                        {activeTab === 'jobs' && <JobFinder initialRole={cvContent.workExperience?.[0]?.role} initialLocation={cvContent.personalInfo.location || ''} />}
                    </div>
                )}
            </div>
         </main>

         {/* Right Sidebar (Stats/Assistant) - Collapsible - INCREASED WIDTH TO PREVENT SCROLL */}
         <aside className={`bg-white border-l border-slate-200 overflow-y-auto transition-all duration-300 z-10 ${showStats ? 'w-96' : 'w-0 border-none'}`}>
             <div className="p-6 w-full">
                 <div className="flex items-center justify-between mb-6">
                     <h3 className="font-bold text-slate-900">Análisis de Perfil</h3>
                     <button onClick={() => setShowStats(false)} className="lg:hidden p-1 text-slate-400"><ChevronDown /></button>
                 </div>
                 <DashboardStats 
                    matchScore={data.matchScore} 
                    analysis={data.analysis} 
                    careerProgress={careerProgress} 
                    cultureAnalysis={cultureAnalysis}
                    matchBreakdown={data.matchBreakdown}
                 />
             </div>
         </aside>

         {/* Toggle Stats Button (Absolute) */}
         <button 
            onClick={() => setShowStats(!showStats)}
            className={`absolute top-4 right-4 z-20 bg-white p-2 rounded-full shadow-md border border-slate-200 text-slate-500 hover:text-blue-600 transition-all ${showStats ? 'hidden' : 'block'}`}
         >
             <ChevronDown className="w-5 h-5 rotate-90" />
         </button>

      </div>
    </div>
  );
};