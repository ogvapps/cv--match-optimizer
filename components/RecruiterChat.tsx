import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface RecruiterChatProps {
  contextData: any; // Optimized CV Data
  jobDescription: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const RecruiterChat: React.FC<RecruiterChatProps> = ({ contextData, jobDescription }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hola 👋 Soy tu reclutador AI. ¿Tienes dudas sobre tu CV optimizado o cómo abordar la entrevista?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const [chatSession, setChatSession] = useState<any>(null);

  useEffect(() => {
    if (isOpen && !chatSession) {
       const systemInstruction = `
       Eres un experto reclutador y coach de carrera amigable.
       Tienes acceso al CV optimizado del usuario y a la descripción del trabajo (JD).
       
       CONTEXTO DEL USUARIO:
       Nombre: ${contextData.optimizedCV.personalInfo.name}
       Puesto objetivo: ${contextData.optimizedCV.professionalSummary.substring(0, 50)}...
       
       TUS FUNCIONES:
       1. Responder dudas sobre por qué hiciste ciertos cambios en el CV.
       2. Dar consejos para la entrevista basados en la JD.
       3. Explicar términos técnicos o "keywords" que añadiste.
       
       Mantén las respuestas concisas (máx 3 frases) a menos que te pidan más detalle.
       `;

       const chat = ai.chats.create({
         model: "gemini-2.5-flash",
         config: { systemInstruction }
       });
       setChatSession(chat);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatSession) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Lo siento, tuve un problema de conexión. Inténtalo de nuevo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 font-bold ${isOpen ? 'bg-slate-800 rotate-90 scale-0' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105'}`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden md:inline">Chat Reclutador</span>
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 w-[90vw] md:w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 h-[500px]' : 'scale-0 opacity-0 h-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
                <div className="bg-blue-500 p-1.5 rounded-lg">
                    <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Coach AI</h3>
                    <p className="text-[10px] text-slate-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        En línea
                    </p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] rounded-xl p-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-slate-500 animate-pulse" />
                    </div>
                    <div className="bg-white p-3 rounded-xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu duda..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
        </form>

      </div>
    </>
  );
};
