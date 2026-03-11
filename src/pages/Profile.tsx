import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen, Trophy, Calendar, MapPin, User as UserIcon, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface UserProfile {
    id: string;
    email: string;
    name: string;
    username: string;
    profile_picture?: string;
    is_online: boolean;
    role: string;
    overall_progress: number;
    modules_completed: string[];
    bio: string;
    joined_at: string;
}

const Profile = () => {
    const { username } = useParams<{ username: string }>();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username || username === "undefined") {
                toast.error("Invalid user identifier");
                navigate("/");
                return;
            }
            setIsLoading(true);
            try {
                const response = await fetch(`/api/users/profile/${username}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                } else {
                    toast.error("User not found");
                    navigate("/");
                }
            } catch (error) {
                console.error("Profile fetch error:", error);
                toast.error("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        }
    }, [username, navigate]);

    const handleChat = () => {
        if (!currentUser) {
            toast.error("Please sign in to chat");
            navigate("/signin");
            return;
        }

        if (!profile) return;

        // Prepare contact object for ChatRoom
        const contact = {
            id: profile.id,
            _id: profile.id,
            name: profile.name,
            username: profile.username,
            email: profile.email,
            profile_picture: profile.profile_picture,
            is_online: profile.is_online
        };

        navigate("/chat-room", { state: { contact } });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="bg-slate-800 border border-slate-700 shadow-xl shadow-black/20 p-8 rounded-[1.5rem] mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                            <div className="relative">
                                <Avatar className="w-32 h-32 border-4 border-slate-700 shadow-md">
                                    <AvatarImage src={profile.profile_picture} alt={profile.name} />
                                    <AvatarFallback className="text-3xl bg-slate-700 text-emerald-500">
                                        {profile.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {profile.is_online && (
                                    <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-slate-700 rounded-full"></span>
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                                    {(profile.role === 'master1_vectors' || profile.role === 'admin') ? (
                                        <Badge
                                            variant="secondary"
                                            className="capitalize bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-colors active:scale-95"
                                            onClick={() => navigate('/admin')}
                                        >
                                            {profile.role}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="capitalize bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{profile.role}</Badge>
                                    )}
                                    {profile.is_online && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-none">Online</Badge>}
                                </div>
                                <p className="text-emerald-500/70 font-mono mb-4 text-sm font-medium">@{profile.username}</p>
                                <p className="text-slate-300 max-w-md mb-6 line-clamp-2 leading-relaxed">{profile.bio}</p>

                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                                    <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-emerald-500" />
                                            Joined {new Date(profile.joined_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {currentUser?.email !== profile.email && (
                                        <div className="pt-2 md:pt-0">
                                            <Button
                                                onClick={handleChat}
                                                className="bg-sky-600 hover:bg-sky-500 text-white font-mono tracking-wider text-xs px-6 h-9 rounded-full shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 border border-sky-500"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                                MESSAGE
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column: Stats */}
                            <div className="md:col-span-1 space-y-6">
                                <Card className="bg-slate-800 border-slate-700 shadow-xl shadow-black/20 rounded-[1.5rem] overflow-hidden">
                                    <CardHeader className="bg-slate-700/50 border-b border-slate-700 pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2 font-bold text-white">
                                            <Trophy className="w-5 h-5 text-emerald-500" />
                                            Overall Progress
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm mb-1 font-medium text-slate-400">
                                                <span>Mastery Level</span>
                                                <span className="font-bold text-emerald-500">{profile.overall_progress}%</span>
                                            </div>
                                            <Progress value={profile.overall_progress} className="h-3 bg-slate-700" indicatorClassName="bg-emerald-500" />
                                            <p className="text-xs text-slate-500 text-center mt-2 font-medium">
                                                Keep coding to reach 100%!
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-800 border-slate-700 shadow-xl shadow-slate-300/50 rounded-[1.5rem] overflow-hidden">
                                    <CardHeader className="bg-slate-700/50 border-b border-slate-700 pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2 font-bold text-white">
                                            <UserIcon className="w-5 h-5 text-emerald-500" />
                                            Badges
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="py-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Early Bird</Badge>
                                            <Badge variant="outline" className="py-1 border-sky-500/20 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20">Python Novice</Badge>
                                            <Badge variant="outline" className="py-1 border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Active Learner</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Modules */}
                            <div className="md:col-span-2">
                                <Card className="bg-slate-800 border-slate-700 shadow-xl shadow-black/20 h-full rounded-[1.5rem] overflow-hidden">
                                    <CardHeader className="bg-slate-700/50 border-b border-slate-700 pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2 font-bold text-white">
                                            <BookOpen className="w-5 h-5 text-emerald-500" />
                                            Completed Modules
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ScrollArea className="h-[400px] pr-4">
                                            {profile.modules_completed.length > 0 ? (
                                                <div className="space-y-4">
                                                    {profile.modules_completed.map((module, index) => (
                                                        <div key={index} className="p-4 border border-slate-700 rounded-xl bg-slate-900/50 hover:bg-slate-900 hover:shadow-md transition-all flex items-center justify-between group">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-500 font-bold border border-slate-600 group-hover:scale-110 transition-transform">
                                                                    {index + 1}
                                                                </div>
                                                                <span className="font-semibold text-slate-200">{module}</span>
                                                            </div>
                                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Completed</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                                    <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                                                    <p>No modules completed yet.</p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
