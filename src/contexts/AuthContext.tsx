import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    name: string;
    email: string;
    role: 'student' | 'admin' | 'master1_vectors';
    telegram_chat_id?: string;
    username?: string;
    profile_picture?: string;
    is_online?: boolean;
    is_active?: boolean;
    is_verified?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Heartbeat logic
        if (user) {
            const sendHeartbeat = async () => {
                try {
                    const response = await fetch("/api/auth/heartbeat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: user.email })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Sync role and status if changed
                        if (data.role && data.role !== user.role) {
                            console.log(`Role updated from ${user.role} to ${data.role}`);
                            const updatedUser = { ...user, role: data.role };
                            setUser(updatedUser);
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                        }
                    } else if (response.status === 401 || response.status === 403) {
                        console.warn("Heartbeat failed with 401/403. User session may be invalid.");
                        // logout(); // Temporarily disabled to debug refresh issue
                    }
                } catch (err) {
                    console.error("Heartbeat failed", err);
                }
            };

            // Initial heartbeat
            sendHeartbeat();

            // Setup interval (every 30 seconds)
            const intervalId = setInterval(sendHeartbeat, 30000);
            return () => clearInterval(intervalId);
        }
    }, [user]);

    useEffect(() => {
        // Load user from localStorage on initial mount
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Error parsing stored user:', error);
                    localStorage.removeItem('user');
                }
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        try {
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving user to localStorage:', error);
        }
    };

    const logout = async () => {
        if (user) {
            // Notify backend about logout for presence tracking
            try {
                await fetch("/api/auth/logout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email })
                });
            } catch (err) {
                console.error("Backend logout notification failed", err);
            }
        }
        setUser(null);
        try {
            localStorage.removeItem('user');
        } catch (error) {
            console.error('Error removing user from localStorage:', error);
        }
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            try {
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (error) {
                console.error('Error updating user in localStorage:', error);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
