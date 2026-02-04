import { Bot, Car, Calculator, Database, Gamepad2, Globe } from "lucide-react";
import SkillCard from "./SkillCard";

const SkillsSection = () => {
  const skills = [
    {
      icon: Database,
      title: "Data Science",
      description: "Analyzing data, building ML models, and creating insights with Python's powerful ecosystem.",
      color: "green" as const,
    },
    {
      icon: Bot,
      title: "Telegram Bots",
      description: "Building intelligent bots for automation, customer service, and community management.",
      color: "blue" as const,
    },
    {
      icon: Globe,
      title: "Web Backend",
      description: "Creating robust APIs and web services using Flask, FastAPI, and Django.",
      color: "purple" as const,
    },
    {
      icon: Gamepad2,
      title: "2D Games",
      description: "Developing fun and interactive games using Pygame and other Python frameworks.",
      color: "amber" as const,
    },
    {
      icon: Car,
      title: "Automotive Service",
      description: "Engineering expertise in automotive systems, maintenance, and design.",
      color: "green" as const,
    },
    {
      icon: Calculator,
      title: "Math Tutoring",
      description: "Teaching mathematics concepts from basic algebra to advanced calculus.",
      color: "blue" as const,
    },
  ];

  return (
    <section className="py-24 bg-[#dddddd]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-mono text-primary mb-2">{"// What I Do"}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Skills & <span className="text-gradient-primary">Expertise</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From writing Python scripts to designing machine parts, here's what I bring to the table.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {skills.map((skill, index) => (
            <SkillCard key={index} {...skill} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
