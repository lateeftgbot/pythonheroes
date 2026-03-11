import { Link, useLocation, useNavigate } from "react-router-dom";
import { Code, Menu, X, ChevronLeft, Search, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import LogoutConfirm from "./LogoutConfirm";

interface SearchUser {
  name: string;
  username: string;
  profile_picture?: string;
  is_online: boolean;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/python-heroes", label: "Python Heroes" },
    { to: "/ai-teacher", label: "AI Teacher" },
  ];


  const isActive = (path: string) => location.pathname === path;

  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a120b] border-b-2 border-amber-500/30 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            {/* Back Button (for Telegram/Mobile) */}
            {location.pathname !== "/" && (
              <button
                onClick={() => {
                  try {
                    // Safety check: if we are at the beginning of history, go home
                    // Otherwise try to go back
                    if (window.history.length <= 1) {
                      navigate("/");
                    } else {
                      navigate(-1);
                    }
                  } catch (e) {
                    navigate("/");
                  }
                }}
                className="p-2 -ml-2 rounded-lg hover:bg-amber-100 text-black hover:text-amber-600 transition-all active:scale-[0.85]"
                aria-label="Go back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group mr-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code className="w-5 h-5 text-amber-500" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Vectors<span className="text-amber-500">.dev</span>
              </span>
            </Link>

            {/* Search Bar */}
            <div className="relative hidden md:flex items-center gap-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search verified users..."
                  className="h-10 pl-9 pr-4 rounded-full bg-black/30 border border-white/10 hover:border-amber-500/50 focus:border-amber-500 focus:outline-none transition-all w-64 text-sm font-mono text-white placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && searchQuery && (
                <div className="absolute top-12 left-0 w-80 bg-white border border-blue-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-blue-50 bg-blue-50/50">
                    <span className="text-[10px] font-mono text-black uppercase tracking-widest pl-2">Verified Users</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {searchResults.map((u) => (
                      <button
                        key={u.username}
                        className="w-full p-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-blue-50 last:border-0"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          navigate(`/profile/${u.username}`);
                        }}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                            {u.profile_picture ? (
                              <img src={u.profile_picture} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-blue-600 font-bold text-sm">{u.name.charAt(0)}</span>
                            )}
                          </div>
                          {u.is_online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-none mb-1 text-black">{u.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-black font-mono">@{u.username}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg font-mono text-sm transition-all duration-200 ${isActive(link.to)
                  ? "bg-amber-500/10 text-amber-500 font-bold border-b-2 border-amber-500"
                  : "text-slate-300 hover:bg-amber-500/5 hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {(user?.role === 'admin' || user?.role === 'master1_vectors') && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg font-mono text-sm transition-all duration-200 ${isActive("/admin")
                  ? "bg-amber-500/10 text-amber-500 font-bold border-b-2 border-amber-500"
                  : "text-slate-300 hover:bg-amber-500/5 hover:text-white"}`}
              >
                Admin
              </Link>
            )}
            {user?.role === 'student' && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg font-mono text-sm transition-all duration-200 ${isActive("/dashboard")
                  ? "bg-amber-500/10 text-amber-500 font-bold border-b-2 border-amber-500"
                  : "text-slate-300 hover:bg-amber-500/5 hover:text-white"}`}
              >
                Dashboard
              </Link>
            )}
            {user && (
              <Link
                to="/conversations"
                className={`px-3 py-1.5 rounded-lg font-mono text-sm transition-all duration-200 ${isActive("/conversations")
                  ? "bg-amber-500/10 text-amber-500 font-bold border-b-2 border-amber-500"
                  : "text-slate-300 hover:bg-amber-500/5 hover:text-white"}`}
              >
                Chat
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/signin">
                  <Button variant="ghost" size="sm" className="font-mono bg-pink-400 hover:bg-pink-500 text-black border border-pink-500/20 shadow-sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="font-mono bg-pink-500 hover:bg-pink-600 text-black shadow-lg shadow-pink-200 border border-pink-600/20">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono text-muted-foreground">Logged in as:</span>
                  <div className="flex items-center gap-2">
                    <Link to="/settings" className="hover:text-primary transition-colors" title="Settings">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <span className="text-sm font-bold text-primary">{user.name}</span>
                  </div>
                </div>
                <Button onClick={() => setShowLogoutConfirm(true)} variant="destructive" size="sm" className="font-mono">
                  Log Out
                </Button>
              </div>
            )}
          </div>

          <LogoutConfirm
            isOpen={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={handleLogout}
          />

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white hover:text-amber-500 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/5 bg-[#1a120b]">
            <div className="flex flex-col gap-3 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`font-mono text-sm py-2 px-4 rounded-lg transition-colors ${isActive(link.to)
                    ? "bg-amber-500/10 text-amber-500 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  to={(user?.role === 'admin' || user?.role === 'master1_vectors') ? "/admin" : "/dashboard"}
                  onClick={() => setIsOpen(false)}
                  className={`font-mono text-sm py-2 px-4 rounded-lg transition-colors ${isActive((user?.role === 'admin' || user?.role === 'master1_vectors') ? "/admin" : "/dashboard") ? "bg-amber-500/10 text-amber-500 font-bold" : "text-slate-300 hover:text-white hover:bg-white/5"}`}
                >
                  {(user?.role === 'admin' || user?.role === 'master1_vectors') ? "Admin Panel" : "Dashboard"}
                </Link>
              )}
              {user && (
                <Link
                  to="/conversations"
                  onClick={() => setIsOpen(false)}
                  className={`font-mono text-sm py-2 px-4 rounded-lg transition-colors ${isActive("/conversations") ? "bg-amber-500/10 text-amber-500 font-bold" : "text-slate-300 hover:text-white hover:bg-white/5"}`}
                >
                  Chat
                </Link>
              )}
              <div className="flex gap-2 mt-4">
                {!user ? (
                  <>
                    <Link to="/signin" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full font-mono bg-pink-400 text-black border-pink-500 hover:bg-pink-500">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" className="flex-1">
                      <Button size="sm" className="w-full font-mono bg-pink-500 hover:bg-pink-600 text-black shadow-lg shadow-pink-200">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="px-4 py-2 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-muted-foreground block">User:</span>
                        <span className="text-sm font-bold text-primary">{user.name}</span>
                      </div>
                      <Link to="/settings" onClick={() => setIsOpen(false)} className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Settings className="w-4 h-4" />
                      </Link>
                    </div>
                    <Button onClick={() => setShowLogoutConfirm(true)} variant="destructive" size="sm" className="w-full font-mono">
                      Log Out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav >
  );
};

export default Navbar;
