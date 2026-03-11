import { LucideIcon, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

interface SkillCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: "green" | "amber" | "blue" | "purple";
  link?: string;
}

const colorClasses = {
  green: "bg-green-50 text-green-600 border-green-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
};

const SkillCard = ({ icon: Icon, title, description, color, link = "#" }: SkillCardProps) => {
  return (
    <div className="group bg-white rounded-3xl p-8 border border-slate-100 hover:border-green-200 transition-all duration-300 hover:shadow-2xl hover:shadow-green-50 flex flex-col items-start relative overflow-hidden">
      <div className={`w-14 h-14 rounded-2xl ${colorClasses[color]} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-black text-sm leading-relaxed mb-6">{description}</p>

      <div className="mt-auto w-full flex justify-end items-center">
        <Link to={link}>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 font-bold hover:text-green-700 hover:bg-green-50 rounded-xl group/btn"
          >
            Explore
            <ArrowUpRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SkillCard;
