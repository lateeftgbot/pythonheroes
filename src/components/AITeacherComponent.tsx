import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Play,
    Square,
    Volume2,
    VolumeX,
    MessageSquare,
    Code2,
    BrainCircuit,
    PenTool,
    Loader2,
    ChevronRight,
    Sparkles
} from "lucide-react";
import CodeMirror, { EditorView, Decoration, DecorationSet, StateField, StateEffect } from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Highlight {
    lines: number[];
    portion?: string;
    comment: string;
}

interface Step {
    code: string;
    narration: string;
}

interface TeacherResponse {
    explanation: string;
    code: string;
    highlights: Highlight[];
    steps: Step[];
    conclusion: string;
}

// Effect to add/remove highlights
const addHighlight = StateEffect.define<{ from: number; to: number } | null>();

const highlightField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none;
    },
    update(highlights, tr) {
        highlights = highlights.map(tr.changes);
        for (const e of tr.effects) {
            if (e.is(addHighlight)) {
                if (e.value) {
                    highlights = Decoration.set([
                        Decoration.mark({ class: "bg-emerald-500/30 ring-1 ring-emerald-500/20 rounded-sm" }).range(e.value.from, e.value.to)
                    ]);
                } else {
                    highlights = Decoration.none;
                }
            }
        }
        return highlights;
    },
    provide: (f) => EditorView.decorations.from(f),
});

