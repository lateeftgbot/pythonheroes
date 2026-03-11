import { ArrowRight, Terminal, Code2, Cpu, Database, Globe, Sparkles, Bot, Layout, Gamepad2, Lock, Zap, Users, GraduationCap, Briefcase, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TypewriterText from "./TypewriterText";

const HeroSection = () => {
  const highlights = [
    "Build Real-World AI Apps",
    "Master Backend Architecture",
    "Join a Global Community",
    "Launch Your Tech Career",
  ];

  const benefits = [
    {
      icon: Users,
      title: "Young Tech Lovers",
      desc: "Designed for the next generation of innovators who are passionate about exploring the frontiers of technology through creative and immersive coding experiences.",
    },
    {
      icon: GraduationCap,
      title: "For Students Worldwide",
      desc: "Providing a globally accessible platform that empowers learners from every corner of the world to master industry-standard Python skills for academic and career excellence.",
    },
    {
      icon: Briefcase,
      title: "Freelancers",
      desc: "Equipping independent professionals with the technical mastery needed to scale their service offerings and thrive in the competitive global digital marketplace.",
    },
    {
      icon: Calendar,
      title: "Tech Event Programs",
      desc: "Empowering organizers and educational partners with high-performance tools to host immersive coding bootcamps and collaborative tech events.",
    },
  ];

  const apps = [
    {
      icon: Bot,
      label: "AI & ML",
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Building predictive intelligence with neural networks to transform raw data into autonomous decision-making systems.",
      code: [
        { text: "import", type: "keyword" }, { text: " torch.nn ", type: "plain" }, { text: "as", type: "keyword" }, { text: " nn\n", type: "plain" },
        { text: "class", type: "keyword" }, { text: " AI", type: "def" }, { text: "(nn.Module):\n  ", type: "plain" },
        { text: "def", type: "keyword" }, { text: " __init__", type: "func" }, { text: "(self):\n    ", type: "plain" },
        { text: "super", type: "func" }, { text: "().__init__()\n    ", type: "plain" },
        { text: "self", type: "variable" }, { text: ".conv1 = nn.Conv2d(1, 32, 3)\n  ", type: "plain" },
        { text: "def", type: "keyword" }, { text: " forward", type: "func" }, { text: "(self, x):\n    ", type: "plain" },
        { text: "x", type: "variable" }, { text: " = F.relu(self.conv1(x))\n    ", type: "plain" },
        { text: "return", type: "keyword" }, { text: " self.out(x)", type: "plain" }
      ]
    },
    {
      icon: Database,
      label: "Big Data",
      color: "text-green-600",
      bg: "bg-green-50",
      description: "Processing massive datasets with scientific computing to uncover patterns and forecast market trends with high precision.",
      code: [
        { text: "import", type: "keyword" }, { text: " pandas ", type: "plain" }, { text: "as", type: "keyword" }, { text: " pd\n", type: "plain" },
        { text: "df", type: "variable" }, { text: " = ", type: "op" }, { text: "pd.read_csv", type: "func" }, { text: "(", type: "op" }, { text: "'sales.csv'", type: "string" }, { text: ")", type: "op" }, { text: "\n", type: "plain" },
        { text: "clean_df", type: "variable" }, { text: " = df.dropna().query(", type: "plain" }, { text: "'q > 0'", type: "string" }, { text: ")\n", type: "plain" },
        { text: "summary", type: "variable" }, { text: " = ", type: "op" }, { text: "clean_df.groupby", type: "func" }, { text: "(", type: "op" }, { text: "'region'", type: "string" }, { text: ")", type: "op" }, { text: "\n", type: "plain" },
        { text: "metrics", type: "variable" }, { text: " = summary.agg(['mean', 'sum'])\n", type: "plain" },
        { text: "print", type: "func" }, { text: "(", type: "op" }, { text: "metrics.to_json()", type: "string" }, { text: ")", type: "op" }
      ]
    },
    {
      icon: Globe,
      label: "Web Apps",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      description: "Developing robust cloud-native APIs and web architectures that power modern digital experiences with seamless performance.",
      code: [
        { text: "@app", type: "def" }, { text: ".get", type: "func" }, { text: "(", type: "op" }, { text: "'/users/{id}'", type: "string" }, { text: ")\n", type: "plain" },
        { text: "async def", type: "keyword" }, { text: " get_user", type: "def" }, { text: "(id: int):\n  ", type: "plain" },
        { text: "user", type: "variable" }, { text: " = ", type: "op" }, { text: "await", type: "keyword" }, { text: " db.fetch(id)\n  ", type: "plain" },
        { text: "if", type: "keyword" }, { text: " not ", type: "keyword" }, { text: "user:\n    ", type: "plain" },
        { text: "raise", type: "keyword" }, { text: " HTTPException(404)\n  ", type: "plain" },
        { text: "cache", type: "variable" }, { text: ".set(id, user)\n  ", type: "plain" },
        { text: "return", type: "keyword" }, { text: " user_schema.dump(user)", type: "plain" }
      ]
    },
    {
      icon: Cpu,
      label: "Robots",
      color: "text-orange-600",
      bg: "bg-orange-50",
      description: "Controlling high-precision hardware and autonomous drones through real-time Python scripting and sensor fusion integrations.",
      code: [
        { text: "from", type: "keyword" }, { text: " robot ", type: "plain" }, { text: "import", type: "keyword" }, { text: " Drone\n", type: "plain" },
        { text: "uav", type: "variable" }, { text: " = ", type: "op" }, { text: "Drone", type: "func" }, { text: "(", type: "op" }, { text: "port", type: "variable" }, { text: "=", type: "op" }, { text: "5000", type: "plain" }, { text: ")", type: "op" }, { text: "\n", type: "plain" },
        { text: "uav", type: "variable" }, { text: ".arm().takeoff(5)\n", type: "plain" },
        { text: "while", type: "keyword" }, { text: " uav.battery > 0.2:\n  ", type: "plain" },
        { text: "targets", type: "variable" }, { text: " = uav.scan_objects()\n  ", type: "plain" },
        { text: "uav", type: "variable" }, { text: ".track(targets[0])\n", type: "plain" },
        { text: "uav", type: "variable" }, { text: ".land", type: "func" }, { text: "()", type: "op" }
      ]
    },
    {
      icon: Lock,
      label: "Security",
      color: "text-red-600",
      bg: "bg-red-50",
      description: "Protecting infrastructure through threat detection, automated audits, and professional encryption.",
      code: [
        { text: "def", type: "keyword" }, { text: " encrypt", type: "func" }, { text: "(msg, key):\n  ", type: "plain" },
        { text: "cipher", type: "variable" }, { text: " = AES.new(key, AES.MODE_GCM)\n  ", type: "plain" },
        { text: "return", type: "keyword" }, { text: " cipher.encrypt(msg)\n", type: "plain" },
        { text: "for", type: "keyword" }, { text: " attempt ", type: "plain" }, { text: "in", type: "keyword" }, { text: " raw_logs:\n  ", type: "plain" },
        { text: "if", type: "keyword" }, { text: " detect_breach(attempt):\n    ", type: "plain" },
        { text: "firewall", type: "variable" }, { text: ".block", type: "func" }, { text: "(", type: "op" }, { text: "attempt.ip", type: "variable" }, { text: ")", type: "op" }, { text: "\n    ", type: "plain" },
        { text: "logger", type: "variable" }, { text: ".alert('Attack Detected')", type: "plain" }
      ]
    },
    {
      icon: Gamepad2,
      label: "Game Dev",
      color: "text-purple-600",
      bg: "bg-purple-50",
      description: "Bringing virtual worlds to life using NPC behavioral logic and real-time physics simulators in professional games.",
      code: [
        { text: "class", type: "keyword" }, { text: " Enemy", type: "def" }, { text: "(Entity):\n  ", type: "plain" },
        { text: "def", type: "keyword" }, { text: " update", type: "func" }, { text: "(self):\n    ", type: "plain" },
        { text: "dist", type: "variable" }, { text: " = self.pos.distance_to(player)\n    ", type: "plain" },
        { text: "if", type: "keyword" }, { text: " dist < 10:\n      ", type: "plain" },
        { text: "self", type: "variable" }, { text: ".attack(player)\n    ", type: "plain" },
        { text: "else", type: "keyword" }, { text: ":\n      ", type: "plain" },
        { text: "self", type: "variable" }, { text: ".patrol_around", type: "func" }, { text: "(", type: "op" }, { text: "self.spawn", type: "variable" }, { text: ")", type: "op" }
      ]
    },
    {
      icon: Layout,
      label: "UI Design",
      color: "text-pink-600",
      bg: "bg-pink-50",
      description: "Designing sleek, interactive scientific dashboards and data visualization tools that make complex engineering insights accessible.",
      code: [
        { text: "import", type: "keyword" }, { text: " streamlit ", type: "plain" }, { text: "as", type: "keyword" }, { text: " st\n", type: "plain" },
        { text: "st", type: "variable" }, { text: ".title", type: "func" }, { text: "(", type: "op" }, { text: "'Live Metrics'", type: "string" }, { text: ")", type: "op" }, { text: "\n", type: "plain" },
        { text: "col1, col2", type: "variable" }, { text: " = st.columns(2)\n", type: "plain" },
        { text: "with", type: "keyword" }, { text: " col1:\n  ", type: "plain" },
        { text: "st", type: "variable" }, { text: ".line_chart", type: "func" }, { text: "(", type: "op" }, { text: "data_stream", type: "variable" }, { text: ")", type: "op" }, { text: "\n", type: "plain" },
        { text: "st", type: "variable" }, { text: ".sidebar.header('Settings')", type: "plain" }
      ]
    },
    {
      icon: Zap,
      label: "Automate",
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: "Optimizing workflows by automating repetitive tasks, large-scale file processing, and cross-platform infrastructure integration.",
      code: [
        { text: "import", type: "keyword" }, { text: " os, shutil, glob\n", type: "plain" },
        { text: "for", type: "keyword" }, { text: " file ", type: "plain" }, { text: "in", type: "keyword" }, { text: " glob.glob('*.log'):\n  ", type: "plain" },
        { text: "creation_time", type: "variable" }, { text: " = os.path.getctime(file)\n  ", type: "plain" },
        { text: "if", type: "keyword" }, { text: " creation_time < threshold:\n    ", type: "plain" },
        { text: "os.remove", type: "func" }, { text: "(", type: "op" }, { text: "file", type: "variable" }, { text: ")", type: "op" }, { text: "\n    ", type: "plain" },
        { text: "print", type: "func" }, { text: "(f'Removed {file}')", type: "string" }
      ]
    },
    {
      icon: Code2,
      label: "Systems",
      color: "text-slate-600",
      bg: "bg-slate-50",
      description: "Managing enterprise cloud operations and server infrastructures using high-availability backend scripts and automated scaling.",
      code: [
        { text: "def", type: "keyword" }, { text: " monitor_cluster", type: "def" }, { text: "(instances):\n  ", type: "plain" },
        { text: "for", type: "keyword" }, { text: " i ", type: "plain" }, { text: "in", type: "keyword" }, { text: " instances:\n    ", type: "plain" },
        { text: "if", type: "keyword" }, { text: " i.health ", type: "plain" }, { text: "==", type: "op" }, { text: " 'critical':\n      ", type: "plain" },
        { text: "i.reboot()\n      ", type: "plain" },
        { text: "logger", type: "variable" }, { text: ".warn(f'Fixed {i.id}')\n    ", type: "plain" },
        { text: "check_load_balance", type: "func" }, { text: "()", type: "op" }
      ]
    },
  ];

  const getCodeColor = (type: string) => {
    switch (type) {
      case "keyword": return "text-purple-600 font-bold";
      case "variable": return "text-blue-600";
      case "func": return "text-cyan-600";
      case "op": return "text-slate-400";
      case "string": return "text-amber-600";
      case "def": return "text-emerald-600";
      default: return "text-slate-700";
    }
  };

  return (
    <section className="min-h-[90vh] flex items-center justify-center pt-24 pb-16 relative overflow-hidden bg-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-100 mb-8 animate-in fade-in slide-in-from-top-4">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-green-700">
              New: Modern Python Mastery 2026
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-slate-900 leading-[1.1]">
            Unlock the Power of <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent italic pr-2 tracking-normal">
              Professional Python
            </span>
          </h1>

          {/* Typewriter outcome effect */}
          <div className="h-12 md:h-16 mb-10">
            <p className="text-xl md:text-2xl font-medium text-black">
              <TypewriterText texts={highlights} className="text-blue-600 font-bold" />
            </p>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-black max-w-2xl mx-auto mb-12 leading-relaxed">
            PythonHeroes is where elite developers are made. Experience a hands-on learning environment
            designed for the next generation of engineers and creators.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-24">
            <Link to="/signup">
              <Button
                size="lg"
                className="px-8 py-7 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-2xl transition-all hover:scale-105 shadow-xl shadow-green-200"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/curriculum">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-7 text-lg font-bold border-slate-200 hover:bg-slate-50 rounded-2xl transition-all text-black"
              >
                See Curriculum
              </Button>
            </Link>
          </div>

          {/* Audience Targeting Section */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Who <span className="text-green-600">Python Heroes</span> Is Built For
            </h2>
            <div className="h-1 w-20 bg-green-500 mx-auto mt-4 rounded-full" />
          </div>

          {/* Premium Benefits Grid with Standalone Card Separators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 relative">
            {benefits.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="relative flex items-center">
                  <div
                    className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-green-200 hover:shadow-2xl hover:shadow-green-100 transition-all duration-300 text-left w-full h-full"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                    <p className="text-sm text-black leading-relaxed">{item.desc}</p>
                  </div>

                  {/* Decorative Vertical Separator (between cards) */}
                  {i !== benefits.length - 1 && (
                    <div className={`hidden lg:block absolute -right-4 top-0 bottom-0 w-px bg-black/40`} />
                  )}
                  {i % 2 === 0 && i !== benefits.length - 2 && (
                    <div className={`hidden md:block lg:hidden absolute -right-4 top-0 bottom-0 w-px bg-black/40`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Showcase Heading */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              The applications of <span className="text-green-600">python Programming language</span> in the tech world
            </h2>
            <div className="h-1 w-20 bg-green-500 mx-auto mt-4 rounded-full" />
          </div>

          {/* Visual Showcase (Grid of 9 Android Phone Mockups) */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
              {apps.map((app, i) => (
                <div key={i} className="group relative">
                  {/* Phone Frame */}
                  <div className="relative z-10 mx-auto max-w-[280px] sm:max-w-none aspect-[9/16] border-[10px] border-slate-200 rounded-[3.5rem] bg-white shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-500 overflow-hidden border-b-[18px]">
                    {/* Screen Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-200 rounded-b-xl z-20" />

                    {/* Screen Content */}
                    <div className={`${app.bg} h-full flex flex-col`}>
                      {/* Top Section: Branding & Desc (Shifted Up & Compact) */}
                      <div className="flex-[1.2] flex flex-col items-center justify-center text-center px-6 pt-6 pb-2">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 transform group-hover:rotate-12 transition-transform duration-500 border border-slate-100 shrink-0">
                          <app.icon className={`w-6 h-6 ${app.color}`} />
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 shrink-0">{app.label}</h4>
                        <p className="text-[14px] md:text-[16px] font-bold text-slate-800 leading-[1.2] px-1 tracking-tight overflow-hidden line-clamp-5">
                          {app.description}
                        </p>
                      </div>

                      {/* Shifted Divider (Thin) */}
                      <div className="h-[2px] bg-green-500 w-full shrink-0" />

                      {/* Bottom Section: Real Python Code (More Compact) */}
                      <div className="flex-1 flex flex-col items-center justify-center text-left font-mono p-4 overflow-hidden">
                        <pre className="whitespace-pre-wrap leading-tight w-full">
                          {app.code.map((chunk, j) => (
                            <span key={j} className={`${getCodeColor(chunk.type)} text-[12px] md:text-[14px]`}>
                              {chunk.text}
                            </span>
                          ))}
                        </pre>

                        {/* Cursor Decoration */}
                        <div className="mt-4 flex gap-2 opacity-20 w-full justify-center shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ambient Glow */}
                  <div className="absolute -inset-2 bg-gradient-to-tr from-slate-100 to-white rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
