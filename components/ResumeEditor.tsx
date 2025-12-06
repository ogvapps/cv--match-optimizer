import React, { useState, useRef } from 'react';
import { MapPin, Mail, Phone, Linkedin, Briefcase, Wand2, Loader2, TrendingUp, Check, Sparkles, ArrowUp, ArrowDown, Trash2, SplitSquareHorizontal, X, GripVertical, Settings2, Camera } from 'lucide-react';
import { OptimizeResponse, BulletStyle } from '../types';
import { regenerateBullet, generateSmartDiff } from '../services/geminiService';
import { DesignSettings } from './ResultCard';

interface ResumeEditorProps {
  cvContent: OptimizeResponse['optimizedCV'];
  setCvContent: React.Dispatch<React.SetStateAction<OptimizeResponse['optimizedCV']>>;
  viewMode: 'preview' | 'analysis' | 'raw';
  theme: 'classic' | 'modern' | 'minimal';
  layout: 'single' | 'double';
  originalContent?: string;
  designSettings: DesignSettings;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ 
  cvContent, 
  setCvContent, 
  viewMode, 
  theme, 
  layout,
  originalContent,
  designSettings
}) => {
  const [loadingBullet, setLoadingBullet] = useState<{expIndex: number, bulletIndex: number} | null>(null);
  const [activeBulletMenu, setActiveBulletMenu] = useState<{expIndex: number, bulletIndex: number} | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffHtml, setDiffHtml] = useState<string | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  
  // Layout Order State
  const [sectionOrder, setSectionOrder] = useState<string[]>(['summary', 'experience', 'education', 'skills']);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Theme Logic ---
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };
  const rgb = hexToRgb(designSettings.color);

  // CSS Variables for Themes
  const containerStyle = {
      '--theme-color': designSettings.color,
      '--theme-rgb': rgb,
      '--font-main': theme === 'minimal' ? '"Space Mono", monospace' : theme === 'classic' ? '"Merriweather", serif' : '"Inter", sans-serif',
      '--font-head': theme === 'minimal' ? '"Space Mono", monospace' : theme === 'classic' ? '"Merriweather", serif' : '"Roboto", sans-serif',
  } as React.CSSProperties;

  // Helpers
  const handleUpdateCV = (section: string, index: number | null, field: string, value: string) => {
    const newContent = { ...cvContent };
    if (section === 'personalInfo') {
      // @ts-ignore
      newContent.personalInfo[field] = value;
    } else if (section === 'professionalSummary') {
      newContent.professionalSummary = value;
    } else if (section === 'workExperience' && index !== null) {
      // @ts-ignore
      newContent.workExperience[index][field] = value;
    } else if (section === 'education' && index !== null) {
      // @ts-ignore
      newContent.education[index][field] = value;
    }
    setCvContent(newContent);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => { handleUpdateCV('personalInfo', null, 'avatar', reader.result as string); };
        reader.readAsDataURL(file);
    }
  };

  const handleRegenerateBullet = async (expIndex: number, bulletIndex: number, style: BulletStyle) => {
    setLoadingBullet({ expIndex, bulletIndex });
    setActiveBulletMenu(null);
    try {
        const originalBullet = cvContent.workExperience[expIndex].bullets[bulletIndex];
        const newBullet = await regenerateBullet(originalBullet, style);
        const newCV = { ...cvContent };
        newCV.workExperience[expIndex].bullets[bulletIndex] = newBullet;
        setCvContent(newCV);
    } catch (e) { console.error(e); } finally { setLoadingBullet(null); }
  };

  const handleSmartDiff = async () => {
      if (!originalContent) return;
      setLoadingDiff(true);
      setShowDiff(true);
      try {
          const summaryHtml = await generateSmartDiff(originalContent.substring(0, 1000) + "...", stripHtml(cvContent.professionalSummary));
          setDiffHtml(summaryHtml);
      } catch (e) { console.error(e); } finally { setLoadingDiff(false); }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };
  
  const getDisplayContent = (htmlContent: string) => viewMode === 'analysis' ? htmlContent : htmlContent.replace(/<span class="keyword-highlight[^>]*>(.*?)<\/span>/g, "$1");

  // Move Helpers
  const moveItem = (list: any[], index: number, dir: 'up'|'down') => {
      const newList = [...list];
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target >= 0 && target < newList.length) {
          [newList[index], newList[target]] = [newList[target], newList[index]];
      }
      return newList;
  };

  // --- Sub-Renderers (Theme Aware) ---

  const ContactInfo = ({ vertical = false }) => (
      <div className={`flex ${vertical ? 'flex-col gap-2 mt-4' : 'flex-wrap gap-x-4 gap-y-1 mt-2'} text-[10px] md:text-xs text-slate-600`}>
          {[{ k: 'location', i: MapPin }, { k: 'email', i: Mail }, { k: 'phone', i: Phone }, { k: 'linkedin', i: Linkedin }].map((item, idx) => (
              // @ts-ignore
              cvContent.personalInfo[item.k] && (
                  <div key={idx} className="flex items-center gap-1.5 opacity-90">
                      <item.i className="w-3 h-3 text-[color:var(--theme-color)]" />
                      <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-blue-50/50 rounded px-0.5" onBlur={(e) => handleUpdateCV('personalInfo', null, item.k, e.currentTarget.textContent || '')}>
                          {/* @ts-ignore */}
                          {cvContent.personalInfo[item.k].replace(/^https?:\/\//, '')}
                      </span>
                  </div>
              )
          ))}
      </div>
  );

  const SectionHeader = ({ title, sidebar = false }: { title: string, sidebar?: boolean }) => {
      // Modern Style
      if (theme === 'modern') return (
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-3 ${sidebar ? 'text-slate-800 border-b border-slate-300' : 'text-[color:var(--theme-color)] border-b border-slate-200'} pb-1`}>
              {title}
          </h2>
      );
      // Classic Style
      if (theme === 'classic') return (
          <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-slate-300 flex-1"></div>
              <h2 className="text-sm font-serif font-bold text-slate-800 uppercase tracking-widest">{title}</h2>
              <div className="h-px bg-slate-300 flex-1"></div>
          </div>
      );
      // Minimal Style
      return (
          <h2 className="text-sm font-mono font-bold text-black uppercase border-b-2 border-black pb-1 mb-4">{title}</h2>
      );
  };

  const SkillsSection = ({ sidebar = false }) => (
      cvContent.skills.length > 0 ? (
        <div className="mb-6 group relative">
            <SectionHeader title="Habilidades" sidebar={sidebar} />
            <div className="flex flex-wrap gap-2">
                {cvContent.skills.map((skill, index) => (
                    <span key={index} contentEditable suppressContentEditableWarning 
                        className={`
                            px-2 py-1 text-[10px] md:text-xs font-medium rounded 
                            ${theme === 'modern' ? (sidebar ? 'bg-white text-slate-700 shadow-sm' : 'bg-[color:rgba(var(--theme-rgb),0.05)] text-[color:var(--theme-color)] border border-[color:rgba(var(--theme-rgb),0.1)]') : ''}
                            ${theme === 'classic' ? 'bg-transparent text-slate-800 border-b border-slate-300 rounded-none px-0 py-0 mr-2' : ''}
                            ${theme === 'minimal' ? 'bg-black text-white rounded-none' : ''}
                        `}
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </div>
      ) : <></>
  );

  const ExperienceSection = () => (
    <div className="mb-6 group relative">
        <SectionHeader title="Experiencia" />
        <div className="space-y-5">
            {cvContent.workExperience.map((exp, index) => (
                <div key={index} className="break-inside-avoid relative group/exp">
                    {/* Hover Controls */}
                    <div className="absolute -left-6 top-0 hidden group-hover/exp:flex flex-col gap-1 no-print z-10">
                        <button onClick={() => setCvContent({...cvContent, workExperience: moveItem(cvContent.workExperience, index, 'up')})} className="p-1 text-slate-300 hover:text-blue-500"><ArrowUp className="w-3 h-3" /></button>
                        <button onClick={() => deleteExperience(index)} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </div>

                    <div className={`flex justify-between items-baseline mb-1 ${theme === 'minimal' ? 'border-b border-dotted border-slate-300 pb-1' : ''}`}>
                        <h3 contentEditable suppressContentEditableWarning className={`font-bold text-sm md:text-base outline-none focus:bg-blue-50 rounded ${theme === 'modern' ? 'text-[color:var(--theme-color)]' : 'text-slate-900'}`} onBlur={(e) => handleUpdateCV('workExperience', index, 'role', e.currentTarget.textContent || '')}>{exp.role}</h3>
                        <span contentEditable suppressContentEditableWarning className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-2" onBlur={(e) => handleUpdateCV('workExperience', index, 'date', e.currentTarget.textContent || '')}>{exp.date}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2 text-xs md:text-sm text-slate-700">
                        <div className="font-semibold flex items-center gap-1">
                            {theme === 'modern' && <Briefcase className="w-3 h-3 opacity-50" />}
                            <span contentEditable suppressContentEditableWarning onBlur={(e) => handleUpdateCV('workExperience', index, 'company', e.currentTarget.textContent || '')}>{exp.company}</span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-1 text-[10px] md:text-xs">
                           {theme === 'modern' && <MapPin className="w-3 h-3 opacity-50" />}
                           {exp.location}
                        </div>
                    </div>

                    <ul className={`text-xs md:text-sm text-slate-700 leading-relaxed ${theme === 'minimal' ? 'list-square ml-4' : 'list-disc ml-4'}`}>
                        {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="group/li relative pl-1 mb-1 marker:text-slate-400">
                                <div className="absolute -left-10 top-0 opacity-0 group-hover/li:opacity-100 transition-opacity no-print flex items-center bg-white shadow-sm border rounded p-0.5">
                                   <button onClick={() => handleRegenerateBullet(index, bIdx, 'result_oriented')} className="p-1 text-purple-500 hover:bg-purple-50 rounded"><Wand2 className="w-3 h-3" /></button>
                                   <button onClick={() => deleteBullet(index, bIdx)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                                </div>
                                {loadingBullet?.expIndex === index && loadingBullet?.bulletIndex === bIdx ? (
                                    <span className="flex items-center gap-1 text-purple-600 animate-pulse bg-purple-50 px-1 rounded"><Loader2 className="w-3 h-3 animate-spin" /> Reescribiendo...</span>
                                ) : (
                                    <div contentEditable suppressContentEditableWarning className="outline-none focus:bg-blue-50 rounded" dangerouslySetInnerHTML={{ __html: getDisplayContent(bullet) }} onBlur={(e) => {
                                        const newBullets = [...exp.bullets]; newBullets[bIdx] = e.currentTarget.innerHTML;
                                        handleUpdateCV('workExperience', index, 'bullets', newBullets as any);
                                    }} />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </div>
  );

  const deleteExperience = (i: number) => { if(confirm("¿Eliminar experiencia?")) { const n = [...cvContent.workExperience]; n.splice(i,1); setCvContent({...cvContent, workExperience: n}); } };
  const deleteBullet = (i: number, bi: number) => { const n = [...cvContent.workExperience]; n[i].bullets.splice(bi,1); setCvContent({...cvContent, workExperience: n}); };

  // --- Main Layout ---
  return (
    <div className="relative group/main">
        {layout === 'single' && (
             <div className="absolute right-0 -top-10 no-print">
                 <button onClick={() => setShowLayoutManager(!showLayoutManager)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center gap-2"><Settings2 className="w-3.5 h-3.5" /> Ordenar</button>
                 {showLayoutManager && (
                     <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl rounded-xl border border-slate-200 z-50 p-2">
                        {sectionOrder.map((s, i) => (
                            <div key={s} className="flex justify-between p-2 hover:bg-slate-50 rounded text-xs capitalize">
                                {s} 
                                <div className="flex gap-1"><button onClick={() => setSectionOrder(moveItem(sectionOrder, i, 'up'))}><ArrowUp className="w-3 h-3" /></button></div>
                            </div>
                        ))}
                     </div>
                 )}
             </div>
        )}

        <div 
            id="printable-resume" 
            style={containerStyle} 
            className={`
                relative w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white 
                shadow-[0_0_50px_rgba(0,0,0,0.08)] my-8 
                print:shadow-none print:my-0 print:w-full print:max-w-none 
                transition-all duration-300 
                font-[family-name:var(--font-main)]
                flex flex-col text-slate-900
            `}
        >
            {/* --- SINGLE LAYOUT --- */}
            {layout === 'single' && (
                <div className="p-[20mm] md:p-[25mm] flex-1 flex flex-col">
                    <header className={`mb-8 ${theme === 'classic' ? 'text-center border-b-2 border-slate-800 pb-6' : 'border-b border-slate-200 pb-6 flex items-start gap-6'}`}>
                        {cvContent.personalInfo.avatar && theme !== 'minimal' && (
                             <div className={`relative group/avatar shrink-0 ${theme === 'classic' ? 'mx-auto mb-4' : ''}`}>
                                 <img src={cvContent.personalInfo.avatar} className={`w-24 h-24 object-cover ${theme === 'modern' ? 'rounded-full ring-4 ring-slate-50' : 'rounded-lg shadow-sm'}`} />
                                 <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity text-white rounded-full"><Camera className="w-5 h-5" /></button>
                             </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        
                        <div className="flex-grow">
                            <h1 contentEditable suppressContentEditableWarning className={`text-3xl md:text-4xl font-bold uppercase tracking-tight mb-2 outline-none focus:bg-blue-50 rounded ${theme === 'modern' ? 'text-[color:var(--theme-color)]' : 'text-slate-900'} font-[family-name:var(--font-head)]`} onBlur={(e) => handleUpdateCV('personalInfo', null, 'name', e.currentTarget.textContent || '')}>
                                {cvContent.personalInfo.name}
                            </h1>
                            <ContactInfo vertical={theme === 'minimal'} />
                        </div>
                    </header>

                    {sectionOrder.map(section => (
                        <div key={section}>
                             {section === 'summary' && (
                                 <div className="mb-6">
                                     <SectionHeader title="Perfil" />
                                     <div contentEditable suppressContentEditableWarning className="text-xs md:text-sm text-slate-700 leading-relaxed text-justify outline-none focus:bg-blue-50 rounded" dangerouslySetInnerHTML={{ __html: getDisplayContent(cvContent.professionalSummary) }} onBlur={(e) => handleUpdateCV('professionalSummary', null, '', e.currentTarget.innerHTML)} />
                                 </div>
                             )}
                             {section === 'skills' && <SkillsSection />}
                             {section === 'experience' && <ExperienceSection />}
                             {section === 'education' && (
                                <div className="mb-6">
                                    <SectionHeader title="Educación" />
                                    {cvContent.education.map((edu, idx) => (
                                        <div key={idx} className="mb-2">
                                            <div className="flex justify-between font-bold text-sm">
                                                <span>{edu.institution}</span>
                                                <span className="text-xs font-normal">{edu.date}</span>
                                            </div>
                                            <div className="text-xs text-slate-600">{edu.degree}</div>
                                        </div>
                                    ))}
                                </div>
                             )}
                        </div>
                    ))}
                </div>
            )}

            {/* --- DOUBLE LAYOUT --- */}
            {layout === 'double' && (
                <div className="flex h-full min-h-[297mm]">
                    {/* Sidebar */}
                    <div className={`w-[32%] p-[10mm] pt-[15mm] flex flex-col gap-8 ${theme === 'modern' ? 'bg-slate-50 border-r border-slate-200' : theme === 'minimal' ? 'bg-white border-r border-black' : 'bg-slate-100'}`}>
                         <div className="relative group/avatar mx-auto">
                             {cvContent.personalInfo.avatar ? (
                                 <img src={cvContent.personalInfo.avatar} className="w-32 h-32 object-cover rounded-full shadow-md mx-auto" />
                             ) : (
                                 <div className="w-32 h-32 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center mx-auto text-slate-400 cursor-pointer" onClick={() => fileInputRef.current?.click()}><Camera className="w-8 h-8" /></div>
                             )}
                             <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                         </div>

                         <div><SectionHeader title="Contacto" sidebar /><ContactInfo vertical /></div>
                         <SkillsSection sidebar />
                         
                         <div>
                             <SectionHeader title="Educación" sidebar />
                             <div className="space-y-4">
                                {cvContent.education.map((edu, idx) => (
                                    <div key={idx}>
                                        <div className="font-bold text-sm text-slate-900">{edu.institution}</div>
                                        <div className="text-xs text-slate-600">{edu.degree}</div>
                                        <div className="text-[10px] text-slate-400 mt-1">{edu.date}</div>
                                    </div>
                                ))}
                             </div>
                         </div>
                    </div>

                    {/* Main */}
                    <div className="w-[68%] p-[10mm] pt-[15mm] flex flex-col">
                        <div className="mb-8 border-b border-slate-200 pb-6">
                            <h1 contentEditable suppressContentEditableWarning className={`text-4xl font-bold uppercase tracking-tight outline-none focus:bg-blue-50 rounded font-[family-name:var(--font-head)] ${theme === 'modern' ? 'text-[color:var(--theme-color)]' : 'text-slate-900'}`} onBlur={(e) => handleUpdateCV('personalInfo', null, 'name', e.currentTarget.textContent || '')}>
                                {cvContent.personalInfo.name}
                            </h1>
                            <p className="text-lg text-slate-500 font-light mt-1">Professional Profile</p>
                        </div>
                        
                        <div className="mb-8">
                            <SectionHeader title="Perfil Profesional" />
                            <div contentEditable suppressContentEditableWarning className="text-sm text-slate-700 leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: getDisplayContent(cvContent.professionalSummary) }} onBlur={(e) => handleUpdateCV('professionalSummary', null, '', e.currentTarget.innerHTML)} />
                        </div>

                        <ExperienceSection />
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};