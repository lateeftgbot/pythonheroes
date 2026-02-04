import { Code, Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <span className="font-mono font-bold text-lg">
                <span className="text-primary">Vectors</span>
                <span className="text-foreground">.dev</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Python developer, automotive engineer, and educator. Building solutions and teaching the next generation of Python developers at Python Heroes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono font-semibold text-primary mb-4">{"// Links"}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/python-heroes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Python Heroes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-mono font-semibold text-primary mb-4">{"// Connect"}</h4>
            <div className="flex gap-3">
              <a
                href="mailto:lateefolayinka97@gmail.com"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/lativectors"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground font-mono">
            <span className="text-primary">$</span> © 2025 Basiru Lateef Olayinka. All rights reserved.
          </p>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
