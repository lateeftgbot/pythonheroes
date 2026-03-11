import { Bot, MessageSquare, Globe, GraduationCap, Trophy, Code2 } from "lucide-react";
import SkillCard from "./SkillCard";

const SkillsSection = () => {
  const skills = [
    {
      icon: GraduationCap,
      title: "Learning with progress",
      description: "Intuitive tracking systems and data-driven curriculum milestones that visualize your journey to technical mastery.",
      color: "green" as const,
      link: "/learning-space",
    },
    {
      icon: MessageSquare,
      title: "Chat integration",
      description: "Seamless real-time communication within professional chat architectures to collaborate with peers and mentors.",
      color: "blue" as const,
      link: "/chat-room",
    },
    {
      icon: Globe,
      title: "Global connection",
      description: "Networking with a high-performance community of engineers and innovators from every corner of the world.",
      color: "purple" as const,
      link: "/infinite-space",
    },
    {
      icon: GraduationCap,
      title: "Practice for Universities",
      description: "Academic-grade programming challenges specifically designed for university students to excel in their coursework.",
      color: "amber" as const,
      link: "/python-heroes",
    },
    {
      icon: Trophy,
      title: "Coding challenges",
      description: "Intense, real-world bug-fixing and algorithm optimization tasks in a high-stakes competitive environment.",
      color: "green" as const,
      link: "/infinite-space",
    },
    {
      icon: Code2,
      title: "Code editor support",
      description: "Integrated development environment with full syntax highlighting and professional tooling for elite coding.",
      color: "blue" as const,
      link: "/learning-space",
    },
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            The features of <span className="text-green-600">Python Heroes</span>
          </h2>
          <p className="text-lg text-black max-w-2xl mx-auto font-medium">
            Explore the sophisticated ecosystem built to transform passionate learners into
            world-class Python engineers and architects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {skills.map((skill, index) => (
            <SkillCard key={index} {...skill} />
          ))}
        </div>
      </div>

      {/* Decorative side element */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-green-50 rounded-full blur-[100px] opacity-20" />
    </section>
  );
};

export default SkillsSection;
