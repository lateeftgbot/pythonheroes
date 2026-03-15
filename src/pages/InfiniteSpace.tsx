import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import AppDrawer from "@/components/AppDrawer";
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
    BookOpen,
    LayoutGrid,
    User,
    LogOut,
    MessageCircle,
    Medal,
    Star,
    Home,
    Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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

// Mock Leaderboard Data
interface LeaderboardPlayer {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    score: number;
    rank: number;
}
const MOCK_LEADERBOARD: LeaderboardPlayer[] = [
    { id: '1', username: 'neural_ninja', name: 'Alina', score: 9850, rank: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alina' },
    { id: '2', username: 'quantum_coder', name: 'Marcus', score: 8720, rank: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
    { id: '3', username: 'byte_weaver', name: 'Sarah', score: 8150, rank: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: '4', username: 'logic_lord', name: 'David', score: 7400, rank: 4 },
    { id: '5', username: 'syntax_samurai', name: 'Elena', score: 6900, rank: 5 },
    { id: '6', username: 'algo_master', name: 'James', score: 6500, rank: 6 },
    { id: '7', username: 'code_whisperer', name: 'Lily', score: 5800, rank: 7 },
];

const InfiniteSpace = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Read initial state from URL
    const initialTab = (searchParams.get('tab') as Tab) || 'problems';

    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
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
    const ITEMS_PER_PAGE = 10;

    // PvP States
    const [pvpStatus, setPvpStatus] = useState<'idle' | 'searching' | 'matched'>('idle');
    const [pvpMatch, setPvpMatch] = useState<any>(null);
    const [isPvPActive, setIsPvPActive] = useState(false);
    const [currentPvPIndex, setCurrentPvPIndex] = useState(0);
    const [pvpScore, setPvpScore] = useState(0);
    const [pvpOpponentScore, setPvpOpponentScore] = useState(0);
    const [pvpPointsAwarded, setPvpPointsAwarded] = useState(0);
    const [pvpPrediction, setPvpPrediction] = useState<number | string | null>(null);
    const [showPvPFeedback, setShowPvPFeedback] = useState(false);
    const [pvpTimer, setPvpTimer] = useState(100);
    const [isPvPTimerPaused, setIsPvPTimerPaused] = useState(false);
    const [pvpStartCountdown, setPvpStartCountdown] = useState(3);
    const [isPvPCountingDown, setIsPvPCountingDown] = useState(true);
    const [isPvPSyncing, setIsPvPSyncing] = useState(false);

    // Matchmaking Notification States
    const [showMatchFoundNotification, setShowMatchFoundNotification] = useState(false);
    const [opponentInfo, setOpponentInfo] = useState<{ name: string } | null>(null);

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
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(searchParams.get('leaderboard') === 'true');
    const [leaderboardCategory, setLeaderboardCategory] = useState<'Global' | 'Solo' | 'PvP' | 'Challenges'>('Global');

    // Battle Loading / Sync Overlay
    const BattleLoadingOverlay = () => (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0a0a0a] rounded-none border border-primary/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] p-10 text-center space-y-8 animate-in zoom-in-95 duration-300 text-white">
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

    // Match Found Overlay
    const MatchFoundOverlay = ({ opponentName }: { opponentName: string }) => (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gradient-to-b from-[#0a0a0a] to-black rounded-[2.5rem] border border-primary/30 shadow-[0_0_80px_rgba(34,197,94,0.15)] p-12 text-center space-y-8 animate-in zoom-in-90 fade-in duration-500 text-white relative overflow-hidden">
                <button
                    onClick={handleQuitPvP}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors z-[130]"
                >
                    <X className="w-5 h-5" />
                </button>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-[60px]" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-[60px]" />

                <div className="relative">
                    <div className="mx-auto w-28 h-28 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-primary/5 rounded-none animate-ping opacity-20" />
                        <Swords className="w-12 h-12 text-primary animate-bounce-slow" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-4 border-[#0a0a0a] animate-in zoom-in-50 delay-300">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 relative">
                    <div className="space-y-1">
                        <h3 className="text-sm font-mono text-primary uppercase tracking-[0.4em] font-bold">Match Confirmed</h3>
                        <h2 className="text-4xl font-black font-mono tracking-tighter">Congratulations!</h2>
                    </div>

                    <div className="py-6 px-4 bg-white/5 rounded-none border border-white/10 backdrop-blur-sm">
                        <p className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-widest">You are matched with</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            {opponentName}
                        </p>
                    </div>

                    <p className="text-[10px] text-slate-500 font-mono italic animate-pulse">
                        Synchronizing battle sectors... Get ready!
                    </p>
                </div>

                <div className="pt-2">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-progress-fast" />
                    </div>
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
                    const response = await fetch(`/api/learning/pvp/status?email=${encodeURIComponent(user.email.toLowerCase())}`);
                    const data = await response.json();
                    if (data.status === 'matched') {
                        // Only initialize if we're moving from 'searching' to 'matched' AND not already syncing
                        if (pvpStatus === 'searching' && !isPvPSyncing) {
                            setIsPvPSyncing(true);
                            const opponent = data.match.player1.email.toLowerCase() === user.email.toLowerCase()
                                ? data.match.player2
                                : data.match.player1;

                            setOpponentInfo({ name: opponent.name });
                            setShowMatchFoundNotification(true);

                            // Delay the start of the game to show the "Matched" card
                            setTimeout(() => {
                                setShowMatchFoundNotification(false);
                                setIsPvPActive(true);
                                setCurrentPvPIndex(0);
                                setPvpScore(0);
                                setPvpStartCountdown(3);
                                setIsPvPCountingDown(true);
                                setPvpStatus('matched');
                                setIsPvPSyncing(false);
                            }, 4000);
                        }

                        setPvpMatch(data.match);

                        // Sync opponent score
                        if (data.match.player1.email.toLowerCase() === user.email.toLowerCase()) {
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
        setPvpMatch(null);
        // Force-clear any hanging session on server before joining
        try {
            await fetch('/api/learning/pvp/quit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email.toLowerCase() })
            });
        } catch (e) { /* ignore */ }

        try {
            const response = await fetch('/api/learning/pvp/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email.toLowerCase(),
                    name: user.name,
                    difficulty: difficulty === 'All' ? 'Beginner' : difficulty
                })
            });
            const data = await response.json();
            if (data.status === 'matched' && !isPvPSyncing) {
                setIsPvPSyncing(true);
                const opponent = data.match.player1.email.toLowerCase() === user.email.toLowerCase()
                    ? data.match.player2
                    : data.match.player1;

                setOpponentInfo({ name: opponent.name });
                setShowMatchFoundNotification(true);
                setPvpMatch(data.match);

                // Delay the start of the game
                setTimeout(() => {
                    setShowMatchFoundNotification(false);
                    setPvpStatus('matched');
                    setIsPvPActive(true);
                    setCurrentPvPIndex(0);
                    setPvpScore(0);
                    // Start sequence
                    setPvpStartCountdown(3);
                    setIsPvPCountingDown(true);
                    setIsPvPSyncing(false);
                }, 4000);
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
                body: JSON.stringify({ email: user.email.toLowerCase() })
            });
        }
        setPvpStatus('idle');
        setPvpMatch(null);
        setIsPvPActive(false);
        setIsPvPSyncing(false);
    };

    const handlePvPSelection = async (prediction: number | string) => {
        if (!pvpMatch || !user) return;
        setPvpPrediction(prediction);
        setShowPvPFeedback(true);
        setIsPvPTimerPaused(true);

        let newScore = pvpScore;
        let pointsAwarded = 0;
        if (prediction === pvpMatch.challenges[currentPvPIndex]?.correct) {
            pointsAwarded = Math.max(1, Math.floor(pvpTimer));
            newScore += pointsAwarded;
            setPvpScore(newScore);
            setPvpPointsAwarded(pointsAwarded);
        } else {
            setPvpPointsAwarded(0);
        }

        // Update score on backend
        try {
            await fetch('/api/learning/pvp/update-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    match_id: pvpMatch.match_id,
                    email: user.email.toLowerCase(),
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
        let interval: NodeJS.Timeout | null = null;
        if (isBattleActive && isCountingDown) {
            interval = setInterval(() => {
                setStartCountdown((prev) => {
                    if (prev <= 0.1) {
                        setIsCountingDown(false);
                        return 0;
                    }
                    return parseFloat((prev - 0.1).toFixed(1));
                });
            }, 100);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isBattleActive, isCountingDown]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isBattleActive && !isTimerPaused && !isCountingDown) {
            interval = setInterval(() => {
                setBattleTimer((prev) => {
                    const decrement = 10 / selectedTimeLimit;
                    const nextValue = Math.max(0, prev - decrement);
                    if (nextValue === 0) {
                        // Delay the feedback slightly to ensure user sees 0.0s
                        setTimeout(() => {
                            setBattlePrediction(null);
                            setShowBattleFeedback(true);
                            setIsTimerPaused(true);
                        }, 50);
                    }
                    return nextValue;
                });
            }, 100);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isBattleActive, isTimerPaused, isCountingDown, selectedTimeLimit]);

    // PvP Countdown Decrementer
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPvPActive && isPvPCountingDown) {
            interval = setInterval(() => {
                setPvpStartCountdown((prev) => {
                    if (prev <= 0.1) {
                        setIsPvPCountingDown(false);
                        setPvpTimer(100);
                        return 0;
                    }
                    return parseFloat((prev - 0.1).toFixed(1));
                });
            }, 100);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPvPActive, isPvPCountingDown]);

    // PvP Timer Decay Logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPvPActive && !isPvPTimerPaused && !isPvPCountingDown) {
            const timeLimit = 10; // Fixed 10s for PvP
            interval = setInterval(() => {
                setPvpTimer((prev) => {
                    const decrement = 1; // 1 point per 0.1s (10 points per second)
                    const nextValue = Math.max(0, prev - decrement);
                    if (nextValue === 0) {
                        setTimeout(() => {
                            setPvpPrediction(null);
                            setShowPvPFeedback(true);
                            setIsPvPTimerPaused(true);
                        }, 50);
                    }
                    return nextValue;
                });
            }, 100);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPvPActive, isPvPTimerPaused, isPvPCountingDown, difficulty]);

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

            // Save results to backend
            if (user?.email) {
                fetch('/api/learning/solo/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email.toLowerCase(),
                        score: battleScore,
                        difficulty: difficulty === 'All' ? 'Mixed' : difficulty,
                        challenges_count: battleChallenges.length
                    })
                }).catch(err => console.error("Failed to save solo battle:", err));
            }
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
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 flex flex-col font-mono">
            <Navbar />

            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />
            </div>

            {isBattleLoading && <BattleLoadingOverlay />}
            {showMatchFoundNotification && opponentInfo && <MatchFoundOverlay opponentName={opponentInfo.name} />}

            <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-6 sm:px-10 pt-20 pb-10 relative z-10 overflow-y-auto custom-scrollbar">
                {/* Header Section - Brutalist */}
                <div className="mb-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                    <div className="space-y-1">
                        <Link to="/python-heroes" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors group uppercase tracking-widest font-black">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-3">
                            INFINITE <span className="text-primary italic">SPACE</span>
                            <BrainCircuit className="w-5 h-5 text-primary" />
                        </h1>
                        <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">University Programming Playground &bull; Logic Mastery Engine</p>
                    </div>

                    {/* Quick Stats - Square */}
                    <div className="flex gap-[1px] bg-white/10 p-[1px] shrink-0">
                        <div className="px-3 py-1.5 bg-[#0a0a0a] border border-white/5 flex flex-col items-center min-w-[70px]">
                            <p className="text-[7px] font-bold text-primary uppercase tracking-[0.2em]">PROBLEMS</p>
                            <p className="text-sm font-black">{problems.length}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-[#0a0a0a] border border-white/5 flex flex-col items-center min-w-[60px]">
                            <p className="text-[7px] font-bold text-secondary uppercase tracking-[0.2em]">CODES</p>
                            <p className="text-sm font-black">{allCodePredictions.length}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-[#0a0a0a] border border-white/5 flex flex-col items-center min-w-[60px]">
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em]">ARENA</p>
                            <p className="text-sm font-black">3</p>
                        </div>
                    </div>
                </div>

                {/* Tab Bar - Brutalist Square */}
                <div className="flex mb-0 shrink-0 self-start w-full h-8">
                    <button
                        onClick={() => { setActiveTab('problems'); setCurrentPage(0); }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 px-4 font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-200 border-t border-l border-r border-white/10 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.1)]",
                            activeTab === 'problems'
                                ? "bg-primary text-[#0a0a0a]"
                                : "bg-primary/10 text-primary/60 hover:bg-primary/20 hover:text-primary"
                        )}
                    >
                        <BrainCircuit className="w-3 h-3" />
                        Problems
                        <span className="opacity-50 text-[8px]">[{filteredProblems.length}]</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('codes'); setFocusedCodeId(null); }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 px-4 font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-200 border-t border-r border-white/10 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.1)]",
                            activeTab === 'codes'
                                ? "bg-secondary text-[#0a0a0a]"
                                : "bg-secondary/10 text-secondary/60 hover:bg-secondary/20 hover:text-secondary"
                        )}
                    >
                        <Code2 className="w-3 h-3" />
                        Codes
                        <span className="opacity-50 text-[8px]">[{allCodePredictions.length}]</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('challenges')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 px-4 font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-200 border-t border-r border-white/10 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.1)]",
                            activeTab === 'challenges'
                                ? "bg-emerald-500 text-[#0a0a0a]"
                                : "bg-emerald-500/10 text-emerald-400/70 hover:bg-emerald-500/20 hover:text-emerald-400"
                        )}
                    >
                        <Swords className="w-3 h-3" />
                        Challenges
                    </button>
                </div>

                {/* Difficulty Filter - Coloured Square Buttons */}
                {activeTab !== 'challenges' && (
                    <div className="flex gap-[1px] bg-white/5 p-[1px] mb-0 shrink-0">
                        {/* ALL */}
                        <button
                            onClick={() => { setDifficulty('All'); setFocusedCodeId(null); setCurrentPage(0); setCurrentCodePage(0); }}
                            className={cn(
                                "flex-1 px-2 py-1 text-[8px] font-black uppercase tracking-[0.15em] transition-all border",
                                difficulty === 'All'
                                    ? "bg-violet-600 text-white border-violet-700"
                                    : "bg-violet-950 text-violet-400 border-violet-800 hover:bg-violet-900"
                            )}
                        >
                            All
                        </button>
                        {/* BEGINNER */}
                        <button
                            onClick={() => { setDifficulty('Beginner'); setFocusedCodeId(null); setCurrentPage(0); setCurrentCodePage(0); }}
                            className={cn(
                                "flex-1 px-2 py-1 text-[8px] font-black uppercase tracking-[0.15em] transition-all border",
                                difficulty === 'Beginner'
                                    ? "bg-emerald-500 text-black border-emerald-600"
                                    : "bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900"
                            )}
                        >
                            Beginner
                        </button>
                        {/* INTERMEDIATE */}
                        <button
                            onClick={() => { setDifficulty('Intermediate'); setFocusedCodeId(null); setCurrentPage(0); setCurrentCodePage(0); }}
                            className={cn(
                                "flex-1 px-2 py-1 text-[8px] font-black uppercase tracking-[0.15em] transition-all border",
                                difficulty === 'Intermediate'
                                    ? "bg-amber-400 text-black border-amber-500"
                                    : "bg-amber-950 text-amber-400 border-amber-800 hover:bg-amber-900"
                            )}
                        >
                            Intermediate
                        </button>
                        {/* ADVANCED */}
                        <button
                            onClick={() => { setDifficulty('Advanced'); setFocusedCodeId(null); setCurrentPage(0); setCurrentCodePage(0); }}
                            className={cn(
                                "flex-1 px-2 py-1 text-[8px] font-black uppercase tracking-[0.15em] transition-all border",
                                difficulty === 'Advanced'
                                    ? "bg-rose-600 text-white border-rose-700"
                                    : "bg-rose-950 text-rose-400 border-rose-800 hover:bg-rose-900"
                            )}
                        >
                            Advanced
                        </button>
                    </div>
                )}



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
                    <div className="flex-1 w-full flex flex-col">
                        {activeTab === 'problems' && (
                            <div className="flex-1 flex flex-col gap-0">
                                {/* Problems Container - Yellowish-White Square */}
                                <div className="flex-1 bg-[#fdf6e3] text-[#1a1a1a] border border-white/10 flex flex-col p-3 sm:p-4">
                                    <p className="text-[7px] font-black text-[#555] uppercase tracking-[0.4em] mb-3 flex items-center gap-3">
                                        <span className="h-[1px] w-4 bg-black/30" />
                                        PROBLEMS_SECTOR // UNIVERSITY_LOGIC_NODES
                                        <span className="h-[1px] w-4 bg-black/30" />
                                    </p>
                                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar-brutalist">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {filteredProblems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE).map((problem, idx) => (
                                            <div
                                                key={problem.id}
                                                onClick={() => setSelectedProblem(problem)}
                                                className="group relative bg-white border-2 border-black p-3 transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2 cursor-pointer"
                                            >
                                                <div className="flex w-full items-start justify-between gap-2">
                                                    <div className="w-7 h-7 flex shrink-0 items-center justify-center text-[11px] font-black border-2 border-[#1a1a1a] text-white bg-[#1a1a1a]">
                                                        {currentPage * ITEMS_PER_PAGE + idx + 1}
                                                    </div>
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest border border-black/70",
                                                        problem.difficulty === 'Beginner' ? "bg-emerald-500 text-black" :
                                                            problem.difficulty === 'Intermediate' ? "bg-amber-400 text-black" : "bg-red-600 text-white"
                                                    )}>
                                                        {problem.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0 w-full">
                                                    <h3 className="text-[12px] font-black text-[#1a1a1a] mb-1 group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">
                                                        {problem.title}
                                                    </h3>
                                                    <p className="text-[10px] text-[#4a4a4a] leading-snug font-semibold">
                                                        {problem.description?.slice(0, 80)}{problem.description?.length > 80 ? '...' : ''}
                                                    </p>
                                                </div>
                                                <div className="w-full pt-1.5 border-t border-black/10 flex items-center justify-between mt-auto">
                                                    <span className="text-[8px] font-black text-[#777] uppercase tracking-widest">{problem.category}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest bg-primary text-black px-2.5 py-1 group-hover:bg-[#1a1a1a] group-hover:text-white transition-colors">
                                                        VIEW &rsaquo;
                                                    </span>
                                                </div>
                                            </div>
                                        ))}\n
                                        </div>
                                    </div>
                                </div>

                                {/* Pagination - Brutalist Square */}
                                <div className="flex items-center justify-center gap-[1px] bg-white/5 p-[1px] mt-0">
                                    <button
                                        disabled={currentPage === 0}
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        className="px-4 py-2 text-[10px] font-black uppercase border border-white/10 bg-[#0a0a0a] text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        &laquo; PREV
                                    </button>
                                    <div className="px-6 py-2 text-[10px] font-black border border-white/10 bg-white text-[#0a0a0a]">
                                        {currentPage + 1} / {Math.ceil(filteredProblems.length / ITEMS_PER_PAGE)}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="JUMP"
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
                                            className="h-[34px] w-20 text-center text-[10px] font-black uppercase bg-[#0a0a0a] border border-white/10 text-white rounded-none focus:border-primary"
                                        />
                                    </div>
                                    <button
                                        disabled={(currentPage + 1) * ITEMS_PER_PAGE >= filteredProblems.length}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="px-4 py-2 text-[10px] font-black uppercase border border-white/10 bg-[#0a0a0a] text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        NEXT &raquo;
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'codes' && (
                            <div className="flex-1 flex flex-col gap-0">
                                {/* Projects Container - Yellowish-White Square */}
                                <div className="flex-1 bg-[#fdf6e3] text-[#1a1a1a] border border-white/10 flex flex-col p-3 sm:p-4">
                                    <p className="text-[7px] font-black text-[#555] uppercase tracking-[0.4em] mb-3 flex items-center gap-3">
                                        <span className="h-[1px] w-4 bg-black/30" />
                                        PROJECT_LOGIC_MATRIX // PYTHON_LOGIC_NODES
                                        <span className="h-[1px] w-4 bg-black/30" />
                                    </p>
                                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar-brutalist">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {paginatedCodes.map((item, idx) => (
                                                <div key={item.id} className="group relative bg-white border-2 border-black p-3 transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2 overflow-hidden text-[#1a1a1a]">
                                                    <div className="flex w-full items-start justify-between gap-2">
                                                        <div className="w-7 h-7 flex shrink-0 items-center justify-center text-[11px] font-black border-2 border-[#1a1a1a] text-white bg-[#1a1a1a]">
                                                            {currentCodePage * ITEMS_PER_PAGE + idx + 1}
                                                        </div>
                                                        <span className={cn(
                                                            "px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest border border-black/70",
                                                            item.difficulty === 'Beginner' ? "bg-emerald-500 text-black" :
                                                                item.difficulty === 'Intermediate' ? "bg-amber-400 text-black" : "bg-red-600 text-white"
                                                        )}>
                                                            {item.difficulty}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 w-full">
                                                        <h3 className="text-[11px] font-black text-[#1a1a1a] mb-1.5 line-clamp-1 group-hover:text-secondary transition-colors uppercase tracking-tight">
                                                            {item.title}
                                                        </h3>
                                                        <div className="border border-black/10 overflow-hidden bg-[#050505]">
                                                            <CodeMirror
                                                                value={item.code}
                                                                height="80px"
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
                                                    <div className="w-full pt-1.5 border-t border-black/10 flex items-center justify-between mt-auto">
                                                        <span className="text-[8px] font-black text-[#777] uppercase tracking-widest">Python</span>
                                                        <button
                                                            className="text-[8px] font-black uppercase tracking-widest bg-[#1a1a1a] text-white px-2.5 py-1 hover:bg-secondary hover:text-black transition-colors"
                                                            onClick={() => handleCopyCode(item.code)}
                                                        >
                                                            COPY &rsaquo;
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Pagination - Brutalist Square */}
                                <div className="flex items-center justify-center gap-[1px] bg-white/5 p-[1px] mt-0">
                                    <button
                                        disabled={currentCodePage === 0}
                                        onClick={() => setCurrentCodePage(prev => Math.max(0, prev - 1))}
                                        className="px-4 py-2 text-[10px] font-black uppercase border border-white/10 bg-[#0a0a0a] text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        &laquo; PREV
                                    </button>
                                    <div className="px-6 py-2 text-[10px] font-black border border-white/10 bg-white text-[#0a0a0a]">
                                        {currentCodePage + 1} / {totalCodePages || 1}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="JUMP"
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
                                            className="h-[34px] w-20 text-center text-[10px] font-black uppercase bg-[#0a0a0a] border border-white/10 text-white rounded-none focus:border-secondary"
                                        />
                                    </div>
                                    <button
                                        disabled={currentCodePage + 1 >= totalCodePages}
                                        onClick={() => setCurrentCodePage(prev => prev + 1)}
                                        className="px-4 py-2 text-[10px] font-black uppercase border border-white/10 bg-[#0a0a0a] text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        NEXT &raquo;
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'challenges' && (
                            <div className="flex-1 bg-[#fdf6e3] text-[#0a0a0a] border border-white/10 flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar-brutalist">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                                    <span className="h-[2px] w-6 bg-black/20" />
                                    CHALLENGE_ARENA // SELECT_MODE
                                    <span className="h-[2px] w-6 bg-black/20" />
                                </p>

                                {/* Challenge type picker - square */}
                                <div className="flex w-full gap-[1px] bg-black/10 p-[1px] mb-6">
                                    <button
                                        onClick={() => setChallengeType('solutions')}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 px-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                            challengeType === 'solutions' ? "bg-[#0a0a0a] text-white" : "text-slate-600 hover:bg-black/10"
                                        )}
                                    >
                                        <Code2 className="w-3.5 h-3.5" />
                                        <span className="truncate">Solutions</span>
                                    </button>
                                    <button
                                        onClick={() => setChallengeType('typing')}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 px-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                            challengeType === 'typing' ? "bg-[#0a0a0a] text-white" : "text-slate-600 hover:bg-black/10"
                                        )}
                                    >
                                        <Keyboard className="w-3.5 h-3.5" />
                                        <span className="truncate">Typing</span>
                                    </button>
                                </div>

                                {challengeType === 'solutions' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Play with Computer */}
                                        <div className="group relative bg-white border-2 border-black p-5 transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-primary text-black shrink-0">
                                                    <Monitor className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">SOLO_VS_AI</p>
                                                    <h3 className="text-base font-black uppercase tracking-tighter leading-tight">Play with Computer</h3>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight leading-tight opacity-80">
                                                Battle our advanced AI agent. Sharpen your logic in a controlled, adaptive environment.
                                            </p>
                                            <button
                                                onClick={handleStartBattle}
                                                className="mt-auto w-full py-2.5 bg-[#0a0a0a] text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-colors border-2 border-black"
                                            >
                                                START BATTLE &rsaquo;
                                            </button>
                                        </div>

                                        {/* Play with a Player */}
                                        <div className="group relative bg-white border-2 border-black p-5 transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-secondary text-black shrink-0">
                                                    <Swords className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">PVP_ARENA</p>
                                                    <h3 className="text-base font-black uppercase tracking-tighter leading-tight">Play with a Player</h3>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight leading-tight opacity-80">
                                                Challenge a peer to a real-time competitive programming duel. Ultimate bragging rights await.
                                            </p>
                                            <button
                                                onClick={handleFindMatch}
                                                className="mt-auto w-full py-2.5 bg-[#0a0a0a] text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-black transition-colors border-2 border-black"
                                            >
                                                FIND MATCH &rsaquo;
                                            </button>
                                        </div>

                                        {/* Join as a Moderator */}
                                        <div className="group relative bg-white border-2 border-[#0a0a0a]/5 hover:border-emerald-600 p-5 transition-all duration-200 flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-emerald-500 text-black shrink-0">
                                                    <ShieldCheck className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">INSTRUCTOR_ROLE</p>
                                                    <h3 className="text-base font-black uppercase tracking-tighter leading-tight">Join as Moderator</h3>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight leading-tight opacity-80">
                                                Host a custom challenge room for students to join and compete simultaneously.
                                            </p>
                                            <button
                                                onClick={handleStartModerator}
                                                className="mt-auto w-full py-2.5 bg-[#0a0a0a] text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-colors border-2 border-black"
                                            >
                                                CREATE ARENA &rsaquo;
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Typing: Play with Computer */}
                                        <div className="group relative bg-white border-2 border-[#0a0a0a]/5 hover:border-orange-500 p-5 transition-all duration-200 flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-orange-500 text-black shrink-0">
                                                    <Monitor className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">SOLO_TYPING_VS_AI</p>
                                                    <h3 className="text-base font-black uppercase tracking-tighter leading-tight">Play with Computer</h3>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight leading-tight opacity-80">
                                                Test your typing speed against our AI. Master complex code snippets under pressure.
                                            </p>
                                            <button
                                                onClick={() => { setIsSoloConfigOpen(true); setSoloConfigPhase('selection'); }}
                                                className="mt-auto w-full py-2.5 bg-[#0a0a0a] text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-colors border-2 border-black"
                                            >
                                                START TYPING &rsaquo;
                                            </button>
                                        </div>

                                        {/* Typing: Play with a Player */}
                                        <div className="group relative bg-white border-2 border-[#0a0a0a]/5 hover:border-purple-600 p-5 transition-all duration-200 flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-purple-500 text-white shrink-0">
                                                    <Swords className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">TYPING_DUEL</p>
                                                    <h3 className="text-base font-black uppercase tracking-tighter leading-tight">Play with a Player</h3>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight leading-tight opacity-80">
                                                Challenge another student to a real-time typing duel. May the fastest fingers win.
                                            </p>
                                            <button
                                                onClick={handleFindMatch}
                                                className="mt-auto w-full py-2.5 bg-[#0a0a0a] text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-colors border-2 border-black"
                                            >
                                                FIND RIVAL &rsaquo;
                                            </button>
                                        </div>

                                        {/* Typing: Join as Moderator */}
                                        <div className="group relative bg-white border-2 border-[#0a0a0a]/5 hover:border-blue-600 p-5 transition-all duration-200 flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-blue-500 text-white shrink-0">
                                                    <ShieldCheck className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">COMPETITION_HOST</p>
                                                    <h3 className="text-base font-black uppercase tracking-tighter leading-tight">Join as Moderator</h3>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight leading-tight opacity-80">
                                                Create a custom typing challenge room. Monitor student progress in real-time.
                                            </p>
                                            <button
                                                onClick={handleStartModerator}
                                                className="mt-auto w-full py-2.5 bg-[#0a0a0a] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-colors border-2 border-black"
                                            >
                                                CREATE ARENA &rsaquo;
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Battle Arena View Layer */}
                {isBattleActive && (
                                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center pt-[76px] px-2 pb-2 sm:p-10 animate-in fade-in duration-300">
                                        <div className="max-w-4xl w-full bg-[#0a0a0a] rounded-none sm:rounded-none border border-white/5 shadow-[0_0_100px_rgba(34,197,94,0.1)] overflow-hidden max-h-full flex flex-col mt-1 sm:mt-0">
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
                                                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/20 rounded-none flex items-center gap-3">
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
                                                        {isCountingDown ? `${Math.ceil(startCountdown)}s` : `${(battleTimer * selectedTimeLimit / 100).toFixed(1)}s`}
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
                                                                    {startCountdown > 0 ? Math.ceil(startCountdown) : "GO!"}
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
                                                        {isCountingDown ? Math.ceil(startCountdown) : battleChallenges[currentBattleIndex]?.title}
                                                    </h2>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {(battleChallenges[currentBattleIndex]?.options || []).map((option, idx) => (
                                                            <button
                                                                key={idx}
                                                                disabled={showBattleFeedback || isCountingDown}
                                                                onClick={() => handleBattleSelection(option)}
                                                                className={cn(
                                                                    "relative h-10 sm:h-20 flex items-center justify-center rounded-none sm:rounded-none border text-[10px] sm:text-base font-bold font-mono transition-all duration-300",
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
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 sm:p-6 bg-white/5 rounded-none sm:rounded-none border border-white/5 animate-in slide-in-from-bottom-2">
                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                            <div className={cn(
                                                                "w-10 h-10 sm:w-12 sm:h-12 rounded-none sm:rounded-none flex items-center justify-center font-bold text-lg sm:text-xl",
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
                                                            className="bg-primary hover:bg-primary/90 text-white font-mono px-6 h-10 sm:px-8 sm:h-12 rounded-none flex items-center gap-2 group"
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
                        <div className="max-w-2xl w-full bg-[#0a0a0a] rounded-none border border-white/10 shadow-[0_0_50px_rgba(249,115,22,0.1)] overflow-hidden animate-in zoom-in-95 duration-300">
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
                                                                            "h-12 rounded-none border font-mono text-xs transition-all",
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
                                                                        "h-10 rounded-none border font-mono text-[10px] transition-all",
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
                                                                            "h-10 px-3 rounded-none border font-mono text-[10px] truncate transition-all",
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
                                                                    "p-5 rounded-none border text-left transition-all group",
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
                                                    className="h-14 flex-[2] bg-orange-600 hover:bg-orange-700 text-white font-mono text-lg rounded-none shadow-xl shadow-orange-600/20"
                                                >
                                                    {soloConfigPhase === 'selection' ? "Continue" : "Initialize Neural Lesson"}
                                                    <ChevronRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                )}


            </main>

            {/* Fixed Bottom Nav Bar & Drawer */}
            <AppDrawer 
                stats={{
                    problems: problems.length,
                    codes: allCodePredictions.length,
                    battles: battleChallenges.length
                }}
                onProblemsClick={() => {
                    setActiveTab('problems');
                    setIsLeaderboardOpen(false);
                    setIsBattleActive(false);
                    setIsSoloConfigOpen(false);
                }}
                onCodesClick={() => {
                    setActiveTab('codes');
                    setIsLeaderboardOpen(false);
                    setIsBattleActive(false);
                    setIsSoloConfigOpen(false);
                }}
                onChallengesClick={() => {
                    setActiveTab('challenges');
                    setIsLeaderboardOpen(false);
                    setIsBattleActive(false);
                    setIsSoloConfigOpen(false);
                }}
                onLeaderboardClick={() => setIsLeaderboardOpen(true)}
            />

            {/* ─── Problem Detail Modal ─── */}
            {selectedProblem && (
                <div
                    className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedProblem(null)}
                >
                    <div
                        className="bg-white w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={cn(
                            "px-5 py-3 flex items-center justify-between border-b border-black/10",
                            selectedProblem.difficulty === 'Beginner' ? "bg-emerald-500" :
                                selectedProblem.difficulty === 'Intermediate' ? "bg-amber-400" : "bg-rose-600"
                        )}>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-black/60">
                                    {selectedProblem.difficulty} · {selectedProblem.category || 'General'}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedProblem(null)}
                                className="w-6 h-6 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-black" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex flex-col gap-4">
                            <h2 className="text-xl font-black uppercase tracking-tight text-[#1a1a1a] leading-tight">
                                {selectedProblem.title}
                            </h2>
                            <div className="h-[1px] bg-black/10 w-full" />
                            <p className="text-[13px] text-[#3a3a3a] leading-relaxed font-medium">
                                {selectedProblem.description}
                            </p>
                            {selectedProblem.reward && (
                                <div className="flex items-center gap-2 pt-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#888]">Reward:</span>
                                    <span className="text-[11px] font-black text-primary">{selectedProblem.reward}</span>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 pb-5 flex gap-2">
                            <button
                                onClick={() => setSelectedProblem(null)}
                                className="flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest border-2 border-black/10 text-[#555] hover:bg-black/5 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                className="flex-[2] py-2.5 text-[9px] font-black uppercase tracking-widest bg-[#1a1a1a] text-white hover:bg-primary hover:text-black transition-colors"
                            >
                                Solve Problem &rsaquo;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Global Leaderboard Slide-Up Modal ─── */}
            {isLeaderboardOpen && (
                <>
                    <div className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsLeaderboardOpen(false)} />
                    <div className="fixed inset-x-0 bottom-0 top-[10%] md:top-[15%] pb-10 z-[150] bg-[#fdf6e3] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom-full duration-500 ease-out border-t-4 border-[#1a1a1a]">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b-2 border-black/5 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-[#1a1a1a] flex items-center gap-3">
                                    <Globe className="w-6 h-6 text-amber-500" />
                                    Rankings: {leaderboardCategory}
                                </h2>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-[#777] mt-1">
                                    Based on {leaderboardCategory === 'Global' ? 'Solo, PvP & Challenges' : leaderboardCategory + ' Activity'}
                                </p>
                            </div>
                            <button onClick={() => setIsLeaderboardOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors">
                                <X className="w-5 h-5 text-[#1a1a1a]" />
                            </button>
                        </div>

                        {/* Category Selector */}
                        <div className="flex w-full gap-[1px] bg-black/5 p-[1px] border-b border-black/5">
                            {['Global', 'Solo', 'PvP', 'Challenges'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setLeaderboardCategory(cat as any)}
                                    className={cn(
                                        "flex-1 py-2 text-[8px] font-black uppercase tracking-widest transition-colors border",
                                        leaderboardCategory === cat
                                            ? "bg-[#1a1a1a] text-amber-400 border-[#1a1a1a]"
                                            : "bg-white text-slate-500 border-black/10 hover:bg-black/5"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar-brutalist flex flex-col">
                            {/* Podium Section (2 - 1 - 3) */}
                            <div className="flex items-end justify-center gap-2 sm:gap-6 px-4 pt-10 pb-6 shrink-0 relative bg-white/50 border-b-2 border-black/5">
                                {/* 2nd Place */}
                                {MOCK_LEADERBOARD[1] && (
                                    <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-500 delay-150 relative z-10 w-20 sm:w-24">
                                        <div className="relative mb-2">
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full border-2 border-slate-300 shadow-md z-20">
                                                <Crown className="w-3 h-3 text-slate-500" />
                                            </div>
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-slate-300 bg-white overflow-hidden shadow-lg">
                                                {MOCK_LEADERBOARD[1].avatar ? <img src={MOCK_LEADERBOARD[1].avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6 m-auto mt-3 text-slate-300" />}
                                            </div>
                                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#1a1a1a] rounded-full border-2 border-slate-300 flex items-center justify-center text-white font-black text-xs z-20">
                                                2
                                            </div>
                                        </div>
                                        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight text-center text-[#1a1a1a] line-clamp-1 mt-1">{MOCK_LEADERBOARD[1].name}</h3>
                                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 mt-0.5">{MOCK_LEADERBOARD[1].score} PTS</p>
                                        <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg mt-3 border-x-[3px] border-t-[3px] border-slate-300 shadow-inner flex flex-col items-center justify-end pb-2">
                                             <div className="w-full h-1.5 bg-slate-300/50 mb-0.5" />
                                             <div className="w-full h-1.5 bg-slate-300/50 mb-0.5" />
                                             <div className="w-full h-1.5 bg-slate-300/50" />
                                        </div>
                                    </div>
                                )}

                                {/* 1st Place */}
                                {MOCK_LEADERBOARD[0] && (
                                    <div className="flex flex-col items-center animate-in slide-in-from-bottom-12 duration-500 relative z-20 w-24 sm:w-28">
                                        <div className="relative mb-2">
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center bg-amber-400 rounded-full border-[3px] border-amber-300 shadow-lg z-20 animate-bounce">
                                                <Crown className="w-4 h-4 text-amber-800" />
                                            </div>
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-400 bg-white overflow-hidden shadow-xl relative">
                                                <div className="absolute inset-0 bg-amber-400/20 animate-pulse" />
                                                {MOCK_LEADERBOARD[0].avatar ? <img src={MOCK_LEADERBOARD[0].avatar} alt="" className="w-full h-full object-cover relative z-10" /> : <User className="w-8 h-8 m-auto mt-4 text-amber-200 relative z-10" />}
                                            </div>
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-[#1a1a1a] rounded-full border-[3px] border-amber-400 flex items-center justify-center text-amber-400 font-black text-sm z-20 shadow-md">
                                                1
                                            </div>
                                        </div>
                                        <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-tight text-center text-[#1a1a1a] mt-1 line-clamp-1">{MOCK_LEADERBOARD[0].name}</h3>
                                        <p className="text-[9px] sm:text-[10px] font-black text-amber-600 mt-0.5">{MOCK_LEADERBOARD[0].score} PTS</p>
                                        <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-lg mt-3 border-x-4 border-t-4 border-amber-400 shadow-inner flex flex-col items-center justify-end pb-3">
                                             <div className="w-full h-2 bg-amber-400/40 mb-1" />
                                             <div className="w-full h-2 bg-amber-400/40 mb-1" />
                                             <div className="w-full h-2 bg-amber-400/40 mb-1" />
                                             <div className="w-full h-2 bg-amber-400/40" />
                                        </div>
                                    </div>
                                )}

                                {/* 3rd Place */}
                                {MOCK_LEADERBOARD[2] && (
                                    <div className="flex flex-col items-center animate-in slide-in-from-bottom-6 duration-500 delay-300 relative z-10 w-20 sm:w-24">
                                        <div className="relative mb-2">
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center bg-orange-800/80 rounded-full border-2 border-orange-900 shadow-md z-20">
                                                <Crown className="w-3 h-3 text-orange-200" />
                                            </div>
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-orange-800/80 bg-white overflow-hidden shadow-lg">
                                                {MOCK_LEADERBOARD[2].avatar ? <img src={MOCK_LEADERBOARD[2].avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6 m-auto mt-3 text-orange-900/50" />}
                                            </div>
                                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#1a1a1a] rounded-full border-2 border-orange-900/80 flex items-center justify-center text-white font-black text-xs z-20">
                                                3
                                            </div>
                                        </div>
                                        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight text-center text-[#1a1a1a] line-clamp-1 mt-1">{MOCK_LEADERBOARD[2].name}</h3>
                                        <p className="text-[8px] sm:text-[9px] font-bold text-orange-800/80 mt-0.5">{MOCK_LEADERBOARD[2].score} PTS</p>
                                        <div className="w-full h-12 sm:h-14 bg-gradient-to-t from-orange-900/40 to-orange-800/30 rounded-t-lg mt-3 border-x-[3px] border-t-[3px] border-orange-900/60 shadow-inner flex flex-col items-center justify-end pb-2">
                                            <div className="w-full h-1 bg-orange-900/30 mb-0.5" />
                                            <div className="w-full h-1 bg-orange-900/30 mb-0.5" />
                                            <div className="w-full h-1 bg-orange-900/30" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* List Section for ranks 4+ */}
                            <div className="flex-1 flex flex-col gap-[2px] bg-black/5 px-4 sm:px-8 py-6">
                                {MOCK_LEADERBOARD.slice(3).map((player, idx) => (
                                    <div key={player.id} className="flex items-center gap-4 p-4 bg-white hover:bg-emerald-50 transition-colors border-2 border-black/5 hover:border-emerald-500 duration-200 group">
                                        <div className="w-8 shrink-0 flex items-center justify-center font-black text-lg text-slate-400 group-hover:text-emerald-500 transition-colors">
                                            #{player.rank}
                                        </div>
                                        <div className="w-10 h-10 rounded bg-[#1a1a1a] border border-black/10 shrink-0 overflow-hidden flex items-center justify-center">
                                            {player.avatar ? <img src={player.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white/50" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-black uppercase tracking-tight text-[#1a1a1a] group-hover:text-emerald-600 transition-colors line-clamp-1">
                                                {player.name}
                                            </h4>
                                            <p className="text-[10px] font-bold text-[#777] uppercase tracking-widest mt-0.5 max-w-full truncate">
                                                @{player.username}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-black text-[#1a1a1a]">{player.score.toLocaleString()}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Points</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ─── Global PvP Overlays (Outside main for z-index safety) ─── */}
            {/* PvP Searching Overlay */}
            {pvpStatus === 'searching' && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-[#0a0a0a] rounded-none border border-primary/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] p-10 text-center space-y-8 animate-in zoom-in-95 duration-300 text-white">
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
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-primary/60 uppercase tracking-[0.2em]">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Synchronizing Vector Sync
                            </div>
                            <Button
                                variant="ghost"
                                onClick={handleQuitPvP}
                                className="text-slate-400 hover:text-white hover:bg-white/5 font-mono text-xs flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Return to Station
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* PvP Battle Arena */}
            {isPvPActive && pvpMatch && (
                <div className="fixed inset-0 z-[200] bg-black backdrop-blur-xl flex flex-col animate-in fade-in duration-300 text-white overflow-hidden h-[100dvh]">
                    {/* ─── Timer Bar (Progress & Countdown) ─── */}
                    <div className="px-4 py-1.5 sm:px-6 sm:py-2 bg-white/[0.03] border-b border-white/5 flex items-center gap-4 shrink-0 z-50 relative">
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
                            "text-[10px] sm:text-xs font-mono font-bold w-12 text-right",
                            pvpTimer > 50 ? "text-primary" : pvpTimer > 20 ? "text-yellow-500" : "text-red-500 animate-pulse"
                        )}>
                            {`${(pvpTimer / 10).toFixed(1)}s`}
                        </span>
                        <button
                            onClick={handleQuitPvP}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors ml-1"
                        >
                            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                        </button>
                    </div>

                    {/* ─── Scoreboard Header (Player Details) ─── */}
                    <div className="flex items-center justify-between px-2 py-1 sm:px-6 sm:py-2 border-b border-white/5 bg-[#0a0a0a] shrink-0 z-50 relative">
                        <button
                            onClick={handleQuitPvP}
                            className="mr-1 sm:mr-2 p-1 rounded-none hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>

                        {/* Player (You) — Left */}
                        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
                            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-none sm:rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] sm:text-xs font-bold text-primary font-mono shrink-0">
                                {user?.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="hidden sm:block text-[8px] font-mono text-primary/60 uppercase tracking-wider leading-none mb-0.5">Player</span>
                                <span className="font-bold font-mono text-[10px] sm:text-base truncate text-white leading-none max-w-[70px] sm:max-w-[150px]">{user?.name ?? "You"}</span>
                            </div>
                        </div>

                        {/* Score — Center */}
                        <div className="flex flex-col items-center mx-1 sm:mx-4 shrink-0">
                            <div className="flex items-center gap-1.5 sm:gap-3 px-2 py-0.5 sm:px-4 sm:py-1 rounded-none sm:rounded-none bg-white/5 border border-white/10 shadow-inner">
                                <span className="text-base sm:text-3xl font-black font-mono text-primary tabular-nums tracking-tighter">{pvpScore}</span>
                                <span className="text-sm sm:text-2xl font-bold text-slate-500 font-mono">:</span>
                                <span className="text-base sm:text-3xl font-black font-mono text-secondary tabular-nums tracking-tighter">{pvpOpponentScore}</span>
                            </div>
                            <span className="hidden sm:block text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-0.5 leading-none">Score</span>
                        </div>

                        {/* Opponent — Right */}
                        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 justify-end">
                            <div className="flex flex-col items-end min-w-0">
                                <span className="hidden sm:block text-[8px] font-mono text-secondary/60 uppercase tracking-wider leading-none mb-0.5 text-right">Opponent</span>
                                <span className="font-bold font-mono text-[10px] sm:text-base truncate text-white text-right leading-none max-w-[70px] sm:max-w-[150px]">
                                    {pvpMatch.player1.email.toLowerCase() === user?.email.toLowerCase() ? (
                                        pvpMatch.player2.name
                                    ) : (
                                        pvpMatch.player1.name
                                    )}
                                </span>
                            </div>
                            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-none sm:rounded-none bg-secondary/10 border border-secondary/20 flex items-center justify-center text-[9px] sm:text-xs font-bold text-secondary font-mono shrink-0">
                                {(pvpMatch.player1.email.toLowerCase() === user?.email.toLowerCase() ? pvpMatch.player2.name : pvpMatch.player1.name)?.[0]?.toUpperCase() ?? "?"}
                            </div>
                        </div>
                    </div>

                    {/* Main Body — Code + Options */}
                    <div className="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-2 relative">
                        {/* Code */}
                        <div className="p-3 sm:p-6 flex flex-col h-[35%] lg:h-auto min-h-0 border-b lg:border-r lg:border-b-0 border-white/5 bg-black/30">
                            <p className="text-[8px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                <Terminal className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                Challenge {currentPvPIndex + 1} / {pvpMatch.challenges.length}
                            </p>
                            <div className="flex-1 rounded-none sm:rounded-none border border-white/10 overflow-hidden relative">
                                <div className={cn("w-full h-full", isPvPCountingDown && "blur-md grayscale")}>
                                    <CodeMirror
                                        value={pvpMatch.challenges[currentPvPIndex]?.code || ""}
                                        height="100%"
                                        theme="dark"
                                        extensions={[python()]}
                                        editable={false}
                                        basicSetup={{ lineNumbers: true, foldGutter: true }}
                                        className="text-[12px] sm:text-sm font-mono h-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Full Screen Countdown Overlay */}
                        {isPvPCountingDown && (
                            <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                        <span className="text-8xl flex items-center justify-center font-black font-mono text-primary drop-shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-in zoom-in duration-300">
                                            {Math.ceil(pvpStartCountdown)}
                                        </span>
                                    </div>
                                    <p className="text-sm font-mono text-primary/60 tracking-[0.4em] uppercase animate-pulse">Synchronizing Orbit...</p>
                                </div>
                            </div>
                        )}

                        {/* Options */}
                        <div className="p-3 sm:p-6 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                            <div className="space-y-4 flex-1 flex flex-col">
                                <h2 className="text-lg sm:text-xl font-bold font-mono tracking-tighter shrink-0">
                                    {isPvPCountingDown ? "Get Ready..." : pvpMatch.challenges[currentPvPIndex]?.title}
                                </h2>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    {(pvpMatch.challenges[currentPvPIndex]?.options || []).map((option: any) => (
                                        <button
                                            key={option}
                                            disabled={showPvPFeedback || pvpTimer === 0 || isPvPCountingDown}
                                            onClick={() => handlePvPSelection(option)}
                                            className={cn(
                                                "relative h-10 sm:h-20 flex items-center justify-center rounded-none sm:rounded-none border text-[10px] sm:text-base font-bold font-mono transition-all duration-300",
                                                pvpPrediction === option
                                                    ? option === pvpMatch.challenges[currentPvPIndex]?.correct
                                                        ? "bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                                        : "bg-red-500/10 border-red-500 text-red-400"
                                                    : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white"
                                            )}
                                        >
                                            {option}
                                            {pvpPrediction === option && (
                                                <span className="absolute top-1 right-1 sm:top-2 sm:right-2">
                                                    {option === pvpMatch.challenges[currentPvPIndex]?.correct
                                                        ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-in zoom-in" />
                                                        : <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-in zoom-in" />}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {showPvPFeedback && (
                                <div className="mt-4 p-3 sm:p-5 bg-white/[0.03] rounded-none sm:rounded-none border border-white/10 space-y-3 sm:space-y-4 animate-in slide-in-from-bottom-4 shrink-0">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className={cn(
                                            "w-10 h-10 sm:w-12 sm:h-12 rounded-none sm:rounded-none flex items-center justify-center font-bold text-lg sm:text-xl border",
                                            pvpPrediction === pvpMatch.challenges[currentPvPIndex]?.correct
                                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                : "bg-red-500/20 text-red-400 border-red-500/30"
                                        )}>
                                            {pvpPrediction === pvpMatch.challenges[currentPvPIndex]?.correct ? `+${pvpPointsAwarded}` : "0"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm sm:text-base">
                                                {pvpPrediction === pvpMatch.challenges[currentPvPIndex]?.correct ? "Correct!" : "Wrong!"}
                                            </p>
                                            <p className="text-[10px] sm:text-sm text-slate-400 font-mono">
                                                {pvpPrediction === pvpMatch.challenges[currentPvPIndex]?.correct
                                                    ? "Victory point secured!"
                                                    : `Correct: ${pvpMatch.challenges[currentPvPIndex]?.correct}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleNextPvPItem}
                                        className="w-full h-10 sm:h-11 bg-primary hover:bg-primary/90 text-white font-mono rounded-none sm:rounded-none group text-xs sm:text-sm"
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
                    <div className="max-w-6xl w-full bg-[#0a0a0a] rounded-none border border-white/5 shadow-[0_0_100px_rgba(34,197,94,0.1)] overflow-hidden flex flex-col md:flex-row h-[80vh]">
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
                                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary group-hover:scale-105 transition-transform shadow-lg shadow-primary/5">
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
                                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-none border-2 border-dashed border-white flex items-center justify-center">
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
                                                className="h-12 px-10 bg-primary hover:bg-primary/90 text-white font-mono text-sm rounded-none shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 transition-transform"
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
                                        className="bg-primary hover:bg-primary/90 text-white font-mono px-6 h-10 rounded-none flex items-center gap-2 group"
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
                                        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-mono text-sm rounded-none shadow-lg shadow-green-600/10"
                                    >
                                        Generate Join Link
                                    </Button>
                                ) : (
                                    <div className="space-y-4 animate-in slide-in-from-right-4">
                                        <div className="p-4 bg-black/40 rounded-none border border-white/10 space-y-2">
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



        </div>
    );
};

export default InfiniteSpace;
