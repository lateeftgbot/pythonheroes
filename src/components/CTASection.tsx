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
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="font-mono text-sm text-secondary">Now Enrolling</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Become a{" "}
            <span className="text-gradient-secondary">Python Hero</span>?
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join our hands-on Python course and learn from real-world projects.
            From zero to hero, I'll guide you every step of the way.
          </p>

          <Link to="/payment" state={{ amount }}>
            <Button
              size="lg"
              className="font-mono bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
              onClick={handleEnrollClick}
            >
              Enroll Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
