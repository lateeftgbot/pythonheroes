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
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <SettingsIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                            <p className="text-muted-foreground font-mono text-sm">{"// Manage your account and preferences"}</p>
                        </div>
                    </div>

                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="bg-muted/50 p-1 border border-border/50">
                            <TabsTrigger value="profile" className="gap-2">
                                <User className="w-4 h-4" /> Profile
                            </TabsTrigger>
                            <TabsTrigger value="account" className="gap-2">
                                <Shield className="w-4 h-4" /> Account
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card className="glass-card border-none bg-white/5">
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your public profile and how others see you.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* Profile Picture Section */}
                                    <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-white/10">
                                        <div className="relative group">
                                            <Avatar className="w-24 h-24 border-2 border-primary/20 transition-all duration-300 group-hover:border-primary">
                                                <AvatarImage src={profilePicture} alt={name} />
                                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                                    {name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                                <Camera className="w-6 h-6 text-white" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <h4 className="font-semibold mb-1">Profile Photo</h4>
                                            <p className="text-sm text-muted-foreground mb-3">Max size 2MB. Recommended 400x400px.</p>
                                            <Button variant="outline" size="sm" onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
                                                Change Photo
                                            </Button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="bg-black/20 border-white/10 focus:border-primary/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="username">Username</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="username"
                                                        value={username}
                                                        onChange={(e) => handleUsernameChange(e.target.value)}
                                                        className={`bg-black/20 border-white/10 focus:border-primary/50 pr-10 ${usernameAvailable === false ? "border-destructive/50" :
                                                                usernameAvailable === true ? "border-green-500/50" : ""
                                                            }`}
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        {isCheckingUsername ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> :
                                                            usernameAvailable === true ? <Check className="w-4 h-4 text-green-500" /> :
                                                                usernameAvailable === false ? <AlertCircle className="w-4 h-4 text-destructive" /> : null}
                                                    </div>
                                                </div>
                                                {usernameAvailable === false && (
                                                    <p className="text-[10px] text-destructive font-mono mt-1">Username already taken</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                placeholder="Tell us about yourself..."
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="bg-black/20 border-white/10 focus:border-primary/50 min-h-[100px]"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={isSaving || usernameAvailable === false} className="bg-primary hover:bg-primary/90 min-w-[120px]">
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="account" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Card className="glass-card border-none bg-white/5">
                                <CardHeader>
                                    <CardTitle>Account Settings</CardTitle>
                                    <CardDescription>Manage your account security and authentication.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold">Email Address</p>
                                                <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
                                            </div>
                                            <Shield className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div className="p-4 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold">Account Role</p>
                                                <p className="text-xs text-muted-foreground font-mono uppercase">{user?.role}</p>
                                            </div>
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/10">
                                        <h4 className="text-sm font-semibold text-destructive mb-2">Danger Zone</h4>
                                        <p className="text-xs text-muted-foreground mb-4">Deleting your account is permanent and cannot be undone.</p>
                                        <Button variant="destructive" size="sm" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white">
                                            Delete Account
                                        </Button>
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
