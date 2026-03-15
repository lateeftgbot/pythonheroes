import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Code2, Loader2, Database, Download, FolderOpen, FolderPlus, Trash2, BookOpen, Square } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { autocompletion } from "@codemirror/autocomplete";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import PyodideWorker from "../lib/pyodide.worker?worker";

interface SavedProject {
    id: string;
    title: string;
    code: string;
    language: string;
    folder: string;
    updated_at: string;
}

interface IDEComponentProps {
    onBackToLearning?: () => void;
    showBackButton?: boolean;
}

const IDEComponent = ({ onBackToLearning, showBackButton = true }: IDEComponentProps) => {
    const { user } = useAuth();
    const [code, setCode] = useState(
        localStorage.getItem("learningSpaceCode") || '# Practice your Python here!\nprint("Hello, Python Heroes!")\n'
    );
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [pyodideReady, setPyodideReady] = useState(false);
    const [viewMode, setViewMode] = useState<"editor" | "console">("editor");
    const [hasRunCode, setHasRunCode] = useState(false);

    // Console Scroll Ref
    const consoleEndRef = useRef<HTMLDivElement>(null);

    // Worker Ref
    const workerRef = useRef<Worker | null>(null);

    // Save Projects State
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [projectTitle, setProjectTitle] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // View Projects State
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);

    // Initialized Worker
    useEffect(() => {
        const initWorker = () => {
            const worker = new PyodideWorker();
            workerRef.current = worker;

            worker.onmessage = (event) => {
                const { type, output: msg, error } = event.data;

                if (type === "loaded") {
                    setPyodideReady(true);
                    setOutput(prev => prev + "✓ Python environment ready! Click 'Run Code' to execute.\n");
                } else if (type === "output") {
                    setOutput((prev) => prev + msg);
                } else if (type === "error") {
                    setOutput((prev) => prev + `Error: ${error}\n`);
                    setIsRunning(false); // Stop running state on error
                } else if (type === "finished") {
                    setIsRunning(false);
                }
            };

            return worker;
        };

        const worker = initWorker();

        return () => {
            worker.terminate();
        };
    }, []);

    // Save code
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem("learningSpaceCode", code);
        }, 500);
        return () => clearTimeout(timer);
    }, [code]);

    // Auto-scroll console
    useEffect(() => {
        if (consoleEndRef.current) {
            consoleEndRef.current.scrollTop = consoleEndRef.current.scrollHeight;
        }
    }, [output]);


    const runCode = useCallback(() => {
        if (!pyodideReady || !workerRef.current) {
            setOutput("Python environment not ready yet. Please wait...\n");
            return;
        }

        setIsRunning(true);
        setOutput("Running...\n");
        setHasRunCode(true);
        setViewMode("console"); // Switch to console view after running

        workerRef.current.postMessage({ type: "run", code, id: Date.now() });
    }, [code, pyodideReady]);

    const stopExecution = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.terminate();

            // Re-initialize worker
            const worker = new PyodideWorker();
            workerRef.current = worker;
            setIsRunning(false);
            setPyodideReady(false); // Temporarily false until loaded
            setOutput((prev) => prev + "\n[Execution Stopped]\n");

            worker.onmessage = (event) => {
                const { type, output: msg, error } = event.data;

                if (type === "loaded") {
                    setPyodideReady(true);
                    // setOutput(prev => prev + "✓ Python environment ready.\n"); // Optional: don't spam ready message
                } else if (type === "output") {
                    setOutput((prev) => prev + msg);
                } else if (type === "error") {
                    setOutput((prev) => prev + `Error: ${error}\n`);
                    setIsRunning(false);
                } else if (type === "finished") {
                    setIsRunning(false);
                }
            };
        }
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // F5: Run code and switch to console
            if (e.key === 'F5') {
                e.preventDefault();
                if (pyodideReady && !isRunning) {
                    runCode();
                } else if (isRunning) {
                    // Optional: F5 to stop if running?
                }
            }

            // Escape in console mode: Switch to editor
            if (e.key === 'Escape' && viewMode === 'console') {
                e.preventDefault();
                setViewMode('editor');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode, pyodideReady, isRunning, runCode]);

    const resetCode = () => {
        setCode('# Practice your Python here!\nprint("Hello, Python Heroes!")\n');
        setOutput("");
    };

    const handleSaveToDevice = async () => {
        try {
            const blob = new Blob([code], { type: "text/x-python;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "project.py";
            link.click();
            toast.success("Project downloaded!");
        } catch (e) {
            toast.error("Failed to save to device");
        }
    };

    const handleSaveToDatabaseRequest = () => {
        if (!user) {
            toast.error("Please login to save projects");
            return;
        }
        setIsSaveOpen(true);
        setProjectTitle("My Learning Project");
    };

    const confirmSaveToDatabase = async () => {
        if (!projectTitle.trim()) return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/code/v1/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    title: projectTitle,
                    code: code,
                    language: 'python',
                    folder: 'Python Heroes/Learning'
                })
            });
            if (response.ok) {
                toast.success("Saved to database!");
                setIsSaveOpen(false);
            }
        } catch (e) {
            toast.error("Failed to save to database");
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewProjects = async () => {
        if (!user) return;
        setIsViewOpen(true);
        setIsLoadingProjects(true);
        try {
            const response = await fetch(`/api/code/v1/list?email=${encodeURIComponent(user.email)}`);
            if (response.ok) {
                const data = await response.json();
                setSavedProjects(data);
            }
        } catch (e) {
            toast.error("Failed to load projects");
        } finally {
            setIsLoadingProjects(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 lg:p-8 lg:pb-0 bg-[#fdf6e3]">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="font-black text-emerald-600 text-[10px] mb-1 uppercase tracking-widest italic">{"// SYSTEM_PLAYGROUND"}</p>
                        <h1 className="text-3xl font-black text-black uppercase tracking-tighter italic">Practice Arena</h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <Button
                        onClick={() => setViewMode(viewMode === "editor" ? "console" : "editor")}
                        variant="outline"
                        size="sm"
                        className="font-black bg-white text-black hover:bg-black/5 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all uppercase text-[10px] tracking-widest h-9 px-4"
                    >
                        {viewMode === "editor" ? "View Console" : "View Editor"}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black hover:bg-black/5" title="Save Project">
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none border-2 border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <DropdownMenuItem onClick={handleSaveToDevice} className="rounded-none font-black text-[10px] uppercase tracking-widest p-2 focus:bg-emerald-500 focus:text-white transition-colors">
                                <Download className="mr-2 h-4 w-4" /> Save to Device
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleSaveToDatabaseRequest} className="rounded-none font-black text-[10px] uppercase tracking-widest p-2 focus:bg-emerald-500 focus:text-white transition-colors">
                                <Database className="mr-2 h-4 w-4" /> Save to Database
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="sm" onClick={handleViewProjects} className="font-black h-9 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black hover:bg-black/5 uppercase text-[10px] tracking-widest px-4 transition-all">
                        <FolderOpen className="w-4 h-4 mr-2" /> Projects
                    </Button>

                    <Button onClick={resetCode} variant="outline" size="sm" className="font-black h-9 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black hover:bg-black/5 uppercase text-[10px] tracking-widest px-4 transition-all">
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset
                    </Button>

                    {showBackButton && onBackToLearning && (
                        <Button
                            onClick={onBackToLearning}
                            variant="outline"
                            size="sm"
                            className="font-black h-9 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-purple-600 hover:bg-black/5 uppercase text-[10px] tracking-widest px-4 transition-all"
                        >
                            <BookOpen className="w-4 h-4 mr-2" /> Exit Lab
                        </Button>
                    )}

                    {isRunning ? (
                        <Button
                            onClick={stopExecution}
                            size="sm"
                            variant="destructive"
                            className="h-9 rounded-none border-2 border-black bg-rose-500 text-white font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase text-[10px] tracking-[0.2em] px-6"
                        >
                            <Square className="w-4 h-4 mr-2 fill-current" />
                            Stop
                        </Button>
                    ) : (
                        <Button
                            onClick={runCode}
                            disabled={!pyodideReady}
                            size="sm"
                            className="h-9 rounded-none border-2 border-black bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase text-[10px] tracking-[0.2em] px-6 disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
                        >
                            <Play className="w-4 h-4 mr-2 fill-current" />
                            Run Project
                        </Button>
                    )}
                </div>
            </div>

            {/* Editor/Console Container */}
            <div className="flex-1 min-h-0 relative overflow-hidden">
                {/* Editor Section */}
                <div className={`absolute inset-0 flex flex-col bg-white rounded-none border-2 border-black overflow-hidden transition-all duration-500 ease-in-out shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${viewMode === "editor"
                    ? "opacity-100 translate-x-0 pointer-events-auto"
                    : "opacity-0 -translate-x-full pointer-events-none"
                    }`}>
                    <div className="flex items-center justify-between p-4 border-b-2 border-black bg-white">
                        <div className="flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-black" />
                            <h2 className="font-black text-black uppercase tracking-tighter italic">Source Editor</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasRunCode && (
                                <Button
                                    onClick={() => setViewMode("console")}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-[10px] font-black text-black border-2 border-black rounded-none hover:bg-black/5 uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                >
                                    <Database className="w-3 h-3 mr-1" /> View Console
                                </Button>
                            )}
                            <Button
                                onClick={() => setCode("")}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-[10px] font-black text-rose-600 hover:bg-rose-50 rounded-none uppercase tracking-widest"
                            >
                                <Trash2 className="w-3 h-3 mr-1" /> Clear
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        <CodeMirror
                            value={code}
                            height="100%"
                            extensions={[python(), autocompletion({ activateOnTyping: true })]}
                            onChange={(value) => setCode(value)}
                            theme="dark"
                            className="h-full w-full"
                        />
                    </div>

                    {/* Keyboard Shortcut Hint */}
                    <div className="p-2 border-t-2 border-black bg-[#fdf6e3] text-[9px] text-black font-black text-center uppercase tracking-widest italic">
                        💡 SYSTEM_HINT: Press <kbd className="px-1.5 py-0.5 bg-black text-white rounded-none border border-black text-[8px]">F5</kbd> to execute current buffer
                    </div>
                </div>

                {/* Console Section */}
                <div className={`absolute inset-0 flex flex-col bg-white rounded-none border-2 border-black overflow-hidden transition-all duration-500 ease-in-out shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${viewMode === "console"
                    ? "opacity-100 translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-x-full pointer-events-none"
                    }`}>
                    <div className="flex items-center justify-between p-4 border-b-2 border-black bg-white">
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-black" />
                            <h2 className="font-black text-black uppercase tracking-tighter italic">Process Console</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setViewMode("editor")}
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-[10px] font-black text-black border-2 border-black rounded-none hover:bg-black/5 uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                            >
                                <Code2 className="w-3 h-3 mr-1" /> Source View
                            </Button>
                            <Button
                                onClick={() => setOutput("")}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-[10px] font-black text-slate-500 hover:text-black rounded-none uppercase tracking-widest"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    <div
                        ref={consoleEndRef}
                        className="flex-1 bg-black text-emerald-400 font-mono text-sm p-6 overflow-auto scrollbar-hide selection:bg-emerald-500 selection:text-black"
                    >
                        <pre className="whitespace-pre-wrap break-words leading-relaxed font-bold">
                            {output || ">>> SYSTEM_READY. Awaiting execution signal...\n"}
                        </pre>
                        {!pyodideReady && (
                            <div className="flex items-center gap-3 text-emerald-500/60 text-xs mt-4 font-black uppercase tracking-widest italic animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                Mounting virtual environment...
                            </div>
                        )}
                        {isRunning && (
                            <div className="flex items-center gap-3 text-emerald-500 text-xs mt-4 font-black uppercase tracking-widest italic">
                                <div className="w-2 h-2 bg-emerald-500 animate-ping rounded-none" />
                                Processing script execution...
                            </div>
                        )}
                    </div>

                    {/* Keyboard Shortcut Hint */}
                    <div className="p-2 border-t-2 border-black bg-[#fdf6e3] text-[9px] text-black font-black text-center uppercase tracking-widest italic">
                        💡 SYSTEM_HINT: Press <kbd className="px-1.5 py-0.5 bg-black text-white rounded-none border border-black text-[8px]">Esc</kbd> to return to source
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent className="rounded-none border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter italic text-black">
                            Archive Project
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-black mb-2 block">
                            Project designation
                        </Label>
                        <Input 
                            value={projectTitle} 
                            onChange={(e) => setProjectTitle(e.target.value)} 
                            placeholder="Enter project name..." 
                            className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:border-emerald-500 font-bold text-black bg-white uppercase text-xs h-11 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                        />
                    </div>
                    <DialogFooter className="gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsSaveOpen(false)}
                            className="rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-11 px-6 hover:bg-black/5"
                        >
                            Abort
                        </Button>
                        <Button 
                            onClick={confirmSaveToDatabase} 
                            disabled={isSaving}
                            className="rounded-none border-2 border-black bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
                        >
                            Commit to Database
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-md rounded-none border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter italic text-black">
                            Stored Projects
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] mt-4 pr-4">
                        {isLoadingProjects ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="animate-spin text-black w-8 h-8" />
                            </div>
                        ) : savedProjects.length === 0 ? (
                            <div className="text-center p-12 bg-black/5 border-2 border-dashed border-black/20">
                                <p className="font-black uppercase tracking-widest text-[10px] text-slate-400 italic">
                                    // NO_RECORDS_FOUND
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {savedProjects.map(p => (
                                    <div 
                                        key={p.id} 
                                        className="p-4 border-2 border-black hover:border-emerald-500 bg-white group cursor-pointer transition-all hover:bg-black/[0.02] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] relative overflow-hidden active:translate-x-[1px] active:translate-y-[1px] active:shadow-none" 
                                        onClick={() => { setCode(p.code); setIsViewOpen(false); setViewMode("editor"); }}
                                    >
                                        <div className="flex justify-between items-center relative z-10">
                                            <div>
                                                <h4 className="font-black text-xs uppercase tracking-tight text-black group-hover:text-emerald-600 transition-colors">
                                                    {p.title}
                                                </h4>
                                                <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                                                    STAMP: {new Date(p.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="h-8 rounded-none border-2 border-black font-black uppercase text-[9px] tracking-widest px-3 hover:bg-emerald-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            >
                                                LOAD
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default IDEComponent;

