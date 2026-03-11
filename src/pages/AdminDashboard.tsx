import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Shield, Search, Mail, ExternalLink, Filter, ArrowDownAz, GraduationCap, Gamepad2 } from "lucide-react";
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
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBy, setFilterBy] = useState("all");
    const [sortBy, setSortBy] = useState("name");

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
        if (!authLoading) {
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'master1_vectors')) {
                navigate("/signin", { replace: true });
            } else {
                fetchUsers();
            }
        }
    }, [currentUser, authLoading, navigate]);

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

    const filteredUsers = allUsers
        .filter((u) => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = (
                (u.name || "").toLowerCase().includes(search) ||
                (u.email || "").toLowerCase().includes(search) ||
                (u.username || "").toLowerCase().includes(search) ||
                (u.id || "").toLowerCase().includes(search)
            );

            if (!matchesSearch) return false;

            if (filterBy === "verified") return u.is_verified;
            if (filterBy === "unverified") return !u.is_verified;
            if (filterBy === "active") return u.is_active;
            if (filterBy === "inactive") return !u.is_active;

            return true;
        })
        .sort((a, b) => {
            if (sortBy === "name") {
                return (a.name || "").localeCompare(b.name || "");
            }
            if (sortBy === "date") {
                return (b.joined_at || "").localeCompare(a.joined_at || "");
            }
            if (sortBy === "paid") {
                return (b.amount_paid || 0) - (a.amount_paid || 0);
            }
            return 0;
        });

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 flex flex-col overflow-hidden pt-24 pb-4 container mx-auto px-4 max-w-5xl">
                <div className="shrink-0">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3 px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-mono text-primary text-xs sm:text-sm">{"// Administration"}</p>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl sm:text-3xl font-bold">User Management</h1>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigate("/admin/missions")}
                                        className="h-8 w-8 rounded-lg bg-primary/5 hover:bg-primary/20 text-primary transition-all border border-primary/20"
                                        title="Mission Creation"
                                    >
                                        <Gamepad2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                {currentUser && (
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                                        Welcome, <span className="text-primary font-bold">{currentUser.name}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/code-editor")}
                                className="h-8 md:h-9 px-3 font-mono text-[10px]"
                            >
                                IDE
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/conversations")}
                                className="h-8 md:h-9 px-3 font-mono text-[10px] border-primary/20 text-primary hover:bg-primary/5"
                            >
                                Chat
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/chat-room")}
                                className="h-8 md:h-9 px-3 font-mono text-[10px] border-primary/20 text-primary hover:bg-primary/5"
                            >
                                General Chat
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/admin/materials")}
                                className="h-8 md:h-9 px-3 font-mono text-[10px] border-primary/20 text-primary hover:bg-primary/5"
                            >
                                Materials
                            </Button>
                            <Button
                                onClick={() => navigate("/dashboard")}
                                className="h-8 md:h-9 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest text-[9px] rounded-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                            >
                                <GraduationCap className="w-3 h-3 mr-1" />
                                STUDENT MODE
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, username or user ID..."
                                className="pl-9 h-10 bg-muted/30 border-border focus-visible:ring-primary/20 text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                                <select
                                    className="h-10 pl-8 pr-3 bg-muted/30 border border-border rounded-md text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none min-w-[100px]"
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value)}
                                >
                                    <option value="all">Users</option>
                                    <option value="verified">Verified</option>
                                    <option value="unverified">Unverified</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="relative">
                                <ArrowDownAz className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                                <select
                                    className="h-10 pl-8 pr-3 bg-muted/30 border border-border rounded-md text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none min-w-[100px]"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="name">Name</option>
                                    <option value="date">Date</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4 text-xs font-mono text-muted-foreground px-2">
                        Showing {filteredUsers.length} of {allUsers.length} users
                    </div>
                </div>

                <div className="flex-1 min-h-0 px-1 pb-8 flex flex-col overflow-hidden">
                    <div className="glass-card rounded-2xl border-2 border-green-600 shadow-xl shadow-black/20 transition-all duration-300 flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-auto scrollbar-hide">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr>
                                        <th className="md:p-5 p-2 font-mono md:text-xs text-[10px] uppercase tracking-wider text-muted-foreground w-1/4 sticky top-0 z-20 bg-muted/95 backdrop-blur-sm border-b border-border">Name</th>
                                        <th className="md:p-5 p-2 font-mono md:text-xs text-[10px] uppercase tracking-wider text-muted-foreground w-1/4 sticky top-0 z-20 bg-muted/95 backdrop-blur-sm border-b border-border">Unique ID</th>
                                        <th className="md:p-5 p-2 font-mono md:text-xs text-[10px] uppercase tracking-wider text-muted-foreground w-1/4 sticky top-0 z-20 bg-muted/95 backdrop-blur-sm border-b border-border">Contact Email</th>
                                        <th className="md:p-5 p-2 font-mono md:text-xs text-[10px] uppercase tracking-wider text-muted-foreground text-right w-1/4 sticky top-0 z-20 bg-muted/95 backdrop-blur-sm border-b border-border">Details</th>
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
                                                <td className="md:p-5 p-2">
                                                    <Link to={`/admin/user/${u.id}`} className="flex items-center gap-2 md:gap-3 hover:text-primary transition-colors group/link">
                                                        <div className="relative">
                                                            <div className="md:w-8 md:h-8 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold md:text-xs text-[10px] ring-1 md:ring-2 ring-primary/20 group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-all overflow-hidden shrink-0">
                                                                {u.profile_picture ? (
                                                                    <img src={u.profile_picture} alt={u.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    (u.name || "?").charAt(0).toUpperCase()
                                                                )}
                                                            </div>
                                                            <UserStatusIndicator is_active={u.is_active} is_verified={u.is_verified} is_online={u.is_online} userId={u.id} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="md:font-semibold font-medium md:text-sm text-[11px] truncate">{u.name}</p>
                                                            {u.username && <p className="md:text-[10px] text-[8px] font-mono opacity-70 truncate">@{u.username}</p>}
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="md:p-5 p-2">
                                                    <Link to={`/admin/user/${u.id}`} className="flex items-center gap-2 font-mono md:text-xs text-[9px] text-primary/80 truncate">
                                                        {u.id}
                                                    </Link>
                                                </td>
                                                <td className="md:p-5 p-2">
                                                    <Link to={`/admin/user/${u.id}`} className="flex items-center gap-2 text-muted-foreground md:text-sm text-[10px] truncate">
                                                        <Mail className="md:w-3 md:h-3 w-2.5 h-2.5 opacity-50 shrink-0" />
                                                        <span className="truncate">{u.email}</span>
                                                    </Link>
                                                </td>
                                                <td className="md:p-5 p-2 text-right">
                                                    <Link
                                                        to={`/admin/user/${u.id}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log(`Link clicked: Navigating to user ${u.id}`);
                                                        }}
                                                        className="inline-flex items-center justify-center md:w-8 md:h-8 w-6 h-6 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                                                    >
                                                        <ExternalLink className="md:w-4 md:h-4 w-3.5 h-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
            <div className="h-[30px] w-full bg-gradient-to-r from-[#ff0000] via-[#ff7f00] via-[#ffff00] via-[#00ff00] via-[#0000ff] via-[#4b0082] to-[#8b00ff] animate-gradient-x shadow-[0_-4px_20px_rgba(0,0,0,0.1)] relative z-50 shrink-0"></div>
        </div>
    );
};

export default AdminDashboard;
