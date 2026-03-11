import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CreditCard, Landmark, ArrowRight, Copy } from "lucide-react";

const Payment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isPaystackLoading, setIsPaystackLoading] = useState(false);

    // Get amount from dynamic state, default to 3000 if not provided
    interface LocationState {
        amount?: number;
    }
    const amount = (location.state as LocationState)?.amount || 3000;
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error("Failed to copy");
        });
    };

    useEffect(() => {
        // Load Paystack script
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    interface PaystackPop {
        setup: (options: Record<string, unknown>) => { openIframe: () => void };
    }

    const handlePaystackPayment = () => {
        if (!user) {
            toast.error("Please sign in to proceed with payment");
            navigate("/signin");
            return;
        }

        const paystackPop = (window as unknown as { PaystackPop: PaystackPop }).PaystackPop;

        if (!paystackPop) {
            toast.error("Payment system is still loading. Please try again in a moment.");
            return;
        }

        setIsPaystackLoading(true);

        // Notify Telegram Bot of Intent (Button Clicked) via Local Backend Proxy
        fetch("/api/notify-bot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: user.email,
                name: user.name,
                amount: amount,
                status: "intent_clicked"
            }),
        }).catch(err => console.error("Failed to notify intent:", err));

        const handler = paystackPop.setup({
            key: publicKey,
            email: user.email,
            amount: amount * 100, // Paystack expects amount in sub-units (kobo)
            currency: "NGN",
            ref: 'VEC_' + Math.floor((Math.random() * 1000000000) + 1), // Generate a random reference
            callback: function (response: { reference: string }) {
                console.log("Payment successful. Reference:", response.reference);
                setIsPaystackLoading(false);
                toast.success("Payment Successful! Welcome to Python Heroes.");

                // Notify Telegram Bot Website via Local Backend Proxy
                fetch("/api/notify-bot", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: user.email,
                        reference: response.reference,
                        amount: amount,
                        status: "success"
                    }),
                }).catch(err => console.error("Failed to notify bot:", err));

                // Redirect to dashboard
                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            },
            onClose: function () {
                setIsPaystackLoading(false);
                toast.info("Payment window closed.");
            },
            metadata: {
                custom_fields: [
                    {
                        display_name: "User Name",
                        variable_name: "user_name",
                        value: user.name
                    }
                ]
            }
        });

        handler.openIframe();
    };

    return (
        <div className="min-h-screen bg-white text-black relative overflow-hidden">
            <Navbar />

            <main className="pt-32 pb-24 relative z-10">
                {/* Background Elements - Absolute but confined to the main content area */}
                <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none -mt-32">
                    <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
                    <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-green-50 rounded-full blur-[120px] opacity-60" />
                </div>
                <div className="container mx-auto px-6 md:px-8">
                    <div className="max-w-4xl mx-auto">

                        {/* Header */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                                <span className="font-black text-[10px] text-blue-600 tracking-[0.2em] uppercase">Secure Enrollment</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 leading-tight">
                                Complete Your <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent italic pr-2">Enrollment</span>
                            </h1>
                            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                                Join the Python Heroes Academy today. Finalize your enrollment via our secure payment gateway to begin your journey.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-5 gap-10 items-start">

                            {/* Order Summary (2/5) */}
                            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl h-fit mx-auto w-full max-w-[380px] lg:max-w-none">
                                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900 uppercase tracking-tight">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm">1</div>
                                    Order Summary
                                </h3>

                                <div className="space-y-6 mb-8">
                                    <div className="flex justify-between items-start pb-6 border-b border-slate-50">
                                        <div>
                                            <h4 className="font-black text-slate-900 text-lg">Python Heroes</h4>
                                            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Premium Access</p>
                                        </div>
                                        <span className="font-black text-xl text-blue-600">₦{amount.toLocaleString()}</span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-400">Course Duration</span>
                                            <span className="text-slate-900">Lifetime Access</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-400">Mentorship</span>
                                            <span className="text-slate-900">Included</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-400">Certification</span>
                                            <span className="text-slate-900">Included</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-6 border-t border-slate-100 mb-8">
                                    <span className="font-black text-lg text-slate-900 uppercase">Total</span>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-green-600">₦{amount.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">One-time payment</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-500 font-bold border border-slate-100 flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                                    <p>Includes high-performance curriculum, community access, and personalized mentorship tracks.</p>
                                </div>
                            </div>

                            {/* Payment Options (3/5) */}
                            <div className="lg:col-span-3 space-y-6 mx-auto w-full max-w-[420px] lg:max-w-none">
                                <h3 className="text-xl font-black mb-4 flex items-center gap-3 text-slate-900 uppercase tracking-tight">
                                    <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center text-white text-sm">2</div>
                                    Payment Method
                                </h3>

                                {/* Card Payment (LATIVE Paystack) */}
                                <div className="bg-white rounded-[2rem] p-8 border-2 border-green-100 relative overflow-hidden group hover:border-green-300 transition-all shadow-xl shadow-green-50/50">
                                    <div className="absolute top-0 right-0 bg-green-600 text-white px-5 py-2 text-[10px] font-black tracking-widest uppercase rounded-bl-3xl">
                                        Fastest
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="w-8 h-8 text-green-600" />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="font-black text-xl mb-2 text-slate-900 uppercase tracking-tight">Card / Transfer</h4>
                                            <p className="text-base text-slate-500 font-medium mb-6">
                                                Instant enrollment via secure Paystack gateway. Supports all Nigerian cards.
                                            </p>

                                            <Button
                                                onClick={handlePaystackPayment}
                                                disabled={isPaystackLoading}
                                                size="lg"
                                                className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-200 transition-all hover:scale-[1.02] active:scale-95"
                                            >
                                                {isPaystackLoading ? "Initializing..." : "Enroll with Paystack"}
                                                <ArrowRight className="ml-3 w-6 h-6" />
                                            </Button>

                                            <p className="mt-4 text-[10px] text-slate-400 font-black text-center uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-green-400" />
                                                Verified & Secure
                                                <span className="w-1 h-1 rounded-full bg-green-400" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Payment;
