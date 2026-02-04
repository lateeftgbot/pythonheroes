import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Code2, Loader2, ChevronLeft, ChevronRight, Database, Download, FolderOpen, FolderPlus, Settings, Trash2, BookOpen } from "lucide-react";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

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
    const pyodideRef = useRef<unknown>(null);

    // Save Projects State
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [projectTitle, setProjectTitle] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // View Projects State
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);

    // Load Pyodide
    useEffect(() => {
        const loadPyodide = async () => {
            try {
                // @ts-expect-error - Pyodide is loaded via CDN
                const pyodide = await window.loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
                });
                pyodideRef.current = pyodide;
                setPyodideReady(true);
                setOutput("✓ Python environment ready! Click 'Run Code' to execute.\n");
            } catch (error) {
                console.error("Pyodide load error:", error);
                setOutput("✗ Failed to load Python environment. Please refresh.\n");
            }
        };
        loadPyodide();
    }, []);

    // Save code
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem("learningSpaceCode", code);
        }, 500);
        return () => clearTimeout(timer);
    }, [code]);

    interface Pyodide {
        runPythonAsync: (code: string) => Promise<string>;
    }

    const runCode = useCallback(async () => {
        if (!pyodideReady || !pyodideRef.current) {
            setOutput("Python environment not ready yet. Please wait...\n");
            return;
        }

        setIsRunning(true);
        setOutput("Running...\n");

        try {
            const pyodide = pyodideRef.current as Pyodide;
            const fullCode = `
import sys
from io import StringIO
_output_buffer = StringIO()
_old_stdout = sys.stdout
_old_stderr = sys.stderr
sys.stdout = _output_buffer
sys.stderr = _output_buffer
try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Error: {e}")
finally:
    sys.stdout = _old_stdout
    sys.stderr = _old_stderr
_output_buffer.getvalue()
`;
            const result = await pyodide.runPythonAsync(fullCode);
            setOutput(result || "Code executed successfully (no output)");
            setViewMode("console");
        } catch (error: unknown) {
            const err = error as Error;
            setOutput(`Error:\n${err.message || String(error)}`);
            setViewMode("console");
        } finally {
            setIsRunning(false);
        }
    }, [code, pyodideReady]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // F5: Run code and switch to console
            if (e.key === 'F5') {
                e.preventDefault();
                if (pyodideReady && !isRunning) {
                    runCode();
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
            const response = await fetch('/api/code/save', {
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
            const response = await fetch(`/api/code/list?email=${encodeURIComponent(user.email)}`);
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
        <div className="flex flex-col h-full">
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

                    <Button
                        onClick={runCode}
                        disabled={!pyodideReady || isRunning}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 font-mono"
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        Run Code
                    </Button>
                </div>
            </div>

            {/* Editor/Console Container */}
            <div className="flex-1 min-h-[500px] relative overflow-hidden glass-card rounded-xl border border-border">
                {/* Editor */}
                <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${viewMode === "editor" ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="h-full flex flex-col p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Code2 className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold text-foreground">Editor</h2>
                            <Button
                                onClick={() => setCode("")}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="w-3 h-3 mr-1" /> Clear
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden" style={{ minHeight: "400px" }}>
                            <CodeMirror
                                value={code}
                                height="100%"
                                extensions={[python(), autocompletion({ activateOnTyping: true })]}
                                onChange={(value) => setCode(value)}
                                theme="dark"
                                className="h-full rounded-lg border border-border overflow-hidden"
                            />
                        </div>
                        {/* Keyboard Shortcut Hint */}
                        <div className="mt-2 text-xs text-muted-foreground font-mono text-center">
                            💡 Press <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">F5</kbd> to run and view console
                        </div>
                    </div>
                </div>

                {/* Console */}
                <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${viewMode === "console" ? "translate-x-0" : "translate-x-full"}`}>
                    <div className="h-full flex flex-col p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-foreground">Console Output</h2>
                            <Button onClick={() => setOutput("")} variant="outline" size="sm" className="font-mono text-xs">Clear</Button>
                        </div>
                        <div className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 rounded-lg overflow-auto border border-border">
                            <pre className="whitespace-pre-wrap break-words">{output || "Output will appear here..."}</pre>
                        </div>
                        {!pyodideReady && <div className="mt-2 text-xs text-muted-foreground"><Loader2 className="inline w-3 h-3 animate-spin mr-1" /> Loading Python...</div>}
                        {/* Keyboard Shortcut Hint */}
                        <div className="mt-2 text-xs text-muted-foreground font-mono text-center">
                            💡 Press <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Escape</kbd> to return to editor
                        </div>
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
