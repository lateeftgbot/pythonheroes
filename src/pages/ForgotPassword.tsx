
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Failed to send reset email");
            }

            setSuccess(data.message || "Reset link sent! Please check your email.");
            setEmail(""); // Clear email on success
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Navbar />

            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0"></div>
            <div className="absolute top-1/4 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl opacity-20 animate-pulse z-0"></div>
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse delay-1000 z-0"></div>

            <main className="pt-24 pb-16 flex items-center justify-center min-h-screen relative z-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto">
                        <div className="glass-card rounded-2xl p-8 border border-border shadow-2xl relative overflow-hidden group bg-black">
                            {/* Card Glow Effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

                            <div className="relative">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-block px-3 py-1 mb-3 text-xs font-mono text-primary bg-primary/10 rounded-full border border-primary/20">
                                        {"// Recovery Mode"}
                                    </div>
                                    <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Forgot Password</h1>
                                    <p className="text-muted-foreground text-sm">
                                        Enter your email to receive a password reset link
                                    </p>
                                </div>

                                {/* Alerts */}
                                {error && (
                                    <div className="mb-6 animate-in fade-in slide-in-from-top-4">
                                        <div className="bg-destructive/15 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-sm font-bold text-destructive">Error</h3>
                                                <p className="text-sm text-foreground/80">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {success && (
                                    <div className="mb-6 animate-in fade-in slide-in-from-top-4">
                                        <div className="bg-green-500/15 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-sm font-bold text-green-500">Success</h3>
                                                <p className="text-sm text-foreground/80">{success}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-foreground font-medium">
                                            Email Address
                                        </Label>
                                        <div className="relative group/input">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 h-11 bg-muted/50 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full h-11 font-mono font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Sending Link..." : "Send Reset Link"}
                                        {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                                    </Button>
                                </form>

                                {/* Footer */}
                                <div className="mt-8 text-center">
                                    <Link to="/signin" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                                        Read to login? <span className="text-primary font-semibold">Sign In</span>
                                    </Link>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ForgotPassword;
