import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, MessageSquare, ArrowRight, User as UserIcon } from "lucide-react";
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
    const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/signin");
            return;
        }
        fetchConversations();
    }, [user, navigate]);

    const fetchConversations = async () => {
        if (!user?.email) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/chat/conversations?email=${encodeURIComponent(user.email)}`);
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&current_email=${encodeURIComponent(user?.email || "")}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const { deletedUsers } = useSoftDelete();

    // Merge soft-deleted users into search results if they match the query
    const effectiveSearchResults = [...searchResults];
    if (searchQuery.trim()) {
        deletedUsers.forEach(deleted => {
            if (deleted.data && !effectiveSearchResults.find(u => u.id === deleted.id)) {
                // Check if matches query
                const q = searchQuery.toLowerCase();
                const d = deleted.data;
                if ((d.name?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q) || d.username?.toLowerCase().includes(q))) {
                    // Cast to ChatUser - map fields if necessary
                    effectiveSearchResults.push({
                        _id: deleted.id,
                        id: deleted.id, // Ensure ID compatibility
                        name: d.name,
                        email: d.email,
                        username: d.username,
                        profile_picture: d.profile_picture,
                        is_active: false, // Force false locally
                        is_verified: d.is_verified,
                        is_online: d.is_online
                    } as any);
                }
            }
        });
    }

    const startChat = (contact: ChatUser) => {
        navigate("/chat-room", { state: { contact } });
    };

    return (
        <div className="min-h-screen bg-background text-white font-sans selection:bg-primary/30">
            <Navbar />
            <main className="pt-24 pb-16 container mx-auto px-4 max-w-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                        <p className="text-muted-foreground font-mono text-sm">{"// Private Conversations"}</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/chat-room")}
                        className="font-mono text-xs border-primary/20 text-primary hover:bg-primary/5"
                    >
                        GENERAL CHAT
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search for users to chat..."
                                className="pl-10 bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            className="h-12 px-6 bg-primary text-primary-foreground font-mono tracking-widest text-xs"
                            onClick={() => handleSearch(searchQuery)}
                            disabled={isSearching}
                        >
                            {isSearching ? "..." : "SEARCH"}
                        </Button>
                    </div>

                    {/* Search Results Dropdown */}
                    {effectiveSearchResults.length > 0 && searchQuery && (
                        <div className="absolute top-14 left-0 right-0 z-50 bg-[#0d121f] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-2 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest pl-2">Search Results</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] py-0"
                                    onClick={() => setSearchResults([])}
                                >
                                    CLOSE
                                </Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {effectiveSearchResults.map((u) => (
                                    <div
                                        key={u.id}
                                        className="p-3 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                        onClick={() => startChat(u)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-primary/20 shrink-0">
                                                    {u.profile_picture ? (
                                                        <img src={u.profile_picture} className="w-full h-full object-cover" />
                                                    ) : (u.username?.[0] || u.name[0])}
                                                </div>
                                                <UserStatusIndicator
                                                    is_active={u.is_active}
                                                    is_verified={u.is_verified}
                                                    is_online={u.is_online}
                                                    userId={u.id}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{u.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">@{u.username || 'user'}</p>
                                            </div>
                                        </div>
                                        <MessageSquare className="w-4 h-4 text-primary opacity-50" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Conversation List */}
                <div className="space-y-3">
                    <h2 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] mb-4">Your Chats</h2>

                    {isLoading ? (
                        <div className="py-10 text-center font-mono text-sm text-muted-foreground animate-pulse">
                            Loading conversations...
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <MessageSquare className="w-8 h-8 text-white/10" />
                            </div>
                            <div>
                                <p className="text-muted-foreground">No conversations yet.</p>
                                <p className="text-xs text-gray-500 font-mono mt-1">Search for a user to start a chat.</p>
                            </div>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between overflow-hidden"
                                onClick={() => startChat(conv)}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-primary/5 border-2 border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shadow-inner shrink-0">
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
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{conv.name}</h3>
                                            <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap ml-2">
                                                {formatTime(conv.last_message_time)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                                                {conv.last_message || 'No messages yet'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-all rounded-r" />
                            </div>
                        ))
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Conversations;
