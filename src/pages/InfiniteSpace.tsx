import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import {
    ArrowLeft,
    BrainCircuit,
    ChevronLeft,
    ChevronRight,
    Code2,
    Cpu,
    Filter,
    Globe,
    Keyboard,
    Layout,
    Monitor,
    Play,
    Search,
    ShieldCheck,
    Swords,
    Terminal,
    Users2,
    Zap,
    X,
    Check,
    Loader2,
    Trophy,
    BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";

interface Problem {
    id: string | number;
    title: string;
    description: string;
    difficulty: Difficulty;
    category?: string;
    reward?: string;
}

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type Tab = 'problems' | 'codes' | 'challenges';
type ChallengeMode = 'solo' | 'group';

// Challenges are now loaded from API to state
const InfiniteSpace = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('problems');
    const [challengeType, setChallengeType] = useState<'solutions' | 'typing'>('solutions');
    const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All');
    const [problems, setProblems] = useState<Problem[]>([]);
    const [allCodePredictions, setAllCodePredictions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [jumpPage, setJumpPage] = useState("");
    const [currentCodePage, setCurrentCodePage] = useState(0);
    const [jumpCodePage, setJumpCodePage] = useState("");
    const [totalCodes, setTotalCodes] = useState(0); // Removed usage below
    const ITEMS_PER_PAGE = 6;

    // PvP States
    const [pvpStatus, setPvpStatus] = useState<'idle' | 'searching' | 'matched'>('idle');
    const [pvpMatch, setPvpMatch] = useState<any>(null);
    const [isPvPActive, setIsPvPActive] = useState(false);
    const [currentPvPIndex, setCurrentPvPIndex] = useState(0);
    const [pvpScore, setPvpScore] = useState(0);
    const [pvpOpponentScore, setPvpOpponentScore] = useState(0);
    const [pvpPrediction, setPvpPrediction] = useState<number | string | null>(null);
    const [showPvPFeedback, setShowPvPFeedback] = useState(false);
    const [pvpTimer, setPvpTimer] = useState(100);
    const [isPvPTimerPaused, setIsPvPTimerPaused] = useState(false);
    const [pvpStartCountdown, setPvpStartCountdown] = useState(3);
    const [isPvPCountingDown, setIsPvPCountingDown] = useState(true);

    const shuffleArray = (array: any[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (problems.length > 0) return; // Already loaded
            setIsLoading(true);
            try {
                // Fetch Programming Problems (they are lightweight, load all at once)
                const problemsResponse = await fetch("/api/learning/problem-sets");
                let allProblems: Problem[] = [];
                if (problemsResponse.ok) {
                    const data = await problemsResponse.json();
                    data.forEach((set: any) => {
                        // Skip sets that are identified as documents or materials
                        const isDocument = set.name?.toLowerCase().includes("document") ||
                            set.name?.toLowerCase().includes("material");
                        if (isDocument) return;

                        if (set.problems && Array.isArray(set.problems)) {
                            set.problems.forEach((p: any) => {
                                allProblems.push({
                                    id: p.id || Math.random(),
                                    title: set.name || "Programming Problem",
                                    difficulty: p.difficulty,
                                    description: p.description,
                                    category: set.category || "Programming",
                                    reward: p.difficulty === 'Beginner' ? '30 XP' : p.difficulty === 'Intermediate' ? '50 XP' : '100 XP'
                                });
                            });
                        }
                    });
                }

                // Initial store (shuffle once to ensure varied categories)
                setProblems(shuffleArray(allProblems));
            } catch (error) {
                console.error("Failed to fetch problems:", error);
                setProblems([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/learning/categories");
                if (res.ok) {
                    const data = await res.json();
                    setAvailableCategories(data.filter((c: string) => c && c !== "None"));
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Local filtering and pagination for Code Predictions (REFACTORED to useMemo below)

    // Prediction Interaction state
    const [focusedCodeId, setFocusedCodeId] = useState<number | null>(null);
    const [prediction, setPrediction] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Battle Loading / Sync Overlay
    const BattleLoadingOverlay = () => (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0a0a0a] rounded-3xl border border-primary/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] p-10 text-center space-y-8 animate-in zoom-in-95 duration-300 text-white">
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Cpu className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold font-mono tracking-tighter">Initializing Neural Battle...</h3>
                    <p className="text-sm text-slate-400 font-mono italic">Synchronizing complex logic patterns from the mainframe</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-primary/60 uppercase tracking-[0.2em]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Fetching Challenges
                </div>
            </div>
        </div>
    );

    // PvP Logic
    useEffect(() => {
        let interval: any;
        if (pvpStatus === 'searching' || (isPvPActive && pvpMatch)) {
            interval = setInterval(async () => {
                if (!user) return;
                try {
                    const response = await fetch(`/api/learning/pvp/status?email=${user.email}`);
                    const data = await response.json();
                    if (data.status === 'matched') {
                        // Only initialize if we're moving from 'searching' to 'matched'
                        if (pvpStatus === 'searching') {
                            setIsPvPActive(true);
                            setCurrentPvPIndex(0);
                            setPvpScore(0);
                            setPvpStartCountdown(3);
                            setIsPvPCountingDown(true);
                            setPvpStatus('matched'); // Set it here so the next poll won't re-init
                        }

                        setPvpMatch(data.match);

                        // Sync opponent score
                        if (data.match.player1.email === user.email) {
                            setPvpOpponentScore(data.match.player2.score);
                        } else {
                            setPvpOpponentScore(data.match.player1.score);
                        }
                    } else if (data.status === 'idle' && pvpStatus === 'searching') {
                        // Potentially kicked or cancelled
                        setPvpStatus('idle');
                    }
                } catch (err) {
                    console.error("PvP poll error:", err);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [pvpStatus, isPvPActive, pvpMatch, user]);

    const handleFindMatch = async () => {
        if (!user) {
            toast.error("Please login to play PvP.");
            return;
        }
        try {
            const response = await fetch('/api/learning/pvp/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    name: user.name,
                    difficulty: difficulty === 'All' ? 'Beginner' : difficulty
                })
            });
            const data = await response.json();
            if (data.status === 'matched') {
                setPvpMatch(data.match);
                setPvpStatus('matched');
                setIsPvPActive(true);
                setCurrentPvPIndex(0);
                setPvpScore(0);
                // Start sequence
                setPvpStartCountdown(3);
                setIsPvPCountingDown(true);
            } else {
                setPvpStatus('searching');
            }
        } catch (err) {
            toast.error("Failed to join matchmaking.");
        }
    };

    const handleQuitPvP = async () => {
        if (user) {
            await fetch('/api/learning/pvp/quit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
        }
        setPvpStatus('idle');
        setPvpMatch(null);
        setIsPvPActive(false);
    };

    const handlePvPSelection = async (prediction: number | string) => {
        if (!pvpMatch || !user) return;
        setPvpPrediction(prediction);
        setShowPvPFeedback(true);
        setIsPvPTimerPaused(true);

        let newScore = pvpScore;
        if (prediction === pvpMatch.challenges[currentPvPIndex]?.correct) {
            newScore += 10;
            setPvpScore(newScore);
        }

        // Update score on backend
        try {
            await fetch('/api/learning/pvp/update-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    match_id: pvpMatch.match_id,
                    email: user.email,
                    score: newScore
                })
            });
        } catch (err) {
            console.error("Failed to update PvP score");
        }
    };

    const handleNextPvPItem = () => {
        if (currentPvPIndex < pvpMatch.challenges.length - 1) {
            setCurrentPvPIndex(prev => prev + 1);
            setPvpPrediction(null);
            setShowPvPFeedback(false);
            setPvpTimer(100);
            setIsPvPTimerPaused(false);
            setPvpStartCountdown(3);
            setIsPvPCountingDown(true);
        } else {
            toast.info("PvP Battle Complete!", {
                description: `Final Score: ${pvpScore} points. Opponent Score: ${pvpOpponentScore}`,
            });
            handleQuitPvP();
        }
    };
    // Battle State
    const [isBattleActive, setIsBattleActive] = useState(false);
    const [battleScore, setBattleScore] = useState(0);
    const [battleTimer, setBattleTimer] = useState(100);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [startCountdown, setStartCountdown] = useState(3);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [currentBattleIndex, setCurrentBattleIndex] = useState(0);
    const [battlePrediction, setBattlePrediction] = useState<string | number | null>(null);
    const [showBattleFeedback, setShowBattleFeedback] = useState(false);
    const [battleChallenges, setBattleChallenges] = useState<any[]>([]);
    const [isBattleLoading, setIsBattleLoading] = useState(false);
    const [isSoloConfigOpen, setIsSoloConfigOpen] = useState(false);
    const [soloConfigPhase, setSoloConfigPhase] = useState<'selection' | 'time'>('selection');
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['Beginner']);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTimeLimit, setSelectedTimeLimit] = useState(30);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);

    // Moderator State
    const [isModeratorActive, setIsModeratorActive] = useState(false);
    const [moderatorPhase, setModeratorPhase] = useState<'preview' | 'waiting' | 'active'>('preview');
    const [currentModeratorIndex, setCurrentModeratorIndex] = useState(0);
    const [roomCode, setRoomCode] = useState("");
    const [isLinkGenerated, setIsLinkGenerated] = useState(false);

    // Mock Joined Students Data
    const JOINED_STUDENTS = [
        { id: '1', name: 'Alex Thompson', avatar: 'AT', status: 'ready' },
        { id: '2', name: 'Sarah Chen', avatar: 'SC', status: 'ready' },
        { id: '3', name: 'Marcus Rodriguez', avatar: 'MR', status: 'waiting' },
        { id: '4', name: 'Jordan Lee', avatar: 'JL', status: 'ready' },
        { id: '5', name: 'Emma Wilson', avatar: 'EW', status: 'waiting' },
        { id: '6', name: 'David Park', avatar: 'DP', status: 'ready' },
        { id: '7', name: 'Luna Stark', avatar: 'LS', status: 'ready' },
        { id: '8', name: 'Oliver Twist', avatar: 'OT', status: 'ready' },
        { id: '9', name: 'Leo Messi', avatar: 'LM', status: 'waiting' },
        { id: '10', name: 'Cristiano R.', avatar: 'CR', status: 'ready' },
        { id: '11', name: 'Tony Stark', avatar: 'TS', status: 'ready' },
        { id: '12', name: 'Bruce Wayne', avatar: 'BW', status: 'ready' },
        { id: '13', name: 'Clark Kent', avatar: 'CK', status: 'waiting' },
        { id: '14', name: 'Diana Prince', avatar: 'DP', status: 'ready' },
        { id: '15', name: 'Peter Park', avatar: 'PP', status: 'ready' },
        { id: '16', name: 'Barry Allen', avatar: 'BA', status: 'ready' },
        { id: '17', name: 'Arthur Curry', avatar: 'AC', status: 'waiting' },
        { id: '18', name: 'Victor Stone', avatar: 'VS', status: 'ready' },
        { id: '19', name: 'Hal Jordan', avatar: 'HJ', status: 'ready' },
        { id: '20', name: 'Billy Batson', avatar: 'BB', status: 'ready' },
        { id: '21', name: 'John Stewart', avatar: 'JS', status: 'waiting' },
        { id: '22', name: 'Kyle Rayner', avatar: 'KR', status: 'ready' },
        { id: '23', name: 'Guy Gardner', avatar: 'GG', status: 'ready' },
        { id: '24', name: 'Alan Scott', avatar: 'AS', status: 'ready' },
        { id: '25', name: 'Simon Baz', avatar: 'SB', status: 'waiting' },
        { id: '26', name: 'Jessica Cruz', avatar: 'JC', status: 'ready' },
        { id: '27', name: 'Jo Mullein', avatar: 'JM', status: 'ready' },
        { id: '28', name: 'Jade', avatar: 'JD', status: 'ready' },
        { id: '29', name: 'Jennifer-Lynn', avatar: 'JL', status: 'waiting' },
        { id: '30', name: 'Kaisa', avatar: 'KS', status: 'ready' },
    ];

    const handleStartModerator = () => {
        if (allFilteredCodes.length === 0) {
            toast.error("No challenges available for this difficulty.");
            return;
        }
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomCode(code);
        setIsModeratorActive(true);
        setModeratorPhase('preview');
        setCurrentModeratorIndex(0);
        setIsLinkGenerated(false);
    };

    const handleGenerateLink = () => {
        setIsLinkGenerated(true);
        const link = `https://lativectors.com/join/${roomCode}`;
        navigator.clipboard.writeText(link);
        toast.success("Join Link Generated!", {
            description: "The invitation link has been copied to your clipboard. Entering Waiting Room...",
        });

        // Transition to Waiting Room phase after a short delay
        setTimeout(() => {
            setModeratorPhase('waiting');
        }, 1500);
    };

    const handleStartMission = () => {
        setModeratorPhase('active');
        toast.success("Mission Started!", {
            description: "All students are now synchronized with your view.",
        });
    };

    const handleNextModeratorItem = () => {
        if (currentModeratorIndex < allFilteredCodes.length - 1) {
            setCurrentModeratorIndex(prev => prev + 1);
        } else {
            toast.info("Course Complete", {
                description: "You have reviewed all challenges in this session."
            });
            setIsModeratorActive(false);
        }
    };

    // Prevent body scroll when moderator view is active
    useEffect(() => {
        if (isModeratorActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModeratorActive]);

    const handleCheckPrediction = (option: string, correctOption: string) => {
        setPrediction(option);
        setShowResult(true);
    };

    const handleStartBattle = async () => {
        setIsBattleLoading(true);
        setIsSoloConfigOpen(false);
        try {
            const difficultiesParam = selectedDifficulties.join(',');
            const categoryParam = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : '';
            const res = await fetch(`/api/learning/challenges/random?limit=10&difficulty=${difficultiesParam}${categoryParam}`);
            if (res.ok) {
                const data = await res.json();
                if (data.length === 0) {
                    toast.error("No challenges available for these settings.");
                    setIsBattleLoading(false);
                    return;
                }
                setBattleChallenges(data);
                setIsBattleActive(true);
                setCurrentBattleIndex(0);
                setBattlePrediction(null);
                setShowBattleFeedback(false);
                setBattleScore(0);
                setBattleTimer(100);
                setIsTimerPaused(false);
                setStartCountdown(3);
                setIsCountingDown(true);
            } else {
                toast.error("Failed to load challenges.");
            }
        } catch (err) {
            console.error("Battle fetch error:", err);
            toast.error("An error occurred starting the battle.");
        } finally {
            setIsBattleLoading(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isBattleActive && isCountingDown && startCountdown > 0) {
            interval = setInterval(() => {
                setStartCountdown((prev) => prev - 1);
            }, 1000);
        } else if (isBattleActive && isCountingDown && startCountdown === 0) {
            setIsCountingDown(false);
        }
        return () => clearInterval(interval);
    }, [isBattleActive, isCountingDown, startCountdown]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isBattleActive && !isTimerPaused && !isCountingDown && battleTimer > 0) {
            interval = setInterval(() => {
                setBattleTimer((prev) => Math.max(0, prev - (10 / selectedTimeLimit)));
            }, 100);
        }

        if (battleTimer === 0 && !showBattleFeedback && !isCountingDown) {
            // Time's up logic
            setBattlePrediction(null); // Explicitly null to show fail
            setShowBattleFeedback(true);
            setIsTimerPaused(true);
        }

        return () => clearInterval(interval);
    }, [isBattleActive, isTimerPaused, battleTimer, showBattleFeedback, isCountingDown]);

    // PvP Countdown Decrementer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPvPActive && isPvPCountingDown && pvpStartCountdown > 0) {
            interval = setInterval(() => {
                setPvpStartCountdown((prev) => prev - 1);
            }, 1000);
        } else if (isPvPActive && isPvPCountingDown && pvpStartCountdown === 0) {
            setIsPvPCountingDown(false);
            setPvpTimer(100);
        }
        return () => clearInterval(interval);
    }, [isPvPActive, isPvPCountingDown, pvpStartCountdown]);

    // PvP Timer Decay Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPvPActive && !isPvPTimerPaused && !isPvPCountingDown && pvpTimer > 0) {
            interval = setInterval(() => {
                const timeLimit = difficulty === 'Beginner' ? 30 : 20;
                setPvpTimer((prev) => Math.max(0, prev - (10 / timeLimit)));
            }, 100);
        }

        if (pvpTimer === 0 && !showPvPFeedback && !isPvPCountingDown && isPvPActive) {
            setPvpPrediction(null);
            setShowPvPFeedback(true);
            setIsPvPTimerPaused(true);
        }

        return () => clearInterval(interval);
    }, [isPvPActive, isPvPTimerPaused, isPvPCountingDown, pvpTimer, difficulty, showPvPFeedback]);

    const handleBattleSelection = (prediction: number | string) => {
        setBattlePrediction(prediction);
        setShowBattleFeedback(true);
        setIsTimerPaused(true);
        if (prediction === battleChallenges[currentBattleIndex]?.correct) {
            setBattleScore(prev => prev + 10);
        }
    };

    const handleNextBattleItem = () => {
        if (currentBattleIndex < battleChallenges.length - 1) {
            setCurrentBattleIndex(prev => prev + 1);
            setBattlePrediction(null);
            setShowBattleFeedback(false);
            setBattleTimer(100);
            setIsTimerPaused(false);
            setStartCountdown(3);
            setIsCountingDown(true);
        } else {
            toast.info("Battle Complete!", {
                description: `Final Score: ${battleScore} points.`,
            });
            setIsBattleActive(false);
        }
    };

    const filteredProblems = useMemo(() =>
        problems.filter(p => difficulty === 'All' || p.difficulty === difficulty),
        [problems, difficulty]
    );

    // Optimized: Fetch all codes once on mount
    const [isCodesLoading, setIsCodesLoading] = useState(false);
    useEffect(() => {
        const fetchAllCodes = async () => {
            if (allCodePredictions.length > 0) return;
            setIsCodesLoading(true);
            try {
                const res = await fetch(`/api/learning/code-predictions?page=0&limit=2000`);
                if (res.ok) {
                    const data = await res.json();
                    const shuffled = shuffleArray(data.items || []);
                    setAllCodePredictions(shuffled);
                    // usage of setTotalCodes removed for cleaner code
                }
            } catch (err) {
                console.error("Failed to fetch codes:", err);
            } finally {
                setIsCodesLoading(false);
            }
        };
        fetchAllCodes();
    }, [allCodePredictions.length]);

    // Memoize filtering and pagination for Code Predictions
    const allFilteredCodes = useMemo(() => {
        if (difficulty === 'All') return allCodePredictions;
        return allCodePredictions.filter(c => c.difficulty === difficulty);
    }, [allCodePredictions, difficulty]);

    const paginatedCodes = useMemo(() => {
        const start = currentCodePage * ITEMS_PER_PAGE;
        return allFilteredCodes.slice(start, start + ITEMS_PER_PAGE);
    }, [allFilteredCodes, currentCodePage]);

    const totalCodePages = Math.ceil(allFilteredCodes.length / ITEMS_PER_PAGE);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard", {
            description: "You can now paste it into your IDE.",
            duration: 2000,
        });
    };

    const difficulties: (Difficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    return (
        <div className="h-screen bg-[#0a0a0a] text-foreground font-sans selection:bg-primary/30 flex flex-col overflow-hidden">
            <Navbar />

            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />
            </div>

            {isBattleLoading && <BattleLoadingOverlay />}

            <main className="flex-1 flex flex-col container mx-auto px-6 md:px-4 pt-[83px] pb-[3px] relative z-10 overflow-hidden">
                {/* Header Section */}
                <div className="max-w-4xl mx-auto mb-3">
                    <Link to="/python-heroes" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-2 group">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Back to Academy
                    </Link>

                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 w-full">
                        <div className="text-center md:text-left w-full md:w-auto">
                            <h1 className="text-xl font-extrabold mb-1">
                                Infinite <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent inline-block">Space</span>
                            </h1>
                            <p className="text-muted-foreground text-[10px] md:text-xs max-w-lg mx-auto md:mx-0">
                                Advanced programming playground designed for university excellence. Master complex logic and binary patterns.
                            </p>
                        </div>
                        <div className="flex items-center w-full md:w-auto justify-center md:justify-end">
                            <div className="flex bg-muted/20 p-1 rounded-xl border border-border/50 backdrop-blur-md w-fit mx-auto md:mx-0">
                                <button
                                    onClick={() => {
                                        setActiveTab('problems');
                                        setCurrentPage(0);
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
                                        activeTab === 'problems' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <BrainCircuit className="w-3.5 h-3.5" />
                                        Problems
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('codes');
                                        setFocusedCodeId(null);
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
                                        activeTab === 'codes' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Code2 className="w-3.5 h-3.5" />
                                        Codes
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('challenges')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
                                        activeTab === 'challenges' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Swords className="w-3.5 h-3.5" />
                                        Challenge Space
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sub-header for Difficulty */}
                    {activeTab !== 'challenges' && (
                        <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mr-1">
                                <Filter className="w-3 h-3" />
                                Level:
                            </div>
                            {difficulties.map(lib => (
                                <button
                                    key={lib}
                                    onClick={() => {
                                        setDifficulty(lib);
                                        setFocusedCodeId(null);
                                        setCurrentPage(0);
                                        setCurrentCodePage(0);
                                    }}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-mono border transition-all",
                                        difficulty === lib
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-muted/10 border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-muted/20"
                                    )}
                                >
                                    {lib}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <div className="flex flex-col items-center">
                            <h2 className="text-xl font-bold font-mono text-primary animate-pulse">Initializing Space...</h2>
                            <p className="text-xs text-muted-foreground font-mono">Synchronizing thousands of neural patterns</p>
                        </div>
                    </div>
                ) : (
                    /* Content Container */
                    <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col overflow-hidden">
                        {activeTab === 'problems' && (
                            <div className="flex-1 flex flex-col overflow-hidden gap-3">
                                <h2 className="text-base font-bold flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    University Programming Problems
                                </h2>
                                <div className="bg-[#f0fdf4]/10 border border-green-500/20 rounded-2xl p-3 md:p-4 shadow-[0_0_20px_rgba(34,197,94,0.05)] overflow-y-auto custom-scrollbar flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3 px-3 md:px-0 focus-visible:outline-none">
                                        {filteredProblems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE).map((problem, idx) => (
                                            <div key={problem.id} className="bg-white p-3.5 md:p-4 rounded-xl flex flex-col items-start gap-3 border border-border/50 hover:border-primary/50 transition-all duration-300 group shadow-sm">
                                                <div className="flex w-full items-start justify-between gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex flex-shrink-0 items-center justify-center text-sm font-bold font-mono text-primary group-hover:bg-primary/20 transition-colors">
                                                        {currentPage * ITEMS_PER_PAGE + idx + 1}
                                                    </div>
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-tighter",
                                                        problem.difficulty === 'Beginner' ? "bg-green-500/10 text-green-600" :
                                                            problem.difficulty === 'Intermediate' ? "bg-yellow-500/10 text-yellow-600" : "bg-red-500/10 text-red-600"
                                                    )}>
                                                        {problem.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0 w-full">
                                                    <h3 className="text-[14px] font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                                                        {problem.title}
                                                    </h3>
                                                    <p className="text-[11px] text-slate-600 leading-tight opacity-90 whitespace-pre-wrap">
                                                        {problem.description}
                                                    </p>
                                                </div>
                                                <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                                                    <span className="text-[10px] font-mono text-slate-400 capitalize">{problem.category}</span>
                                                    <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] font-mono text-primary hover:bg-primary/10 group/btn">
                                                        Solve <ChevronRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination Arrows and Jump-to-Page */}
                                <div className="flex flex-wrap items-center justify-center gap-3 mt-6 sm:mt-[3px]">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-lg border border-border/50 hover:bg-primary/20 hover:text-primary disabled:opacity-20"
                                            disabled={currentPage === 0}
                                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        >
                                            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                                        </Button>

                                        <div className="flex items-center gap-2 px-3 py-1 bg-muted/10 border border-border/50 rounded-lg">
                                            <span className="text-[11px] font-mono font-bold text-primary">
                                                {currentPage + 1}
                                            </span>
                                            <span className="text-[11px] font-mono text-muted-foreground opacity-50">/</span>
                                            <span className="text-[11px] font-mono text-muted-foreground">
                                                {Math.ceil(filteredProblems.length / ITEMS_PER_PAGE)}
                                            </span>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-lg border border-border/50 hover:bg-primary/20 hover:text-primary disabled:opacity-20"
                                            disabled={(currentPage + 1) * ITEMS_PER_PAGE >= filteredProblems.length}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    {/* Jump to Page Search Bar */}
                                    <div className="relative group">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="text"
                                            placeholder="Jump to..."
                                            value={jumpPage}
                                            onChange={(e) => setJumpPage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const pageNum = parseInt(jumpPage);
                                                    const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
                                                    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
                                                        setCurrentPage(pageNum - 1);
                                                        setJumpPage("");
                                                    }
                                                }
                                            }}
                                            className="h-7 w-28 pl-7 pr-2 text-[10px] font-mono bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'codes' && (
                            <div className="flex-1 flex flex-col overflow-hidden gap-3">
                                <h2 className="text-base font-bold flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-primary" />
                                    Prediction Sets
                                </h2>
                                <div className="bg-[#f0fdf4]/10 border border-blue-500/20 rounded-2xl p-3 md:p-4 shadow-[0_0_20px_rgba(59,130,246,0.05)] overflow-y-auto custom-scrollbar flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3 px-3 md:px-0">
                                        {paginatedCodes.map((item, idx) => (
                                            <div key={item.id} className="bg-white p-3.5 md:p-4 rounded-xl flex flex-col items-start gap-3 border border-border/50 hover:border-primary/50 transition-all duration-300 group shadow-sm overflow-hidden text-slate-900 font-mono">
                                                <div className="flex w-full items-start justify-between gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex flex-shrink-0 items-center justify-center text-sm font-bold font-mono text-primary group-hover:bg-primary/20 transition-colors">
                                                        {currentCodePage * ITEMS_PER_PAGE + idx + 1}
                                                    </div>
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-tighter",
                                                        item.difficulty === 'Beginner' ? "bg-green-500/10 text-green-600" :
                                                            item.difficulty === 'Intermediate' ? "bg-yellow-500/10 text-yellow-600" : "bg-red-500/10 text-red-600"
                                                    )}>
                                                        {item.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0 w-full">
                                                    <h3 className="text-[14px] font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <div className="rounded-lg border border-slate-100 overflow-hidden bg-[#050505]">
                                                        <CodeMirror
                                                            value={item.code}
                                                            height="100px"
                                                            theme="dark"
                                                            extensions={[python()]}
                                                            editable={false}
                                                            basicSetup={{
                                                                lineNumbers: true,
                                                                foldGutter: false,
                                                                dropCursor: false,
                                                                allowMultipleSelections: false,
                                                                indentOnInput: false,
                                                            }}
                                                            className="text-[10px] font-mono"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                                                    <span className="text-[10px] font-mono text-slate-400">Python</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-3 text-[11px] font-mono text-primary hover:bg-primary/10 group/btn"
                                                        onClick={() => handleCopyCode(item.code)}
                                                    >
                                                        Copy <ChevronRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination Arrows and Jump-to-Page for Codes */}
                                <div className="flex flex-wrap items-center justify-center gap-3 mt-6 sm:mt-[3px]">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-lg border border-border/50 hover:bg-primary/20 hover:text-primary disabled:opacity-20"
                                            disabled={currentCodePage === 0}
                                            onClick={() => setCurrentCodePage(prev => Math.max(0, prev - 1))}
                                        >
                                            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                                        </Button>

                                        <div className="flex items-center gap-2 px-3 py-1 bg-muted/10 border border-border/50 rounded-lg">
                                            <span className="text-[11px] font-mono font-bold text-primary">
                                                {currentCodePage + 1}
                                            </span>
                                            <span className="text-[11px] font-mono text-muted-foreground opacity-50">/</span>
                                            <span className="text-[11px] font-mono text-muted-foreground">
                                                {totalCodePages || 1}
                                            </span>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-lg border border-border/50 hover:bg-primary/20 hover:text-primary disabled:opacity-20"
                                            disabled={currentCodePage + 1 >= totalCodePages}
                                            onClick={() => setCurrentCodePage(prev => prev + 1)}
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    {/* Jump to Page Search Bar */}
                                    <div className="relative group">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="text"
                                            placeholder="Jump to..."
                                            value={jumpCodePage}
                                            onChange={(e) => setJumpCodePage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const pageNum = parseInt(jumpCodePage);
                                                    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalCodePages) {
                                                        setCurrentCodePage(pageNum - 1);
                                                        setJumpCodePage("");
                                                    }
                                                }
                                            }}
                                            className="h-7 w-28 pl-7 pr-2 text-[10px] font-mono bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'challenges' && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                                    <h2 className="text-2xl font-bold flex items-center gap-3 text-center sm:text-left">
                                        <Swords className="w-7 h-7 text-secondary" />
                                        Challenge Space
                                    </h2>

                                    {/* Challenge Type Toggle */}
                                    <div className="flex bg-muted/20 p-1 rounded-xl border border-border/50 backdrop-blur-md self-center sm:self-end">
                                        <button
                                            onClick={() => setChallengeType('solutions')}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono transition-all",
                                                challengeType === 'solutions' ? "bg-secondary text-secondary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Code2 className="w-3.5 h-3.5" />
                                            Code Solutions
                                        </button>
                                        <button
                                            onClick={() => setChallengeType('typing')}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono transition-all",
                                                challengeType === 'typing' ? "bg-secondary text-secondary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Keyboard className="w-3.5 h-3.5" />
                                            Typing Challenge
                                        </button>
                                    </div>
                                </div>

                                {challengeType === 'solutions' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 md:px-0">
                                        {/* Play with Computer */}
                                        <div className="bg-white p-5 md:p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all group relative overflow-hidden shadow-sm">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rotate-45 translate-x-8 -translate-y-8 group-hover:bg-primary/10 transition-colors" />
                                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-primary uppercase tracking-widest">
                                                <Monitor className="w-3.5 h-3.5" />
                                                Solo VS AI
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold mb-2 text-slate-900 group-hover:text-primary transition-colors">
                                                Play with Computer
                                            </h3>
                                            <p className="text-[13px] md:text-sm text-slate-600 mb-6 leading-relaxed">
                                                Battle against our advanced AI agent to sharpen your logic skills in a controlled, adaptive environment.
                                            </p>
                                            <div className="pt-4 border-t border-slate-100 mt-auto flex justify-end">
                                                <Button
                                                    onClick={handleStartBattle}
                                                    className="bg-primary hover:bg-primary/90 text-white font-mono text-xs px-6 h-9 rounded-lg"
                                                >
                                                    Start Battle
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Play with a Player */}
                                        <div className="bg-white p-5 md:p-6 rounded-2xl border border-border/50 hover:border-secondary/50 transition-all group relative overflow-hidden shadow-sm flex flex-col">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rotate-45 translate-x-8 -translate-y-8 group-hover:bg-secondary/20 transition-colors" />
                                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-secondary uppercase tracking-widest">
                                                <Swords className="w-3.5 h-3.5" />
                                                PvP Arena
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold mb-2 text-slate-900 group-hover:text-secondary transition-colors">
                                                Play with a Player
                                            </h3>
                                            <p className="text-[13px] md:text-sm text-slate-600 mb-6 leading-relaxed">
                                                Enter the arena and challenge a peer to a real-time competitive programming duel for ultimate bragging rights.
                                            </p>
                                            <div className="pt-4 border-t border-slate-100 mt-auto flex justify-end">
                                                <Button
                                                    onClick={handleFindMatch}
                                                    className="bg-secondary hover:bg-secondary/90 text-white font-mono text-xs px-6 h-9 rounded-lg"
                                                >
                                                    Find Match
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Join as a Moderator */}
                                        <div className="bg-white p-5 md:p-6 rounded-2xl border border-border/50 hover:border-green-500/50 transition-all group relative overflow-hidden shadow-sm flex flex-col">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rotate-45 translate-x-8 -translate-y-8 group-hover:bg-green-500/10 transition-colors" />
                                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-green-600 uppercase tracking-widest">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Instructor Role
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold mb-2 text-slate-900 group-hover:text-green-600 transition-colors">
                                                Join as a Moderator
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                                Create and host a custom challenge room for a specific number of students to join and compete simultaneously.
                                            </p>
                                            <div className="pt-4 border-t border-slate-100 mt-auto flex justify-end">
                                                <Button
                                                    onClick={handleStartModerator}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-mono text-xs px-6 h-9 rounded-lg"
                                                >
                                                    Create Game
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 md:px-0">
                                        {/* Play with Computer */}
                                        <div className="bg-white p-5 md:p-6 rounded-2xl border border-border/50 hover:border-orange-500/50 transition-all group relative overflow-hidden shadow-sm flex flex-col">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rotate-45 translate-x-8 -translate-y-8 group-hover:bg-orange-500/10 transition-colors" />
                                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-orange-600 uppercase tracking-widest">
                                                <Monitor className="w-3.5 h-3.5" />
                                                Solo Typing VS AI
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold mb-2 text-slate-900 group-hover:text-orange-600 transition-colors">
                                                Play with Computer
                                            </h3>
                                            <p className="text-[13px] md:text-sm text-slate-600 mb-6 leading-relaxed">
                                                Test your typing speed and accuracy against our AI. Master complex code snippets under pressure.
                                            </p>
                                            <div className="pt-4 border-t border-slate-100 mt-auto flex justify-end">
                                                <Button
                                                    onClick={() => {
                                                        setIsSoloConfigOpen(true);
                                                        setSoloConfigPhase('selection');
                                                    }}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white font-mono text-xs px-6 h-9 rounded-lg"
                                                >
                                                    Start Typing
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Play with a Player */}
                                        <div className="bg-white p-5 md:p-6 rounded-2xl border border-border/50 hover:border-purple-500/50 transition-all group relative overflow-hidden shadow-sm flex flex-col">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rotate-45 translate-x-8 -translate-y-8 group-hover:bg-purple-500/10 transition-colors" />
                                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-purple-600 uppercase tracking-widest">
                                                <Swords className="w-3.5 h-3.5" />
                                                Typing Duel
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold mb-2 text-slate-900 group-hover:text-purple-600 transition-colors">
                                                Play with a Player
                                            </h3>
                                            <p className="text-[13px] md:text-sm text-slate-600 mb-6 leading-relaxed">
                                                Challenge another student to a real-time typing dual. May the fastest fingers win the prize.
                                            </p>
                                            <div className="pt-4 border-t border-slate-100 mt-auto flex justify-end">
                                                <Button
                                                    onClick={handleFindMatch}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs px-6 h-9 rounded-lg"
                                                >
                                                    Find Rival
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Join as a Moderator */}
                                        <div className="bg-white p-5 md:p-6 rounded-2xl border border-border/50 hover:border-blue-500/50 transition-all group relative overflow-hidden shadow-sm flex flex-col">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rotate-45 translate-x-8 -translate-y-8 group-hover:bg-blue-500/10 transition-colors" />
                                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-blue-600 uppercase tracking-widest">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Competition Host
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">
                                                Join as a Moderator
                                            </h3>
                                            <p className="text-[13px] md:text-sm text-slate-600 mb-6 leading-relaxed">
                                                Create a custom typing challenge room for your students. Monitor their progress in real-time.
                                            </p>
                                            <div className="pt-4 border-t border-slate-100 mt-auto flex justify-end">
                                                <Button
                                                    onClick={handleStartModerator}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs px-6 h-9 rounded-lg"
                                                >
                                                    Create Arena
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Battle Arena View Layer */}
                                {isBattleActive && (
                                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center pt-[76px] px-2 pb-2 sm:p-10 animate-in fade-in duration-300">
                                        <div className="max-w-4xl w-full bg-[#0a0a0a] rounded-xl sm:rounded-3xl border border-white/5 shadow-[0_0_100px_rgba(34,197,94,0.1)] overflow-hidden max-h-full flex flex-col mt-1 sm:mt-0">
                                            {/* Battle Header */}
                                            <div className="p-2 sm:p-5 border-b border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <button
                                                        onClick={() => setIsBattleActive(false)}
                                                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                                    >
                                                        <ArrowLeft className="w-4 h-4" />
                                                    </button>
                                                    <div>
                                                        <h3 className="text-base sm:text-xl font-bold flex items-center gap-2">
                                                            <Zap className="w-5 h-5 text-primary animate-pulse" />
                                                            AI Battlefront
                                                        </h3>
                                                        <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">
                                                            Mission {currentBattleIndex + 1} of {battleChallenges.length} • Sector Alpha-9
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                                                    <Trophy className="w-4 h-4 text-primary" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase tracking-widest text-primary/70 font-bold">Battle Score</span>
                                                        <span className="text-base sm:text-lg font-mono font-bold leading-none">{battleScore}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Battle IDE / Score Section */}
                                            <div className="flex-1 overflow-hidden flex flex-col relative px-1 sm:px-0">
                                                {/* Timer Bar */}
                                                <div className="px-4 py-1.5 sm:px-6 sm:py-2 bg-white/5 border-b border-white/5 flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <Progress
                                                            value={isCountingDown ? 100 : battleTimer}
                                                            className={cn(
                                                                "h-1.5 transition-all duration-100",
                                                                isCountingDown ? "bg-primary/20" : battleTimer > 50 ? "bg-primary/20" : battleTimer > 20 ? "bg-yellow-500/20" : "bg-red-500/20"
                                                            )}
                                                            indicatorClassName={cn(
                                                                "transition-all duration-100",
                                                                isCountingDown ? "bg-primary" : battleTimer > 50 ? "bg-primary" : battleTimer > 20 ? "bg-yellow-500" : "bg-red-500"
                                                            )}
                                                        />
                                                    </div>
                                                    <span className={cn(
                                                        "text-[10px] font-mono font-bold w-12 text-right",
                                                        isCountingDown ? "text-primary" : battleTimer > 50 ? "text-primary" : battleTimer > 20 ? "text-yellow-500" : "text-red-500 animate-pulse"
                                                    )}>
                                                        {isCountingDown ? "3.0s" : `${(battleTimer / 10).toFixed(1)}s`}
                                                    </span>
                                                </div>

                                                <div className={cn(
                                                    "bg-[#050505] border-b border-white/5 relative",
                                                    isCountingDown && "blur-sm grayscale"
                                                )}>
                                                    <CodeMirror
                                                        value={battleChallenges[currentBattleIndex]?.code || ""}
                                                        height="120px"
                                                        theme="dark"
                                                        extensions={[python()]}
                                                        editable={false}
                                                        basicSetup={{
                                                            lineNumbers: true,
                                                            foldGutter: true,
                                                            highlightActiveLine: false,
                                                        }}
                                                        className="text-sm font-mono h-full"
                                                    />
                                                </div>

                                                {/* Start Countdown Overlay */}
                                                {isCountingDown && (
                                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                                        <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                                                <span className="text-8xl font-black font-mono text-primary drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-in zoom-in-50 duration-500">
                                                                    {startCountdown > 0 ? startCountdown : "GO!"}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-mono text-white/60 tracking-[0.4em] uppercase">Analyze Logic...</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Battle Interaction (4 Options) */}
                                            <div className="p-3 sm:p-8 space-y-2 sm:space-y-8 overflow-y-auto">
                                                <div className="space-y-1 sm:space-y-2">
                                                    <h4 className="text-[8px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                                                        <Play className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-primary fill-current" />
                                                        Anticipated Output Result
                                                    </h4>
                                                    <h2 className="text-base sm:text-2xl font-bold font-mono tracking-tighter mb-1">
                                                        {isCountingDown ? startCountdown : battleChallenges[currentBattleIndex]?.title}
                                                    </h2>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {(battleChallenges[currentBattleIndex]?.options || []).map((option, idx) => (
                                                            <button
                                                                key={idx}
                                                                disabled={showBattleFeedback || isCountingDown}
                                                                onClick={() => handleBattleSelection(option)}
                                                                className={cn(
                                                                    "relative h-10 sm:h-20 flex items-center justify-center rounded-lg sm:rounded-2xl border text-[10px] sm:text-base font-bold font-mono transition-all duration-300",
                                                                    battlePrediction === option
                                                                        ? (option === battleChallenges[currentBattleIndex]?.correct
                                                                            ? "bg-green-500/10 border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                                                            : "bg-red-500/10 border-red-500 text-red-500")
                                                                        : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/20 hover:text-white"
                                                                )}
                                                            >
                                                                {option}
                                                                {battlePrediction === option && (
                                                                    <div className="absolute top-2 right-2">
                                                                        {option === battleChallenges[currentBattleIndex]?.correct
                                                                            ? <Check className="w-3 h-3" />
                                                                            : <X className="w-3 h-3" />
                                                                        }
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {showBattleFeedback && (
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5 animate-in slide-in-from-bottom-2">
                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                            <div className={cn(
                                                                "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl",
                                                                battlePrediction === battleChallenges[currentBattleIndex]?.correct ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                                                            )}>
                                                                {battlePrediction === battleChallenges[currentBattleIndex]?.correct ? "+10" : "0"}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-base sm:text-lg">
                                                                    {battlePrediction === null && battleTimer === 0
                                                                        ? "Neural Timeout"
                                                                        : battlePrediction === battleChallenges[currentBattleIndex]?.correct
                                                                            ? "Outstanding Analysis!"
                                                                            : "Logic Mismatch"}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {battlePrediction === null && battleTimer === 0
                                                                        ? "You failed to analyze the logic within the time limit."
                                                                        : battlePrediction === battleChallenges[currentBattleIndex]?.correct
                                                                            ? "You correctly mapped the computer's execution path."
                                                                            : `The computer evaluated this as ${battleChallenges[currentBattleIndex]?.correct}.`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={handleNextBattleItem}
                                                            className="bg-primary hover:bg-primary/90 text-white font-mono px-6 h-10 sm:px-8 sm:h-12 rounded-xl flex items-center gap-2 group"
                                                        >
                                                            {currentBattleIndex < battleChallenges.length - 1 ? "Next Mission" : "Finish Battle"}
                                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Solo Battle Config Dialog */}
                                {isSoloConfigOpen && (
                                    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                                        <div className="max-w-2xl w-full bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(249,115,22,0.1)] overflow-hidden animate-in zoom-in-95 duration-300">
                                            {/* Header */}
                                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                                <div>
                                                    <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                                                        <Monitor className="w-6 h-6 text-orange-500" />
                                                        {soloConfigPhase === 'selection' ? "Configure Challenge" : "Set Difficulty Level"}
                                                    </h3>
                                                    <p className="text-sm text-slate-400 font-mono mt-1">
                                                        {soloConfigPhase === 'selection'
                                                            ? "Select your training parameters"
                                                            : "Choose your execution speed"}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setIsSoloConfigOpen(false)}
                                                    className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Content */}
                                            <div className="p-8">
                                                {soloConfigPhase === 'selection' ? (
                                                    <div className="space-y-8">
                                                        {/* Difficulty Multi-select */}
                                                        <div>
                                                            <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest mb-4">
                                                                Proficiency Levels
                                                            </h4>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                                                                    <button
                                                                        key={lvl}
                                                                        onClick={() => {
                                                                            if (selectedDifficulties.includes(lvl)) {
                                                                                if (selectedDifficulties.length > 1) {
                                                                                    setSelectedDifficulties(prev => prev.filter(d => d !== lvl));
                                                                                }
                                                                            } else {
                                                                                setSelectedDifficulties(prev => [...prev, lvl]);
                                                                            }
                                                                        }}
                                                                        className={cn(
                                                                            "h-12 rounded-xl border font-mono text-xs transition-all",
                                                                            selectedDifficulties.includes(lvl)
                                                                                ? "bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                                                                                : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                                                                        )}
                                                                    >
                                                                        {lvl}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Category Absolute Choice */}
                                                        <div>
                                                            <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-widest mb-4">
                                                                Logic Category
                                                            </h4>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                                                <button
                                                                    onClick={() => setSelectedCategory(null)}
                                                                    className={cn(
                                                                        "h-10 rounded-lg border font-mono text-[10px] transition-all",
                                                                        selectedCategory === null
                                                                            ? "bg-white/10 border-white/20 text-white"
                                                                            : "bg-white/5 border-white/5 text-slate-500 opacity-50"
                                                                    )}
                                                                >
                                                                    Mixed Logic
                                                                </button>
                                                                {availableCategories.map(cat => (
                                                                    <button
                                                                        key={cat}
                                                                        onClick={() => setSelectedCategory(cat)}
                                                                        className={cn(
                                                                            "h-10 px-3 rounded-lg border font-mono text-[10px] truncate transition-all",
                                                                            selectedCategory === cat
                                                                                ? "bg-orange-500/10 border-orange-500/50 text-orange-500"
                                                                                : selectedCategory === null
                                                                                    ? "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                                                                                    : "bg-white/5 border-white/5 text-slate-500 opacity-30 cursor-default"
                                                                        )}
                                                                    >
                                                                        {cat}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {[
                                                            { id: 'easy', label: 'Easy Mode', time: 30, desc: '30 seconds per challenge - Ideal for training.' },
                                                            { id: 'medium', label: 'Medium Mode', time: 20, desc: '20 seconds per challenge - Test your speed.' },
                                                            { id: 'hard', label: 'Hard Mode', time: 10, desc: '10 seconds per challenge - Elite level required.' }
                                                        ].map(mode => (
                                                            <button
                                                                key={mode.id}
                                                                onClick={() => setSelectedTimeLimit(mode.time)}
                                                                className={cn(
                                                                    "p-5 rounded-2xl border text-left transition-all group",
                                                                    selectedTimeLimit === mode.time
                                                                        ? "bg-orange-500/10 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                                                        : "bg-white/5 border-white/5 hover:border-white/10"
                                                                )}
                                                            >
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className={cn(
                                                                        "font-bold text-lg",
                                                                        selectedTimeLimit === mode.time ? "text-orange-500" : "text-white"
                                                                    )}>
                                                                        {mode.label}
                                                                    </span>
                                                                    <span className="font-mono text-xs text-slate-500">
                                                                        {mode.time}s
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-slate-400 leading-relaxed font-mono">
                                                                    {mode.desc}
                                                                </p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="p-8 border-t border-white/5 flex gap-4 bg-white/[0.01]">
                                                {soloConfigPhase === 'time' && (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setSoloConfigPhase('selection')}
                                                        className="h-14 flex-1 border border-white/5 hover:bg-white/5 text-slate-400 font-mono"
                                                    >
                                                        Back
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => {
                                                        if (soloConfigPhase === 'selection') {
                                                            setSoloConfigPhase('time');
                                                        } else {
                                                            handleStartBattle();
                                                        }
                                                    }}
                                                    className="h-14 flex-[2] bg-orange-600 hover:bg-orange-700 text-white font-mono text-lg rounded-xl shadow-xl shadow-orange-600/20"
                                                >
                                                    {soloConfigPhase === 'selection' ? "Continue" : "Initialize Neural Lesson"}
                                                    <ChevronRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PvP Searching Overlay */}
                                {pvpStatus === 'searching' && (
                                    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                                        <div className="max-w-md w-full bg-[#0a0a0a] rounded-3xl border border-primary/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] p-10 text-center space-y-8 animate-in zoom-in-95 duration-300 text-white">
                                            <div className="relative mx-auto w-24 h-24">
                                                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                                <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Globe className="w-8 h-8 text-primary animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-bold font-mono tracking-tighter">Searching for Opponent...</h3>
                                                <p className="text-sm text-slate-400 font-mono italic">Looking for a challenger in the global arena</p>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-primary/60 uppercase tracking-[0.2em]">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Syncing Neural Uplink
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    onClick={handleQuitPvP}
                                                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 font-mono text-xs"
                                                >
                                                    Cancel Search
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PvP Battle Arena */}
                                {isPvPActive && pvpMatch && (
                                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300 text-white">
                                        {/* ─── Scoreboard Header ─── */}
                                        <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 bg-[#0a0a0a]">
                                            {/* Player (You) — Left */}
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary font-mono shrink-0">
                                                    {user?.name?.[0]?.toUpperCase() ?? "?"}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[8px] font-mono text-primary/60 uppercase tracking-wider">Player</span>
                                                    <span className="font-bold font-mono text-sm truncate text-white">{user?.name ?? "You"}</span>
                                                </div>
                                            </div>

                                            {/* Score — Center */}
                                            <div className="flex flex-col items-center mx-4 shrink-0">
                                                <div className="flex items-center gap-3 px-4 py-1 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                                                    <span className="text-2xl font-black font-mono text-primary tabular-nums tracking-tighter">{pvpScore}</span>
                                                    <span className="text-xl font-bold text-slate-500 font-mono">:</span>
                                                    <span className="text-2xl font-black font-mono text-secondary tabular-nums tracking-tighter">{pvpOpponentScore}</span>
                                                </div>
                                                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-0.5">Score</span>
                                            </div>

                                            {/* Opponent — Right */}
                                            <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
                                                <div className="flex flex-col items-end min-w-0">
                                                    <span className="text-[8px] font-mono text-secondary/60 uppercase tracking-wider">Opponent</span>
                                                    <span className="font-bold font-mono text-sm truncate text-white text-right">
                                                        {pvpMatch.player1.email === user?.email ? pvpMatch.player2.name : pvpMatch.player1.name}
                                                    </span>
                                                </div>
                                                <div className="w-8 h-8 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-xs font-bold text-secondary font-mono shrink-0">
                                                    {(pvpMatch.player1.email === user?.email ? pvpMatch.player2.name : pvpMatch.player1.name)?.[0]?.toUpperCase() ?? "?"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timer Bar */}
                                        <div className="px-6 py-1.5 bg-white/[0.03] border-b border-white/5 flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            pvpTimer > 50 ? "bg-primary" : pvpTimer > 20 ? "bg-yellow-500" : "bg-red-500"
                                                        )}
                                                        style={{ width: `${pvpTimer}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-mono font-bold w-10 text-right",
                                                pvpTimer > 50 ? "text-primary" : pvpTimer > 20 ? "text-yellow-500" : "text-red-500 animate-pulse"
                                            )}>
                                                {`${(pvpTimer / 10).toFixed(1)}s`}
                                            </span>
                                            <button
                                                onClick={handleQuitPvP}
                                                className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors ml-1"
                                            >
                                                <X className="w-3.5 h-3.5 text-red-500" />
                                            </button>
                                        </div>

                                        {/* Main Body — Code + Options */}
                                        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                                            {/* Code */}
                                            <div className="p-6 flex flex-col min-h-0 border-r border-white/5 bg-black/30">
                                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                                    <Terminal className="w-3.5 h-3.5" />
                                                    Challenge {currentPvPIndex + 1} / {pvpMatch.challenges.length}
                                                </p>
                                                <div className="flex-1 rounded-2xl border border-white/10 overflow-hidden relative">
                                                    <div className={cn("w-full h-full", isPvPCountingDown && "blur-md grayscale")}>
                                                        <CodeMirror
                                                            value={pvpMatch.challenges[currentPvPIndex]?.code || ""}
                                                            height="100%"
                                                            theme="dark"
                                                            extensions={[python()]}
                                                            editable={false}
                                                            basicSetup={{ lineNumbers: true, foldGutter: true }}
                                                            className="text-sm font-mono h-full"
                                                        />
                                                    </div>
                                                    {isPvPCountingDown && (
                                                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                                                            <span className="text-8xl font-black font-mono text-primary drop-shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-in zoom-in duration-300">
                                                                {pvpStartCountdown}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Options */}
                                            <div className="p-6 space-y-6 overflow-y-auto">
                                                <div className="space-y-4">
                                                    <h2 className="text-xl font-bold font-mono tracking-tighter">
                                                        {isPvPCountingDown ? "Get Ready..." : pvpMatch.challenges[currentPvPIndex]?.title}
                                                    </h2>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {(pvpMatch.challenges[currentPvPIndex]?.options || []).map((option: any) => (
                                                            <button
                                                                key={option}
                                                                disabled={showPvPFeedback || pvpTimer === 0 || isPvPCountingDown}
                                                                onClick={() => handlePvPSelection(option)}
                                                                className={cn(
                                                                    "p-4 rounded-xl border font-mono text-xs transition-all relative text-left",
                                                                    pvpPrediction === option
                                                                        ? option === pvpMatch.challenges[currentPvPIndex]?.correct
                                                                            ? "bg-green-500/10 border-green-500 text-green-400"
                                                                            : "bg-red-500/10 border-red-500 text-red-400"
                                                                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/30"
                                                                )}
                                                            >
                                                                {option}
                                                                {pvpPrediction === option && (
                                                                    <span className="absolute top-2 right-2">
                                                                        {option === pvpMatch.challenges[currentPvPIndex]?.correct
                                                                            ? <Check className="w-3 h-3 animate-in zoom-in" />
                                                                            : <X className="w-3 h-3 animate-in zoom-in" />}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {showPvPFeedback && (
                                                    <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/10 space-y-4 animate-in slide-in-from-bottom-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border",
                                                                pvpPrediction === pvpMatch.challenges[currentPvPIndex]?.correct
                                                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                                                            )}>
                                                                {pvpPrediction === pvpMatch.challenges[currentPvPIndex]?.correct ? "+10" : "0"}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold">
                                                                    {pvpPrediction === pvpMatch.challenges[currentPvPIndex]?.correct ? "Correct!" : "Wrong!"}
                                                                </p>
                                                                <p className="text-sm text-slate-400 font-mono">
                                                                    {pvpPrediction === pvpMatch.challenges[currentPvPIndex]?.correct
                                                                        ? "You got it right before your opponent!"
                                                                        : `Answer: ${pvpMatch.challenges[currentPvPIndex]?.correct}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={handleNextPvPItem}
                                                            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-mono rounded-xl group"
                                                        >
                                                            {currentPvPIndex < pvpMatch.challenges.length - 1 ? "Next Challenge" : "Finish Match"}
                                                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isModeratorActive && (
                                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
                                        <div className="max-w-6xl w-full bg-[#0a0a0a] rounded-3xl border border-white/5 shadow-[0_0_100px_rgba(34,197,94,0.1)] overflow-hidden flex flex-col md:flex-row h-[80vh]">
                                            {/* Main Content: IDE */}
                                            <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
                                                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => setIsModeratorActive(false)}
                                                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                                        >
                                                            <ArrowLeft className="w-4 h-4" />
                                                        </button>
                                                        <div>
                                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                                                {moderatorPhase === 'waiting' ? "Waiting Room" : "Moderator Challenge Room"}
                                                            </h3>
                                                            <p className="text-xs text-muted-foreground font-mono">
                                                                {moderatorPhase === 'waiting'
                                                                    ? `${JOINED_STUDENTS.length} Students Connected`
                                                                    : `Mission Preview ${currentModeratorIndex + 1} of ${allFilteredCodes.length}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-hidden bg-[#050505] relative p-6">
                                                    {moderatorPhase === 'waiting' ? (
                                                        <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
                                                            <div className="mb-8 flex items-center justify-between">
                                                                <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                                                    <Users2 className="w-4 h-4 text-primary" />
                                                                    Connected Students
                                                                </h4>
                                                                <div className="px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                                                    <span className="text-[10px] font-mono text-green-500 font-bold uppercase tracking-wider">Room Live</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar max-h-[55vh]">
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-4 pb-10">
                                                                    {JOINED_STUDENTS.map(student => (
                                                                        <div key={student.id} className="flex flex-col items-center gap-2 group transition-all animate-in fade-in zoom-in-95 duration-300">
                                                                            <div className="relative">
                                                                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary group-hover:scale-105 transition-transform shadow-lg shadow-primary/5">
                                                                                    {student.avatar}
                                                                                </div>
                                                                                <div className={cn(
                                                                                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#050505]",
                                                                                    student.status === 'ready' ? "bg-green-500" : "bg-yellow-500"
                                                                                )} />
                                                                            </div>
                                                                            <p className="text-[10px] font-mono font-bold text-slate-400 truncate w-full text-center group-hover:text-primary transition-colors">
                                                                                {student.name}
                                                                            </p>
                                                                        </div>
                                                                    ))}

                                                                    {/* Empty slots to indicate capacity */}
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <div key={`empty-${i}`} className="flex flex-col items-center gap-2 opacity-5">
                                                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-dashed border-white flex items-center justify-center">
                                                                                <Users2 className="w-6 h-6 text-white" />
                                                                            </div>
                                                                            <div className="h-2 w-10 bg-white/20 rounded-full" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="mt-auto pt-6 border-t border-white/5 flex justify-center">
                                                                <Button
                                                                    onClick={handleStartMission}
                                                                    className="h-12 px-10 bg-primary hover:bg-primary/90 text-white font-mono text-sm rounded-xl shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 transition-transform"
                                                                >
                                                                    Start Mission
                                                                    <Play className="w-4 h-4 fill-current" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-green-500/10 rounded-md border border-green-500/20">
                                                                <span className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">Instructor Preview</span>
                                                            </div>
                                                            <CodeMirror
                                                                value={allFilteredCodes[currentModeratorIndex]?.code || ""}
                                                                height="100%"
                                                                theme="dark"
                                                                extensions={[python()]}
                                                                editable={false}
                                                                basicSetup={{
                                                                    lineNumbers: true,
                                                                    foldGutter: true,
                                                                }}
                                                                className="text-sm font-mono h-full"
                                                            />
                                                        </>
                                                    )}
                                                </div>

                                                <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                                                            {moderatorPhase === 'waiting'
                                                                ? `Access Code: ${roomCode}`
                                                                : <span className="text-xs font-mono font-bold text-blue-600">
                                                                    Active Challenge: {allFilteredCodes[currentModeratorIndex]?.title}
                                                                </span>}
                                                        </span>
                                                    </div>
                                                    {moderatorPhase === 'active' && (
                                                        <Button
                                                            onClick={handleNextModeratorItem}
                                                            className="bg-primary hover:bg-primary/90 text-white font-mono px-6 h-10 rounded-xl flex items-center gap-2 group"
                                                        >
                                                            {currentModeratorIndex < allFilteredCodes.length - 1 ? "Next Mission" : "Finish Review"}
                                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sidebar: Invites & Management */}
                                            <div className="w-full md:w-80 bg-white/[0.02] p-8 flex flex-col gap-8">
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                                            <Users2 className="w-4 h-4 text-primary" />
                                                            Invitations
                                                        </h4>
                                                        <p className="text-xs text-slate-400 leading-relaxed font-mono">
                                                            Students can join this session using the following generated link.
                                                        </p>
                                                    </div>

                                                    {!isLinkGenerated ? (
                                                        <Button
                                                            onClick={handleGenerateLink}
                                                            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-mono text-sm rounded-xl shadow-lg shadow-green-600/10"
                                                        >
                                                            Generate Join Link
                                                        </Button>
                                                    ) : (
                                                        <div className="space-y-4 animate-in slide-in-from-right-4">
                                                            <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Access Code</span>
                                                                    <span className="text-[10px] font-mono text-green-500 uppercase">Live</span>
                                                                </div>
                                                                <div className="text-2xl font-mono font-bold tracking-widest text-center py-2 border-y border-white/5">
                                                                    {roomCode}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full h-12 border-white/10 hover:bg-white/5 font-mono text-xs"
                                                                onClick={handleGenerateLink}
                                                            >
                                                                Copy Link Again
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                                                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                                                        <span>Live Status</span>
                                                        <span className="text-green-500">Active</span>
                                                    </div>
                                                    <Button
                                                        className="w-full h-10 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 font-mono text-xs font-bold"
                                                        onClick={() => setIsModeratorActive(false)}
                                                    >
                                                        Terminate Room
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Coming Soon/Power for Universities message */}
                                <div className="mt-12 p-8 rounded-3xl bg-primary/5 border border-primary/20 text-center">
                                    <BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                                    <h3 className="text-2xl font-bold mb-2 italic">Institutional Power</h3>
                                    <p className="text-muted-foreground max-w-2xl mx-auto">
                                        The Challenge Space is being optimized for university-wide hackathons and academic assessments.
                                        Real-time leaderboards and peer-to-peer verification logic coming soon.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default InfiniteSpace;
