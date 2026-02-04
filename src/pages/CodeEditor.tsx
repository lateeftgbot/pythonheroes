import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IDEComponent from "@/components/IDEComponent";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const CodeEditor = () => {
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/signin", { replace: true });
        }
    }, [user, authLoading, navigate]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 pt-24 pb-8">
                <div className="container mx-auto px-4 h-full">
                    <IDEComponent showBackButton={false} />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CodeEditor;
