import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GraduationCap, MapPin, Calendar, Code, Wrench, BookOpen } from "lucide-react";

const About = () => {
  const timeline = [
    {
      year: "2026",
      title: "Python Heroes Founded",
      description: "Started teaching Python programming to aspiring developers.",
      icon: Code,
    },
    {
      year: "2025",
      title: "Graduated from OAU",
      description: "Completed degree at Obafemi Awolowo University, Ile-Ife.",
      icon: GraduationCap,
    },
    {
      year: "2024",
      title: "First Major Projects",
      description: "Built production-ready Telegram bots and data science projects.",
      icon: Wrench,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <p className="font-mono text-blue-600 mb-4 font-bold tracking-widest uppercase text-sm">{"// About the founder"}</p>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-black leading-tight">
              The Story of <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent italic pr-4 pb-2 inline-block tracking-normal">Python Heroes</span>
            </h1>
            <p className="text-xl text-black font-medium leading-relaxed max-w-2xl mx-auto">
              A passionate developer and engineer from Nigeria, on a mission to build and teach.
            </p>
          </div>

          {/* Bio Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto mb-32 items-center">
            <div className="space-y-8">
              <div className="rounded-[2.5rem] p-3 bg-gradient-to-b from-slate-100 to-white border border-slate-200 shadow-2xl overflow-hidden">
                <div className="rounded-[2rem] bg-white border border-slate-100 overflow-hidden shadow-inner p-8">
                  <pre className="text-xs md:text-sm font-mono leading-relaxed text-black whitespace-pre-wrap break-words">
                    <code>
                      <span className="text-purple-600">const</span>{" "}
                      <span className="text-blue-600">Vectors</span> = {"{"}
                      {"\n"}
                      {"  "}fullName: <span className="text-green-600">"BASIRU Lateef Olayinka"</span>,
                      {"\n"}
                      {"  "}location: <span className="text-green-600">"Nigeria 🇳🇬"</span>,
                      {"\n"}
                      {"  "}university: <span className="text-green-600">"OAU Ile-Ife"</span>,
                      {"\n"}
                      {"  "}graduated: <span className="text-orange-600">2025</span>,
                      {"\n"}
                      {"  "}loves: [<span className="text-green-600">"Python"</span>, <span className="text-green-600">"Teaching"</span>,{"\n"}
                      {"          "}<span className="text-green-600">"Mathematics"</span>],
                      {"\n"}
                      {"  "}professions: [<span className="text-green-600">"GMNSE (Graduate Member of Nigerian Society of Engineers)"</span>,{"\n"}
                      {"                "}<span className="text-green-600">"Auto Electrician"</span>],
                      {"\n"}
                      {"}"};
                    </code>
                  </pre>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm transition-all hover:scale-105">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-black">Nigeria</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm transition-all hover:scale-105">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-black">Class of 2025</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-50 border border-green-100 shadow-sm transition-all hover:scale-105">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-black">Python Heroes Founder</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <p className="text-xl text-black leading-relaxed">
                <span className="text-black font-extrabold border-b-2 border-blue-200">Basiru Lateef Olayinka</span>,
                a fresh graduate from Obafemi Awolowo University, Ile-Ife. His journey in tech started
                with a curiosity about how things work, which led him to explore both software
                development and auto engineering.
              </p>
              <p className="text-xl text-black leading-relaxed">
                Python became his weapon of choice. He's used it to build everything from
                data analysis pipelines to Telegram bots, web backends, and even 2D games.
                There's something magical about writing code that solves real problems.
              </p>
              <p className="text-xl text-black leading-relaxed">
                But beyond building, he discovered a passion for <span className="text-blue-600 font-extrabold">teaching</span>.
                That's why he founded <span className="text-green-600 font-extrabold">Python Heroes</span> —
                to help others start their programming journey with guidance he wishes he had when he started.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto py-20 bg-blue-50/30 rounded-[3rem] border border-blue-100/50 px-8">
            <h2 className="text-3xl font-black mb-16 text-center text-black uppercase tracking-tighter">
              <span className="text-blue-600 font-mono">{"// "}</span>The Journey
            </h2>

            <div className="relative max-w-2xl mx-auto">
              <div className="absolute left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-green-200 to-transparent rounded-full" />

              {timeline.map((item, index) => (
                <div key={index} className="relative flex gap-10 mb-12 group">
                  <div className="w-20 h-20 rounded-3xl bg-white border-2 border-slate-100 shadow-xl flex items-center justify-center flex-shrink-0 z-10 group-hover:scale-110 transition-all duration-500 group-hover:border-blue-200">
                    <item.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="pt-3">
                    <span className="font-mono text-base font-black text-blue-600 bg-blue-100/50 px-3 py-1 rounded-full">{item.year}</span>
                    <h3 className="font-black text-2xl text-black mt-3 mb-2">{item.title}</h3>
                    <p className="text-black text-lg font-medium leading-relaxed">{item.description}</p>
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
