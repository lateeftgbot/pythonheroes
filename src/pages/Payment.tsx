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
        <div className="min-h-screen bg-background relative overflow-hidden">
            <Navbar />

            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background z-0"></div>

            <main className="pt-24 pb-16 min-h-screen relative z-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">

                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="inline-block px-3 py-1 mb-3 text-xs font-mono text-secondary bg-secondary/10 rounded-full border border-secondary/20 font-bold">
                                SECURE ENROLLMENT
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4">
                                Complete Your <span className="text-gradient-secondary">Enrollment</span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Join the Python Heroes Academy today. Choose your preferred payment method below.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">

                            {/* Order Summary */}
                            <div className="glass-card rounded-2xl p-8 border border-border h-fit">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-mono">1</span>
                                    Order Summary
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-start pb-4 border-b border-border">
                                        <div>
                                            <h4 className="font-semibold text-foreground">Python Heroes Course</h4>
                                            <p className="text-sm text-muted-foreground">Complete Access</p>
                                        </div>
                                        <span className="font-mono font-bold">₦{amount.toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Course Duration</span>
                                        <span>1 Month</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Mentorship</span>
                                        <span>Included</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-border mb-8">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-bold text-2xl text-primary">₦{amount.toLocaleString()}</span>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground border border-white/5">
                                    <p>Includes lifetime access to course materials, community, and certificate of completion.</p>
                                </div>
                            </div>

                            {/* Payment Options */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-sm font-mono">2</span>
                                    Payment Method
                                </h3>

                                {/* Card Payment (LATIVE Paystack) */}
                                <div className="glass-card rounded-xl p-6 border border-primary/30 relative overflow-hidden group hover:border-primary/60 transition-all cursor-pointer shadow-lg shadow-primary/5">
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-mono tracking-widest font-bold rounded-bl-lg uppercase">
                                        FASTEST
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg mb-1">Pay with Card / Transfer</h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Fastest way to get started. Securely powered by Paystack.
                                            </p>

                                            <Button
                                                onClick={handlePaystackPayment}
                                                disabled={isPaystackLoading}
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                                            >
                                                {isPaystackLoading ? "Initializing..." : "Enroll Now with Card"}
                                                <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>

                                            <div className="mt-3 flex items-center justify-center gap-2 opacity-50">
                                                <div className="h-px bg-muted-foreground w-4"></div>
                                                <span className="text-[10px] uppercase tracking-tighter font-mono">Secure Payment Gateway</span>
                                                <div className="h-px bg-muted-foreground w-4"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Transfer (Manual) */}
                                <div className="glass-card rounded-xl p-6 border border-border relative overflow-hidden group hover:border-secondary/40 transition-colors cursor-pointer bg-muted/5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                            <Landmark className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1 text-muted-foreground">Direct Bank Transfer</h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Pay directly to our business account. Use this if your card is unavailable.
                                            </p>

                                            <div
                                                className="flex justify-between items-center cursor-pointer hover:text-primary transition-colors group/copy"
                                                onClick={() => copyToClipboard("OPay", "Bank Name")}
                                            >
                                                <span className="text-muted-foreground">Bank:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground group-hover/copy:text-primary transition-colors">OPay</span>
                                                    <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                            <div
                                                className="flex justify-between items-center cursor-pointer hover:text-primary transition-colors group/copy"
                                                onClick={() => copyToClipboard("8162043451", "Account Number")}
                                            >
                                                <span className="text-muted-foreground">Account:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground font-bold select-all group-hover/copy:text-primary transition-colors">8162043451</span>
                                                    <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                            <div
                                                className="flex justify-between items-center cursor-pointer hover:text-primary transition-colors group/copy"
                                                onClick={() => copyToClipboard("Lateef Olayinka Basiru", "Account Name")}
                                            >
                                                <span className="text-muted-foreground">Name:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground group-hover/copy:text-primary transition-colors">Lateef Olayinka Basiru</span>
                                                    <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <Button variant="outline" className="w-full border-border hover:bg-muted font-bold text-xs" asChild>
                                                    <a href="https://wa.me/2348162043451?text=Hi, I want to confirm my payment for Python Heroes Academy." target="_blank" rel="noopener noreferrer">
                                                        Confirm via WhatsApp
                                                        <ArrowRight className="ml-2 w-3 h-3" />
                                                    </a>
                                                </Button>
                                            </div>
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
