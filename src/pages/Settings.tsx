import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, User, Settings as SettingsIcon, Shield, Camera, Check, AlertCircle } from "lucide-react";

const Settings = () => {
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [profilePicture, setProfilePicture] = useState("");

    // Username checking state
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/signin", { replace: true });
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.email) return;
            setIsLoading(true);
            try {
                const response = await fetch(`/api/user/profile?email=${encodeURIComponent(user.email)}`);
                if (response.ok) {
                    const data = await response.json();
                    setName(data.name || "");
                    setUsername(data.username || "");
                    setBio(data.bio || "");
                    setProfilePicture(data.profile_picture || "");
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                toast.error("Failed to load profile settings");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleUsernameChange = async (newUsername: string) => {
        setUsername(newUsername);
        if (newUsername.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        setIsCheckingUsername(true);
        try {
            const response = await fetch('/api/auth/check-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername, email: user?.email })
            });
            const data = await response.json();
            setUsernameAvailable(data.available);
        } catch (error) {
            console.error("Username check failed", error);
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.email) return;

        setIsSaving(true);
        try {
            // Update Name and Bio
            const profileRes = await fetch('/api/user/update-profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    name,
                    bio
                })
            });

            if (!profileRes.ok) throw new Error("Failed to update profile");

            // Update Username if changed and available
            if (username && usernameAvailable === true) {
                const usernameRes = await fetch('/api/user/username', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        username
                    })
                });
                if (!usernameRes.ok) throw new Error("Failed to update username");
            }

            toast.success("Settings updated successfully!");
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.email) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', user.email);

        setIsSaving(true);
        try {
            const response = await fetch('/api/user/profile-picture', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setProfilePicture(data.profile_picture);
                toast.success("Profile picture updated!");
            } else {
                toast.error("Failed to upload image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading image");
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <SettingsIcon className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="font-mono text-emerald-500 mb-1 text-xs font-medium tracking-wide">{"// Account Settings"}</p>
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Settings</h1>
                        </div>
                    </div>

                    <Tabs defaultValue="profile" className="space-y-8">
                        <TabsList className="bg-slate-800 p-1.5 border border-slate-700 rounded-2xl h-auto">
                            <TabsTrigger
                                value="profile"
                                className="gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 transition-all"
                            >
                                <User className="w-4 h-4" /> Profile
                            </TabsTrigger>
                            <TabsTrigger
                                value="account"
                                className="gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 transition-all"
                            >
                                <Shield className="w-4 h-4" /> Account
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card className="bg-slate-800 border-slate-700 shadow-xl shadow-black/20 rounded-[1.5rem] overflow-hidden">
                                <CardHeader className="bg-slate-700/30 border-b border-slate-700/50 pb-6">
                                    <div className="flex items-baseline gap-2">
                                        <CardTitle className="text-xl font-bold text-white">Profile Information</CardTitle>
                                        <span className="text-[10px] font-mono text-emerald-500/70 uppercase">v1.2</span>
                                    </div>
                                    <CardDescription className="text-slate-400">Update your public profile and how others see you.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-8">
                                    {/* Profile Picture Section */}
                                    <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-700/50">
                                        <div className="relative group">
                                            <Avatar className="w-28 h-28 border-2 border-slate-700 transition-all duration-300 group-hover:border-emerald-500/50 shadow-lg">
                                                <AvatarImage src={profilePicture} alt={name} />
                                                <AvatarFallback className="text-3xl bg-slate-700 text-emerald-500 font-bold">
                                                    {name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer backdrop-blur-[2px]">
                                                <Camera className="w-7 h-7 text-white" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                        <div className="text-center md:text-left space-y-2">
                                            <h4 className="font-bold text-white text-lg">Profile Photo</h4>
                                            <p className="text-xs text-slate-500 max-w-[200px]">{"// Suggested 400x400px. Max 2MB."}</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                                                className="mt-2 h-9 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-mono text-xs uppercase tracking-wider"
                                            >
                                                Change Identity
                                            </Button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="name" className="text-slate-300 font-bold text-sm ml-1 flex items-center gap-2">
                                                <span className="text-emerald-500/50 font-mono text-xs">01.</span> Full Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="h-12 bg-slate-900/50 border-slate-700 focus:border-emerald-500/50 text-white rounded-xl px-4 transition-all"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="username" className="text-slate-300 font-bold text-sm ml-1 flex items-center gap-2">
                                                <span className="text-emerald-500/50 font-mono text-xs">02.</span> Username
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="username"
                                                    value={username}
                                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                                    className={`h-12 bg-slate-900/50 border-slate-700 focus:border-emerald-500/50 text-white rounded-xl px-4 transition-all pr-12 ${usernameAvailable === false ? "border-red-500/50" :
                                                        usernameAvailable === true ? "border-emerald-500/50" : ""
                                                        }`}
                                                    placeholder="Enter username"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {isCheckingUsername ? <Loader2 className="w-5 h-5 animate-spin text-slate-500" /> :
                                                        usernameAvailable === true ? <Check className="w-5 h-5 text-emerald-500" /> :
                                                            usernameAvailable === false ? <AlertCircle className="w-5 h-5 text-red-500" /> : null}
                                                </div>
                                            </div>
                                            {usernameAvailable === false && (
                                                <p className="text-[10px] text-red-400 font-mono mt-1 ml-1 uppercase tracking-tighter">Status: Identity Collision [Username Taken]</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2 space-y-3">
                                            <Label htmlFor="bio" className="text-slate-300 font-bold text-sm ml-1 flex items-center gap-2">
                                                <span className="text-emerald-500/50 font-mono text-xs">03.</span> User Bio
                                            </Label>
                                            <Textarea
                                                id="bio"
                                                placeholder="Tell us about yourself..."
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="bg-slate-900/50 border-slate-700 focus:border-emerald-500/50 text-white min-h-[140px] rounded-2xl p-4 resize-none transition-all leading-relaxed"
                                            />
                                        </div>

                                        <div className="md:col-span-2 flex justify-end pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSaving || usernameAvailable === false}
                                                className="h-12 px-10 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-black text-sm uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Sync Changes"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="account" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card className="bg-slate-800 border-slate-700 shadow-xl shadow-black/20 rounded-[1.5rem] overflow-hidden">
                                <CardHeader className="bg-slate-700/30 border-b border-slate-700/50 pb-6">
                                    <CardTitle className="text-xl font-bold text-white">Account Kernel</CardTitle>
                                    <CardDescription className="text-slate-400">Manage security protocols and system identity.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-700/50 flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono">System Email</p>
                                                <Shield className="w-4 h-4 text-emerald-500 animate-pulse" />
                                            </div>
                                            <p className="text-lg text-white font-bold font-mono truncate">{user?.email}</p>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-700/50 flex flex-col justify-between group hover:border-blue-500/30 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">Kernel Role</p>
                                                <User className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <p className="text-lg text-white font-bold font-mono uppercase tracking-widest">{user?.role}</p>
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-slate-700/50">
                                        <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <p className="text-white font-bold flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                    Termination Protocol
                                                </p>
                                                <p className="text-xs text-slate-500 max-w-sm">Warning: Deletion is irreversible. All training data and modules will be purged from the vector space.</p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl h-10 px-8 font-bold transition-all active:scale-95 uppercase text-xs tracking-widest"
                                            >
                                                Purge Account
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Settings;
