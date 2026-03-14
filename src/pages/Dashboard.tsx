import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { User, BookOpen, Trophy, Settings, LogOut, Send, Code, MessageSquare, GraduationCap, Shield, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import UsernameSettings from "@/components/UsernameSettings";
import UserStatusIndicator from "@/components/UserStatusIndicator";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";


interface Material {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'quiz' | 'external';
  url?: string;
  raw_text?: string;
  category: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, logout, isLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/signin", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const [registeredMaterials, setRegisteredMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [showMasterDialog, setShowMasterDialog] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user?.email) return;
      try {
        // Fetch all materials
        const materialsRes = await fetch('/api/learning/materials');
        // Fetch enrolled IDs
        const enrolledRes = await fetch(`/api/learning/enrolled/${user.email}`);

        if (materialsRes.ok && enrolledRes.ok) {
          const allMaterials = await materialsRes.json();
          const enrolledIds = await enrolledRes.json();
          const enrolledSet = new Set(enrolledIds);

          setRegisteredMaterials(allMaterials.filter((m: Material) => enrolledSet.has(m._id)));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard modules:", error);
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    if (user) {
      fetchAllData();
    }
  }, [user]);

  const handleRunCode = () => {
    setOutput("Running...");
    setTimeout(() => {
      const normalizedCode = code.replace(/\r\n/g, "\n").trim();
      const targetCode = 'for Masters in Vectors1(01):\n  me = "master"';

      if (normalizedCode === targetCode) {
        setOutput("Process finished with exit code 0");
        setShowMasterDialog(true);
      } else {
        setOutput("SyntaxError: invalid syntax");
      }
    }, 800);
  };

  const handleGrantMaster = async () => {
    try {
      const response = await fetch('/api/admin/grant-master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email }),
      });

      if (response.ok) {
        // Sync local state with DB persistence
        if (user) {
          updateUser({ role: 'master1_vectors' });
        }

        toast.success("Master role granted successfully!", {
          description: "Permissions elevated. Access granted."
        });
        setShowMasterDialog(false);
      } else {
        toast.error("Failed to grant master role");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };




  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-12">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-emerald-500 mb-2 text-xs sm:text-sm font-medium tracking-wide">{"// " + ((user.role === 'admin' || user.role === 'master1_vectors') ? "Classroom Admin" : "Student Dashboard")}</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Welcome back, <span className="text-emerald-500">{user.name.split(" ")[0]}</span>
              </h1>
            </div>
            {(user.role === 'admin' || user.role === 'master1_vectors') && (
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="font-mono border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-sm text-xs sm:text-sm w-full sm:w-auto bg-slate-900 gap-2"
              >
                <Shield className="w-4 h-4 text-emerald-500" />
                Switch to Admin Mode
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 max-w-[420px] mx-auto lg:max-w-none w-full px-2 sm:px-0">
              <div className="bg-slate-800 rounded-[1.25rem] p-5 sm:p-5 sticky top-24 border border-slate-700 shadow-xl shadow-black/20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600 shadow-sm shrink-0">
                      {user.profile_picture ? (
                        <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-emerald-500" />
                      )}
                    </div>
                    <UserStatusIndicator is_online={true} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-lg truncate">{user.name}</p>
                      <button
                        onClick={() => navigate("/infinite-space")}
                        title="Go to Infinite Space"
                        className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all group/inf"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-500 group-hover/inf:text-white transition-colors" />
                      </button>
                    </div>
                    <p className="text-xs text-emerald-500/70 font-medium break-all">{user.email}</p>
                  </div>
                </div>

                {/* User ID (Green Container) */}
                {user.telegram_chat_id && (
                  <div
                    className="mb-8 p-4 rounded-xl bg-white border border-sky-200 group/tg cursor-pointer hover:bg-sky-50 transition-all active:scale-[0.98]"
                    onClick={() => {
                      navigator.clipboard.writeText(user.telegram_chat_id);
                      toast.success("User ID copied to clipboard!");
                    }}
                    title="Click to copy ID"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">User ID</span>
                      <span className="text-[10px] text-sky-600/60 group-hover/tg:text-sky-700 transition-colors font-medium">Click to copy</span>
                    </div>
                    <p className="font-mono text-sm font-bold text-sky-900 break-all select-all tracking-tight">
                      {user.telegram_chat_id}
                    </p>
                  </div>
                )}

                <nav className="space-y-2">
                  <button
                    onClick={() => navigate(`/profile/${user.username}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-700/40 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 font-medium text-sm transition-all duration-200 group border border-slate-700/50"
                  >
                    <User className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                    My Profile
                  </button>
                  <button
                    onClick={() => navigate("/learning-space", { state: { tab: "registered" } })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-700/40 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 font-medium text-sm transition-all duration-200 group border border-slate-700/50"
                  >
                    <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                    My Courses
                  </button>
                  <button
                    onClick={() => navigate("/learning-space")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-700/40 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 font-medium text-sm transition-all duration-200 group border border-slate-700/50"
                  >
                    <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                    Learn New Skills
                  </button>
                  <button
                    onClick={() => navigate("/conversations")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-700/40 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 font-medium text-sm transition-all duration-200 group border border-slate-700/50"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                    Chat Room
                  </button>
                  <button
                    onClick={() => navigate("/ai-teacher")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 font-bold text-sm transition-all duration-200 group shadow-lg shadow-emerald-500/5"
                  >
                    <Sparkles className="w-4 h-4 group-hover:scale-110 transition-all" />
                    AI Python Teacher
                    <span className="ml-auto text-[8px] bg-emerald-500 text-white px-1 py-0.5 rounded">NEW</span>
                  </button>
                  <button 
                    onClick={() => navigate("/match-history")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-700/40 text-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 font-medium text-sm transition-all duration-200 group border border-slate-700/50"
                  >
                    <Trophy className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                    Achievements
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8 max-w-[600px] mx-auto lg:max-w-none w-full text-center lg:text-left">
              {/* Progress Overview */}
              <div className="bg-slate-800 rounded-[1.25rem] p-5 sm:p-6 border border-slate-700 shadow-xl shadow-black/20 mx-2 sm:mx-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-xl text-white">Overall Progress</h2>
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Level 1</span>
                </div>

                <div className="flex items-center gap-4 text-left">
                  <div className="flex-1 h-3 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      style={{ width: `0%` }}
                    />
                  </div>
                  <span className="font-mono text-emerald-500 font-bold text-sm">0%</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 mx-2 sm:mx-0">
                  {/* Mini IDE / Console Terminal - FIXED IN POSITION 1 */}
                  <div className="bg-slate-800 rounded-[1.25rem] p-5 sm:p-6 shadow-xl shadow-black/20 border border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Code className="w-5 h-5 text-emerald-500" />
                      </div>
                      <h2 className="font-bold text-lg text-white">Quick Console</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <CodeMirror
                          value={code}
                          onChange={(value) => setCode(value)}
                          extensions={[python()]}
                          theme="dark"
                          placeholder="# Practice your python here..."
                          className="text-sm border border-slate-700 rounded-xl overflow-hidden bg-slate-900"
                          basicSetup={{
                            lineNumbers: true,
                            highlightActiveLineGutter: true,
                            highlightSpecialChars: true,
                            foldGutter: true,
                            drawSelection: true,
                            dropCursor: true,
                            allowMultipleSelections: true,
                            indentOnInput: true,
                            bracketMatching: true,
                            closeBrackets: true,
                            autocompletion: true,
                            rectangularSelection: true,
                            crosshairCursor: true,
                            highlightActiveLine: true,
                            highlightSelectionMatches: true,
                            closeBracketsKeymap: true,
                            searchKeymap: true,
                            foldKeymap: true,
                            completionKeymap: true,
                            lintKeymap: true,
                          }}
                          style={{
                            fontSize: '13px',
                            minHeight: '120px',
                          }}
                        />
                        <Button
                          size="sm"
                          className="absolute bottom-3 right-3 h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white z-10 font-bold shadow-lg shadow-emerald-500/20"
                          onClick={handleRunCode}
                        >
                          Run Code
                        </Button>
                      </div>

                      {output && (
                        <div className="p-3 rounded-lg bg-black/50 border border-slate-700 shadow-inner">
                          <p className={`font-mono text-xs ${output.includes("Error") ? "text-red-400" : "text-emerald-400"}`}>
                            {output}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registered Courses Section */}
                  <div className="space-y-4">
                    <h2 className="font-bold text-xl text-white flex items-center gap-2">
                      My Enrolled Courses
                      <span className="text-xs font-normal text-slate-400 bg-slate-900 border border-slate-700 px-2 py-1 rounded-full">
                        {registeredMaterials.length} Items
                      </span>
                    </h2>

                    <div className={cn(
                      "flex gap-6 scrollbar-hide",
                      // On non-mobile, allow horizontal scroll. On mobile, stack vertically.
                      "flex-col sm:flex-row sm:overflow-x-auto sm:pb-4"
                    )}>
                      {isLoadingMaterials ? (
                        Array(2).fill(0).map((_, i) => (
                          <div key={i} className="h-44 min-w-[320px] sm:w-[350px] bg-slate-800 rounded-[1.25rem] animate-pulse border border-slate-700 shrink-0" />
                        ))
                      ) : (
                        registeredMaterials.map((material) => (
                          <div
                            key={material._id}
                            onClick={() => navigate("/learning-space", { state: { materialId: material._id, view: 'materials' } })}
                            className="bg-slate-800 rounded-[1.25rem] p-5 border border-slate-700 shadow-lg hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer min-w-[280px] sm:w-[350px] shrink-0"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="min-w-0">
                                <h3 className="font-bold text-white mb-1 group-hover:text-emerald-500 transition-colors truncate">{material.title}</h3>
                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{material.type}</p>
                              </div>
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-4 h-4 text-emerald-500" />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <p className="text-xs text-slate-400 line-clamp-2 opacity-80 leading-relaxed">
                                {material.description || "Continue your learning journey."}
                              </p>
                              <div className="pt-1">
                                <div className="flex justify-between text-[9px] font-mono mb-1 opacity-60">
                                  <span className="text-slate-400 uppercase tracking-widest">Enrolled</span>
                                  <span className="text-emerald-500 font-bold">READY</span>
                                </div>
                                <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
                                  <div className="h-full bg-emerald-500/50 w-full" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>


            {/* Master Grant Dialog */}
            <Dialog open={showMasterDialog} onOpenChange={setShowMasterDialog}>
              <DialogContent className="sm:max-w-md border-primary/20 bg-black/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-primary font-mono text-xl">System Override Initiated</DialogTitle>
                  <DialogDescription className="text-green-400/80 font-mono pt-2">
                    Access Code Verified.
                    <br />
                    Identity: "Master"
                    <br />
                    Privilege Level: Vectors1(01)
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 py-4">
                  <div className="grid flex-1 gap-2">
                    <div className="p-3 rounded border border-green-500/20 bg-green-500/10">
                      <p className="text-sm font-mono text-green-400">
                        &gt; Granting root access privileges...
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="sm:justify-start">
                  <Button
                    type="button"
                    onClick={handleGrantMaster}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-mono tracking-wide"
                  >
                    PROCEED &gt;&gt;
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
