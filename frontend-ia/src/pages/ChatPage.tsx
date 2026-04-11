import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Send, Bot, User, Plus, Menu, MessageSquare, Trash2, Home, Settings,
  ChevronLeft, Image as ImageIcon, Paperclip, Mic, UserCircle, LogOut, LogIn,
  X, Mail, Lock, SlidersHorizontal, BrainCircuit, AlignLeft, AlertTriangle, BarChart3, ShieldAlert, Printer
} from "lucide-react";

// ===== INTERFACES =====
interface Message { id: string; text: string; sender: "user" | "ai"; timestamp: Date; }
interface Chat { id: string; title: string; preview: string; timestamp: Date; messages: Message[]; }
interface UserProfile { nombre: string; email: string; avatar?: string; }
interface ReporteData { nombre: string; email: string; consultas: number; conversaciones: number; }

const PROMPT_SUGGESTIONS = [
  { icon: "💡", title: "Ideas creativas", prompt: "Dame 5 ideas creativas para un proyecto innovador" },
  { icon: "📊", title: "Análisis de datos", prompt: "Ayúdame a analizar tendencias en mi industria" },
  { icon: "✍️", title: "Escritura", prompt: "Ayúdame a escribir un artículo sobre inteligencia artificial" },
  { icon: "🎨", title: "Diseño", prompt: "Sugiere una paleta de colores moderna para una app" },
];

