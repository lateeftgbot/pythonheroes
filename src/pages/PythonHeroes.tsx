import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Zap, Users, Trophy, ArrowRight, BookOpen, Code, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PythonHeroes = () => {
  const { user } = useAuth();
  const [price, setPrice] = useState("3,000");
  const location = useLocation();

  useEffect(() => {
    // Pricing logic: 5000 from Monday night (Feb 2, 2026)
    const checkPrice = () => {
      const now = new Date();
      const cutoff = new Date("2026-02-02T20:00:00"); // Monday night 8 PM
      if (now >= cutoff) {
        setPrice("5,000");
      } else {
        setPrice("3,000");
      }
    };

    checkPrice();
    const interval = setInterval(checkPrice, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.hash === "#enroll") {
      const element = document.getElementById("enroll");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }
  }, [location]);

  const features = [
    "Complete Python fundamentals",
    "Real-world project building",
    "Data science introduction",
    "Telegram bot development",
    "Web backend with Flask",
    "One-on-one mentorship",
    "Certificate of completion",
    "Lifetime community access",
  ];

  const curriculum = [
    {
      module: "Module 1",
      title: "Python Fundamentals",
      topics: ["Variables & Data Types", "Control Flow", "Functions", "OOP Basics"],
      icon: Code,
    },
    {
      module: "Module 2",
      title: "Working with Data",
      topics: ["File Handling", "JSON & APIs", "Pandas Intro", "Data Visualization"],
      icon: BookOpen,
    },
    {
      module: "Module 3",
      title: "Building Projects",
      topics: ["Telegram Bots", "Flask Web Apps", "Game Development", "Final Project"],
      icon: Video,
    },
  ];

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
          amount: parseInt(price.replace(/,/g, '')),
          status: "enroll_clicked_heroes",
          page: "PythonHeroes"
        }),
      }).catch(err => console.error("Failed to notify bot:", err));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm text-primary">Python Heroes Academy</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                From <span className="text-gradient-primary">Zero</span> to{" "}
                <span className="text-gradient-secondary">Python Hero</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                A comprehensive, hands-on Python course designed for complete beginners.
                Learn by building real projects with personalized mentorship.
              </p>

              <div className="flex flex-wrap justify-center gap-6 mb-12">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">200+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-secondary" />
                  <span className="text-muted-foreground">One Month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-terminal-blue" />
                  <span className="text-muted-foreground">Live Sessions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto" id="enroll">
              <div className="glass-card rounded-2xl p-8 border-2 border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-mono rounded-bl-lg">
                  Most Popular
                </div>

                <div className="text-center mb-8">
                  <p className="font-mono text-primary mb-2">Complete Package</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-foreground">₦{price}</span>
                    <span className="text-muted-foreground">/one-time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    or $30 USD for international students
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/payment" state={{ amount: parseInt(price.replace(/,/g, '')) }}>
                  <Button
                    size="lg"
                    className="w-full font-mono bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                    onClick={handleEnrollClick}
                  >
                    Enroll Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  * Payment processed securely. Start learning immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="font-mono text-primary mb-2">{"// Curriculum"}</p>
              <h2 className="text-3xl md:text-4xl font-bold">
                What You'll <span className="text-gradient-primary">Learn</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {curriculum.map((item, index) => (
                <div key={index} className="glass-card rounded-xl p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-mono text-sm text-secondary mb-1">{item.module}</p>
                  <h3 className="font-semibold text-lg mb-4 text-foreground">{item.title}</h3>
                  <ul className="space-y-2">
                    {item.topics.map((topic, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary">›</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="font-mono text-primary mb-2">{"// FAQ"}</p>
              <h2 className="text-3xl font-bold">Common Questions</h2>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {[
                {
                  q: "Do I need any programming experience?",
                  a: "No! This course is designed for complete beginners. We start from the very basics.",
                },
                {
                  q: "How are the classes conducted?",
                  a: "We have live sessions twice a week plus recorded content you can access anytime.",
                },
                {
                  q: "What if I get stuck?",
                  a: "You'll have direct access to me for mentorship and a community of fellow learners.",
                },
              ].map((faq, index) => (
                <div key={index} className="glass-card rounded-lg p-6">
                  <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PythonHeroes;
