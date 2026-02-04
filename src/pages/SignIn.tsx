import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // Handle non-JSON response (e.g. 500 error page)
        throw new Error(`Server Error: ${response.status}. Please try again later.`);
      }

      if (!response.ok) {
        throw new Error(data?.error || "Login failed");
      }

      console.log("User logged in:", data);

      login(data.user);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
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
                    {"// Welcome Back"}
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Sign In</h1>
                  <p className="text-muted-foreground text-sm">
                    Access your Python Heroes dashboard
                  </p>
                </div>

                {/* Animated Error Alert */}
                {error && (
                  <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                    <div className="bg-destructive/15 border border-destructive/30 rounded-xl p-4 flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative overflow-hidden group/error">
                      <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 to-transparent opacity-0 group-hover/error:opacity-100 transition-opacity duration-700"></div>
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1 relative z-10">
                        <h3 className="text-sm font-bold text-destructive">Login Error</h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">{error}</p>
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
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-foreground font-medium">
                        Password
                      </Label>
                      <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
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
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-11 font-mono font-bold text-base bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Access Dashboard"}
                    {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary hover:text-accent font-semibold transition-colors">
                      Sign up now
                    </Link>
                  </p>
                </div>

                {/* Developer Note */}
                <div className="mt-8 p-3 rounded-md bg-black/40 border border-white/5 backdrop-blur-md">
                  <div className="flex items-start gap-2 text-xs font-mono opacity-60 hover:opacity-100 transition-opacity">
                    <div className="mt-0.5 text-secondary">{"//"}</div>
                    <div className="text-muted-foreground">
                      <span className="text-blue-400">POST</span> /api/auth/signin
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
