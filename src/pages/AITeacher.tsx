import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AITeacherComponent from "../components/AITeacherComponent";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, GraduationCap } from "lucide-react";

const AITeacher = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/signin", { replace: true });
        }
    }, [user, isLoading, navigate]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12 flex flex-col">
                <div className="container mx-auto px-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <GraduationCap className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">AI Python Teacher</h1>
                                <p className="text-xs text-slate-400 font-mono tracking-widest uppercase italic">{"// mentor: vectors"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span className="text-xs font-bold text-slate-300">Learning Mode: Interactive</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row gap-8">
                        {/* Interactive AI Teacher Component */}
                        <AITeacherComponent />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AITeacher;
