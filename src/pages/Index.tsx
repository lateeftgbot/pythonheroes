import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import SkillsSection from "@/components/SkillsSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <HeroSection />
      <SkillsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