export default function ChatPage() {
  const navigate = useNavigate();
  
  // ===== RESPONSIVE: Detectar pantalla para el menú lateral =====
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("studentu-user");
    return saved ? JSON.parse(saved) : null;
  });
  const isLoggedIn = !!currentUser;

  // ===== SEGURIDAD A PRUEBA DE BALAS =====
  const emailLimpio = currentUser?.email?.toLowerCase().trim();
  const isAdmin = emailLimpio === "chris1@gmail.com" || emailLimpio === "admin@udem.edu.ni";

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ nombre: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // ===== REPORTES =====
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [reportsData, setReportsData] = useState<ReporteData[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState(() => {
    const saved = localStorage.getItem("studentu-settings");
    return saved ? JSON.parse(saved) : { personalidad: "amigable", creatividad: "balanceado", longitud: "detallado" };
  });

  useEffect(() => {
    localStorage.setItem("studentu-settings", JSON.stringify(aiSettings));
  }, [aiSettings]);

  const [chats, setChats] = useState<Chat[]>(() => {
    const savedChats = localStorage.getItem("studentu-chats");
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      return parsed.map((chat: any) => ({
        ...chat, timestamp: new Date(chat.timestamp),
        messages: chat.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      }));
    }
    return [];
  });

  const [currentChatId, setCurrentChatId] = useState<string | null>(chats.length > 0 ? chats[0].id : null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentChat = chats.find((chat) => chat.id === currentChatId);

  useEffect(() => {
    localStorage.setItem("studentu-chats", JSON.stringify(chats));
  }, [chats]);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isTyping]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // ===== LÓGICA DE FOTO DE PERFIL (CON IP DINÁMICA) =====
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          await fetch(`http://${window.location.hostname}:8000/api/avatar`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: currentUser.email, avatar: base64String })
          });
          const updatedUser = { ...currentUser, avatar: base64String };
          setCurrentUser(updatedUser);
          localStorage.setItem("studentu-user", JSON.stringify(updatedUser));
          setMenuOpen(false);
          showToast("¡Foto de perfil actualizada!");
        } catch(err) {
          showToast("Error al conectar con el servidor principal.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearAllHistory = () => {
    if(window.confirm("¿Estás completamente seguro de borrar TODO tu historial local? Esto no se puede deshacer.")){
      setChats([]); setCurrentChatId(null); setIsSettingsModalOpen(false); showToast("Historial borrado 🗑️");
    }
  };

  // ===== LÓGICA DE REGISTRO / LOGIN (CON IP DINÁMICA) =====
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    const emailParts = authForm.email.split("@");
    const dominiosValidos = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "udem.edu.ni"];
    if (emailParts.length !== 2 || !dominiosValidos.includes(emailParts[1].toLowerCase())) return setAuthError("Usa un correo válido (@gmail, @hotmail, @outlook, @udem.edu.ni).");
    
    if (authMode === "register") {
      if (authForm.nombre.trim().length < 3) return setAuthError("El nombre debe tener al menos 3 letras.");
      if (/(.)\1{3,}/.test(authForm.nombre)) return setAuthError("El nombre tiene demasiados caracteres repetidos.");
    }
    if (authForm.password.length <= 5) return setAuthError("La contraseña debe ser mayor a 5 caracteres.");
    if (!/[a-zA-Z]/.test(authForm.password) || !/[0-9]/.test(authForm.password)) return setAuthError("La contraseña debe contener letras y números.");
    if (/(.)\1{3,}/.test(authForm.password)) return setAuthError("La contraseña no puede tener caracteres tan repetidos.");

    setIsLoadingAuth(true);

    try {
      const endpoint = authMode === "login" ? "/api/login" : "/api/registro";
      const payload = authMode === "login" ? { email: authForm.email, password: authForm.password } : { nombre: authForm.nombre, email: authForm.email, password: authForm.password };

      const res = await fetch(`http://${window.location.hostname}:8000${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error en el servidor.");

      const userData = { nombre: data.nombre, email: data.email, avatar: data.avatar };
      setCurrentUser(userData);
      localStorage.setItem("studentu-user", JSON.stringify(userData));
      
      setIsAuthModalOpen(false); setAuthForm({ nombre: "", email: "", password: "" });
      showToast(`¡Bienvenido, ${data.nombre}!`);
    } catch (err: any) {
      setAuthError("No se pudo establecer conexión con el servidor.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem("studentu-user"); setMenuOpen(false); showToast("Sesión cerrada."); };

  // ===== LÓGICA DE ENVÍO DE CHAT (CON IP DINÁMICA) =====
  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    let targetChatId = currentChatId;

    if (!targetChatId) {
      const newChat: Chat = { id: Date.now().toString(), title: inputValue.slice(0, 30) + "...", preview: inputValue.slice(0, 50) + "...", timestamp: new Date(), messages: [] };
      setChats(prev => [newChat, ...prev]);
      targetChatId = newChat.id;
      setCurrentChatId(newChat.id);
      
      if (currentUser) {
        fetch(`http://${window.location.hostname}:8000/api/nueva_conversacion`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUser.email })
        }).catch(err => console.log(err));
      }
    }

    const userMessage: Message = { id: Date.now().toString(), text: inputValue, sender: "user", timestamp: new Date() };

    setChats((prevChats) => prevChats.map((chat) => chat.id === targetChatId ? { ...chat, messages: [...chat.messages, userMessage], preview: inputValue.slice(0, 50) + "...", timestamp: new Date(), title: chat.messages.length === 0 ? inputValue.slice(0, 30) + "..." : chat.title } : chat));

    const promptToSend = inputValue; setInputValue(""); setIsTyping(true);

    const updatedChat = chats.find(c => c.id === targetChatId) || { messages: [] };
    const recentMessages = updatedChat.messages.slice(-6);
    const historial = recentMessages.map((m) => `${m.sender === "user" ? "Usuario" : "IA"}: ${m.text}`).join("\n");

    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/chat/stream`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: promptToSend, historial: historial, email: currentUser?.email, configuracion: aiSettings }),
        signal: AbortSignal.timeout(80000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Error del servidor (${response.status})`);
      }
      if (!response.body) throw new Error("El navegador no pudo abrir la respuesta en directo.");

      const assistantMessageId = (Date.now() + 1).toString();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedAnswer = "";
      const processLine = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.error) throw new Error(event.error);
        if (typeof event.token !== "string" || !event.token) return;

        streamedAnswer += event.token;
        const currentText = streamedAnswer;
        setChats((prevChats) => prevChats.map((chat) => {
          if (chat.id !== targetChatId) return chat;
          const existing = chat.messages.some((message) => message.id === assistantMessageId);
          const aiMessage: Message = { id: assistantMessageId, text: currentText, sender: "ai", timestamp: new Date() };
          return {
            ...chat,
            messages: existing
              ? chat.messages.map((message) => message.id === assistantMessageId ? aiMessage : message)
              : [...chat.messages, aiMessage]
          };
        }));
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        lines.forEach(processLine);
      }
      buffer += decoder.decode();
      processLine(buffer);
      if (!streamedAnswer) throw new Error("La IA cerró la conexión sin responder.");
    } catch (error) {
      const detail = error instanceof Error && error.name === "TimeoutError"
        ? "La IA tardó demasiado en responder. Inténtalo de nuevo."
        : error instanceof Error ? error.message : "No se pudo conectar con la IA.";
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: `⚠️ ${detail}`, sender: "ai", timestamp: new Date() };
      setChats((prevChats) => prevChats.map((chat) => chat.id === targetChatId ? { ...chat, messages: [...chat.messages, errorMessage] } : chat));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  
  // Responsive: Cerrar el menú automáticamente al abrir o elegir un chat en móvil
  const handleNewChat = () => {
    setCurrentChatId(null);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };
  
  const handleDeleteChat = (chatId: string) => {
    const filteredChats = chats.filter((chat) => chat.id !== chatId); setChats(filteredChats);
    if (currentChatId === chatId) setCurrentChatId(filteredChats.length > 0 ? filteredChats[0].id : null);
  };

  const handleSuggestionClick = (prompt: string) => { setInputValue(prompt); textareaRef.current?.focus(); };
  const isEmptyChat = !currentChat || currentChat.messages.length === 0;

  // ===== ABRIR MODAL DE REPORTES (CON IP DINÁMICA) =====
  const openReports = async () => {
    setMenuOpen(false);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/reportes`);
      const data = await res.json();
      setReportsData(data);
      setIsReportsModalOpen(true);
    } catch(err) {
      showToast("No se pudo cargar los reportes.");
    }
  };

  // ===== FUNCIÓN PARA IMPRIMIR PDF =====
  const handlePrintPDF = () => {
    const printContent = document.getElementById("tabla-reportes");
    if (!printContent) return;
    const windowPrint = window.open('', '', 'width=900,height=650');
    if (!windowPrint) { showToast("Permite los pop-ups."); return; }
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    windowPrint.document.write(`
      <html>
        <head>
          <title>Reporte UdeM</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h2>📊 Reporte StudentU.IA</h2>
          <p>Generado el ${fecha}</p>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => { windowPrint.print(); windowPrint.close(); }, 250);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-purple-500/30 relative">
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />

      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[999] bg-slate-900 border border-purple-500/50 text-white px-6 py-3 rounded-full shadow-2xl shadow-purple-500/20 text-sm font-medium flex items-center gap-2">
            <Sparkles className="size-4 text-purple-400" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -100, 0], y: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      {/* ===== OVERLAY PARA MÓVILES ===== */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ===== SIDEBAR RESPONSIVE ===== */}
      <motion.aside 
        initial={false} 
        animate={{ width: sidebarOpen ? 260 : 0 }} 
        transition={{ duration: 0.3, ease: "easeInOut" }} 
        className="absolute inset-y-0 left-0 md:relative z-[100] md:z-40 border-r border-white/10 bg-slate-950/95 md:bg-slate-950/40 backdrop-blur-2xl overflow-hidden flex flex-col shrink-0 shadow-2xl md:shadow-none"
      >
        <div className="flex flex-col h-full w-[260px]">
          <div className="h-[73px] flex items-center justify-between px-5 shrink-0 border-b border-white/5">
            <div className="flex items-center">
              <div className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md mr-3"><Sparkles className="size-4 text-white" /></div>
              <span className="font-semibold text-white tracking-tight">UdeM - Collaborators</span>
            </div>
            {/* Botón X solo visible en móvil para cerrar el menú */}
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
              <X className="size-5" />
            </button>
          </div>
          <div className="p-4 shrink-0">
            <button onClick={handleNewChat} className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-500/20">
              <Plus className="size-4 mr-2" /> Nueva conversación
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
            <p className="text-[10px] font-bold text-slate-500 mb-3 px-2 tracking-widest uppercase">Historial Reciente</p>
            <AnimatePresence>
              <div className="space-y-1">
                {chats.map((chat) => (
                  <motion.div 
                    key={chat.id} 
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      if (window.innerWidth <= 768) setSidebarOpen(false); // Cierra en móvil al seleccionar chat
                    }} 
                    className={`group relative p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 ${currentChatId === chat.id ? "bg-white/10 text-white border border-white/5" : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"}`}
                  >
                    <MessageSquare className="size-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{chat.title}</p></div>
                    <button className="opacity-0 group-hover:opacity-100 size-7 p-0 hover:bg-red-500/20 rounded-md flex items-center justify-center transition-all absolute right-2" onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}><Trash2 className="size-3.5 text-red-400" /></button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
          <div className="p-3 border-t border-white/10 space-y-1 shrink-0">
            <button onClick={() => navigate("/")} className="w-full flex items-center text-slate-400 hover:text-white hover:bg-white/5 py-2.5 px-3 rounded-lg text-sm transition-colors"><Home className="size-4 mr-3" /> Inicio</button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="w-full flex items-center text-slate-400 hover:text-white hover:bg-white/5 py-2.5 px-3 rounded-lg text-sm transition-colors"><SlidersHorizontal className="size-4 mr-3" /> Configuración</button>
          </div>
        </div>
      </motion.aside>

      {/* ===== MAIN CHAT AREA ===== */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0 w-full">
        <header className="h-[73px] px-4 md:px-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-950/40 backdrop-blur-md relative z-50 overflow-visible">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors border border-white/5 shrink-0">
              <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>{sidebarOpen ? <ChevronLeft className="size-5" /> : <Menu className="size-5" />}</motion.div>
            </button>
            <div className="min-w-0">
               <h1 className="font-semibold text-white text-sm md:text-base truncate max-w-[150px] md:max-w-[200px]">{currentChat?.title || "Nueva conversación"}</h1>
               <p className="text-[10px] md:text-xs text-slate-400 truncate">Asistente UdeM - Activo</p>
            </div>
          </div>

          <div className="relative shrink-0">
            {isLoggedIn ? (
              <button onClick={() => setMenuOpen(!menuOpen)} className="size-9 md:size-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg shadow-purple-500/20 border-2 border-white/10 overflow-hidden">
                {currentUser.avatar ? <img src={currentUser.avatar} alt="Perfil" className="w-full h-full object-cover" /> : <span className="font-bold text-white text-sm">{currentUser.nombre.charAt(0).toUpperCase()}</span>}
              </button>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium border border-white/10 shadow-lg"><LogIn className="size-4" /> <span className="hidden sm:inline">Iniciar Sesión</span></button>
            )}
            
            <AnimatePresence>
              {menuOpen && isLoggedIn && (
                <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-2 z-[999] overflow-hidden max-w-[calc(100vw-2rem)]">
                  <div className="px-4 py-3 border-b border-white/10 mb-1"><p className="text-sm font-semibold text-white truncate">{currentUser.nombre}</p><p className="text-xs text-slate-400 truncate">{currentUser.email}</p></div>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center transition-colors"><UserCircle className="mr-3 size-4" /> Cambiar foto</button>
                  {isAdmin && <button onClick={openReports} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center transition-colors"><BarChart3 className="mr-3 size-4 text-blue-400" /> Panel de Administración</button>}
                  <button onClick={() => {setMenuOpen(false); setIsSettingsModalOpen(true);}} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center transition-colors"><SlidersHorizontal className="mr-3 size-4" /> Ajustes IA</button>
                  <div className="border-t border-white/10 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors"><LogOut className="mr-3 size-4" /> Cerrar sesión</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 sm:px-6 custom-scrollbar relative z-0 flex flex-col">
          <div className="max-w-4xl mx-auto py-6 md:py-8 w-full flex-1 flex flex-col justify-end">
            {isEmptyChat ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-auto mb-auto py-8 md:py-12 flex flex-col items-center">
                <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-xl shadow-purple-500/20"><Sparkles className="size-8 text-white" /></div>
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4 tracking-tight text-center px-4">¿En qué puedo ayudarte hoy?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full max-w-3xl px-2">
                  {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                    <button key={index} onClick={() => handleSuggestionClick(suggestion.prompt)} className="text-left p-4 md:p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all group">
                      <div className="text-2xl md:text-3xl mb-2 md:mb-3">{suggestion.icon}</div>
                      <div className="font-semibold text-white text-sm md:text-base mb-1 md:mb-2 group-hover:text-purple-300 transition-colors">{suggestion.title}</div>
                      <div className="text-xs md:text-sm text-slate-400 line-clamp-2">{suggestion.prompt}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {currentChat?.messages.map((message) => (
                    <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 md:gap-4 mb-6 md:mb-8 ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                      <div className="size-8 md:size-10 rounded-full flex items-center justify-center border border-white/10 overflow-hidden shadow-lg shrink-0">
                        {message.sender === "ai" ? <Bot className="size-4 md:size-5 text-white" /> : currentUser?.avatar ? <img src={currentUser.avatar} alt="Perfil" className="w-full h-full object-cover" /> : <User className="size-4 md:size-5 text-slate-300" />}
                      </div>
                      <div className={`flex-1 ${message.sender === "user" ? "flex justify-end" : ""}`}>
                        <div className={`max-w-[90%] md:max-w-[85%] px-4 md:px-6 py-3 md:py-4 rounded-2xl text-[14px] md:text-[15px] shadow-xl ${message.sender === "ai" ? "bg-white/5 border border-white/10 text-slate-200" : "bg-gradient-to-br from-purple-600 to-blue-600 text-white"}`}>
                          {message.text}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && <div className="text-xs text-slate-500 italic ml-12 md:ml-14 mb-4">La IA está escribiendo...</div>}
                <div ref={messagesEndRef} className="h-4" />
              </>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-6 shrink-0 z-50 bg-slate-950/40 backdrop-blur-md border-t border-white/10">
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-black/20 border border-white/10 rounded-2xl focus-within:border-purple-500/50 transition-colors flex flex-col shadow-xl">
              <textarea ref={textareaRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Envía un mensaje a StudentU..." className="w-full bg-transparent border-0 text-sm md:text-base text-white px-4 md:px-5 py-3 md:py-4 resize-none focus:outline-none min-h-[50px] md:min-h-[56px] max-h-[150px] custom-scrollbar" rows={1} />
              <div className="flex items-center justify-between px-2 md:px-3 pb-2 md:pb-3">
                <div className="flex items-center text-slate-400 gap-0.5 md:gap-1">
                  <button onClick={() => showToast("Adjuntar archivos llegará pronto 🚀")} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><Paperclip className="size-4 md:size-4.5" /></button>
                  <button onClick={() => showToast("Subir imágenes llegará pronto 📸")} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><ImageIcon className="size-4 md:size-4.5" /></button>
                </div>
                <button onClick={handleSend} disabled={!inputValue.trim() || isTyping} className="p-2 md:p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white rounded-xl transition-all shadow-lg"><Send className="size-4" /></button>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-slate-500 text-center mt-2 md:mt-4">StudentU.IA de UdeM - Collaborators</p>
          </div>
        </div>
      </div>

      {/* ===== MODALES (REPORTES, CONFIGURACIÓN, LOGIN) - SIN CAMBIOS IMPORTANTES ===== */}
      {/* ===== MODAL DE REPORTES ===== */}
      <AnimatePresence>
        {isReportsModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2 md:gap-3"><ShieldAlert className="text-blue-400 size-5 md:size-6" /><h3 className="font-bold text-white text-sm md:text-base">Panel de Administración</h3></div>
                <div className="flex gap-2 md:gap-4"><button onClick={handlePrintPDF} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm flex items-center gap-2"><Printer className="size-3 md:size-4" /> PDF</button><button onClick={() => setIsReportsModalOpen(false)} className="text-slate-400"><X className="size-5" /></button></div>
              </div>
              <div className="p-4 md:p-6 overflow-y-auto"><table id="tabla-reportes" className="w-full text-left text-xs md:text-sm"><thead className="bg-white/5 text-slate-300"><tr><th className="px-3 md:px-6 py-3 md:py-4">Nombre</th><th className="px-3 md:px-6 py-3 md:py-4">Correo</th><th className="px-3 md:px-6 py-3 md:py-4 text-center">Consultas</th><th className="px-3 md:px-6 py-3 md:py-4 text-center">Chats</th></tr></thead><tbody className="divide-y divide-white/5">{reportsData.map((u, i) => (<tr key={i}><td className="px-3 md:px-6 py-3 md:py-4 text-white font-medium">{u.nombre}</td><td className="px-3 md:px-6 py-3 md:py-4 text-slate-400">{u.email}</td><td className="px-3 md:px-6 py-3 md:py-4 text-center text-purple-400 font-bold">{u.consultas}</td><td className="px-3 md:px-6 py-3 md:py-4 text-center text-blue-400 font-bold">{u.conversaciones}</td></tr>))}</tbody></table></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* MODAL CONFIG IA */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3"><Settings className="size-5 text-purple-400" /><h3 className="font-semibold text-white">Ajustes de IA</h3></div>
                <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400"><X className="size-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-8">
                <div className="space-y-3"><p className="text-sm font-medium text-slate-300">Personalidad</p><div className="grid grid-cols-3 gap-2">{["académico", "amigable", "tutor"].map((opt) => (<button key={opt} onClick={() => setAiSettings({...aiSettings, personalidad: opt})} className={`py-2 px-3 rounded-lg text-xs capitalize border ${aiSettings.personalidad === opt ? "bg-purple-600/20 border-purple-500/50 text-white" : "bg-white/5 border-white/5 text-slate-400"}`}>{opt}</button>))}</div></div>
                <div className="space-y-3"><p className="text-sm font-medium text-slate-300">Creatividad</p><div className="grid grid-cols-3 gap-2">{["estricto", "balanceado", "creativo"].map((opt) => (<button key={opt} onClick={() => setAiSettings({...aiSettings, creatividad: opt})} className={`py-2 px-3 rounded-lg text-xs capitalize border ${aiSettings.creatividad === opt ? "bg-blue-600/20 border-blue-500/50 text-white" : "bg-white/5 border-white/5 text-slate-400"}`}>{opt}</button>))}</div></div>
                <div className="border-t border-white/10 pt-6"><button onClick={handleClearAllHistory} className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-xs flex items-center justify-center gap-2"><Trash2 className="size-4" /> Borrar Historial Local</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
