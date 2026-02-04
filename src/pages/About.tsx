import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GraduationCap, MapPin, Calendar, Code, Wrench, BookOpen } from "lucide-react";

const About = () => {
  const timeline = [
    {
      year: "2026",
      title: "Python Heroes Founded",
      description: "Started teaching Python programming to aspiring developers",
      icon: Code,
    },
    {
      year: "2025",
      title: "Graduated from OAU",
      description: "Completed degree at Obafemi Awolowo University, Ile-Ife",
      icon: GraduationCap,
    },
    {
      year: "2024",
      title: "First Major Projects",
      description: "Built production-ready Telegram bots and data science projects",
      icon: Wrench,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="font-mono text-primary mb-2">{"// About Me"}</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">The Story of </span>
              <span className="text-gradient-primary">Basiru</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              A passionate developer and engineer from Nigeria, on a mission to build and teach.
            </p>
          </div>

          {/* Bio Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto mb-24">
            <div className="space-y-6">
              <div className="code-block p-6">
                <pre className="text-sm overflow-x-auto">
                  <code>
                    <span className="text-terminal-purple">const</span>{" "}
                    <span className="text-terminal-blue">basiru</span> = {"{"}
                    {"\n"}
                    {"  "}fullName: <span className="text-terminal-green">"Basiru Lateef Olayinka"</span>,
                    {"\n"}
                    {"  "}location: <span className="text-terminal-green">"Nigeria 🇳🇬"</span>,
                    {"\n"}
                    {"  "}university: <span className="text-terminal-green">"OAU Ile-Ife"</span>,
                    {"\n"}
                    {"  "}graduated: <span className="text-terminal-amber">2025</span>,
                    {"\n"}
                    {"  "}loves: [<span className="text-terminal-green">"Python"</span>, <span className="text-terminal-green">"Teaching"</span>,{"\n"}
                    {"          "}<span className="text-terminal-green">"Mathematics"</span>],
                    {"\n"}
                    {"  "}professions: [<span className="text-terminal-green">"Mech engineer"</span>,{"\n"}
                    {"                "}<span className="text-terminal-green">"Auto Electrician"</span>],
                    {"\n"}
                    {"}"};
                  </code>
                </pre>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Nigeria</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">Class of 2025</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                  <BookOpen className="w-4 h-4 text-terminal-blue" />
                  <span className="text-sm text-muted-foreground">Python Heroes Founder</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                I'm <span className="text-foreground font-semibold">Basiru Lateef Olayinka</span>,
                a fresh graduate from Obafemi Awolowo University, Ile-Ife. My journey in tech started
                with a curiosity about how things work, which led me to explore both software
                development and auto engineering.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Python became my weapon of choice. I've used it to build everything from
                data analysis pipelines to Telegram bots, web backends, and even 2D games.
                There's something magical about writing code that solves real problems.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                But beyond building, I discovered a passion for <span className="text-primary font-semibold">teaching</span>.
                That's why I founded <span className="text-secondary font-semibold">Python Heroes</span> —
                to help others start their programming journey with guidance I wish I had when I started.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">
              <span className="text-primary font-mono">{"// "}</span>Journey
            </h2>

            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

              {timeline.map((item, index) => (
                <div key={index} className="relative flex gap-6 mb-8">
                  <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0 z-10">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="pt-2">
                    <span className="font-mono text-sm text-secondary">{item.year}</span>
                    <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
