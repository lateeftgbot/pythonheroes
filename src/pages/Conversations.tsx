import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, MessageSquare, ArrowRight, User as UserIcon, LayoutDashboard, Zap, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSoftDelete } from '@/hooks/useSoftDelete';
import { useNavigate } from "react-router-dom";
import UserStatusIndicator from "@/components/UserStatusIndicator";

interface ChatUser {
    id: string;
    name: string;
    email: string;
    username?: string;
    profile_picture?: string;
    is_online?: boolean;
    is_active?: boolean;
    is_verified?: boolean;
    last_message?: string;
    last_message_time?: string;
}

const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
        return "";
    }
};

const Conversations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<ChatUser[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/signin");
            return;
        }

        // Initial fetch - NOT silent to show initial loader
        fetchConversations();

        // Setup polling every 5 seconds - SILENT to avoid flickering
        const interval = setInterval(() => {
            fetchConversations(true);
        }, 5000);

        return () => clearInterval(interval);
    }, [user, navigate]);

    const fetchConversations = async (silent = false) => {
        if (!user?.email) return;
        if (!silent) setIsLoading(true);
        try {
            const response = await fetch(`/api/chat/conversations?email=${encodeURIComponent(user.email)}`);
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const { deletedUsers } = useSoftDelete();

    const startChat = (contact: ChatUser) => {
        navigate("/chat-room", { state: { contact } });
    };

    return (
        <div className="h-screen bg-slate-900 text-slate-200 font-sans relative overflow-hidden flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-28 sm:pb-6 container mx-auto px-4 max-w-2xl relative z-10 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Messages</h1>
                        <p className="text-[10px] sm:text-xs text-emerald-500/70 font-mono">{"// Private Conversations"}</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/chat-room")}
                        className="font-mono text-[10px] bg-slate-800 text-emerald-500 hover:bg-slate-700 hover:text-emerald-400 font-bold border border-slate-700"
                    >
                        GENERAL CHAT
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4 sm:mb-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1 group/input">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-emerald-500 transition-colors" />
                            <Input
                                placeholder="Search for users..."
                                className="pl-10 h-10 sm:h-11 rounded-xl bg-slate-800/50 border-slate-700 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium text-white placeholder:text-slate-500 text-sm"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            className="h-10 sm:h-11 px-4 sm:px-6 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                            onClick={() => handleSearch(searchQuery)}
                        >
                            SEARCH
                        </Button>
                    </div>

                </div>

                {/* Conversation List Container */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-3xl sm:rounded-[2rem] p-2 sm:p-4 shadow-inner flex-1 flex flex-col min-h-0 mb-4 overflow-hidden">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                            {searchQuery ? 'Search Results' : 'Live Chats'}
                        </h2>
                        <span className="text-[10px] font-mono text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter">
                            {(() => {
                                const q = searchQuery.toLowerCase().trim();
                                if (!q) return `${conversations.length} Active`;
                                const matches = conversations.filter(c =>
                                    c.name.toLowerCase().includes(q) ||
                                    (c.username && c.username.toLowerCase().includes(q))
                                ).length;
                                return `${matches} Matches`;
                            })()}
                        </span>
                    </div>

                    <div className="overflow-y-auto pr-2 scrollbar-hide custom-scrollbar space-y-2 flex-1">
                        {isLoading && !searchQuery ? (
                            <div className="py-10 text-center font-mono text-xs text-slate-400 animate-pulse">
                                Syncing messages...
                            </div>
                        ) : (() => {
                            const q = searchQuery.toLowerCase().trim();
                            const displayList = q
                                ? conversations.filter(c =>
                                    c.name.toLowerCase().includes(q) ||
                                    (c.username && c.username.toLowerCase().includes(q))
                                )
                                : conversations;

                            if (displayList.length === 0) {
                                return (
                                    <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center gap-4 bg-white/50">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                                            <MessageSquare className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <div>
                                            <p className="text-slate-600 font-bold">{q ? 'No matches found' : 'No active chats'}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wide">
                                                {q ? 'Try a different search term' : 'Find a hero and start learning'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            return displayList.map((conv) => (
                                <div
                                    key={conv.id}
                                    className="group relative bg-white border border-slate-100 hover:border-blue-200 rounded-xl p-2 transition-all cursor-pointer flex items-center justify-between overflow-hidden shadow-sm hover:shadow-md"
                                    onClick={() => startChat(conv)}
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-bold overflow-hidden shrink-0 shadow-sm group-hover:border-blue-300 transition-colors">
                                                {conv.profile_picture ? (
                                                    <img src={conv.profile_picture} className="w-full h-full object-cover" />
                                                ) : (conv.username?.[0] || conv.name[0])}
                                            </div>
                                            <UserStatusIndicator
                                                is_active={conv.is_active}
                                                is_verified={conv.is_verified}
                                                is_online={conv.is_online}
                                                userId={conv.id}
                                                className="absolute -bottom-0.5 -right-0.5"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0">
                                                <h3 className="text-xs font-black text-slate-950 group-hover:text-blue-600 transition-colors truncate">{conv.name}</h3>
                                                <span className="text-[9px] text-emerald-600 font-mono font-bold whitespace-nowrap ml-2">
                                                    {formatTime(conv.last_message_time)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-slate-700 font-bold truncate max-w-[150px] sm:max-w-[300px] opacity-80">
                                                    {conv.last_message || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-all rounded-r" />
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50 sm:relative sm:bottom-0 sm:left-0 sm:translate-x-0 sm:w-full sm:max-w-none sm:mt-8 sm:mb-6 sm:z-auto">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-1 shadow-2xl shadow-black/50 flex items-center justify-around">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex flex-col items-center gap-0.5 p-1.5 text-slate-400 hover:text-emerald-500 transition-colors group"
                        >
                            <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-mono font-bold uppercase tracking-tighter">Dash</span>
                        </button>
                        <button
                            onClick={() => navigate("/infinite-space")}
                            className="flex flex-col items-center gap-0.5 p-1.5 text-slate-400 hover:text-emerald-500 transition-colors group"
                        >
                            <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-mono font-bold uppercase tracking-tighter">Space</span>
                        </button>
                        <button
                            onClick={() => navigate(`/profile/${user?.username || 'me'}`)}
                            className="flex flex-col items-center gap-0.5 p-1.5 text-slate-400 hover:text-emerald-500 transition-colors group"
                        >
                            <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-mono font-bold uppercase tracking-tighter">Profile</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Conversations;
