
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Lock, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to reset password");
            }

            setSuccess(true);
            setTimeout(() => {
                navigate("/signin");
            }, 3000);

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Navbar />

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0"></div>
            <div className="absolute top-1/4 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl opacity-20 animate-pulse z-0"></div>

            <main className="pt-24 pb-16 flex items-center justify-center min-h-screen relative z-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto">
                        <div className="glass-card rounded-2xl p-8 border border-border shadow-2xl relative overflow-hidden group bg-black">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

                            <div className="relative">
                                <div className="text-center mb-8">
                                    <div className="inline-block px-3 py-1 mb-3 text-xs font-mono text-purple-400 bg-purple-900/20 rounded-full border border-purple-500/30">
                                        {"// Secure Access"}
                                    </div>
                                    <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Reset Password</h1>
                                    <p className="text-muted-foreground text-sm">
                                        Enter your new password below
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 animate-in fade-in slide-in-from-top-4">
                                        <div className="bg-destructive/15 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                                            <p className="text-sm text-foreground/80">{error}</p>
                                        </div>
                                    </div>
                                )}

                                {success ? (
                                    <div className="text-center py-8 animate-in fade-in zoom-in">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 mb-4">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-green-500 mb-2">Password Reset!</h3>
                                        <p className="text-muted-foreground mb-6">Your password has been updated successfully. Redirecting you to login...</p>
                                        <Link to="/signin">
                                            <Button className="font-mono">Go to Login Now</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-foreground font-medium">New Password</Label>
                                            <div className="relative group/input">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="pl-10 pr-10 h-11 bg-muted/50 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
                                            <div className="relative group/input">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="pl-10 h-11 bg-muted/50 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full h-11 font-mono font-bold text-base bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Resetting..." : "Set New Password"}
                                            {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ResetPassword;
