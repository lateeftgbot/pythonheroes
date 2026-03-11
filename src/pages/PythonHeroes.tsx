import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Zap, Users, Trophy, ArrowRight, BookOpen, Code, Video, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PythonHeroes = () => {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('standard');
  const location = useLocation();

  const packages = {
    basic: {
      name: "Basic Package",
      price: "10,000",
      modules: [1],
      description: "Perfect for getting started with Python core fundamentals."
    },
    standard: {
      name: "Standard Package",
      price: "20,000",
      modules: [1, 2],
      description: "Master Python fundamentals and data processing."
    },
    premium: {
      name: "Premium Package",
      price: "50,000",
      modules: [1, 2, 3],
      description: "The complete journey: from basics to building professional projects."
    }
  };

  const currentPackage = packages[selectedPackage];

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
          amount: parseInt(currentPackage.price.replace(/,/g, '')),
          status: "enroll_clicked_heroes",
          page: "PythonHeroes"
        }),
      }).catch(err => console.error("Failed to notify bot:", err));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="py-24 relative overflow-hidden bg-white">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-black tracking-wide uppercase">Python Heroes Academy</span>
                </div>
                <Link to="/infinite-space">
                  <Button variant="outline" size="sm" className="rounded-full font-bold text-xs border-green-600 bg-white hover:bg-green-50 text-green-600 gap-2 transition-all hover:scale-105">
                    <Terminal className="w-3.5 h-3.5 text-green-600" />
                    Infinite space
                  </Button>
                </Link>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-black leading-tight">
                From <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent italic pr-2 tracking-normal">Zero</span> to{" "}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent italic pr-2 tracking-normal">Python Hero</span>
              </h1>

              <p className="text-xl text-black font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                A comprehensive, hands-on Python course designed for complete beginners.
                Learn by building real projects with personalized mentorship.
              </p>

              <div className="flex flex-wrap justify-center gap-8 mb-16">
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Users className="w-6 h-6 text-blue-600" />
                  <span className="text-black font-bold">200+ Students</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Trophy className="w-6 h-6 text-green-600" />
                  <span className="text-black font-bold">One Month</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <Video className="w-6 h-6 text-amber-600" />
                  <span className="text-black font-bold">Live Sessions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 bg-blue-50/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto" id="enroll">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-black mb-4">Choose Your <span className="text-green-600">Growth Path</span></h2>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  {(Object.keys(packages) as Array<keyof typeof packages>).map((pkg) => (
                    <button
                      key={pkg}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${selectedPackage === pkg
                        ? "bg-green-600 text-white shadow-xl shadow-green-200 scale-105"
                        : "bg-white text-slate-400 border border-slate-200 hover:border-green-200 hover:text-green-600"
                        }`}
                    >
                      {pkg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-12 border-2 border-slate-100 shadow-2xl relative overflow-hidden">
                {selectedPackage === 'premium' && (
                  <div className="absolute top-0 right-0 bg-amber-400 text-black px-6 py-2 text-xs font-black uppercase tracking-widest rounded-bl-3xl">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-10">
                  <p className="font-bold text-blue-600 mb-2 uppercase tracking-widest text-sm">{currentPackage.name}</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-black text-black">₦{currentPackage.price}</span>
                    <span className="text-black font-bold">/one-time</span>
                  </div>
                  <p className="text-base text-black font-medium mt-4">
                    {currentPackage.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 list-none">
                      <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 border border-green-100">
                        <Check className="w-3.5 h-3.5 text-green-600 font-bold" />
                      </div>
                      <span className="text-black text-sm font-bold">{feature}</span>
                    </li>
                  ))}
                </div>

                <Link to="/payment" state={{ amount: parseInt(currentPackage.price.replace(/,/g, '')) }}>
                  <Button
                    size="lg"
                    className="w-full h-20 text-xl font-black rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-200 transition-all hover:scale-105 active:scale-95"
                    onClick={handleEnrollClick}
                  >
                    Enroll as a {selectedPackage} Hero
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Link>

              </div>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="font-bold text-blue-600 mb-3 uppercase tracking-widest text-sm">{"// Curriculum"}</p>
              <h2 className="text-4xl md:text-5xl font-black text-black">
                What You'll <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent pr-2 tracking-normal">Learn</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {curriculum.map((item, index) => {
                const isIncluded = currentPackage.modules.includes(index + 1);
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-[2.5rem] p-8 border transition-all duration-300 ${isIncluded
                      ? "border-blue-200 shadow-xl shadow-blue-50 opacity-100 scale-100"
                      : "border-slate-100 opacity-40 grayscale scale-95 hover:grayscale-0 hover:opacity-100"
                      }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isIncluded ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>
                      <item.icon className="w-8 h-8" />
                    </div>
                    <p className={`font-bold text-xs mb-2 uppercase tracking-widest ${isIncluded ? "text-blue-600" : "text-slate-400"}`}>{item.module}</p>
                    <h3 className="font-black text-2xl mb-6 text-black tracking-tight">{item.title}</h3>
                    <ul className="space-y-3">
                      {item.topics.map((topic, i) => (
                        <li key={i} className="text-base text-black font-bold flex items-center gap-3">
                          <span className={`${isIncluded ? "bg-blue-400" : "bg-slate-300"} w-2 h-2 rounded-full`}></span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                    {!isIncluded && (
                      <p className="mt-6 text-xs font-black text-slate-400 uppercase tracking-widest italic">Not in {selectedPackage} package</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-amber-50/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="font-bold text-amber-600 mb-3 uppercase tracking-widest text-sm">{"// FAQ"}</p>
              <h2 className="text-4xl font-black text-black">Common Questions</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  q: "Do I need any programming experience?",
                  a: "No! This course is designed for complete beginners. We start from the very basics.",
                },
                {
                  q: "How are the classes conducted?",
                  a: "We have live sessions three times a week plus recorded content you can access anytime.",
                },
                {
                  q: "What if I get stuck?",
                  a: "You will have direct access to the lead instructor, Vectors (the CEO and founder) and our learning community.",
                },
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-xl transition-all">
                  <h4 className="font-black text-black text-xl mb-3 flex items-start gap-3">
                    <span className="text-amber-500 font-mono text-2xl leading-none">?</span>
                    {faq.q}
                  </h4>
                  <p className="text-black text-lg font-medium pl-6 leading-relaxed opacity-90">{faq.a}</p>
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
