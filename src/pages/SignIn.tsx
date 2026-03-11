import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'master1_vectors') {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
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
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      <Navbar />

      <main className="pt-32 pb-24 relative z-10">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none -mt-32">
          <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-green-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-green-500 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] relative overflow-hidden group">
              <div className="relative">
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-[10px] text-black tracking-widest uppercase">Welcome Back</span>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Sign <span className="text-blue-600">In</span></h1>
                  <p className="text-slate-800 text-sm font-medium">
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
                    <Label htmlFor="email" className="text-slate-900 font-medium">
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
                        className="pl-10 h-11 bg-white border-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-slate-900 font-medium">
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
                        className="pl-10 pr-10 h-11 bg-white border-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all font-medium"
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
                    className="w-full h-14 font-black text-sm uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Access Dashboard"}
                    {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
                  </Button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-800 italic">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-primary hover:text-accent font-semibold transition-colors">
                      Sign up now
                    </Link>
                  </p>
                </div>

                {/* Developer Note */}
                <div className="mt-10 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-2 text-[10px] font-mono">
                    <div className="mt-0.5 text-blue-600">{"//"}</div>
                    <div className="text-slate-800">
                      <span className="text-blue-600 font-bold">POST</span> /api/auth/signin
                    </div>
                  </div>
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

export default SignIn;
