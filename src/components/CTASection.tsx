import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const CTASection = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(3000);

  useEffect(() => {
    // Pricing logic: 5000 from Monday night (Feb 2, 2026)
    const checkPrice = () => {
      const now = new Date();
      const cutoff = new Date("2026-02-02T20:00:00"); // Monday night 8 PM
      if (now >= cutoff) {
        setAmount(5000);
      } else {
        setAmount(3000);
      }
    };

    checkPrice();
    const interval = setInterval(checkPrice, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleEnrollClick = () => {
    // Notify bot of interest if user is logged in
    if (user) {
      fetch("/api/notify-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          amount: amount,
          status: "enroll_clicked_home",
          page: "Home"
        }),
      }).catch(err => console.error("Failed to notify bot:", err));
    }
  };

  return (
    <section className="py-32 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white to-blue-50/50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto p-12 md:p-20 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-green-100/50 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 mb-8">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-green-700">Ready to start?</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-900 tracking-tight">
            Become the <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent italic pr-3 tracking-normal">Python Hero</span> <br />
            the world needs.
          </h2>

          <p className="text-xl text-black mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students mastering the most versatile language on the planet.
            Step-by-step mentorship, production-ready projects, and an elite community await.
          </p>

          <Link to="/payment" state={{ amount }}>
            <Button
              size="lg"
              className="px-10 py-8 text-xl font-bold bg-green-600 hover:bg-green-700 text-white rounded-2xl transition-all hover:scale-105 shadow-xl shadow-green-200"
              onClick={handleEnrollClick}
            >
              Start Your Journey Now
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>

          <p className="mt-8 text-sm font-medium text-black">
            Secure Enrollment • Instant Access • Life-long Skills
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
