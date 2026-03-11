import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import PythonHeroes from "./pages/PythonHeroes";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserDetails from "./pages/UserDetails";
import CodeEditor from "./pages/CodeEditor";
import Verify from "./pages/Verify";
import Profile from "./pages/Profile";
import TelegramEntry from "./pages/TelegramEntry";
import ChatRoom from "./pages/ChatRoom";
import Conversations from "./pages/Conversations";
import LearningSpace from "./pages/LearningSpace";
import Settings from "./pages/Settings";
import AdminMaterials from "./pages/AdminMaterials";
import AdminApproval from "./pages/AdminApproval";
import InfiniteSpace from "./pages/InfiniteSpace";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AdminMissions from "./pages/AdminMissions";
import AdminCreateProblems from "./pages/AdminCreateProblems";
import AdminBrowseProblemSets from "./pages/AdminBrowseProblemSets";
import AITeacher from "./pages/AITeacher";
import NotFound from "./pages/NotFound";
import ScrollToTop from "@/components/ScrollToTop";
import LearningPrefetcher from "./components/LearningPrefetcher";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LearningPrefetcher />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/python-heroes" element={<PythonHeroes />} />
            <Route path="/infinite-space" element={<InfiniteSpace />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/user/:id" element={<UserDetails />} />
            <Route path="/code-editor" element={<CodeEditor />} />
            <Route path="/chat-room" element={<ChatRoom />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/learning-space" element={<LearningSpace />} />
            <Route path="/api/verify/:token" element={<Verify />} />
            <Route path="/verify/:token" element={<Verify />} />
            <Route path="/tg/:chatId" element={<TelegramEntry />} />
            <Route path="/admin/materials" element={<AdminMaterials />} />
            <Route path="/admin/approve/:token" element={<AdminApproval />} />
            <Route path="/admin/missions" element={<AdminMissions />} />
            <Route path="/admin/create-problems" element={<AdminCreateProblems />} />
            <Route path="/admin/problem-sets" element={<AdminBrowseProblemSets />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-teacher" element={<AITeacher />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
