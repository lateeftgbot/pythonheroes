import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AppDrawer from "@/components/AppDrawer";
import {
    Trophy,
    Swords,
    User,
    Clock,
    ChevronRight,
    Calendar,
    Target,
    Zap,
    ArrowLeft,
    TrendingUp,
    History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MatchRecord {
    id: string;
    mode: 'Solo' | 'PvP';
    difficulty: string;
    score: number;
    player1?: any;
    player2?: any;
    created_at: string;
    type?: string;
    challenges_count?: number;
}

const MatchHistory = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState<MatchRecord[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [activeTab, setActiveTab] = useState<'solo' | 'pvp'>('solo');

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/signin");
        }
    }, [user, isLoading]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.email) return;
            try {
                const res = await fetch(`/api/learning/match-history/${user.email}`);
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchHistory();
    }, [user]);

    if (isLoading || isFetching) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/5 border-t-primary rounded-none animate-spin"></div>
            </div>
        );
    }

    const totalScore = history.reduce((acc, curr) => acc + curr.score, 0);
    const soloHistory = history.filter(h => h.mode === 'Solo');
    const pvpHistory = history.filter(h => h.mode === 'PvP');

    const activeHistory = activeTab === 'solo' ? soloHistory : pvpHistory;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 font-mono">
            <Navbar />

            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-primary/20 rounded-none blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-secondary/20 rounded-none blur-[120px]" />
            </div>

            <main className="pt-20 pb-0 relative z-10 h-screen flex flex-col">
                <div className="max-w-6xl mx-auto w-full px-6 sm:px-10 flex-1 flex flex-col min-h-0">
                    {/* Header - Brutalist Style */}
                    <div className="mb-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                        <div className="space-y-1">
                            <Link to="/dashboard" className="inline-flex items-center gap-2 text-[10px] text-slate-500 hover:text-primary transition-colors group uppercase tracking-widest">
                                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                                Return to Dashboard
                            </Link>
                            <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                                NEURAL <span className="text-primary italic">ARCHIVIUM</span>
                                <History className="w-5 h-5 text-primary" />
                            </h1>
                        </div>

                        {/* Quick Stats Grid - Square */}
                        <div className="flex gap-[1px] bg-white/10 p-[1px]">
                            <div className="px-4 py-2 bg-[#0a0a0a] border border-white/5 flex flex-col items-center min-w-[70px]">
                                <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">TOTAL XP</p>
                                <p className="text-base font-black">{totalScore}</p>
                            </div>
                            <div className="px-4 py-2 bg-[#0a0a0a] border border-white/5 flex flex-col items-center min-w-[60px]">
                                <p className="text-[8px] font-bold text-secondary uppercase tracking-[0.2em]">PVP</p>
                                <p className="text-base font-black">{pvpHistory.length}</p>
                            </div>
                            <div className="px-4 py-2 bg-[#0a0a0a] border border-white/5 flex flex-col items-center min-w-[60px]">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">SOLO</p>
                                <p className="text-base font-black">{soloHistory.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Switcher - Square - Fixed Width to prevent shifting */}
                    <div className="flex mb-0 shrink-0 self-start w-full md:w-auto h-10">
                        <button
                            onClick={() => setActiveTab('solo')}
                            className={cn(
                                "flex-1 md:flex-none flex items-center justify-center gap-3 px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-200 border-t border-l border-r border-white/10",
                                activeTab === 'solo'
                                    ? "bg-primary text-[#0a0a0a]"
                                    : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Target className="w-3 h-3" />
                            Solo Training
                            <span className="opacity-50 text-[8px]">[{soloHistory.length}]</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('pvp')}
                            className={cn(
                                "flex-1 md:flex-none flex items-center justify-center gap-3 px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-200 border-t border-r border-white/10",
                                activeTab === 'pvp'
                                    ? "bg-secondary text-[#0a0a0a]"
                                    : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Swords className="w-3 h-3" />
                            PVP Arena
                            <span className="opacity-50 text-[9px]">[{pvpHistory.length}]</span>
                        </button>
                    </div>

                    {/* Achievement Container - Yellowish White Square */}
                    <div className="flex-1 min-h-0 bg-[#fdf6e3] text-[#0a0a0a] border border-white/10 flex flex-col p-4 sm:p-6 overflow-hidden">
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar-brutalist space-y-3">
                            {activeHistory.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-14 h-14 border-2 border-dashed border-black/10 flex items-center justify-center grayscale opacity-40">
                                        {activeTab === 'solo' ? <Target className="w-6 h-6" /> : <Swords className="w-6 h-6" />}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black uppercase tracking-tighter italic">LOG_SECTOR_EMPTY</h3>
                                        <p className="text-slate-600 text-xs max-w-xs mx-auto uppercase tracking-wider font-bold">
                                            {activeTab === 'solo'
                                                ? "Zero exploratory logs detected. Initialize Neural Link to begin data capture."
                                                : "PvP combat frequency is zero. Arena engagement required for log generation."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate("/infinite-space")}
                                        className="bg-[#0a0a0a] text-white border-2 border-black px-10 py-3 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-primary hover:text-black transition-colors"
                                    >
                                        ACTIVATE_NEURAL_LINK
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {activeHistory.map((record, index) => (
                                        <div
                                            key={record.id || index}
                                            className="group relative bg-white border-2 border-[#0a0a0a]/5 hover:border-primary p-3 transition-all duration-200"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                {/* Left Section */}
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 flex items-center justify-center shrink-0 border-2 border-black",
                                                        record.mode === 'Solo'
                                                            ? "bg-primary text-black"
                                                            : "bg-secondary text-black"
                                                    )}>
                                                        {record.mode === 'Solo' ? <Target className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[7px] font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5">
                                                                {record.mode}_LOG
                                                            </span>
                                                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                                                                {format(new Date(record.created_at), 'yyyy.MM.dd // HH:mm')}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-sm font-black tracking-tighter uppercase leading-tight">
                                                            {record.mode === 'Solo'
                                                                ? `${record.difficulty} SECTOR RUN`
                                                                : `${record.player1.name} VS ${record.player2.name}`}
                                                        </h3>
                                                        {record.mode === 'Solo' && (
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">
                                                                LOADED: {record.challenges_count || 10} NODES // DIFFICULTY: {record.difficulty}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-black/5 pt-2 sm:pt-0 sm:pl-4">
                                                    <div className="text-right">
                                                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">YIELD_TOTAL</p>
                                                        <p className="text-lg font-black tracking-tighter text-[#0a0a0a]">
                                                            +{record.score}
                                                            <span className="text-primary text-[8px] ml-1">XP</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Info - Square */}
                        <div className="pt-4 border-t border-black/5 text-center shrink-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center justify-center gap-4">
                                <span className="h-[2px] w-8 bg-black/10" />
                                END_OF_BLOCK_TRANSMISSION
                                <span className="h-[2px] w-8 bg-black/10" />
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <AppDrawer />

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-brutalist::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar-brutalist::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.05);
                }
                .custom-scrollbar-brutalist::-webkit-scrollbar-thumb {
                    background: #22c55e;
                    border: 1px solid black;
                }
                .custom-scrollbar-brutalist::-webkit-scrollbar-thumb:hover {
                    background: #16a34a;
                }
            `}} />
        </div>
    );
};

export default MatchHistory;
