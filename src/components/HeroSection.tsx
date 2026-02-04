import { ArrowRight, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TypewriterText from "./TypewriterText";

const HeroSection = () => {
  const roles = [
    "Python Developer",
    "Data Scientist",
    "Automotive Engineer",
    "Math Tutor",
    "Bot Developer",
  ];

  return (
    <section className="min-h-screen flex items-center justify-center pt-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Terminal header */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">
              ~/basiru <span className="text-primary">$</span> whoami
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-foreground">Hi, I'm </span>
            <span className="text-gradient-primary">Basiru Lateef</span>
          </h1>

          {/* Typewriter effect */}
          <div className="h-12 md:h-16 mb-8">
            <p className="text-xl md:text-3xl font-mono text-muted-foreground">
              {">"} <TypewriterText texts={roles} className="text-secondary" />
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Fresh graduate from Obafemi Awolowo University, Ile-Ife.
            I build Python solutions — from data science to Telegram bots,
            and teach aspiring developers at <span className="text-primary font-semibold">Python Heroes</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="font-mono bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20">
                Join Python Heroes
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="font-mono border-border hover:bg-muted">
                Learn More About Me
              </Button>
            </Link>
          </div>

          {/* Code snippet decoration */}
          <div className="mt-16 code-block p-4 text-left max-w-md mx-auto">
            <pre className="text-sm">
              <code>
                <span className="text-terminal-purple">class</span>{" "}
                <span className="text-terminal-amber">Developer</span>:
                {"\n"}
                {"  "}
                <span className="text-terminal-purple">def</span>{" "}
                <span className="text-terminal-blue">__init__</span>
                <span className="text-muted-foreground">(self):</span>
                {"\n"}
                {"    "}self.name = <span className="text-terminal-green">"Basiru"</span>
                {"\n"}
                {"    "}self.passion = <span className="text-terminal-green">"Python"</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
