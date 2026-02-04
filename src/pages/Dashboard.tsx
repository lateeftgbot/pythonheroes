import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { User, BookOpen, Trophy, Settings, LogOut, Send, Code, MessageSquare, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import UsernameSettings from "@/components/UsernameSettings";
import UserStatusIndicator from "@/components/UserStatusIndicator";



const Dashboard = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/signin", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const [showSettings, setShowSettings] = useState(false);

  const courses = [
    { title: "Python Fundamentals", progress: 100, status: "Completed" },
    { title: "Working with Data", progress: 40, status: "In Progress" },
    { title: "Building Projects", progress: 0, status: "Locked" },
  ];



  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-primary mb-2 text-xs sm:text-sm">{"// " + (user.role === 'admin' ? "Classroom Admin" : "Student Dashboard")}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Welcome back, <span className="text-gradient-primary">{user.name.split(" ")[0]}</span>
              </h1>
            </div>
            {user.role === 'admin' && (
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="font-mono border-primary/20 text-primary hover:bg-primary/5 transition-all shadow-sm text-xs sm:text-sm w-full sm:w-auto"
              >
                Back to Admin Panel
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-xl p-6 sticky top-24">
                <div className="flex items-center gap-4 mb-6">

                  <div className="relative">

                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 shrink-0">

                      {user.profile_picture ? (

                        <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />

                      ) : (

                        <User className="w-6 h-6 text-primary" />

                      )}

                    </div>

                    <UserStatusIndicator is_online={true} />

                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-all">{user.email}</p>
                  </div>
                </div>

                {/* User ID (Green Container) */}
                {user.telegram_chat_id && (
                  <div
                    className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 group/tg cursor-pointer hover:bg-green-500/20 transition-all active:scale-[0.98]"
                    onClick={() => {
                      navigator.clipboard.writeText(user.telegram_chat_id);
                      toast.success("User ID copied to clipboard!");
                    }}
                    title="Click to copy ID"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-green-500 uppercase tracking-wider">User ID</span>
                      <span className="text-[10px] text-green-500/50 group-hover/tg:text-green-500 transition-colors">Click to copy</span>
                    </div>
                    <p className="font-mono text-sm font-bold text-green-500 break-all select-all">
                      {user.telegram_chat_id}
                    </p>
                  </div>
                )}

                <nav className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 text-primary font-mono text-sm">
                    <BookOpen className="w-4 h-4" />
                    My Courses
                  </button>
                  <button
                    onClick={() => navigate("/code-editor")}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 font-mono text-sm transition-all shadow-sm hover:shadow-md"
                  >
                    <Code className="w-4 h-4" />
                    Code Now
                  </button>
                  <button
                    onClick={() => navigate("/learning-space")}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 font-mono text-sm transition-all shadow-sm hover:shadow-md"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Learn
                  </button>
                  <button
                    onClick={() => navigate("/conversations")}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-mono text-sm transition-all shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted font-mono text-sm transition-colors">
                    <Trophy className="w-4 h-4" />
                    Achievements
                  </button>
                  <button
                    onClick={() => {
                      console.log("Settings button clicked. New state:", !showSettings);
                      setShowSettings(!showSettings);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${showSettings
                      ? "bg-primary/20 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/signin");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 font-mono text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </nav>

                {/* Settings Panel */}
                {showSettings && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                    <UsernameSettings onUsernameUpdate={(oldName, newName) => {
                      toast.success("Profile updated!");
                    }} />
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Progress Overview */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-semibold text-lg mb-4 text-foreground">Overall Progress</h2>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                      style={{ width: `0%` }}
                    />
                  </div>
                  <span className="font-mono text-primary font-bold">0%</span>
                </div>
              </div>

              {/* Courses & Chat Grid */}
              <div className="space-y-4">
                <h2 className="font-semibold text-lg text-foreground">Your Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course, index) => (
                    <div key={index} className="glass-card rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{course.title}</h3>
                          <span className={`text-xs font-mono ${course.status === "Completed" ? "text-primary" :
                            course.status === "In Progress" ? "text-secondary" :
                              "text-muted-foreground"
                            }`}>
                            {course.status}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${course.status === "Completed" ? "bg-primary" :
                            course.status === "In Progress" ? "bg-secondary" :
                              "bg-muted"
                            }`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
