import { useRef, useState, useEffect } from "react";
import { Camera, Loader2, User, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import UserStatusIndicator from "@/components/UserStatusIndicator";

interface UsernameSettingsProps {
    onUsernameUpdate?: (oldUsername: string, newUsername: string) => void;
}

const UsernameSettings = ({ onUsernameUpdate }: UsernameSettingsProps) => {
    const { user, updateUser } = useAuth();
    const [username, setUsername] = useState(user?.username || "");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            toast.error("Please select a valid image (JPG/PNG)");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File size must be less than 5MB");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("email", user.email);

        setIsUploading(true);
        try {
            const response = await fetch("/api/user/profile-picture", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            updateUser({ profile_picture: data.profile_picture });
            toast.success("Profile picture updated!");

            // Re-render chat messages if needed? 
            // The chat component will need simple update logic if we display avatars there too.
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Upload failed";
            toast.error(message);
        } finally {
            setIsUploading(false);
        }
    };

    const charCount = username.length;
    const isValid = charCount >= 3 && charCount <= 20 && /^[a-zA-Z0-9_-]*$/.test(username);

    // Debounced availability check
    useEffect(() => {
        if (!isValid || username === user?.username) {
            setIsAvailable(null);
            setIsChecking(false);
            return;
        }

        setIsChecking(true);
        setIsAvailable(null);

        const timer = setTimeout(async () => {
            try {
                const response = await fetch("/api/auth/check-username", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: username.trim(),
                        email: user?.email
                    }),
                });
                const data = await response.json();
                setIsAvailable(data.available);
            } catch (err) {
                console.error("Availability check failed", err);
            } finally {
                setIsChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [username, user?.username, isValid, user?.email]);

    const handleSave = async () => {
        if (!user) return;

        // Validation
        if (username.length < 3 || username.length > 20) {
            setError("Username must be 3-20 characters");
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            setError("Only letters, numbers, _ and - allowed");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/user/username", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    username: username.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to update username");
                return;
            }

            // Update local user state
            const oldUsername = user.username || user.name;
            updateUser({ username: username.trim() });

            // Notify parent component to update chat messages
            if (onUsernameUpdate) {
                onUsernameUpdate(oldUsername, username.trim());
            }

            toast.success("Username updated successfully!");
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                    <div className={`w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 ${isUploading ? 'opacity-50' : ''}`}>
                        {user?.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <User className="w-8 h-8 text-primary" />
                            </div>
                        )}
                    </div>
                    <UserStatusIndicator is_online={true} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Profile Settings</h3>
                    <p className="text-xs text-muted-foreground">
                        Click the circle to change your photo
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-foreground">Display Name</h3>
                        <p className="text-[10px] text-muted-foreground">
                            Updated locally instantly for chat continuity
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                        Username
                    </Label>
                    <div className="relative">
                        <Input
                            id="username"
                            type="text"
                            placeholder="e.g., CodeMaster"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError(null);
                            }}
                            className={`pr-16 ${error || (isValid && username && isAvailable === false)
                                ? "border-destructive focus:ring-destructive"
                                : isValid && username && isAvailable === true
                                    ? "border-green-500 focus:ring-green-500"
                                    : ""
                                }`}
                            maxLength={20}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span
                                className={`text-xs font-mono ${charCount > 20
                                    ? "text-destructive"
                                    : charCount >= 3
                                        ? "text-green-500"
                                        : "text-muted-foreground"
                                    }`}
                            >
                                {charCount}/20
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    {isChecking && (
                        <div className="flex items-center gap-2 text-muted-foreground animate-pulse text-sm">
                            <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            <span>Checking availability...</span>
                        </div>
                    )}

                    {isValid && username && !error && !isChecking && isAvailable === true && (
                        <div className="flex items-center gap-2 text-green-500 text-sm">
                            <Check className="w-4 h-4" />
                            <span>Username is available</span>
                        </div>
                    )}

                    {isValid && username && !error && !isChecking && isAvailable === false && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>This username is not available</span>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                        3-20 characters. Letters, numbers, underscores, and hyphens only.
                    </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                        Current: <span className="font-mono text-foreground">{user?.username || user?.name}</span>
                    </p>
                    <Button
                        onClick={handleSave}
                        disabled={!isValid || isLoading || isChecking || isAvailable === false || username === user?.username}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isLoading ? "Saving..." : "Save Username"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UsernameSettings;
