import { LucideIcon } from "lucide-react";

interface SkillCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: "green" | "amber" | "blue" | "purple";
}

const colorClasses = {
  green: "bg-terminal-green/10 text-terminal-green border-terminal-green/20",
  amber: "bg-terminal-amber/10 text-terminal-amber border-terminal-amber/20",
  blue: "bg-terminal-blue/10 text-terminal-blue border-terminal-blue/20",
  purple: "bg-terminal-purple/10 text-terminal-purple border-terminal-purple/20",
};

const SkillCard = ({ icon: Icon, title, description, color }: SkillCardProps) => {
  return (
    <div className="group glass-card rounded-xl p-6 hover:border-primary/50 transition-all duration-300">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-mono font-semibold text-lg mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default SkillCard;
