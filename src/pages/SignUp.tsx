import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Lock, User, ArrowRight, Check, Eye, EyeOff, AlertCircle, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const SignUp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'master1_vectors') {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const telegram_chat_id = localStorage.getItem("telegram_chat_id");

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          telegram_chat_id // Send the chat ID if it exists
        }),
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
        // Specifically handle conflict (email exists)
        if (response.status === 409) {
          setError(data?.error || "This email is already registered.");
          return;
        }
        throw new Error(data?.error || "Signup failed");
      }

      setIsSuccess(true);
      console.log("User registered:", data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Access to all course materials",
    "Join the Python Heroes community",
    "Track your learning progress",
    "Get certificate on completion",
  ];

  if (isSuccess) {
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
              <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-2xl shadow-blue-100/50 text-center relative overflow-hidden">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[2rem] bg-blue-50 flex items-center justify-center mx-auto mb-8 border border-blue-100 shadow-lg shadow-blue-50">
                    <Mail className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Check your <span className="text-blue-600">Inbox</span></h2>
                  <p className="text-slate-500 mb-10 text-lg font-medium">
                    We've sent a verification link to <br /><span className="font-bold text-slate-900 bg-blue-50 px-3 py-1.5 rounded-xl">{email}</span>.
                  </p>
                  <div className="p-6 bg-slate-50 rounded-[2rem] mb-10 border border-slate-100 text-left">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-black text-blue-600 uppercase tracking-widest text-[10px] block mb-2">Requirement:</span>
                      Click the link in the email to activate your account.
                      <br /><br />
                      <span className="text-red-600 font-bold">Note:</span> The link will <span className="underline">expire in 10 minutes</span>. If not used by then, you'll need to sign up again.
                    </p>
                  </div>
                  <Link to="/signin">
                    <Button size="lg" className="w-full h-14 font-black text-sm uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-100 transition-all">
                      Proceed to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-green-500 shadow-2xl shadow-blue-100/50 relative overflow-hidden group">
              <div className="relative">
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-[10px] text-black tracking-widest uppercase">Join Python Heroes</span>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Create <span className="text-blue-600">Account</span></h1>
                  <p className="text-slate-500 text-sm font-medium mb-8">
                    Sign up to enroll in Python Heroes
                  </p>

                  {/* Compact Benefits */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 w-full">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                          <Check className="w-3 h-3 text-green-600 font-black" />
                        </div>
                        <span className="text-left font-bold">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Animated Error Alert */}
                {error && (
                  <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                    <div className="bg-destructive/15 border border-destructive/30 rounded-xl p-4 flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative overflow-hidden group/error">
                      <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 to-transparent opacity-0 group-hover/error:opacity-100 transition-opacity duration-700"></div>
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1 relative z-10">
                        <h3 className="text-sm font-bold text-destructive flex items-center gap-2">
                          Verification Error
                        </h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-900 font-medium">
                      Full Name
                    </Label>
                    <div className="relative group/input">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-primary transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Basiru Lateef"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11 bg-white border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

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
                        className={cn(
                          "pl-10 h-11 bg-white border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all font-medium",
                          error && error.toLowerCase().includes('email') && "bg-red-50 border-red-200 ring-red-100 text-red-600"
                        )}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-900 font-medium">
                      Password
                    </Label>
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
                        className="pl-10 pr-10 h-11 bg-white border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all font-medium"
                        required
                        minLength={8}
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
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 font-black text-sm uppercase tracking-widest bg-blue-600 hover:bg-blue-700 transition-all text-white rounded-2xl shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                    {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By signing up, you agree to our Terms of Service
                  </p>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-primary hover:text-accent font-semibold transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>

                {/* Developer Note */}
                <div className="mt-10 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-2 text-[10px] font-mono opacity-50">
                    <div className="mt-0.5 text-blue-600">{"//"}</div>
                    <div className="text-slate-600">
                      <span className="text-blue-600 font-bold">POST</span> /api/auth/signup
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

export default SignUp;
