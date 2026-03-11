import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
    Gamepad2,
    Code2,
    Swords,
    ArrowLeft,
    Plus,
    LayoutDashboard,
    Zap,
    BrainCircuit,
    Terminal
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const AdminMissions = () => {
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading) {
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'master1_vectors')) {
                navigate("/signin", { replace: true });
            }
        }
    }, [currentUser, authLoading, navigate]);

    if (authLoading || !currentUser) {
        return <div className="h-screen bg-background flex items-center justify-center font-mono text-primary animate-pulse">Authenticating Admin...</div>;
    }

    const cards = [
        {
            title: "Code Problems",
            description: "Design algorithmic challenges and data structure problems for the main library.",
            icon: Code2,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            hover: "hover:border-blue-500/50",
            action: "Create Problem"
        },
        {
            title: "Coding Games",
            description: "Build interactive simulations and logic-based games for the community.",
            icon: Gamepad2,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            hover: "hover:border-purple-500/50",
            action: "Design Game"
        },
        {
            title: "Challenge Space",
            description: "Manage global tournaments, real-time typing duels, and instructor-led arenas.",
            icon: Swords,
            color: "text-secondary",
            bg: "bg-secondary/10",
            border: "border-secondary/20",
            hover: "hover:border-secondary/50",
            action: "Manage Space"
        }
    ];

    return (
        <div className="h-screen bg-background text-foreground font-sans selection:bg-primary/30 flex flex-col overflow-hidden">
            <Navbar />

            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />
            </div>

            <main className="flex-1 flex flex-col container mx-auto px-4 pt-24 pb-8 relative z-10 overflow-hidden">
                <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/admin" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-4 group">
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                            Back to Admin Dashboard
                        </Link>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3">
                                    <Zap className="w-8 h-8 text-primary fill-primary/20" />
                                    Missions <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent inline-block">Creation</span>
                                </h1>
                                <p className="text-muted-foreground text-sm mt-2 max-w-2xl font-mono">
                                    {"// CENTRAL_COMMAND: DESIGN_AND_DEPLOY_EDUCATIONAL_ASSETS"}
                                </p>
                            </div>
                            <div className="hidden md:flex p-3 rounded-2xl bg-muted/30 border border-border backdrop-blur-sm items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Admin Status</span>
                                    <span className="text-xs font-mono font-bold text-green-500">AUTHORIZED_ACCESS</span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <LayoutDashboard className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {cards.map((card, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-white/[0.02] backdrop-blur-md border ${card.border} ${card.hover} p-8 rounded-3xl transition-all duration-300 group flex flex-col relative overflow-hidden h-[400px] shadow-2xl shadow-black/40`}
                                >
                                    {/* Decor */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} blur-[60px] translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform`} />

                                    <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center mb-6 border ${card.border} group-hover:scale-110 transition-all duration-500`}>
                                        <card.icon className={`w-7 h-7 ${card.color}`} />
                                    </div>

                                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{card.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed font-mono">
                                        {card.description}
                                    </p>

                                    <div className="mt-auto pt-8 flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className={`w-1 h-1 rounded-full ${card.color} opacity-40`} />
                                            ))}
                                        </div>
                                        <Button
                                            onClick={() => {
                                                if (idx === 0) navigate("/admin/create-problems");
                                                else toast.info(`Initializing ${card.title} Module...`);
                                            }}
                                            className={`bg-white text-black hover:bg-white/90 font-bold rounded-xl flex items-center gap-2 group/btn`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            {card.action}
                                        </Button>
                                    </div>

                                    {/* Sub-icons decor */}
                                    <div className="absolute bottom-4 left-8 text-[8px] font-mono text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {idx === 0 && <span className="flex items-center gap-2"><Code2 className="w-3 h-3" /> ALGO_V2</span>}
                                        {idx === 1 && <span className="flex items-center gap-2"><Gamepad2 className="w-3 h-3" /> SIM_ENGINE</span>}
                                        {idx === 2 && <span className="flex items-center gap-2"><Swords className="w-3 h-3" /> PvP_SOCKET</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Secondary Actions / Stats */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex items-center gap-6 group hover:bg-white/[0.03] transition-colors">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <BrainCircuit className="w-8 h-8 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg">Knowledge Discovery</h4>
                                    <p className="text-xs text-muted-foreground font-mono">Sync system intelligence with latest academic research.</p>
                                </div>
                                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                </Button>
                            </div>
                            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex items-center gap-6 group hover:bg-white/[0.03] transition-colors">
                                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                                    <Terminal className="w-8 h-8 text-secondary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg">System Logs</h4>
                                    <p className="text-xs text-muted-foreground font-mono">Monitor real-time deployment and user engagement metrics.</p>
                                </div>
                                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Rainbow Footer Decor */}
            <div className="h-[30px] w-full bg-gradient-to-r from-[#ff0000] via-[#ff7f00] via-[#ffff00] via-[#00ff00] via-[#0000ff] via-[#4b0082] to-[#8b00ff] animate-gradient-x shadow-[0_-4px_20px_rgba(0,0,0,0.1)] relative z-50 shrink-0"></div>
        </div>
    );
};

export default AdminMissions;
