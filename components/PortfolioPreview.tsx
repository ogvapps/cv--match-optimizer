import React, { useState } from 'react';
import { OptimizeResponse, PortfolioStyle } from '../types';
import { generatePortfolioCode } from '../services/geminiService';
import { Laptop, Terminal, Palette, Code, Download, RefreshCw, Loader2, Smartphone, Monitor, Sparkles, MessageSquare } from 'lucide-react';

interface PortfolioPreviewProps {
    cvContent: OptimizeResponse['optimizedCV'];
    accentColor: string;
}

export const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ cvContent, accentColor }) => {
    const [style, setStyle] = useState<PortfolioStyle>('modern_spa');
    const [customInstruction, setCustomInstruction] = useState('');
    const [htmlCode, setHtmlCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const code = await generatePortfolioCode(cvContent, style, accentColor, customInstruction);
            setHtmlCode(code);
        } catch (e) {
            console.error(e);
            alert("Error generando el portafolio. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!htmlCode) return;
        const blob = new Blob([htmlCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-${cvContent.personalInfo.name.replace(/\s+/g, '-').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 my-8">
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col h-[900px]">
                
                {/* Control Panel */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                    
                    {/* Brand & Style Select */}
                    <div className="flex flex-col gap-4 flex-1 w-full">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                                <Laptop className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg leading-tight flex items-center gap-2">
                                    Generador Web Pro <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-mono">AI v2.0</span>
                                </h2>
                                <p className="text-xs text-slate-400">Tailwind CSS + Animaciones CSS + SEO Friendly</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-sm overflow-x-auto max-w-full">
                            <button 
                                onClick={() => setStyle('modern_spa')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${style === 'modern_spa' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                <Monitor className="w-3.5 h-3.5" /> Modern SaaS
                            </button>
                            <button 
                                onClick={() => setStyle('developer_terminal')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${style === 'developer_terminal' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                <Terminal className="w-3.5 h-3.5" /> Hacker Console
                            </button>
                            <button 
                                onClick={() => setStyle('creative_grid')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${style === 'creative_grid' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                            >
                                <Palette className="w-3.5 h-3.5" /> Bento Grid
                            </button>
                        </div>
                    </div>

                    {/* Custom Prompt & Actions */}
                    <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-stretch">
                         <div className="relative flex-1 xl:w-80">
                             <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                             <textarea 
                                value={customInstruction}
                                onChange={(e) => setCustomInstruction(e.target.value)}
                                placeholder="Instrucciones extra (ej: 'Usa modo oscuro y neón rosa', 'Añade un blog', 'Hazlo muy minimalista')..."
                                className="w-full h-full min-h-[50px] pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                             />
                         </div>

                         <div className="flex flex-col gap-2 justify-center">
                            <div className="flex bg-slate-950 rounded-lg border border-slate-700 p-1 self-end md:self-auto">
                                <button onClick={() => setDeviceMode('desktop')} className={`p-2 rounded ${deviceMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`} title="Vista Escritorio">
                                    <Monitor className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeviceMode('mobile')} className={`p-2 rounded ${deviceMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`} title="Vista Móvil">
                                    <Smartphone className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="bg-white text-slate-900 px-5 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-50 shadow-lg shadow-white/10 whitespace-nowrap flex-1"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (htmlCode ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />)}
                                    {htmlCode ? "Regenerar Web" : "Diseñar Web"}
                                </button>
                                {htmlCode && (
                                    <button 
                                        onClick={handleDownload}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                         </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                    {loading ? (
                        <div className="relative z-10 flex flex-col items-center justify-center text-slate-400 bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full text-center">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                            <h3 className="text-white font-bold text-xl mb-2">Diseñando Arquitectura...</h3>
                            <div className="space-y-2 text-xs font-mono opacity-80 text-left bg-black/30 p-4 rounded-lg w-full">
                                <p className="text-emerald-400 flex gap-2"><span className="animate-pulse">✓</span> analyzing_cv_data()</p>
                                <p className="text-blue-400 flex gap-2"><span className="animate-pulse delay-75">✓</span> generating_hero_section()</p>
                                <p className="text-purple-400 flex gap-2"><span className="animate-pulse delay-150">➜</span> coding_interactive_components()</p>
                                <p className="text-slate-400 flex gap-2"><span className="animate-pulse delay-300">➜</span> polishing_css_animations()</p>
                            </div>
                        </div>
                    ) : htmlCode ? (
                        <div className={`transition-all duration-500 ease-in-out shadow-2xl ${deviceMode === 'mobile' ? 'w-[375px] h-[700px] rounded-3xl border-8 border-slate-800 bg-slate-800' : 'w-full h-full rounded-none'}`}>
                            {deviceMode === 'mobile' && <div className="w-full h-6 bg-slate-800 rounded-t-2xl flex justify-center items-center"><div className="w-20 h-4 bg-black rounded-b-xl"></div></div>}
                            <iframe 
                                srcDoc={htmlCode}
                                title="Portfolio Preview"
                                className={`w-full h-full bg-white ${deviceMode === 'mobile' ? 'rounded-b-2xl' : ''}`}
                                sandbox="allow-scripts"
                            />
                        </div>
                    ) : (
                        <div className="relative z-10 text-center space-y-6 max-w-lg">
                            <div className="w-24 h-24 bg-slate-800 rounded-3xl mx-auto flex items-center justify-center border border-slate-700 shadow-2xl rotate-3">
                                <Palette className="w-10 h-10 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-2xl">Crea tu Web Personal Profesional</h3>
                                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                                    La IA generará un sitio web completo con 
                                    <span className="text-blue-400 font-bold"> Hero, Proyectos, Timeline de Experiencia y Contacto</span>. 
                                    <br/>Todo en un solo archivo HTML listo para subir.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {htmlCode && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600 h-fit"><Code className="w-5 h-5" /></div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-800">Código Limpio y Moderno</h4>
                            <p className="text-xs text-slate-500 mt-1">Generado con HTML5 semántico, Tailwind CSS y animaciones fluidas.</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 h-fit"><Smartphone className="w-5 h-5" /></div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-800">100% Responsive</h4>
                            <p className="text-xs text-slate-500 mt-1">Se adapta perfectamente a móviles, tablets y monitores grandes.</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600 h-fit"><Sparkles className="w-5 h-5" /></div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-800">Contenido Inteligente</h4>
                            <p className="text-xs text-slate-500 mt-1">La IA inventa proyectos y testimonios basados en tu perfil para rellenar la web.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};