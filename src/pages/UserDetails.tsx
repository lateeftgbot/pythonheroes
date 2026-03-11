import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Ban, CheckCircle, ArrowLeft, Mail, User as UserIcon, Calendar, DollarSign, Fingerprint, Shield, MessageSquare, Database } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import UserStatusIndicator from "@/components/UserStatusIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useSoftDelete } from '@/hooks/useSoftDelete';

interface UserDetail {
    id: string;
    name: string;
    email: string;
    username?: string;
    is_verified: boolean;
    is_active: boolean;
    joined_at?: string;
    amount_paid: number;
    telegram_chat_id?: string;
    is_online?: boolean;
    profile_picture?: string;
}

const UserDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showRaw, setShowRaw] = useState(false);

    const fetchUserDetail = async () => {
        console.log(`FETCHING_USER_DETAILS for ID: "${id}"`);
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                headers: {
                    "X-Admin-Email": currentUser?.email || ""
                }
            });
            console.log(`API_RESPONSE_STATUS: ${response.status}`);
            if (response.ok) {
                const data = await response.json();
                console.log("USER_DATA_RECEIVED:", data);
                setUser(data);
            } else {
                console.error("Failed to fetch user detail");
                alert("User not found or registration has expired.");
                navigate("/admin");
            }
        } catch (error) {
            console.error("Error fetching user detail", error);
            alert("An error occurred while fetching user details.");
            navigate("/admin");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'master1_vectors')) {
                navigate("/signin", { replace: true });
            } else if (id) {
                fetchUserDetail();
            }
        }
    }, [id, currentUser, authLoading, navigate]);

    const { softDeleteUser, undoDeleteUser, isDeleted, getRemainingTime } = useSoftDelete();
    const isSoftDeleted = user ? isDeleted(user.id) : false;

    // Timer update logic could be added here to force re-render if needed for countdown

    const handleDelete = async () => {
        if (!user) return;
        if (!confirm("Are you sure you want to delete this user? This will schedule deletion in 5 minutes.")) return;
        softDeleteUser(user.id, user);
        navigate("/admin");
    };

    const handleUndo = async () => {
        if (!user) return;
        undoDeleteUser(user.id);
    };

    const handleToggleStatus = async () => {
        if (!user) return;
        try {
            const response = await fetch(`/api/admin/users/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Email": currentUser?.email || ""
                },
                body: JSON.stringify({ is_active: !user.is_active }),
            });

            if (response.ok) {
                setUser({ ...user, is_active: !user.is_active });
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            alert("Error updating status");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-24 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground font-mono text-sm tracking-widest">DECRYPTING_USER_DATA...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="pt-24 pb-16 container mx-auto px-4 max-w-5xl">
                {/* Top Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/admin")}
                        className="hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Administration
                    </Button>

                    <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg border border-border/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] font-mono h-8 hover:bg-primary/10 text-primary"
                            onClick={() => navigate("/dashboard")}
                        >
                            CHAT
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] font-mono h-8 hover:bg-primary/10 text-primary"
                            onClick={() => navigate("/chat-room")}
                        >
                            GENERAL CHAT
                        </Button>
                        <Button
                            variant={!showRaw ? "secondary" : "ghost"}
                            size="sm"
                            className="text-[10px] font-mono h-8"
                            onClick={() => setShowRaw(false)}
                        >
                            DASHBOARD
                        </Button>
                        <Button
                            variant={showRaw ? "secondary" : "ghost"}
                            size="sm"
                            className="text-[10px] font-mono h-8"
                            onClick={() => setShowRaw(true)}
                        >
                            RAW_OBJECT
                        </Button>
                    </div>
                </div>

                {!showRaw ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                        {/* Summary Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card rounded-2xl p-8 border border-border relative overflow-hidden group shadow-2xl">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                                <div className="relative">
                                    <div className="relative w-24 h-24 mx-auto mb-6">
                                        <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-12 h-12 text-primary" />
                                            )}
                                        </div>
                                        <UserStatusIndicator is_active={user.is_active} is_verified={user.is_verified} is_online={user.is_online} size="lg" />
                                    </div>
                                    <div className="text-center">
                                        <h1 className="text-2xl font-bold mb-1 tracking-tight">{user.name}</h1>
                                        <p className="text-sm text-muted-foreground font-mono mb-8 opacity-70 break-all">{user.email}</p>

                                        <div className="space-y-3">
                                            <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase border ${user.is_verified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                <span>Identity</span>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span>{user.is_verified ? "VERIFIED" : "PENDING"}</span>
                                                </div>
                                            </div>
                                            <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase border ${user.is_active ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                <span>Account</span>
                                                <span>{user.is_active ? "ACTIVE" : "SUSPENDED"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Command Center */}
                            <div className="glass-card rounded-2xl p-6 border border-border shadow-lg">
                                <h3 className="text-xs font-bold font-mono mb-6 text-primary flex items-center gap-2 uppercase tracking-tighter">
                                    <Shield className="w-4 h-4" /> Command Center
                                </h3>
                                <div className="space-y-3">
                                    <Button
                                        className="w-full justify-between font-mono text-[10px] h-12 px-5 hover:scale-[1.02] transition-transform"
                                        variant="outline"
                                        onClick={handleToggleStatus}
                                    >
                                        <div className="flex items-center uppercase tracking-wider">
                                            {user.is_active ? <Ban className="w-4 h-4 mr-3 text-orange-500" /> : <CheckCircle className="w-4 h-4 mr-3 text-green-500" />}
                                            {user.is_active ? "Suspend Access" : "Grant Access"}
                                        </div>
                                        <ArrowLeft className="w-3 h-3 rotate-180 opacity-30" />
                                    </Button>
                                    {isSoftDeleted ? (
                                        <Button
                                            className="w-full justify-between font-mono text-[10px] h-12 px-5 bg-green-600 hover:bg-green-700 text-white hover:scale-[1.02] transition-transform"
                                            variant="default"
                                            onClick={handleUndo}
                                        >
                                            <div className="flex items-center uppercase tracking-wider">
                                                <span className="mr-3 text-lg">↩</span> Undo Deletion
                                            </div>
                                            <span className="opacity-70">{Math.ceil(getRemainingTime(user.id) / 60000)}m Left</span>
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full justify-between font-mono text-[10px] h-12 px-5 text-destructive hover:bg-destructive/10 border-destructive/20 hover:scale-[1.02] transition-transform"
                                            variant="outline"
                                            onClick={handleDelete}
                                        >
                                            <div className="flex items-center uppercase tracking-wider">
                                                <Trash2 className="w-4 h-4 mr-3" /> Terminate Account
                                            </div>
                                            <Database className="w-3 h-3 opacity-30" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Analytics Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="glass-card rounded-2xl p-8 border border-border flex flex-col justify-between h-40 relative group">
                                    <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <DollarSign className="w-16 h-16" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Financial footprint</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold font-mono text-primary">${user.amount_paid}</span>
                                        <span className="text-xs text-muted-foreground/50 font-mono">USD</span>
                                    </div>
                                </div>

                                <div className="glass-card rounded-2xl p-8 border border-border flex flex-col justify-between h-40 relative group">
                                    <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Calendar className="w-16 h-16" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Legacy age</p>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold">{user.joined_at ? new Date(user.joined_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono uppercase">System Registration</span>
                                    </div>
                                </div>
                            </div>

                            {/* Property Matrix */}
                            <div className="glass-card rounded-2xl border border-border shadow-xl overflow-hidden divide-y divide-border/30">
                                <div className="p-8">
                                    <h2 className="text-sm font-bold mb-8 flex items-center gap-2 uppercase tracking-wide text-foreground/80">
                                        <Fingerprint className="w-4 h-4 text-primary" />
                                        System Metadata
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Database className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-xs font-mono text-muted-foreground uppercase">Unique Identifier</span>
                                            </div>
                                            <span className="text-xs font-mono text-primary select-all">{user.id}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-xs font-mono text-muted-foreground uppercase">Alias</span>
                                            </div>
                                            <span className="text-sm font-bold text-foreground">{user.username ? `@${user.username}` : "UNSPECIFIED"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-muted/5">
                                    <h2 className="text-sm font-bold mb-8 flex items-center gap-2 uppercase tracking-wide text-foreground/80">
                                        <MessageSquare className="w-4 h-4 text-secondary" />
                                        Network Integration
                                    </h2>
                                    <div className="p-6 rounded-2xl border border-dashed border-border flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground font-mono uppercase">Telegram Handshake</p>
                                            <p className="text-base font-mono font-bold tracking-wider">{user.telegram_chat_id || "NOT_FOUND"}</p>
                                        </div>
                                        {user.telegram_chat_id ? (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold uppercase">Linked</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground/30">Disconnected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl border border-border overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="bg-muted p-4 border-b border-border flex justify-between items-center px-6">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-primary" />
                                <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Database Integrity Check</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                <span className="text-[9px] font-mono font-bold uppercase">Live Stream</span>
                            </div>
                        </div>
                        <div className="p-10 bg-[#050505]">
                            <pre className="text-xs font-mono text-primary/80 overflow-x-auto leading-relaxed overflow-y-auto max-h-[60vh] custom-scrollbar">
                                {JSON.stringify(user, null, 4)}
                            </pre>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default UserDetails;
