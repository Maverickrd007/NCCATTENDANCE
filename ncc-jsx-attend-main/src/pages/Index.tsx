import { useState } from "react";
import LoginPage from "@/components/auth/LoginPage";
import SignupPage from "@/components/auth/SignupPage";
import CadetNavigation from "@/components/cadet/CadetNavigation";
import CadetDashboard from "@/components/cadet/CadetDashboard";
import { useToast } from "@/hooks/use-toast";
import { Cadet } from "@/services/api";

const Index = () => {
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentCadet, setCurrentCadet] = useState<Cadet | null>(null);

  const handleLogin = (cadetData: Cadet) => {
    setCurrentCadet(cadetData);
  };

  const handleSignup = (cadetData: Cadet) => {
    setCurrentCadet(cadetData);
  };

  const handleLogout = () => {
    setCurrentCadet(null);
    setAuthMode('login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleUpdateAttendance = (status: Cadet['attendanceStatus']) => {
    if (currentCadet) {
      setCurrentCadet({
        ...currentCadet,
        attendanceStatus: status,
      });
    }
  };

  // If not logged in, show authentication pages
  if (!currentCadet) {
    if (authMode === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthMode('signup')}
        />
      );
    } else {
      return (
        <SignupPage
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      );
    }
  }

  // If logged in, show cadet dashboard
  return (
    <div className="min-h-screen bg-background">
      <CadetNavigation 
        currentCadet={currentCadet} 
        onLogout={handleLogout}
      />
      <main className="px-6 md:px-8 py-8">
        <CadetDashboard
          currentCadet={currentCadet}
          onUpdateAttendance={handleUpdateAttendance}
        />
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-muted/30 px-6 md:px-8 py-6 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              © 2024 NCC Attendance Portal. Built for National Cadet Corps Excellence.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Unity & Discipline</span>
            <span>•</span>
            <span>Service Before Self</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;