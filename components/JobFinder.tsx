import React, { useState, useEffect } from 'react';
import { Globe, Search, MapPin, Briefcase, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { findRelevantJobs } from '../services/geminiService';

interface JobFinderProps {
  initialRole: string;
  initialLocation: string;
}

export const JobFinder: React.FC<JobFinderProps> = ({ initialRole, initialLocation }) => {
  const [role, setRole] = useState(initialRole);
  const [location, setLocation] = useState(initialLocation);
  const [results, setResults] = useState<{ text: string; sourceLinks: { title: string; url: string }[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search on mount if data is present
  useEffect(() => {
    if (initialRole && !hasSearched) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!role) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setHasSearched(true);

    try {
      const data = await findRelevantJobs(role, location);
      setResults(data);
    } catch (err) {
      setError("No pudimos realizar la búsqueda en este momento. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 my-8 space-y-6">
      
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Globe className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-900">Búsqueda de Empleos en Tiempo Real</h2>
                <p className="text-xs text-slate-500">Impulsado por Google Search Grounding</p>
            </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <Briefcase className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Puesto (ej: Frontend Developer)"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                />
            </div>
            <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ubicación (ej: Madrid, Remoto)"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                />
            </div>
            <button 
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Buscar
            </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 animate-in fade-in">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm font-medium">Buscando las mejores ofertas en la web...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* AI Summary/List */}
            <div className="bg-white rounded-xl shadow border border-slate-200 p-6 mb-6">
                 <div className="prose prose-sm prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {results.text}
                 </div>
            </div>

            {/* Grounding Sources (Required by Google) */}
            {results.sourceLinks.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Fuentes & Enlaces Directos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {results.sourceLinks.map((link, idx) => (
                            <a 
                                key={idx} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group"
                            >
                                <div className="bg-slate-100 p-2 rounded text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700">{link.title || "Enlace a la oferta"}</h4>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{link.url}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
            
            {results.sourceLinks.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm italic">
                    La IA generó la respuesta pero no proporcionó enlaces directos estructurados. Revisa el texto para más detalles.
                </div>
            )}
        </div>
      )}
    </div>
  );
};