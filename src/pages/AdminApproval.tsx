import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, ShieldAlert, User, Mail, Globe } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface RequesterInfo {
    name: string;
    email: string;
    username: string;
    profile_picture?: string;
    current_role: string;
}

const AdminApproval = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requester, setRequester] = useState<RequesterInfo | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        const fetchRequesterInfo = async () => {
            try {
                const response = await fetch(`/api/admin/approve-request/${token}`);
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Invalid or expired approval link");
                }
                const data = await response.json();
                setRequester(data);
            } catch (err: any) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchRequesterInfo();
        }
    }, [token]);

    const handleAction = async (action: 'approve' | 'dismiss') => {
        setSubmitting(true);
        try {
            const response = await fetch(`/api/admin/approve-request/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to ${action} request`);
            }

            const data = await response.json();
            toast.success(data.message);

            // Redirect to dashboard after short delay
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        } catch (err: any) {
            toast.error(err.message);
            setError(err.message);
        } finally {
            setSubmitting(false);
            setIsConfirmOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-mono animate-pulse">Verifying Security Token...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-12">
                <div className="w-full max-w-md">
                    {error ? (
                        <Card className="glass-card border-red-500/20 bg-background/95 backdrop-blur-md">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                    <ShieldAlert className="w-8 h-8 text-red-500" />
                                </div>
                                <CardTitle className="text-xl text-foreground">Link Inactive</CardTitle>
                                <CardDescription className="text-red-400/80 font-mono text-xs pt-1">
                                    Status: REQUEST_EXPIRED_OR_PROCESSED
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center py-6 text-muted-foreground text-sm">
                                {error}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={() => navigate("/")}
                                    variant="outline"
                                    className="w-full font-mono text-xs border-white/10"
                                >
                                    Return to Home
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <>
                            <Card className="glass-card border-primary/20 bg-background/95 backdrop-blur-md overflow-hidden animate-fade-in">
                                <CardHeader className="text-center pb-2 bg-primary/5 border-b border-primary/10">
                                    <CardTitle className="text-xl flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                        Admin Permission Grant
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground font-mono text-xs pt-1">
                                        Request Source: DASHBOARD_MINI_IDE
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8 pb-6 flex flex-col items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary/60 transition-all duration-300">
                                            {requester?.profile_picture ? (
                                                <img
                                                    src={requester.profile_picture}
                                                    alt={requester.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.error("ADMIN_APPROVAL: Profile picture failed to load", e);
                                                        (e.target as HTMLImageElement).src = ""; // Force fallback to User icon
                                                        setRequester(prev => prev ? { ...prev, profile_picture: undefined } : null);
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-10 h-10 text-primary/40" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-background border border-primary/30 rounded-full p-1.5 shadow-lg">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#04AA6D] animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 w-full">
                                        <div className="text-center">
                                            <h3 className="text-lg font-bold text-foreground">{requester?.name}</h3>
                                            <p className="text-primary text-xs font-mono">@{requester?.username || "unknown"}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 pt-2">
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/5">
                                                <Mail className="w-4 h-4 text-primary/60" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-mono leading-none mb-1">Email Address</span>
                                                    <span className="text-sm font-medium">{requester?.email}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/5">
                                                <Globe className="w-4 h-4 text-primary/60" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-mono leading-none mb-1">Current Status</span>
                                                    <span className="text-sm font-medium capitalize">{requester?.current_role}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3 p-6 bg-primary/5 border-t border-primary/10">
                                    <Button
                                        onClick={() => setIsConfirmOpen(true)}
                                        disabled={submitting || requester?.current_role === 'admin' || requester?.current_role === 'master1_vectors'}
                                        className="w-full bg-[#04AA6D] hover:bg-[#059862] text-white font-mono shadow-[0_0_15px_rgba(4,170,109,0.3)]"
                                    >
                                        {(requester?.current_role === 'admin' || requester?.current_role === 'master1_vectors') ? "Already an Admin/Master" : "Grant Admin permission"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate("/")}
                                        className="w-full text-muted-foreground hover:text-foreground text-xs font-mono"
                                    >
                                        Cancel & Return Home
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Custom Decision Dialog */}
                            {isConfirmOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                                    <div className="w-full max-w-sm glass-card border-primary/20 bg-background/95 p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-primary" />
                                            Final Decision
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-6">
                                            What action would you like to take regarding <span className="text-foreground font-medium">{requester?.name}</span>'s request?
                                        </p>
                                        <div className="grid grid-cols-1 gap-3">
                                            <Button
                                                onClick={() => handleAction('approve')}
                                                disabled={submitting}
                                                className="bg-[#04AA6D] hover:bg-[#059862] text-white py-6"
                                            >
                                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Grant Access"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleAction('dismiss')}
                                                disabled={submitting}
                                                className="border-red-500/30 text-red-500 hover:bg-red-500/10 py-6"
                                            >
                                                Dismiss
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsConfirmOpen(false)}
                                                disabled={submitting}
                                                className="text-xs text-muted-foreground"
                                            >
                                                Back to Review
                                            </Button>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-muted-foreground text-center font-mono">
                                            NOTE: Dismissing will expire this link immediately.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminApproval;
