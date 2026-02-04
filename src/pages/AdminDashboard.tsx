import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Shield, Search, Mail, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import UserStatusIndicator from "@/components/UserStatusIndicator";
import { useSoftDelete } from '@/hooks/useSoftDelete';

interface User {
    id: string;
    name: string;
    email: string;
    username?: string;
    is_verified: boolean;
    is_active: boolean;
    joined_at?: string;
    amount_paid: number;
    is_online?: boolean;
    profile_picture?: string;
}

const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/admin/users", {
                headers: {
                    "X-Admin-Email": currentUser?.email || ""
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.error || `Server returned ${response.status}`);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            setError("Could not connect to the server. Please check if the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate("/signin", { replace: true });
        } else {
            fetchUsers();
        }
    }, [currentUser, navigate]);

    const { deletedUsers } = useSoftDelete();

    // Merge soft-deleted users back into the list if they are missing (because backend filtered them)
    const allUsers = [...users];

    deletedUsers.forEach(deleted => {
        if (!allUsers.find(u => u.id === deleted.id) && deleted.data) {
            // Construct a User object compatible with the interface, ensuring is_active is false locally if it wasn't already
            const restoredUser = { ...deleted.data, is_active: false };
            allUsers.push(restoredUser);
        }
    });

    const filteredUsers = allUsers.filter((u) => {
        const search = searchTerm.toLowerCase();
        return (
            (u.name || "").toLowerCase().includes(search) ||
            (u.email || "").toLowerCase().includes(search) ||
            (u.username || "").toLowerCase().includes(search) ||
            (u.id || "").toLowerCase().includes(search)
        );
    });

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16 container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="font-mono text-primary text-sm">{"// Administration"}</p>
                            <h1 className="text-3xl font-bold">User Management</h1>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/code-editor")}
                            className="flex-1 md:flex-none font-mono text-xs"
                        >
                            IDE
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/dashboard")}
                            className="flex-1 md:flex-none font-mono text-xs border-primary/20 text-primary hover:bg-primary/5"
                        >
                            Chat
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/chat-room")}
                            className="flex-1 md:flex-none font-mono text-xs border-primary/20 text-primary hover:bg-primary/5"
                        >
                            General Chat
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/admin/materials")}
                            className="flex-1 md:flex-none font-mono text-xs border-primary/20 text-primary hover:bg-primary/5"
                        >
                            Manage Materials
                        </Button>
                        <Button
                            onClick={() => navigate("/dashboard")}
                            className="flex-1 md:flex-none bg-primary text-primary-foreground font-mono text-xs shadow-lg shadow-primary/20"
                        >
                            Dashboard
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, username or user ID..."
                        className="pl-10 h-12 bg-muted/30 border-border focus-visible:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                            Found {filteredUsers.length} users
                        </div>
                    )}
                </div>

                <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-5 font-mono text-xs uppercase tracking-wider text-muted-foreground w-1/4">Name</th>
                                    <th className="p-5 font-mono text-xs uppercase tracking-wider text-muted-foreground w-1/4">Unique ID</th>
                                    <th className="p-5 font-mono text-xs uppercase tracking-wider text-muted-foreground w-1/4">Contact Email</th>
                                    <th className="p-5 font-mono text-xs uppercase tracking-wider text-muted-foreground text-right w-1/4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-muted-foreground font-mono animate-pulse">Scanning database...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-destructive font-mono">
                                            <div className="flex flex-col items-center gap-4">
                                                <Shield className="w-10 h-10 opacity-20" />
                                                <p>CRITICAL_ERROR: {error}</p>
                                                <Button variant="outline" size="sm" onClick={() => fetchUsers()} className="mt-2">
                                                    RETRY_CONNECTION
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-muted-foreground font-mono">
                                            {searchTerm ? "No users match your search criteria" : "No users registered yet"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="group hover:bg-primary/[0.03] transition-colors"
                                        >
                                            <td className="p-5">
                                                <Link to={`/admin/user/${u.id}`} className="flex items-center gap-3 hover:text-primary transition-colors group/link">
                                                    <div className="relative">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-primary/20 group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-all overflow-hidden shrink-0">
                                                            {u.profile_picture ? (
                                                                <img src={u.profile_picture} alt={u.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                (u.name || "?").charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <UserStatusIndicator is_active={u.is_active} is_verified={u.is_verified} is_online={u.is_online} userId={u.id} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{u.name}</p>
                                                        {u.username && <p className="text-[10px] font-mono opacity-70">@{u.username}</p>}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="p-5">
                                                <Link to={`/admin/user/${u.id}`} className="flex items-center gap-2 font-mono text-xs text-primary/80">
                                                    {u.id}
                                                </Link>
                                            </td>
                                            <td className="p-5">
                                                <Link to={`/admin/user/${u.id}`} className="flex items-center gap-2 text-muted-foreground text-sm">
                                                    <Mail className="w-3 h-3 opacity-50" />
                                                    {u.email}
                                                </Link>
                                            </td>
                                            <td className="p-5 text-right">
                                                <Link
                                                    to={`/admin/user/${u.id}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log(`Link clicked: Navigating to user ${u.id}`);
                                                    }}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
