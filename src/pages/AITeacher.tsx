import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AITeacherComponent from "../components/AITeacherComponent";
import AppDrawer from "@/components/AppDrawer";
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
        <div className="min-h-screen bg-[#fdf6e3] text-[#1a1a1a] flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12 flex flex-col">
                <div className="container mx-auto px-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/10 border-2 border-emerald-500/20">
                                <GraduationCap className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black tracking-tight uppercase">AI Python Teacher</h1>
                                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase italic">{"// mentor: vectors"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 border-2 border-black/10">
                            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-600">Learning Mode: Interactive</span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Interactive AI Teacher Component */}
                        <AITeacherComponent />
                    </div>
                </div>
            </main>
            <AppDrawer />
        </div>
    );
};

export default AITeacher;
