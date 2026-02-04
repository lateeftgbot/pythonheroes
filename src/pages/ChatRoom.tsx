import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Send, MessageSquare, ArrowLeft, Users, MoreVertical, Edit2, Trash2, Settings, X, Check, CheckCheck, Search, User, Lock, Unlock, Trash, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserStatusIndicator from "@/components/UserStatusIndicator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Message {
    _id: string;
    sender: string;
    content: string;
    timestamp: string;
    is_edited?: boolean;
    is_deleted_masked?: boolean;
    sender_email?: string;
    receiver_email?: string;
    is_read?: boolean;
}

interface ChatUser {
    _id: string;
    name: string;
    username?: string;
    email: string;
    profile_picture?: string;
    is_disabled?: boolean;
    is_online?: boolean;
}

type ChatTheme = 'classic' | 'midnight' | 'matrix' | 'forest';

const ChatRoom = () => {
    const { user, logout, isLoading } = useAuth(); // Destructure logout from useAuth if not already
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/signin", { replace: true });
        }
    }, [user, isLoading, navigate]);

    // State initialization from navigation state
    const [chatMode, setChatMode] = useState<'general' | 'private'>(() =>
        location.state?.contact ? 'private' : 'general'
    );
    const [activeContact, setActiveContact] = useState<ChatUser | null>(() =>
        location.state?.contact || null
    );

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoadingChat, setIsLoadingChat] = useState(true);

    // Selection and Actions
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");

    // Settings
    const [showSettings, setShowSettings] = useState(false);
    const [theme, setTheme] = useState<ChatTheme>(() => (localStorage.getItem('chat-theme') as ChatTheme) || 'classic');
    const [enterToSend, setEnterToSend] = useState(() => localStorage.getItem('chat-enter-send') !== 'false');

    // Selection and Actions
    // Admin & Profile State
    const [isRoomLocked, setIsRoomLocked] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [profileUser, setProfileUser] = useState<ChatUser | null>(null);
    const [typers, setTypers] = useState<ChatUser[]>([]);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const prevMessageCountRef = useRef(0);

    const scrollToBottom = (smooth = false) => {
        if (chatContainerRef.current) {
            setTimeout(() => {
                chatContainerRef.current?.scrollTo({
                    top: chatContainerRef.current.scrollHeight,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }, 100);
        }
    };

    useEffect(() => {
        if (messages.length > prevMessageCountRef.current) {
            scrollToBottom(true);
        }
        prevMessageCountRef.current = messages.length;
    }, [messages]);

    const fetchMessages = async () => {
        if (chatMode === 'private' && (!user?.email || !activeContact?.email)) return;

        try {
            const url = chatMode === 'general'
                ? "/api/chat/messages"
                : `/api/chat/private?user1=${user?.email}&user2=${activeContact?.email}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);

                // If in private chat and last message is from partner, mark as read
                if (chatMode === 'private' && data.length > 0) {
                    const lastMsg = data[data.length - 1];
                    if (lastMsg.sender_email !== user?.email) {
                        markAsRead();
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch messages");
        } finally {
            setIsLoadingChat(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const response = await fetch("/api/admin/chat/settings");
            if (response.ok) {
                const data = await response.json();
                setIsRoomLocked(data.is_locked);
            }
        } catch (error) {
            console.error("Failed to fetch chat config");
        }
    };

    const fetchUserProfile = async (email: string) => {
        try {
            const response = await fetch(`/api/user/profile?email=${email}`);
            if (response.ok) {
                const data = await response.json();
                setProfileUser(data);
                setShowProfile(true);
            }
        } catch (error) {
            console.error("Profile fetch error");
        }
    };

    const navigateToProfile = async (email: string) => {
        try {
            const response = await fetch(`/api/user/profile?email=${email}`);
            if (response.ok) {
                const data = await response.json();
                if (data.username) {
                    navigate(`/profile/${data.username}`);
                }
            }
        } catch (error) {
            console.error("Navigation error");
        }
    };

    const markAsRead = async () => {
        if (chatMode !== 'private' || !user?.email || !activeContact?.email) return;
        try {
            await fetch("/api/chat/read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reader_email: user.email,
                    sender_email: activeContact.email
                })
            });
        } catch (e) { }
    };

    const handleTyping = async (isTyping: boolean) => {
        if (!user?.email) return;
        try {
            await fetch("/api/chat/typing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    typing_to: chatMode === 'general' ? 'general' : activeContact?.email,
                    is_typing: isTyping
                })
            });
        } catch (e) { }
    };

    const fetchTypingStatus = async () => {
        try {
            const target = chatMode === 'general' ? 'general' : activeContact?.email;
            if (!target) return;
            const response = await fetch(`/api/chat/typing?typing_to=${target}`);
            if (response.ok) {
                const data = await response.json();
                // Filter out self
                setTypers(data.filter((t: any) => t.email !== user?.email));
            }
        } catch (e) { }
    };

    useEffect(() => {
        fetchConfig();
        fetchMessages();
        fetchTypingStatus();
        const interval = setInterval(() => {
            fetchMessages();
            fetchTypingStatus();
            if (chatMode === 'general') fetchConfig();
        }, 3000);
        return () => clearInterval(interval);
    }, [chatMode, activeContact]);

    useEffect(() => {
        localStorage.setItem('chat-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('chat-enter-send', enterToSend.toString());
    }, [enterToSend]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || (isRoomLocked && user.role !== 'admin')) return;

        // Force session validation before sending
        try {
            const authCheck = await fetch("/api/auth/heartbeat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email })
            });
            if (authCheck.status === 401 || authCheck.status === 403) {
                logout();
                return;
            }
        } catch (e) {
            // If validation fails due to network, we might still try sending or just warn
        }

        try {
            const senderName = user.username || user.name;
            const body: any = {
                sender: chatMode === 'general' ? (user.role === 'admin' ? "Vectors" : senderName) : senderName,
                sender_email: user.email,
                content: newMessage
            };

            if (chatMode === 'private' && activeContact) {
                body.receiver = activeContact.email;
            }

            const url = chatMode === 'general' ? "/api/chat/messages" : "/api/chat/private";

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setNewMessage("");
                await fetchMessages();
                scrollToBottom(true);
            }
        } catch (error) {
            console.error("Failed to send message");
        }
    };

    const handleLockRoom = async (locked: boolean) => {
        try {
            const response = await fetch("/api/admin/chat/lock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_locked: locked }),
            });
            if (response.ok) {
                setIsRoomLocked(locked);
            }
        } catch (error) {
            console.error("Lock failed");
        }
    };

    const handleClearChat = async () => {
        if (!confirm("Are you sure you want to clear all messages?")) return;
        try {
            const response = await fetch("/api/admin/chat/clear", { method: "DELETE" });
            if (response.ok) {
                fetchMessages();
            }
        } catch (error) {
            console.error("Clear failed");
        }
    };

    const handleToggleUserStatus = async (targetEmail: string, disabled: boolean) => {
        try {
            const response = await fetch(`/api/admin/users/${targetEmail}/toggle-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_disabled: disabled }),
            });
            if (response.ok) {
                // Refresh data
            }
        } catch (error) {
            console.error("Toggle status failed");
        }
    };

    const handleUpdateMessage = async () => {
        if (!selectedMessage || !editContent.trim()) return;
        try {
            const response = await fetch(`/api/chat/messages/${selectedMessage._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editContent }),
            });
            if (response.ok) {
                setIsEditing(false);
                setSelectedMessage(null);
                fetchMessages();
            }
        } catch (error) {
            console.error("Failed to edit message");
        }
    };

    const handleDeleteMessage = async () => {
        if (!selectedMessage) return;
        try {
            const response = await fetch(`/api/chat/messages/${selectedMessage._id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setSelectedMessage(null);
                fetchMessages();
            }
        } catch (error) {
            console.error("Failed to delete message");
        }
    };

    const handleLongPressStart = (msg: Message) => {
        longPressTimer.current = setTimeout(() => {
            setSelectedMessage(msg);
        }, 500);
    };

    const handleLongPressEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const groupMessagesByDate = () => {
        const groups: { [key: string]: Message[] } = {};
        messages.forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Africa/Lagos'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const themeStyles = {
        classic: {
            bg: "bg-black/40",
            border: "border-primary/30 shadow-[0_0_20px_rgba(74,222,128,0.1)]",
            msg_other: "bg-[#1e293b] text-slate-100 border-slate-700/50",
            msg_mine: "bg-primary text-primary-foreground"
        },
        midnight: {
            bg: "bg-slate-950/80",
            border: "border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]",
            msg_other: "bg-slate-900 text-slate-100 border-slate-800",
            msg_mine: "bg-blue-600 text-white"
        },
        matrix: {
            bg: "bg-black/90",
            border: "border-green-500 border-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]",
            msg_other: "bg-black text-green-500 border-green-900",
            msg_mine: "bg-green-600 text-black border-green-400"
        },
        forest: {
            bg: "bg-emerald-950/40",
            border: "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
            msg_other: "bg-emerald-900/50 text-emerald-50 border-emerald-800",
            msg_mine: "bg-emerald-600 text-white"
        }
    };

    const currentTheme = themeStyles[theme];

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-20 pb-10 container mx-auto px-4 flex flex-col items-center">
                {/* Chat Header */}
                <div className="w-full max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                <h1 className="text-2xl font-bold">Lativectors Chat Room</h1>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{"// " + (user.role === 'admin' ? "ADMIN_ACCESS" : "COMMUNITY_HUB")}</p>
                        </div>
                    </div>

                    <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Integration</span>
                    </div>
                </div>

                {/* Chat Container */}
                <div className={`w-full max-w-5xl min-h-[500px] max-h-[80vh] rounded-lg border shadow-2xl overflow-hidden flex relative group transition-all duration-300 ${currentTheme.bg} ${currentTheme.border}`}>

                    <div className="flex-1 flex flex-col h-full overflow-hidden">

                        {/* Sub-header inside chat */}
                        <div className="bg-white/5 border-b border-white/5 p-3 sm:p-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                                        {chatMode === 'general' ? 'Classroom Conversation' : `Chat with ${activeContact?.name}`}
                                    </p>
                                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-mono hidden sm:block">
                                        {chatMode === 'general' ? 'Syncing with main database...' : `Direct Message Channel`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedMessage && (user?.role === 'admin' || selectedMessage.sender === (user?.username || user?.name)) && (
                                    <div className="flex items-center gap-1 mr-4 bg-primary/10 p-1 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-right-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="w-8 h-8 text-primary hover:bg-primary/20"
                                            onClick={() => {
                                                setEditContent(selectedMessage.content);
                                                setIsEditing(true);
                                            }}
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="w-8 h-8 text-destructive hover:bg-destructive/10"
                                            onClick={handleDeleteMessage}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <div className="w-px h-4 bg-primary/20 mx-1" />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="w-8 h-8 text-gray-400 hover:bg-white/5"
                                            onClick={() => setSelectedMessage(null)}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                )}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-8 h-8 text-gray-400 hover:text-white"
                                    onClick={() => setShowSettings(true)}
                                >
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto flex flex-col px-3 py-3 sm:px-6 sm:py-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent gap-y-1"
                        >
                            {isLoadingChat ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 font-mono">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs tracking-[0.2em] uppercase">Fetching messages...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 font-mono opacity-40">
                                    <MessageSquare className="w-12 h-12" />
                                    <p className="text-sm italic">{"// No communication records found."}</p>
                                    <p className="text-xs">
                                        {chatMode === 'general' ? 'Be the first to transmit a message.' : 'Start your private conversation.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {Object.entries(groupMessagesByDate()).map(([date, msgs]) => (
                                        <div key={date} className="flex flex-col">
                                            <div className="sticky top-0 z-10 flex justify-center my-4 pointer-events-none">
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-400 font-mono backdrop-blur-md">
                                                    {date}
                                                </span>
                                            </div>
                                            {msgs.map((msg, index) => {
                                                const isMine = (msg.sender_email?.toLowerCase().trim() === user.email?.toLowerCase().trim()) ||
                                                    (msg.sender?.toLowerCase().trim() === user.username?.toLowerCase().trim()) ||
                                                    (msg.sender?.toLowerCase().trim() === user.name?.toLowerCase().trim());
                                                const messageDate = new Date(msg.timestamp);
                                                const messageTime = messageDate.toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                    timeZone: 'Africa/Lagos'
                                                });

                                                const showSender = chatMode === 'private' || index === 0 || msgs[index - 1].sender_email !== msg.sender_email;
                                                const isSelected = selectedMessage?._id === msg._id;
                                                const senderDisplayName = msg.sender === 'Vectors' ? 'Vectors' : (isMine ? (user.username || user.name) : msg.sender);

                                                return (
                                                    <div
                                                        key={msg._id}
                                                        className={`flex flex-col ${isMine ? "items-end ml-auto" : "items-start mr-auto"} ${showSender ? "mt-2 sm:mt-3" : "mt-0.5"} pb-0.5 relative group/msg transition-all duration-200 ${isSelected ? "bg-primary/5" : ""} w-fit max-w-[90%] sm:max-w-[75%]`}
                                                        onContextMenu={(e) => {
                                                            e.preventDefault();
                                                            setSelectedMessage(msg);
                                                        }}
                                                        onTouchStart={() => handleLongPressStart(msg)}
                                                        onTouchEnd={handleLongPressEnd}
                                                    >
                                                        {showSender && (
                                                            <span
                                                                className={`text-[9px] mb-0.5 font-mono tracking-wider cursor-pointer hover:underline ${isMine ? "text-primary ml-auto" : "text-gray-400 mr-auto"}`}
                                                                onClick={() => msg.sender_email && navigateToProfile(msg.sender_email)}
                                                            >
                                                                {senderDisplayName}
                                                            </span>
                                                        )}
                                                        <div className={`relative group w-full`}>
                                                            <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed shadow-sm transition-all duration-300 font-medium whitespace-pre-wrap ${isMine
                                                                ? currentTheme.msg_mine + " rounded-tr-none"
                                                                : currentTheme.msg_other + " rounded-tl-none"
                                                                } ${msg.is_deleted_masked ? "italic opacity-50" : ""}`}>
                                                                {msg.content}
                                                            </div>
                                                            <div className={`flex items-center gap-1.5 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                                                                {msg.is_edited && !msg.is_deleted_masked && (
                                                                    <span className="text-[7px] text-gray-500 font-mono italic">Edited</span>
                                                                )}
                                                                <span className="text-[8px] text-gray-500 font-mono block">
                                                                    {messageTime}
                                                                </span>
                                                                {isMine && chatMode === 'private' && (
                                                                    msg.is_read ? (
                                                                        <CheckCheck className="w-3 h-3 text-primary animate-in fade-in zoom-in" />
                                                                    ) : (
                                                                        <Check className="w-3 h-3 text-gray-600" />
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </>
                            )}
                            <div className="h-4" />
                        </div>

                        {/* Typing Indicator */}
                        {typers.length > 0 && (
                            <div className="px-6 py-2 bg-white/5 border-t border-white/5 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-[10px] text-primary/80 font-mono italic">
                                    {typers.length === 1
                                        ? `${typers[0].username || typers[0].name} is typing...`
                                        : `${typers.length} people are typing...`}
                                </span>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 sm:p-4 bg-white/5 border-t border-white/5 z-10">
                            <div className={`flex gap-3 p-1.5 rounded-xl border focus-within:border-primary/50 transition-all bg-black/40 ${currentTheme.border}`}>
                                <textarea
                                    placeholder="Compose a message..."
                                    className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-[13px] focus:outline-none text-white placeholder:text-gray-600 font-medium resize-none min-h-[36px] max-h-[120px] scrollbar-hide"
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);

                                        // Handle typing signal
                                        if (e.target.value.trim().length > 0) {
                                            handleTyping(true);

                                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                            typingTimeoutRef.current = setTimeout(() => {
                                                handleTyping(false);
                                            }, 2000);
                                        } else {
                                            handleTyping(false);
                                        }
                                    }}
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            if (enterToSend) {
                                                if (!e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }
                                            // If enterToSend is false, allow default behavior (new line)
                                        }
                                    }}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-auto px-3 sm:px-5"
                                >
                                    <Send className="w-4 h-4 sm:mr-2" />
                                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hidden sm:inline">Transmit</span>
                                </Button>
                            </div>
                            <p className="text-[9px] text-gray-500 font-mono text-center mt-3 uppercase tracking-widest">
                                Secured channel • All communications are logged
                            </p>
                        </div>
                    </div>

                    {/* Settings Dialog */}
                    <Dialog open={showSettings} onOpenChange={setShowSettings}>
                        <DialogContent className="bg-[#0a0f1c] border-white/5 text-white max-w-sm">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-primary" />
                                    Chat Settings
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {user.role === 'admin' && (
                                    <div className="space-y-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                                        <Label className="text-xs text-red-500 uppercase tracking-widest flex items-center gap-2">
                                            <ShieldAlert className="w-3.5 h-3.5" />
                                            Moderator Controls
                                        </Label>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-[11px] text-gray-200">Lock General Room</Label>
                                                <p className="text-[9px] text-gray-500 font-mono">Prevents non-admins from chatting</p>
                                            </div>
                                            <Switch
                                                checked={isRoomLocked}
                                                onCheckedChange={handleLockRoom}
                                                className="data-[state=checked]:bg-red-500"
                                            />
                                        </div>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full text-[10px] font-mono h-8"
                                            onClick={handleClearChat}
                                        >
                                            <Trash className="w-3.5 h-3.5 mr-2" />
                                            CLEAR GENERAL CHAT
                                        </Button>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Label className="text-xs text-gray-400 uppercase tracking-widest">Chat Theme</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['classic', 'midnight', 'matrix', 'forest'] as ChatTheme[]).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setTheme(t)}
                                                className={`px-3 py-2 rounded-lg text-xs font-mono border capitalize transition-all ${theme === t
                                                    ? "bg-primary/20 border-primary text-primary"
                                                    : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs text-gray-200">Enter Key to Send</Label>
                                        <p className="text-[10px] text-gray-500 font-mono italic">{"// " + (enterToSend ? "ENABLED" : "DISABLED")}</p>
                                    </div>
                                    <Switch
                                        checked={enterToSend}
                                        onCheckedChange={setEnterToSend}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="ghost" className="w-full text-xs font-mono" onClick={() => setShowSettings(false)}>
                                    CLOSE
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* User Profile Dialog */}
                <Dialog open={showProfile} onOpenChange={setShowProfile}>
                    <DialogContent className="bg-[#0a0f1c] border-white/5 text-white max-w-sm">
                        <DialogHeader>
                            <DialogTitle>User Profile</DialogTitle>
                        </DialogHeader>
                        {profileUser && (
                            <div className="py-6 flex flex-col items-center gap-4 text-center">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-4 border-primary/20 overflow-hidden shrink-0">
                                        {profileUser.profile_picture ? (
                                            <img src={profileUser.profile_picture} className="w-full h-full object-cover" />
                                        ) : profileUser.name?.[0]}
                                    </div>
                                    <UserStatusIndicator is_active={profileUser.is_disabled !== true} is_online={profileUser.is_online} userId={profileUser._id} size="lg" />
                                </div>
                                <div
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => {
                                        if (profileUser.username) {
                                            navigate(`/profile/${profileUser.username}`);
                                            setShowProfile(false);
                                        }
                                    }}
                                >
                                    <h2 className="text-xl font-bold">{profileUser.name}</h2>
                                    <p className="text-sm text-gray-500 font-mono">@{profileUser.username || 'user'}</p>
                                </div>
                                <div className="w-full h-px bg-white/5 my-2" />
                                <div className="w-full space-y-2">
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                        onClick={() => {
                                            setActiveContact(profileUser);
                                            setChatMode('private');
                                            setShowProfile(false);
                                        }}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        SEND DIRECT MESSAGE
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full border-primary/30 hover:bg-primary/10 text-primary gap-2"
                                        onClick={() => {
                                            if (profileUser.username) {
                                                navigate(`/profile/${profileUser.username}`);
                                                setShowProfile(false);
                                            }
                                        }}
                                    >
                                        <User className="w-4 h-4" />
                                        VIEW FULL PROFILE
                                    </Button>

                                    {user.role === 'admin' && profileUser.email !== user.email && (
                                        <Button
                                            variant="destructive"
                                            className="w-full gap-2"
                                            onClick={() => {
                                                const newStatus = !profileUser.is_disabled;
                                                handleToggleUserStatus(profileUser.email, newStatus);
                                                setProfileUser({ ...profileUser, is_disabled: newStatus });
                                            }}
                                        >
                                            <ShieldAlert className="w-4 h-4" />
                                            {profileUser.is_disabled ? "ENABLE USER ACCESS" : "DISABLE USER ACCESS"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="ghost" className="w-full text-xs font-mono" onClick={() => setShowProfile(false)}>
                                CLOSE
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Message Dialog */}
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="bg-[#0a0f1c] border-white/5 text-white max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Message</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <textarea
                                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 text-white"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="flex gap-2">
                            <Button variant="ghost" className="text-xs font-mono" onClick={() => setIsEditing(false)}>
                                CANCEL
                            </Button>
                            <Button className="bg-primary text-primary-foreground text-xs font-mono" onClick={handleUpdateMessage}>
                                UPDATE
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>

            <Footer />
        </div>
    );
};

export default ChatRoom;
