import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Zap, Shield, Brain, Code, ArrowRight, Globe, Layers, 
  ChevronDown, MapPin, Users, Mail, User, Lock, X, LogOut, Briefcase, Link
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ===== INTERFACES =====
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

interface UserProfile {
  nombre: string;
  email: string;
  avatar?: string;
}

// ===== EQUIPO (MODIFICA LAS IMÁGENES AQUÍ) =====
const TEAM_MEMBERS = [
  {
    name: "Christhian Ortiz",
    role: "Lead Full-Stack Developer",
    description: "Arquitecto del ecosistema FastAPI y la integración de modelos Llama 3.2.",
    // PARA CAMBIAR LA FOTO: Reemplaza el texto entre comillas con la ruta de tu imagen
    image: "https://ui-avatars.com/api/?name=Christhian&background=6D28D9&color=fff&size=128", 
    gradient: "from-purple-500 to-blue-500"
  },
  {
    name: "Francisco José Vélez Castañeda",
    role: "Desarrollador IA / Investigador",
    description: "Especialista en estructuración de datos y entrenamiento del modelo.",
    image: "https://ui-avatars.com/api/?name=Francisco+Velez&background=2563EB&color=fff&size=128",
    gradient: "from-blue-500 to-cyan-500"
  },
    {
    name: "Jeremy Josue Juarez Pastran",
    role: "Desarrollador IA / Investigador",
    description: "Especialista en estructuración de datos y entrenamiento del modelo.",
    image: "https://ui-avatars.com/api/?name=Francisco+Velez&background=2563EB&color=fff&size=128",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    name: "Jessner Alfonso Leiva Avendaño",
    role: "Desarrollador Frontend",
    description: "Encargado de la experiencia de usuario interactiva y diseño visual.",
    image: "https://ui-avatars.com/api/?name=Jessner+Leiva&background=059669&color=fff&size=128",
    gradient: "from-emerald-500 to-teal-500"
  },
    {
    name: "Oliver Joel Villalta Chavarría",
    role: "Desarrollador Frontend",
    description: "Encargado de la experiencia de usuario interactiva y diseño visual.",
    image: "https://ui-avatars.com/api/?name=Jessner+Leiva&background=059669&color=fff&size=128",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    name: "Deybis Enrique Mercado Ortiz",
    role: "Ingeniero de Datos",
    description: "Recopilación y curación de los reglamentos oficiales de la UdeM.",
    image: "https://ui-avatars.com/api/?name=Deybis+Mercado&background=D97706&color=fff&size=128",
    gradient: "from-orange-500 to-amber-500"
  },
  {
    name: "Gerson Emmanuel Mora González0",
    role: "Backend Developer",
    description: "Optimización de la base de datos y endpoints en FastAPI.",
    image: "https://ui-avatars.com/api/?name=Gerson+Mora&background=DC2626&color=fff&size=128",
    gradient: "from-red-500 to-rose-500"
  },
  {
    name: "Enddy Paul Ramos Toruño",
    role: "Especialista NLP",
    description: "Ajuste de prompts y mejora de la coherencia en las respuestas.",
    image: "https://ui-avatars.com/api/?name=Enddy+Ramos&background=4F46E5&color=fff&size=128",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    name: "Javier Andrés Mendieta Parrales",
    role: "Analista de Calidad (QA)",
    description: "Pruebas de estrés y validación de precisión de la Inteligencia Artificial.",
    image: "https://ui-avatars.com/api/?name=Javier+Mendieta&background=9333EA&color=fff&size=128",
    gradient: "from-purple-500 to-fuchsia-500"
  },
  {
    name: "Jair Adrian Espinoza Hernandez",
    role: "UI/UX Designer",
    description: "Creación de interfaces limpias, modernas y accesibles para estudiantes.",
    image: "https://ui-avatars.com/api/?name=Jair+Espinoza&background=0284C7&color=fff&size=128",
    gradient: "from-sky-500 to-blue-500"
  },
  {
    name: "Agner Lenin Guido Flores",
    role: "DevOps Engineer",
    description: "Despliegue, configuración de servidores y mantenimiento de Ollama.",
    image: "https://ui-avatars.com/api/?name=Eddy+Sanchez&background=0D9488&color=fff&size=128",
    gradient: "from-teal-500 to-emerald-500"
  },
  {
    name: "Santiago Alberto López Zapata",
    role: "Investigador Académico",
    description: "Validación de normativas y enlace con las facultades de la UdeM.",
    image: "https://ui-avatars.com/api/?name=Santiago+Lopez&background=EA580C&color=fff&size=128",
    gradient: "from-amber-500 to-orange-500"
  },
  {
    name: "Luis Antonio Hernández Hernández",
    role: "Cloud Architect",
    description: "Diseño de la infraestructura y escalabilidad del proyecto.",
    image: "https://ui-avatars.com/api/?name=Luis+Hernandez&background=E11D48&color=fff&size=128",
    gradient: "from-rose-500 to-red-500"
  },
  {
    name: "Axel Alexander Estrada Blandón",
    role: "Project Manager",
    description: "Coordinación ágil, seguimiento de tareas y visión estratégica.",
    image: "https://ui-avatars.com/api/?name=Axel+Estrada&background=4338CA&color=fff&size=128",
    gradient: "from-indigo-500 to-violet-500"
  }
];

