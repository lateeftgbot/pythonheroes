import { Code, Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-slate-800">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2 flex flex-col items-center text-center">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code className="w-6 h-6 text-green-500" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                Vectors<span className="text-green-500">.dev</span>
              </span>
            </Link>

            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
              Empowering the next generation of Python developers through world-class courses in AI,
              automation, and engineering architecture.
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center text-center">
            <h4 className="font-bold text-green-500 mb-6 uppercase tracking-widest text-sm">Connect</h4>
            <div className="flex gap-4">
              {[
                { icon: Mail, href: "mailto:lateefolayinka97@gmail.com" },
                { icon: Github, href: "https://github.com" },
                { icon: Linkedin, href: "https://linkedin.com/in/lativectors" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-green-400 hover:bg-white/10 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Python Heroes */}
          <div className="flex flex-col items-center text-center">
            <h4 className="font-bold text-green-500 mb-6 uppercase tracking-widest text-sm">Platform</h4>
            <Link to="/python-heroes" className="group flex items-center gap-2 text-slate-300 hover:text-green-400 transition-colors font-medium">
              Python Heroes
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </Link>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-400 font-medium">
            © 2026 Python Heroes. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-medium text-slate-400">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