const AITeacherComponent = () => {
    const { user } = useAuth();
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [lesson, setLesson] = useState<TeacherResponse | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [muted, setMuted] = useState(false);
    const [activeHighlightIndex, setActiveHighlightIndex] = useState<number>(-1);
    const [pointerPosition, setPointerPosition] = useState({ top: 0, left: 0 });
    const [displayedCode, setDisplayedCode] = useState("");
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const dragStartRef = useRef<number | null>(null);

    const editorRef = useRef<any>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const categories = [
        { id: "basic", name: "Basics", icon: Code2 },
        { id: "intermediate", name: "Intermediate", icon: BrainCircuit },
        { id: "advanced", name: "Advanced", icon: Sparkles },
        { id: "libraries", name: "Libraries", icon: ChevronRight }
    ];

    const fetchLesson = async (categoryPrompt?: string, catId?: string) => {
        // Stop any current lesson immediately
        stopEverything();

        setIsLoading(true);
        try {
            const response = await fetch("/api/ai-teacher/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: categoryPrompt || prompt,
                    category: catId || "General",
                    history: []
                })
            });
            const data = await response.json();
            setLesson(data);
            setPrompt("");

            if (!muted) {
                playInteractiveLesson(data);
            } else {
                setDisplayedCode(data.code);
            }
        } catch (error) {
            toast.error("Failed to reach the AI Teacher. Is the GEMINI_API_KEY set?");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const stripMarkdown = (text: string) => {
        if (!text) return "";
        return text
            .replace(/[*_#`~]/g, "") // Remove common markdown symbols
            .replace(/[()\[\]{}]/g, "") // Remove parentheses, brackets, braces for cleaner speech
            .replace(/["']/g, "") // Remove quotes for cleaner speech
            .replace(/\\/g, " ") // Remove backslashes
            .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Simplify links
            .replace(/\s+/g, " ") // Normalize spaces
            .replace(/\n/g, " ") // Replace newlines with spaces
            .trim();
    };

    const stopEverything = () => {
        window.speechSynthesis.cancel();
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setIsSpeaking(false);
        setActiveHighlightIndex(-1);
    };

    const speakAsync = (text: string, signal: AbortSignal) => {
        return new Promise<void>((resolve) => {
            if (signal.aborted || !text) return resolve();

            const cleanText = stripMarkdown(text);
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.02; // Slightly faster for modern feel

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) || voices[0];
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                resolve();
            };
            utterance.onerror = () => resolve();

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);

            signal.addEventListener('abort', () => {
                window.speechSynthesis.cancel();
                resolve();
            });
        });
    };

    const typeAsync = (codePart: string | undefined, signal: AbortSignal) => {
        return new Promise<void>((resolve) => {
            // Safety: Never type the literal string "undefined" or empty values
            if (signal.aborted || !codePart || codePart.includes("undefined") || codePart.includes("null")) return resolve();

            let currentIdx = 0;
            const charInterval = 20;

            // Ensure we start from a clean state if this is the first typing or as requested
            typingIntervalRef.current = setInterval(() => {
                if (signal.aborted) {
                    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
                    return resolve();
                }

                if (currentIdx < codePart.length) {
                    const char = codePart[currentIdx];
                    setDisplayedCode(prev => prev + char);
                    currentIdx += 1;
                } else {
                    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
                    resolve();
                }
            }, charInterval);
        });
    };

    const playInteractiveLesson = async (data: TeacherResponse) => {
        if (!data) return;

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setDisplayedCode("");

        // 1. Intro
        if (data.explanation && data.explanation.trim()) {
            await speakAsync(data.explanation, signal);
        }
        if (signal.aborted) return;

        // 2. Steps
        if (data.steps && data.steps.length > 0) {
            for (const step of data.steps) {
                if (signal.aborted) break;

                // Explicitly avoid typing if code is missing OR is the literal string "undefined"
                if (step.code && typeof step.code === "string" && step.code.toLowerCase() !== "undefined") {
                    await typeAsync(`${step.code}\n`, signal);
                }

                if (signal.aborted) break;

                if (step.narration) {
                    await speakAsync(step.narration, signal);
                }
            }
        } else if (data.code && typeof data.code === "string" && data.code.toLowerCase() !== "undefined") {
            // Fallback for older structures
            await typeAsync(data.code, signal);
        }

        // 3. Conclusion
        if (data.conclusion && data.conclusion.trim() && !signal.aborted) {
            await speakAsync(data.conclusion, signal);
        }
    };

    const stopSpeaking = () => {
        stopEverything();
    };

    const handleCategoryClick = (catId: string, catName: string) => {
        fetchLesson(`Give me a ${catName} lesson.`, catId);
    };

    const handlePlayExplanation = () => {
        if (lesson) playInteractiveLesson(lesson);
    };

    const handleHeaderDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        dragStartRef.current = x;
    };

    const handleHeaderDragEnd = (e: React.MouseEvent | React.TouchEvent, panel: 'explanation' | 'code') => {
        if (dragStartRef.current === null) return;
        
        const x = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
        const delta = x - dragStartRef.current;
        dragStartRef.current = null;

        const threshold = 50; // px
        if (panel === 'code' && delta > threshold) {
            setIsPanelOpen(true);
        } else if (panel === 'explanation' && delta < -threshold) {
            setIsPanelOpen(false);
        }
    };


    // Update pointer position and editor decorations based on highlights
    useEffect(() => {
        if (activeHighlightIndex >= 0 && lesson?.highlights?.[activeHighlightIndex] && editorRef.current?.view) {
            const h = lesson.highlights[activeHighlightIndex];
            const view = editorRef.current.view as EditorView;

            if (h.lines && h.lines.length > 0) {
                const lineNum = h.lines[0];
                const line = view.state.doc.line(lineNum);

                let from = line.from;
                let to = line.to;

                // Try to find specific portion
                if (h.portion) {
                    const content = view.state.doc.sliceString(line.from, line.to);
                    const index = content.indexOf(h.portion);
                    if (index !== -1) {
                        from = line.from + index;
                        to = from + h.portion.length;
                    }
                }

                // Apply CodeMirror decoration
                view.dispatch({
                    effects: addHighlight.of({ from, to })
                });

                // Calculate Pointer Position
                try {
                    const coords = view.coordsAtPos(from);
                    const editorRect = view.dom.getBoundingClientRect();

                    if (coords) {
                        setPointerPosition({
                            top: coords.top - editorRect.top + 8,
                            left: coords.left - editorRect.left - 10
                        });
                    } else {
                        // Fallback to line-based
                        setPointerPosition({
                            top: (lineNum - 1) * 22.4 + 40,
                            left: 20
                        });
                    }
                } catch (e) {
                    // Fallback
                    setPointerPosition({
                        top: (lineNum - 1) * 22.4 + 40,
                        left: 20
                    });
                }
            }
        } else if (editorRef.current?.view) {
            // Clear decoration
            editorRef.current.view.dispatch({
                effects: addHighlight.of(null)
            });
        }
    }, [activeHighlightIndex, lesson]);

    return (
        <div className={cn(
            "flex-initial flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden max-h-[calc(100vh-200px)]",
            isPanelOpen ? "gap-6" : "gap-0"
        )}>
            <div className={cn(
                "flex-initial flex flex-row min-h-0 relative",
                isPanelOpen ? "gap-6" : "gap-0"
            )}>
                {/* Left: AI explanation and Input */}
                <div 
                    className={cn(
                        "flex flex-col gap-4 transition-all duration-500 ease-in-out h-full overflow-hidden border-r-2",
                        isPanelOpen 
                            ? "w-full lg:w-1/3 opacity-100 border-black/10 pr-6 mr-0" 
                            : "w-0 opacity-0 pointer-events-none border-transparent pr-0 mr-0"
                    )}
                >
                    <div className="flex-1 bg-white border-2 border-black/10 p-6 overflow-y-auto flex flex-col relative group shadow-2xl">
                        <div 
                            className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing border-b border-black/5 pb-2"
                            onMouseDown={handleHeaderDragStart}
                            onMouseUp={(e) => handleHeaderDragEnd(e, 'explanation')}
                            onTouchStart={handleHeaderDragStart}
                            onTouchEnd={(e) => handleHeaderDragEnd(e, 'explanation')}
                        >
                            <span className="text-[10px] font-black text-emerald-500 font-mono tracking-widest uppercase italic">{"// AI Teacher Insight"}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{"< swipe to hide"}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-emerald-500"
                                    onClick={() => setMuted(!muted)}
                                >
                                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        {lesson ? (
                            <div className="prose prose-sm max-w-none text-[#1a1a1a]">
                                <p className="text-[#1a1a1a] leading-relaxed font-medium">
                                    {lesson.explanation}
                                </p>

                                {lesson.highlights && lesson.highlights.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Key Highlights</p>
                                        {lesson.highlights.map((h, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "p-3 border-2 transition-all cursor-pointer",
                                                    activeHighlightIndex === i
                                                        ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20"
                                                        : "bg-black/5 border-transparent hover:border-black/10"
                                                )}
                                                onClick={() => setActiveHighlightIndex(i)}
                                            >
                                                <p className="text-xs font-bold text-emerald-600 mb-1">Lines {h.lines?.join('-') || 'N/A'}</p>
                                                <p className="text-xs text-slate-600">{h.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                <BrainCircuit className="w-16 h-16 mb-4 text-emerald-500" />
                                <p className="text-sm font-medium italic">Select a category or ask a question to begin your learning session.</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                                    <span className="text-xs font-black uppercase tracking-widest text-emerald-500 animate-pulse">Consulting AI...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ask Vectors anything about Python..."
                            className="w-full bg-white border-2 border-black/10 p-4 pr-16 text-sm resize-none focus:outline-none focus:border-emerald-500/50 transition-all h-24 placeholder:text-slate-400 font-medium text-black"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    fetchLesson();
                                }
                            }}
                        />
                        <Button
                            onClick={() => fetchLesson()}
                            disabled={isLoading || !prompt.trim()}
                            className="absolute right-4 bottom-4 h-10 w-10 rounded-none border-2 border-emerald-900 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/20"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Right: Code Container */}
                <div className="flex-1 bg-slate-900 border-2 border-black/10 overflow-hidden flex flex-col shadow-2xl relative">
                    <div 
                        className="px-6 py-4 border-b-2 border-black/20 bg-black/60 flex items-center justify-between cursor-grab active:cursor-grabbing"
                        onMouseDown={handleHeaderDragStart}
                        onMouseUp={(e) => handleHeaderDragEnd(e, 'code')}
                        onTouchStart={handleHeaderDragStart}
                        onTouchEnd={(e) => handleHeaderDragEnd(e, 'code')}
                    >
                        <div className="flex items-center gap-3">
                            {!isPanelOpen && (
                                <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded-none border border-emerald-500/30 mr-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{"swipe right for insights >"}</span>
                                </div>
                            )}
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 ml-4 tracking-[0.2em]">{"LEARNING_CONTAINER.py"}</span>
                        </div>

                        {isSpeaking ? (
                            <Button size="sm" variant="destructive" className="h-8 rounded-none border-2 border-red-900 font-black text-[10px] tracking-widest uppercase" onClick={stopSpeaking}>
                                <Square className="w-3 h-3 mr-2 fill-current" /> Stop Audio
                            </Button>
                        ) : lesson && (
                            <Button size="sm" className="h-8 rounded-none border-2 border-emerald-900 font-black text-[10px] tracking-widest uppercase bg-emerald-600 hover:bg-emerald-500 text-white" onClick={handlePlayExplanation}>
                                <Play className="w-3 h-3 mr-2" /> Play Explanation
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 relative overflow-hidden bg-[#0f172a]">
                        <CodeMirror
                            ref={editorRef}
                            value={displayedCode}
                            height="auto"
                            minHeight="100px"
                            maxHeight="500px"
                            extensions={[python(), highlightField]}
                            theme="dark"
                            readOnly={true}
                            className="text-sm h-full"
                        />

                        {/* Visual Pointer / Pen Navigation */}
                        {activeHighlightIndex >= 0 && (
                            <div
                                className="absolute transition-all duration-500 ease-in-out z-40 pointer-events-none"
                                style={{
                                    top: `${pointerPosition.top}px`,
                                    left: `${pointerPosition.left}px`
                                }}
                            >
                                <div className="relative">
                                    <PenTool className="w-6 h-6 text-emerald-400 filter drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] transform -rotate-45" />
                                    <div className="absolute top-0 left-0 w-6 h-6 bg-emerald-400/20 rounded-full animate-ping" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-mono text-slate-500">{"// platform: lativectors_academy"}</p>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Compiler Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AITeacherComponent;
