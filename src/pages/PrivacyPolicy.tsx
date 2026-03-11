import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="container mx-auto px-4 pt-32 pb-24">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-black transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight uppercase italic pr-2">
                        Privacy <span className="text-green-600">Policy</span>
                    </h1>

                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-8 text-lg">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                            <p>
                                At Vectors.dev, we value your privacy and are committed to protecting your personal data.
                                This Privacy Policy explains how we collect, use, and safeguard your information when you
                                visit our website or use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                            <p>
                                We collect information that you provide directly to us, such as when you create an account,
                                subscribe to our newsletter, or communicate with us. This may include your name, email
                                address, and any other information you choose to provide.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to provide, maintain, and improve our services, to
                                process your transactions, and to communicate with you about our offerings and updates.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal
                                data against unauthorized access, loss, or alteration. However, no method of transmission
                                over the Internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at
                                <a href="mailto:lateefolayinka97@gmail.com" className="text-green-600 hover:underline ml-1">
                                    lateefolayinka97@gmail.com
                                </a>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
