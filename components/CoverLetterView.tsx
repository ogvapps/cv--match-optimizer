import React from 'react';
import { OptimizeResponse } from '../types';
import { DesignSettings } from './ResultCard';

interface CoverLetterViewProps {
  coverLetter: string;
  setCoverLetter: (val: string) => void;
  cvContent: OptimizeResponse['optimizedCV'];
  theme: 'classic' | 'modern' | 'minimal';
  viewMode: 'preview' | 'analysis' | 'raw';
  designSettings: DesignSettings;
}

export const CoverLetterView: React.FC<CoverLetterViewProps> = ({ 
  coverLetter, 
  setCoverLetter, 
  cvContent, 
  theme,
  viewMode,
  designSettings
}) => {
  
  // Helper for dynamic colors
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };
  const rgb = hexToRgb(designSettings.color);

  // Style mapping
  const containerStyle = {
      '--theme-color': designSettings.color,
      '--theme-rgb': rgb,
  } as React.CSSProperties;

  const currentStyle = {
    fontBody: designSettings.font,
    fontHead: designSettings.font,
    textHeader: 'text-[color:var(--theme-color)]',
  };

  const getDisplayContent = (htmlContent: string) => {
    if (viewMode === 'analysis') return htmlContent;
    return htmlContent.replace(/<span class="keyword-highlight[^>]*>(.*?)<\/span>/g, "$1");
  };

  return (
    <div id="printable-resume" style={containerStyle} className={`relative w-full max-w-[210mm] mx-auto bg-white shadow-xl my-8 print:shadow-none print:my-0 print:w-full print:max-w-none transition-all duration-300 ${currentStyle.fontBody}`}>
        <div className="p-[20mm] md:p-[25mm] text-slate-900 leading-normal min-h-[297mm]">
            <div className="mb-12">
                <h1 className={`text-3xl font-bold uppercase tracking-tight mb-2 ${currentStyle.fontHead} ${currentStyle.textHeader}`}>
                    {cvContent.personalInfo.name || "Tu Nombre"}
                </h1>
                <p className="text-slate-500 text-sm">{cvContent.personalInfo.email} • {cvContent.personalInfo.phone}</p>
            </div>

            <div 
                contentEditable
                suppressContentEditableWarning
                className="whitespace-pre-wrap outline-none focus:bg-slate-100 rounded p-4 -m-4 text-justify leading-relaxed"
                dangerouslySetInnerHTML={{ __html: getDisplayContent(coverLetter) || "Generando carta..." }}
                onBlur={(e) => setCoverLetter(e.currentTarget.innerHTML)}
            />

            <div className="mt-16 pt-8 border-t border-slate-200">
                {/* 'Atentamente' removed here as AI includes it */}
                <p className="mt-4 text-lg font-script text-slate-600">{cvContent.personalInfo.name}</p>
            </div>
        </div>
    </div>
  );
};