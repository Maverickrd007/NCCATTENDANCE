import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import nccFlag from "@/assets/nccflagm.jpg";

interface CadetNavigationProps {
  currentCadet: {
    name: string;
    regNumber: string;
    rank: string;
    company: string;
  };
  onLogout: () => void;
}

const CadetNavigation = ({ currentCadet, onLogout }: CadetNavigationProps) => {
  return (
    <header className="relative overflow-hidden">
      <div 
        className="h-24 md:h-32 bg-gradient-hero bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${nccFlag})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero/80"></div>
        <div className="relative h-full flex items-center justify-between px-6 md:px-8">
          <div className="text-primary-foreground">
            <h1 className="text-xl md:text-2xl font-bold">NCC Attendance Portal</h1>
            <p className="text-sm opacity-90">Cadet Dashboard</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Cadet Info */}
            <div className="hidden md:block text-right text-primary-foreground">
              <div className="text-sm font-medium">{currentCadet.name}</div>
              <div className="text-xs opacity-80">
                {currentCadet.rank} • {currentCadet.regNumber}
              </div>
              <div className="text-xs opacity-80">{currentCadet.company}</div>
            </div>
            
            {/* Profile Icon for Mobile */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Cadet Info */}
      <div className="md:hidden bg-background border-b px-6 py-3">
        <div className="text-center">
          <div className="font-medium text-foreground">{currentCadet.name}</div>
          <div className="text-sm text-muted-foreground">
            {currentCadet.rank} • {currentCadet.regNumber} • {currentCadet.company}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CadetNavigation;