import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AdminRequestDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdminRequestDialog = ({ isOpen, onClose }: AdminRequestDialogProps) => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/user/request-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                }),
            });

            if (response.ok) {
                setIsSuccess(true);
                toast.success("Admin request sent successfully!");
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                }, 2000);
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to send request");
            }
        } catch (error) {
            console.error("Failed to request admin:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-primary/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <ShieldAlert className="w-5 h-5 text-primary" />
                        Elevate Permissions
                    </DialogTitle>
                    <DialogDescription className="font-mono text-xs pt-2">
                        {"// Access Restricted: Administrative override detected."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-4 animate-in fade-in zoom-in-95">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <p className="text-center font-medium">Request Sent!</p>
                            <p className="text-xs text-muted-foreground text-center">
                                The administrator has been notified. Check your email for status updates.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-foreground">
                                You are about to request <span className="text-primary font-bold">Admin Privileges</span> for:
                            </p>
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">Requester</p>
                                <p className="font-semibold">{user?.name}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                            <p className="text-[11px] text-muted-foreground italic">
                                Note: This request will be logged and sent to the system administrator for approval.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    {!isSuccess && (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="font-mono text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit Request
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AdminRequestDialog;
