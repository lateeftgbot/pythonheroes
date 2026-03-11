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
        <div className="flex flex-col h-full p-4 lg:p-8 lg:pb-0">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="font-mono text-primary text-sm mb-1">{"// Python IDE"}</p>
                        <h1 className="text-3xl font-bold text-foreground">Practice Playground</h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <Button
                        onClick={() => setViewMode(viewMode === "editor" ? "console" : "editor")}
                        variant="outline"
                        size="sm"
                        className="font-mono bg-green-600 text-white hover:bg-green-500 border-green-600 shadow-sm"
                    >
                        {viewMode === "editor" ? "View Console" : "View Editor"}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9" title="Save Project">
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleSaveToDevice}>
                                <Download className="mr-2 h-4 w-4" /> Save to Device
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleSaveToDatabaseRequest}>
                                <Database className="mr-2 h-4 w-4" /> Save to Database
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="sm" onClick={handleViewProjects} className="font-mono h-9">
                        <FolderOpen className="w-4 h-4 mr-2" /> View Projects
                    </Button>

                    <Button onClick={resetCode} variant="outline" size="sm" className="font-mono">
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset
                    </Button>

                    {showBackButton && onBackToLearning && (
                        <Button
                            onClick={onBackToLearning}
                            variant="outline"
                            size="sm"
                            className="font-mono bg-purple-600 text-white hover:bg-purple-500 border-purple-600 shadow-sm"
                        >
                            <BookOpen className="w-4 h-4 mr-2" /> Back to Learning
                        </Button>
                    )}

                    {isRunning ? (
                        <Button
                            onClick={stopExecution}
                            size="sm"
                            variant="destructive"
                            className="font-mono"
                        >
                            <Square className="w-4 h-4 mr-2 fill-current" />
                            Stop
                        </Button>
                    ) : (
                        <Button
                            onClick={runCode}
                            disabled={!pyodideReady}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 font-mono"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Run Code
                        </Button>
                    )}
                </div>
            </div>

            {/* Editor/Console Container */}
            <div className="flex-1 min-h-0 relative overflow-hidden">
                {/* Editor Section */}
                <div className={`absolute inset-0 flex flex-col glass-card rounded-xl border border-border overflow-hidden transition-all duration-500 ease-in-out ${viewMode === "editor"
                    ? "opacity-100 translate-x-0 pointer-events-auto"
                    : "opacity-0 -translate-x-full pointer-events-none"
                    }`}>
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold text-foreground">Editor</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasRunCode && (
                                <Button
                                    onClick={() => setViewMode("console")}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs font-mono text-primary border-primary/20 hover:bg-primary/10 transition-colors"
                                >
                                    <Database className="w-3 h-3 mr-1" /> View Console
                                </Button>
                            )}
                            <Button
                                onClick={() => setCode("")}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-destructive transition-colors"
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
                    <div className="p-2 border-t border-border bg-muted/20 text-[10px] text-muted-foreground font-mono text-center">
                        💡 Press <kbd className="px-1 py-0.5 bg-muted rounded border border-border">F5</kbd> to run code
                    </div>
                </div>

                {/* Console Section */}
                <div className={`absolute inset-0 flex flex-col glass-card rounded-xl border border-border overflow-hidden transition-all duration-500 ease-in-out ${viewMode === "console"
                    ? "opacity-100 translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-x-full pointer-events-none"
                    }`}>
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold text-foreground">Console Output</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setViewMode("editor")}
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs font-mono text-primary border-primary/20 hover:bg-primary/10 transition-colors"
                            >
                                <Code2 className="w-3 h-3 mr-1" /> Back to Editor
                            </Button>
                            <Button
                                onClick={() => setOutput("")}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    <div
                        ref={consoleEndRef}
                        className="flex-1 bg-[#0f0f0f] text-[#d4d4d4] font-mono text-sm p-6 overflow-auto"
                    >
                        <pre className="whitespace-pre-wrap break-words leading-relaxed font-mono">
                            {output || ">>> Output will appear here...\n"}
                        </pre>
                        {!pyodideReady && (
                            <div className="flex items-center gap-2 text-primary/60 text-sm mt-4 italic">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Initiating Python kernel...
                            </div>
                        )}
                        {isRunning && (
                            <div className="flex items-center gap-2 text-green-500/60 text-sm mt-2 italic">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Executing...
                            </div>
                        )}
                    </div>

                    {/* Keyboard Shortcut Hint */}
                    <div className="p-2 border-t border-border bg-muted/20 text-[10px] text-muted-foreground font-mono text-center">
                        💡 Press <kbd className="px-1 py-0.5 bg-muted rounded border border-border">Esc</kbd> for editor
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Save to Database</DialogTitle></DialogHeader>
                    <div className="py-4">
                        <Label>Project Title</Label>
                        <Input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Project name..." />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSaveOpen(false)}>Cancel</Button>
                        <Button onClick={confirmSaveToDatabase} disabled={isSaving}>Save Project</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>My Projects</DialogTitle></DialogHeader>
                    <ScrollArea className="h-[300px] pr-4">
                        {isLoadingProjects ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> :
                            savedProjects.length === 0 ? <div className="text-center p-8">No projects fund</div> :
                                <div className="space-y-2">
                                    {savedProjects.map(p => (
                                        <div key={p.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer flex justify-between items-center" onClick={() => { setCode(p.code); setIsViewOpen(false); setViewMode("editor"); }}>
                                            <div>
                                                <h4 className="font-semibold text-sm">{p.title}</h4>
                                                <p className="text-[10px] text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</p>
                                            </div>
                                            <Button size="sm" variant="ghost">Load</Button>
                                        </div>
                                    ))}
                                </div>
                        }
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default IDEComponent;

