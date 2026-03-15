import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Home, BrainCircuit, Code2, Swords, Trophy, Medal, MessageCircle, Star, Terminal, LogOut, User, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AppDrawerProps {
    stats?: {
        problems: number;
        codes: number;
        battles: number;
    };
    onProblemsClick?: () => void;
    onCodesClick?: () => void;
    onChallengesClick?: () => void;
    onLeaderboardClick?: () => void;
}

export default function AppDrawer({ stats, onProblemsClick, onCodesClick, onChallengesClick, onLeaderboardClick }: AppDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleNav = (path: string | null, customAction?: () => void) => {
        if (customAction) {
            customAction();
        } else if (path) {
            navigate(path);
        }
        setIsOpen(false);
    };

    if (!user) return null;

    return (
        <>
            {/* Fixed Bottom Nav Bar - yellowish-white */}
            <div className="fixed bottom-0 left-0 right-0 z-[260] flex items-center justify-center py-1.5 bg-[#fdf6e3] border-t-2 border-black/10 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    title="Open Menu"
                    className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] text-[#fdf6e3] hover:bg-primary hover:text-black transition-all active:scale-95 group"
                >
                    <LayoutGrid className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-[240] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />
            {/* Drawer Panel */}
            <div className={cn(
                "fixed top-0 left-0 bottom-0 z-[250] w-[55vw] sm:w-[320px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>

                {/* Profile Header */}
                <div className="bg-[#1a1a1a] px-4 pt-10 pb-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {user?.profile_picture ? (
                                <img
                                    src={user.profile_picture}
                                    alt="Profile"
                                    className="w-12 h-12 object-cover border-2 border-primary"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-primary/20 border-2 border-primary flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                            )}
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-white leading-tight">
                                    {user?.name || 'Student'}
                                </p>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                    @{user?.username || user?.email?.split('@')[0]}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-6 h-6 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-white"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {stats && (
                        <div className="flex gap-[1px]">
                            <div className="flex-1 bg-white/5 px-2 py-1.5 text-center">
                                <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Problems</p>
                                <p className="text-base font-black text-primary">{stats.problems}</p>
                            </div>
                            <div className="flex-1 bg-white/5 px-2 py-1.5 text-center">
                                <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Codes</p>
                                <p className="text-base font-black text-secondary">{stats.codes}</p>
                            </div>
                            <div className="flex-1 bg-white/5 px-2 py-1.5 text-center">
                                <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Battles</p>
                                <p className="text-base font-black text-emerald-400">{stats.battles}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-[1px] bg-[#f5f0e8]">
                    {[
                        { icon: Home, label: 'Dashboard', path: '/dashboard', color: 'text-violet-600', bg: 'bg-violet-50' },
                        { icon: BrainCircuit, label: 'Problems', path: '/infinite-space?tab=problems', color: 'text-primary', bg: 'bg-emerald-50', onClick: onProblemsClick },
                        { icon: Code2, label: 'Codes', path: '/infinite-space?tab=codes', color: 'text-secondary', bg: 'bg-blue-50', onClick: onCodesClick },
                        { icon: Swords, label: 'Challenge Space', path: '/infinite-space?tab=challenges', color: 'text-emerald-600', bg: 'bg-emerald-50', onClick: onChallengesClick },
                        { icon: Trophy, label: 'Leaderboard', path: '/infinite-space?leaderboard=true', color: 'text-amber-500', bg: 'bg-amber-50', onClick: onLeaderboardClick },
                        { icon: Medal, label: 'Achievements', path: '/match-history', color: 'text-rose-500', bg: 'bg-rose-50' },
                        { icon: MessageCircle, label: 'Chat Room', path: '/chat-room', color: 'text-sky-500', bg: 'bg-sky-50' },
                        { icon: Star, label: 'AI Tutor', path: '/ai-teacher', color: 'text-orange-500', bg: 'bg-orange-50' },
                        { icon: Terminal, label: 'Code Editor', path: '/learning-space?view=ide', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    ].map(({ icon: Icon, label, path, color, bg, onClick }) => (
                        <button
                            key={label}
                            onClick={() => handleNav(path, onClick)}
                            className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#fdf6e3] transition-colors border-b border-black/5 w-full text-left group"
                        >
                            <div className={`w-7 h-7 flex items-center justify-center ${bg}`}>
                                <Icon className={`w-3.5 h-3.5 ${color}`} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#1a1a1a] group-hover:text-primary transition-colors">
                                {label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Logout Footer */}
                <div className="border-t-2 border-black/10 bg-[#fdf6e3]">
                    <button
                        onClick={() => { navigate('/login'); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-colors group"
                    >
                        <div className="w-7 h-7 flex items-center justify-center bg-rose-50">
                            <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-rose-500">
                            Sign Out
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}
