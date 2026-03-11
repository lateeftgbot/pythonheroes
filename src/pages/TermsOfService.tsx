import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
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
                        Terms of <span className="text-green-600">Service</span>
                    </h1>

                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-8 text-lg">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
                            <p>
                                By accessing or using our website, you agree to be bound by these Terms of Service
                                and all applicable laws and regulations. If you do not agree with any of these terms,
                                you are prohibited from using or accessing this site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Use License</h2>
                            <p>
                                Permission is granted to temporarily download one copy of the materials (information
                                or software) on Vectors.dev for personal, non-commercial transitory viewing only.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Disclaimer</h2>
                            <p>
                                The materials on Vectors.dev are provided on an 'as is' basis. We make no warranties,
                                expressed or implied, and hereby disclaim and negate all other warranties including,
                                without limitation, implied warranties or conditions of merchantability, fitness for
                                a particular purpose, or non-infringement of intellectual property.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Limitations</h2>
                            <p>
                                In no event shall Vectors.dev or its suppliers be liable for any damages (including,
                                without limitation, damages for loss of data or profit, or due to business interruption)
                                arising out of the use or inability to use the materials on Vectors.dev.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Governing Law</h2>
                            <p>
                                These terms and conditions are governed by and construed in accordance with the laws
                                and you irrevocably submit to the exclusive jurisdiction of the courts in that State
                                or location.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfService;
