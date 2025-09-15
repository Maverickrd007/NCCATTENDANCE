import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Users, UserCheck, Settings, Menu, X } from "lucide-react";
import nccFlag from "@/assets/nccflagm.jpg";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'roster', label: 'Cadet Roster', icon: Users },
    { id: 'attendance', label: 'Mark Attendance', icon: UserCheck },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Header */}
      <header className="relative overflow-hidden">
        <div 
          className="h-32 md:h-48 bg-gradient-hero bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${nccFlag})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero/80"></div>
          <div className="relative h-full flex items-center justify-between px-6 md:px-8">
            <div className="text-primary-foreground">
              <h1 className="text-2xl md:text-4xl font-bold">NCC Attendance Portal</h1>
              <p className="text-sm md:text-lg opacity-90 mt-1">National Cadet Corps - Excellence Through Discipline</p>
            </div>
            
            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMobileMenu}
              className="md:hidden bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block bg-background border-b shadow-sm">
          <div className="px-6 md:px-8">
            <nav className="flex space-x-1 py-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => onTabChange(item.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-b shadow-lg">
            <nav className="flex flex-col p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 justify-start"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navigation;