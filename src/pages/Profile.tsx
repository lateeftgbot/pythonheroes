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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="glass-card p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden bg-white/5 border border-white/10">
                            <div className="relative">
                                <Avatar className="w-32 h-32 border-4 border-primary/20">
                                    <AvatarImage src={profile.profile_picture} alt={profile.name} />
                                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                        {profile.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {profile.is_online && (
                                    <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-[#0a0a0c] rounded-full"></span>
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                                    <Badge variant="secondary" className="capitalize bg-primary/10 text-primary border-primary/20">{profile.role}</Badge>
                                    {profile.is_online && <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Online</Badge>}
                                </div>
                                <p className="text-muted-foreground font-mono mb-4 text-sm">@{profile.username}</p>
                                <p className="text-foreground/80 max-w-md mb-6 line-clamp-2">{profile.bio}</p>

                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Joined {new Date(profile.joined_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {currentUser?.email !== profile.email && (
                                        <div className="pt-2 md:pt-0">
                                            <Button
                                                onClick={handleChat}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono tracking-wider text-xs px-6 h-9 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
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
                                <Card className="glass-card border-none">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                            Overall Progress
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Mastery Level</span>
                                                <span className="font-bold">{profile.overall_progress}%</span>
                                            </div>
                                            <Progress value={profile.overall_progress} className="h-3" />
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                Keep coding to reach 100%!
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="glass-card border-none">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-primary" />
                                            Badges
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="py-1">Early Bird</Badge>
                                            <Badge variant="outline" className="py-1">Python Novice</Badge>
                                            <Badge variant="outline" className="py-1">Active Learner</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Modules */}
                            <div className="md:col-span-2">
                                <Card className="glass-card border-none h-full">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                            Completed Modules
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[400px] pr-4">
                                            {profile.modules_completed.length > 0 ? (
                                                <div className="space-y-4">
                                                    {profile.modules_completed.map((module, index) => (
                                                        <div key={index} className="p-4 border rounded-xl bg-muted/30 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                                    {index + 1}
                                                                </div>
                                                                <span className="font-semibold">{module}</span>
                                                            </div>
                                                            <Badge className="bg-green-500/10 text-green-500">Completed</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
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
