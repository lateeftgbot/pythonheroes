import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DeletedUser<T = any> {
    id: string; // Using email or ID as unique identifier
    data?: T;   // Checkpoint data to restore visibility if API hides them
    deletedAt: number;
}

const STORAGE_KEY = 'soft_deleted_users';
const DELETE_DELAY_MS = 5 * 60 * 1000; // 5 minutes

export const useSoftDelete = () => {
    const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
    const { user: currentUser } = useAuth();

    // Load from storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setDeletedUsers(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse deleted users", e);
            }
        }
    }, []);

    // Save to storage whenever state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deletedUsers));
    }, [deletedUsers]);

    // Check for expired deletions periodically
    useEffect(() => {
        const checkExpiration = async () => {
            const now = Date.now();
            const expiredUsers = deletedUsers.filter(u => now - u.deletedAt > DELETE_DELAY_MS);

            if (expiredUsers.length > 0 && currentUser?.role === 'admin') {
                console.log("Processing permanent deletion for:", expiredUsers);

                for (const user of expiredUsers) {
                    try {
                        await fetch(`/api/admin/users/${user.id}`, {
                            method: 'DELETE',
                            headers: { 'X-Admin-Email': currentUser.email }
                        });
                        // Remove from local storage after successful delete
                        setDeletedUsers(prev => prev.filter(u => u.id !== user.id));
                    } catch (err) {
                        console.error(`Failed to permanently delete user ${user.id}`, err);
                    }
                }
            }
        };

        const interval = setInterval(checkExpiration, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, [deletedUsers, currentUser]);

    const softDeleteUser = useCallback(async (id: string, data?: any) => {
        const newUser = { id, data, deletedAt: Date.now() };

        // 1. Update backend to suspend (force logout)
        if (currentUser?.role === 'admin') {
            try {
                await fetch(`/api/admin/users/${id}/status`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Admin-Email": currentUser.email
                    },
                    body: JSON.stringify({ is_active: false }),
                });
            } catch (err) {
                console.error("Failed to suspend user during soft delete", err);
            }
        }

        // 2. Update local soft-delete state
        setDeletedUsers(prev => {
            // Avoid duplicates
            if (prev.some(u => u.id === id)) return prev;
            return [...prev, newUser];
        });
    }, [currentUser]);

    const undoDeleteUser = useCallback(async (id: string) => {
        // 1. Update backend to activate (restore access)
        if (currentUser?.role === 'admin') {
            try {
                await fetch(`/api/admin/users/${id}/status`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Admin-Email": currentUser.email
                    },
                    body: JSON.stringify({ is_active: true }),
                });
            } catch (err) {
                console.error("Failed to restore user during undo", err);
            }
        }

        // 2. Update local soft-delete state
        setDeletedUsers(prev => prev.filter(u => u.id !== id));
    }, [currentUser]);

    const isDeleted = useCallback((id: string) => {
        return deletedUsers.some(u => u.id === id);
    }, [deletedUsers]);

    const getRemainingTime = useCallback((id: string) => {
        const user = deletedUsers.find(u => u.id === id);
        if (!user) return 0;
        const elapsed = Date.now() - user.deletedAt;
        return Math.max(0, DELETE_DELAY_MS - elapsed);
    }, [deletedUsers]);

    return {
        deletedUsers,
        softDeleteUser,
        undoDeleteUser,
        isDeleted,
        getRemainingTime
    };
};
