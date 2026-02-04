import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, UserPlus, ArrowRight, Loader2 } from "lucide-react";

const Verify = () => {
    const { token } = useParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/verify/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Verification successful!');
                    setUserName(data.name || '');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed. Link may be expired.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Network error during verification.');
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Navbar />

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0"></div>

            <main className="pt-24 pb-16 flex items-center justify-center min-h-screen relative z-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto">
                        <div className="glass-card rounded-2xl p-8 border border-border text-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

                            <div className="relative">
                                {status === 'loading' && (
                                    <div className="space-y-6">
                                        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                                        <h2 className="text-2xl font-bold">Verifying your account...</h2>
                                        <p className="text-muted-foreground">Please wait while we activate your Python Heroes access.</p>
                                    </div>
                                )}

                                {status === 'success' && (
                                    <div className="space-y-6">
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 shadow-lg shadow-primary/20">
                                            <CheckCircle2 className="w-12 h-12 text-primary" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-foreground">
                                            Congratulations{userName ? `, ${userName.split(' ')[0]}` : ''}!
                                        </h1>
                                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                            <p className="text-lg text-primary font-medium">{message}</p>
                                        </div>
                                        <p className="text-muted-foreground">
                                            Your account is now fully active. You're ready to start your journey as a Python Hero!
                                        </p>
                                        <Link to="/signin" className="block">
                                            <Button size="lg" className="w-full h-11 font-mono font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                                                Proceed to Sign In
                                                <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="space-y-6">
                                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto border border-destructive/20">
                                            <CheckCircle2 className="w-12 h-12 text-destructive rotate-180" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">Verification Issue</h2>
                                        <p className="text-destructive font-medium bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                                            {message}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            If your link has expired, you may need to register again or request a new verification email.
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            <Link to="/signup" className="block">
                                                <Button variant="outline" className="w-full h-11 font-mono border-primary/20 text-primary hover:bg-primary/5">
                                                    <UserPlus className="mr-2 w-4 h-4" />
                                                    Return to Sign Up
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Verify;
