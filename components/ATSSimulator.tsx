import React, { useState, useEffect } from 'react';
import { Bot, AlertTriangle, CheckCircle, FileJson, Terminal, Download, ShieldCheck, ShieldAlert, Bug } from 'lucide-react';
import { OptimizeResponse, ATSReport } from '../types';
import { simulateATSParse } from '../services/geminiService';

interface ATSSimulatorProps {
    cvContent: OptimizeResponse['optimizedCV'];
}

export const ATSSimulator: React.FC<ATSSimulatorProps> = ({ cvContent }) => {
    const [report, setReport] = useState<ATSReport | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const runSimulation = async () => {
            setLoading(true);
            try {
                const data = await simulateATSParse(cvContent);
                setReport(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        runSimulation();
    }, [cvContent]);

    const downloadJsonResume = () => {
        const jsonResume = {
            basics: {
                name: cvContent.personalInfo.name,
                email: cvContent.personalInfo.email,
                phone: cvContent.personalInfo.phone,
                location: { address: cvContent.personalInfo.location },
                profiles: [{ network: "LinkedIn", url: cvContent.personalInfo.linkedin }],
                summary: cvContent.professionalSummary
            },
            work: cvContent.workExperience.map(w => ({
                name: w.company,
                position: w.role,
                startDate: w.date,
                highlights: w.bullets
            })),
            education: cvContent.education.map(e => ({
                institution: e.institution,
                studyType: e.degree,
                startDate: e.date
            })),
            skills: [{ name: "Professional Skills", keywords: cvContent.skills }]
        };

        const blob = new Blob([JSON.stringify(jsonResume, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-${cvContent.personalInfo.name.replace(/\s+/g, '-').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 font-mono text-sm animate-pulse">
                <Bot className="w-10 h-10 mb-4 text-emerald-500" />
                <p>SIMULATING_LEGACY_ATS_PARSER_V1.0...</p>
                <p className="text-xs opacity-60 mt-2">EXTRACTING_ENTITIES...</p>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 my-8 space-y-6 animate-in fade-in">
            
            {/* Header / Score */}
            <div className="bg-slate-900 text-green-400 p-6 rounded-t-xl font-mono shadow-lg border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Terminal className="w-8 h-8" />
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">ATS_PARSER_SIMULATOR</h2>
                        <p className="text-xs opacity-60 text-green-600">SYSTEM_ID: TALEO_MOCK_2024</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold">{report.readabilityScore}/100</div>
                    <div className="text-xs opacity-80 uppercase">Legibilidad Técnica</div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-b-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
                
                {/* Left Panel: Parsed Entities */}
                <div className="flex-1 p-6 border-r border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Entidades Extraídas
                    </h3>
                    
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500">Candidate Name</span>
                            <span className="font-mono text-slate-800 font-bold">{report.parsedData.candidateName || "NULL"}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500">Contact Email</span>
                            <span className="font-mono text-slate-800">{report.parsedData.email || "NULL"}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500">Skills Detected</span>
                            <span className="font-mono text-blue-600">{report.parsedData.skillsCount}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500">Recent Role</span>
                            <span className="font-mono text-slate-800 truncate max-w-[150px]">{report.parsedData.mostRecentRole || "UNKNOWN"}</span>
                        </div>
                        
                        <div className="bg-slate-50 p-3 rounded-lg mt-4">
                            <span className="text-xs text-slate-400 block mb-1 uppercase">Simulación de Texto Plano (Raw)</span>
                            <p className="font-mono text-xs text-slate-600 break-all leading-tight">
                                {report.rawTextExtraction}...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Errors & Logs */}
                <div className="flex-1 p-6 bg-slate-50/50">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Bug className="w-4 h-4 text-amber-500" /> Logs de Errores
                    </h3>

                    <div className="space-y-3">
                        {report.parsingErrors.length > 0 ? (
                            report.parsingErrors.map((err, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100">
                                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <span>{err}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100 flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>No critical parsing errors detected.</span>
                            </div>
                        )}
                        
                        <div className="mt-6">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Keyword Matching</h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {report.keywordMatches.found.map(k => (
                                    <span key={k} className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] rounded font-mono">+{k}</span>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {report.keywordMatches.missing.map(k => (
                                    <span key={k} className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[10px] rounded font-mono">-{k}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200">
                         <button 
                            onClick={downloadJsonResume}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <FileJson className="w-4 h-4" /> Exportar a JSON Resume (Standard)
                         </button>
                         <p className="text-[10px] text-slate-400 text-center mt-2">
                             Formato compatible con la mayoría de importadores de CV modernos.
                         </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
