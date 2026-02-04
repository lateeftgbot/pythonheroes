import React from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { LogOut } from "lucide-react";

interface LogoutConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const LogoutConfirm = ({ isOpen, onClose, onConfirm }: LogoutConfirmProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] glass-card border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <LogOut className="w-5 h-5 text-destructive" />
                        Confirm Logout
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground pt-2">
                        Are you sure you want to log out of your account? You will need to sign in again to access your dashboard.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 pt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="font-mono hover:bg-muted"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="font-mono bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
                    >
                        Proceed to Log Out
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LogoutConfirm;
