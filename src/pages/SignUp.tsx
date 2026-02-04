import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Lock, User, ArrowRight, Check, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const SignUp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? "/admin" : "/dashboard", { replace: true });
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
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navbar />

        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0"></div>

        <main className="pt-24 pb-16 flex items-center justify-center min-h-screen relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="glass-card rounded-2xl p-8 border border-border text-center shadow-2xl relative overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30"></div>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-lg shadow-primary/10">
                    <Mail className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 tracking-tight">Check your Inbox</h2>
                  <p className="text-muted-foreground mb-8 text-lg">
                    We've sent a verification link to <br /><span className="font-semibold text-foreground bg-primary/10 px-2 py-1 rounded">{email}</span>.
                  </p>
                  <div className="p-4 bg-muted/50 rounded-lg mb-8 border border-border text-left">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">Requirement:</span> Click the link in the email to activate your account.
                      <br />
                      <span className="text-destructive font-semibold">Note:</span> The link will <span className="underline">expire in 10 minutes</span>. If not used by then, your registration will be cleared and you'll need to sign up again.
                    </p>
                  </div>
                  <Link to="/signin">
                    <Button size="lg" className="w-full h-11 font-mono font-bold text-base bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20">
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0"></div>
      <div className="absolute top-1/4 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl opacity-20 animate-pulse z-0"></div>
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse delay-1000 z-0"></div>

      <main className="pt-24 pb-16 flex items-center justify-center min-h-screen relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <div className="glass-card rounded-2xl p-8 border border-border shadow-2xl relative overflow-hidden group bg-black">
              {/* Card Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

              <div className="relative">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-block px-3 py-1 mb-3 text-xs font-mono text-primary bg-primary/10 rounded-full border border-primary/20">
                    {"// Join Python Heroes"}
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Create Account</h1>
                  <p className="text-muted-foreground text-sm mb-6">
                    Sign up to enroll in Python Heroes
                  </p>

                  {/* Compact Benefits */}
                  <div className="flex flex-col gap-y-2 text-xs text-muted-foreground bg-black/20 p-4 rounded-lg border border-white/5 w-full items-start">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-primary" />
                        </div>
                        <span className="text-left">{benefit}</span>
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
                    <Label htmlFor="name" className="text-foreground font-medium">
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
                        className="pl-10 h-11 bg-muted/50 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        required
                      />
                    </div>
                  </div>

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
                        className={cn(
                          "pl-10 h-11 bg-muted/50 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all",
                          error && error.toLowerCase().includes('email') && "bg-destructive/10 border-destructive/50 ring-destructive/20 text-destructive"
                        )}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">
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
                        className="pl-10 pr-10 h-11 bg-muted/50 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
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
                    className="w-full h-11 font-mono font-bold text-base bg-green-600 hover:bg-green-700 transition-opacity text-white shadow-lg shadow-green-900/20"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                    {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
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
                <div className="mt-8 p-3 rounded-md bg-black/40 border border-white/5 backdrop-blur-md">
                  <div className="flex items-start gap-2 text-xs font-mono opacity-60 hover:opacity-100 transition-opacity">
                    <div className="mt-0.5 text-secondary">{"//"}</div>
                    <div className="text-muted-foreground">
                      <span className="text-blue-400">POST</span> /api/auth/signup
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