// ===== COMPONENTE DE PREGUNTAS FRECUENTES =====
function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 bg-white/[0.03] rounded-2xl overflow-hidden mb-4 transition-colors hover:bg-white/[0.06]">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-6 py-4 flex items-center justify-between text-left">
        <span className="font-medium text-slate-100">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="size-5 text-purple-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-6 pb-4 pt-0 text-slate-300 text-sm leading-relaxed border-t border-white/5 mt-2">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== FEATURE CARD =====
function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }} whileHover={{ y: -5 }} className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-purple-500/30 transition-all group">
      <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:bg-purple-500/20 transition-colors">
        <Icon className="size-6 text-purple-300" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">{title}</h3>
      <p className="text-slate-300 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ===== MAIN HOME COMPONENT =====
export default function Home() {
  const navigate = useNavigate();
  
  // Estados de Autenticación
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("studentu-user");
    return saved ? JSON.parse(saved) : null;
  });
  const isLoggedIn = !!currentUser;

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ nombre: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // FUNCIÓN DE SCROLL SUAVE
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoadingAuth(true);

    try {
      const endpoint = authMode === "login" ? "/api/login" : "/api/registro";
      const payload = authMode === "login" ? { email: authForm.email, password: authForm.password } : { nombre: authForm.nombre, email: authForm.email, password: authForm.password };

      // AQUI ESTÁ LA MAGIA: Dinámico para cualquier IP
      const res = await fetch(`http://${window.location.hostname}:8000${endpoint}`, { 
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error al conectar con el servidor.");

      const existingUser = localStorage.getItem("studentu-user");
      const existingAvatar = existingUser ? JSON.parse(existingUser).avatar : undefined;

      const userData = { nombre: data.nombre, email: data.email, avatar: existingAvatar };
      setCurrentUser(userData);
      localStorage.setItem("studentu-user", JSON.stringify(userData));
      
      setIsAuthModalOpen(false);
      navigate("/chat"); 
    } catch (err: any) {
      setAuthError(err.message === "Failed to fetch" ? "No se pudo conectar al servidor. Enciende main.py." : err.message);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("studentu-user");
  };

  const navLinks = [
    { name: "Características", id: "caracteristicas" },
    { name: "Equipo", id: "equipo" },
    { name: "FAQ", id: "faq" },
    { name: "Ubicación", id: "ubicacion" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight text-lg">UdeM - Collaborators</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <a key={link.id} href={`#${link.id}`} onClick={(e) => scrollToSection(e, link.id)} className="relative py-2 text-slate-300 hover:text-white transition-colors group">
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 py-1.5 px-3 rounded-full">
                  <div className="size-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20 flex items-center justify-center overflow-hidden border border-white/10">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-white text-xs">{currentUser.nombre.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-200 hidden sm:block pr-1">
                    Hola, {currentUser.nombre.split(" ")[0]}
                  </span>
                </div>

                <button onClick={() => navigate("/chat")} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-500/20">
                  Ir al Chat
                </button>
                <button onClick={handleLogout} className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Cerrar sesión">
                  <LogOut className="size-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => {setAuthMode("login"); setIsAuthModalOpen(true);}} className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors">
                  Iniciar Sesión
                </button>
                <button onClick={() => {setAuthMode("register"); setIsAuthModalOpen(true);}} className="bg-white text-black hover:bg-slate-200 px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg">
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ===== MODAL DE LOGIN / REGISTRO ===== */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
              <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X className="size-5" /></button>
              <div className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mr-3 shadow-lg shadow-purple-500/20"><Sparkles className="size-5 text-white" /></div>
                  <span className="font-bold text-xl text-white tracking-tight">StudentU.IA</span>
                </div>
                <div className="flex rounded-lg bg-white/5 p-1 mb-6">
                  <button onClick={() => {setAuthMode("login"); setAuthError("");}} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${authMode === "login" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}>Iniciar Sesión</button>
                  <button onClick={() => {setAuthMode("register"); setAuthError("");}} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${authMode === "register" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}>Crear Cuenta</button>
                </div>
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authError && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">{authError}</motion.div>}
                  {authMode === "register" && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400 ml-1">Nombre completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                        <input required type="text" value={authForm.nombre} onChange={e => setAuthForm({...authForm, nombre: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-purple-500/50 transition-colors" placeholder="Tu nombre" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 ml-1">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                      <input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-purple-500/50 transition-colors" placeholder="correo@udem.edu.ni" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 ml-1">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                      <input required type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-purple-500/50 transition-colors" placeholder="••••••••" />
                    </div>
                  </div>
                  <button disabled={isLoadingAuth} type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white py-2.5 rounded-lg font-medium transition-all shadow-lg mt-4 disabled:opacity-50">
                    {isLoadingAuth ? "Procesando..." : (authMode === "login" ? "Ingresar al Chat" : "Crear mi cuenta")}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 pt-20">
        {/* ===== HERO SECTION ===== */}
        <section className="px-6 py-20 md:py-28 min-h-[90vh] flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-purple-500/20 border border-purple-500/30 text-purple-200 mb-6">
                  <Sparkles className="size-4 mr-2 text-purple-300" /> Tecnología UdeM Exclusiva
                </span>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                  El futuro de tu <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-emerald-300">
                    Educación Superior
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl">
                  Descubre el poder de la IA entrenada con documentos oficiales de la UdeM. Resuelve dudas, analiza reglamentos y optimiza tu vida universitaria en segundos.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => isLoggedIn ? navigate("/chat") : setIsAuthModalOpen(true)} className="flex items-center bg-white text-purple-900 hover:bg-slate-200 text-lg font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl">
                    {isLoggedIn ? "Ir al Chat" : "Probar Gratis Ahora"} <ArrowRight className="ml-2 size-5" />
                  </button>
                  <a href="#caracteristicas" onClick={(e) => scrollToSection(e, 'caracteristicas')} className="flex items-center border border-white/30 bg-white/5 hover:bg-white/10 text-white text-lg font-medium px-8 py-3.5 rounded-xl transition-all">
                    Descubrir Más
                  </a>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative lg:ml-auto">
                <div className="relative rounded-2xl border border-white/20 bg-slate-900/40 backdrop-blur-xl overflow-visible shadow-2xl p-3 max-w-md mx-auto">
                  <div className="relative rounded-xl overflow-hidden shadow-inner">
                    <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000" alt="IA Dashboard" className="w-full opacity-90 scale-105 hover:scale-100 transition-transform duration-700" />
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-4 left-4 bg-slate-950/90 border border-white/10 px-3 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
                      <div className="p-1.5 bg-green-500/20 rounded-md"><Zap className="size-4 text-green-400" /></div>
                      <div><p className="text-xs font-bold text-white">Respuestas Rápidas</p><p className="text-[10px] text-slate-400">En menos de 2s</p></div>
                    </motion.div>
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-4 right-4 bg-slate-950/90 border border-white/10 px-3 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
                      <div className="p-1.5 bg-purple-500/20 rounded-md"><Shield className="size-4 text-purple-400" /></div>
                      <div><p className="text-xs font-bold text-white">100% Seguro</p><p className="text-[10px] text-slate-400">Datos privados</p></div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== CARACTERÍSTICAS ===== */}
        <section id="caracteristicas" className="px-6 py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Potencia sin límites</h2>
              <p className="text-lg text-slate-300">Explora las capacidades que hacen de StudentU.IA tu mejor aliado universitario.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard icon={Brain} title="IA Entrenada con UdeM" description="Conoce reglamentos, horarios y normativas específicas de la universidad." delay={0} />
              <FeatureCard icon={Zap} title="Respuestas Instantáneas" description="Procesamiento ultrarrápido impulsado por Llama 3.2 local." delay={0.1} />
              <FeatureCard icon={Shield} title="Privacidad Absoluta" description="Tus conversaciones y consultas académicas están totalmente encriptadas." delay={0.2} />
              <FeatureCard icon={Globe} title="Soporte Multiidioma" description="Traduce e interpreta textos académicos en más de 100 idiomas." delay={0.3} />
              <FeatureCard icon={Layers} title="Memoria de Contexto" description="Recuerda el hilo de la conversación para darte respuestas coherentes." delay={0.4} />
              <FeatureCard icon={Code} title="Análisis Estructural" description="Capacidad para desglosar problemas complejos en pasos sencillos." delay={0.5} />
            </div>
          </div>
        </section>

        {/* ===== EQUIPO / COLABORADORES ===== */}
        <section id="equipo" className="px-6 py-24 border-t border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 border border-blue-500/30 text-blue-300 mb-4 uppercase tracking-widest">
                <Users className="size-3 mr-2" /> UdeM - Collaborators
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Conoce a los creadores</h2>
              <p className="text-lg text-slate-300">Estudiantes y desarrolladores detrás de la revolución de la IA en nuestra universidad.</p>
            </div>

            {/* GRID DEL EQUIPO (4 COLUMNAS EN PANTALLAS GRANDES) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
              {TEAM_MEMBERS.map((member, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-center hover:bg-white/[0.05] hover:border-purple-500/50 transition-all group backdrop-blur-md shadow-xl flex flex-col h-full"
                >
                  <div className={`size-24 mx-auto rounded-full p-1 bg-gradient-to-br ${member.gradient} mb-4 shadow-lg`}>
                    <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover border-[3px] border-slate-900" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{member.name}</h3>
                  <p className="text-purple-300 text-xs font-medium mb-3">{member.role}</p>
                  <p className="text-slate-400 text-xs mb-6 flex-1">{member.description}</p>
                  <div className="flex justify-center gap-3 mt-auto">
                    <a href="#" className="p-2 bg-white/5 hover:bg-purple-600 rounded-full transition-colors text-white"><Link className="size-3.5" /></a>
                    <a href="#" className="p-2 bg-white/5 hover:bg-blue-600 rounded-full transition-colors text-white"><Briefcase className="size-3.5" /></a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ / PREGUNTAS FRECUENTES ===== */}
        <section id="faq" className="px-6 py-24 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Preguntas Frecuentes</h2>
              <p className="text-lg text-slate-300">Todo lo que necesitas saber sobre StudentU.IA</p>
            </div>
            <div className="space-y-3">
              <FAQItem question="¿Qué documentos conoce StudentU.IA?" answer="La IA ha sido entrenada específicamente con reglamentos, guías de admisión, manuales de carrera y normativa oficial de la Universidad de Managua (UdeM). Si le preguntas por información general del mundo, también te la responderá usando su base de datos global." />
              <FAQItem question="¿Mis conversaciones son privadas?" answer="Absolutamente. Todo el procesamiento de los chats se realiza de manera local en el servidor de la universidad mediante modelos Open Source (Llama 3.2). Tu información no se comparte con empresas externas como OpenAI o Google." />
              <FAQItem question="¿Tiene algún costo para los estudiantes?" answer="No, StudentU.IA es un proyecto colaborativo desarrollado para la comunidad universitaria y es completamente gratuito para todos los estudiantes y docentes con un correo activo." />
              <FAQItem question="¿Puede hacer mis tareas por mí?" answer="StudentU.IA está diseñado para ser una herramienta de apoyo académico, como un tutor Socrático. Te ayudará a entender conceptos complejos, estructurar ideas y encontrar bibliografía, pero siempre debes revisar y validar la información." />
            </div>
          </div>
        </section>

        {/* ===== UBICACIÓN (GOOGLE MAPS) ===== */}
        <section id="ubicacion" className="px-6 py-24 border-t border-white/5 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 mb-4 uppercase tracking-widest">
                <MapPin className="size-3 mr-2" /> Campus Central
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">¿Dónde nos ubicamos?</h2>
              <p className="text-lg text-slate-300">Universidad de Managua (UdeM), Nicaragua.</p>
            </div>
            
            <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-emerald-500/10 bg-slate-900 relative h-[450px] w-full p-2 backdrop-blur-md bg-white/5">
              <iframe 
                src="https://maps.google.com/maps?q=Universidad%20de%20Managua%20(UdeM)&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%" 
                height="100%" 
                className="rounded-2xl"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(80%) opacity(85%)' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl max-w-xs">
                <h4 className="font-bold text-white flex items-center gap-2 mb-2 text-lg"><MapPin className="size-5 text-emerald-400"/> UdeM</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Paso a Desnivel de Rubenia, 2 cuadras al Sur, 1 cuadra al Este. Managua, Nicaragua.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA FINAL ===== */}
        <section className="px-6 py-24 pb-32 border-t border-white/5 bg-gradient-to-b from-transparent to-purple-900/20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="size-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-500/30 rotate-12">
                <Sparkles className="size-10 text-white -rotate-12" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">El futuro es hoy.</h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">Únete a la nueva era académica con la IA de UdeM - Collaborators.</p>
              <button onClick={() => isLoggedIn ? navigate("/chat") : setIsAuthModalOpen(true)} className="inline-flex items-center justify-center bg-white text-purple-900 hover:bg-slate-200 text-lg font-bold px-10 py-4 rounded-xl transition-all shadow-2xl">
                {isLoggedIn ? "Volver al Chat" : "Crear Cuenta Gratis"} <ArrowRight className="ml-2 size-5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="px-6 py-8 border-t border-white/10 bg-slate-950/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-purple-400" />
              <span className="text-base font-bold text-white tracking-tight">UdeM - Collaborators</span>
            </div>
            <p className="text-slate-400 text-sm">© 2026 UdeM - Collaborators. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-purple-400 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Términos</a>
              <a href="mailto:soporte@udem.edu.ni" className="hover:text-purple-400 transition-colors flex items-center gap-1"><Mail className="size-3"/> Contacto</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}