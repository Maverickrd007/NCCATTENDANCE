import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";
import nccFlag from "@/assets/nccflagm.jpg";
import { apiService, Cadet } from "@/services/api";

interface LoginPageProps {
  onLogin: (cadetData: Cadet) => void;
  onSwitchToSignup: () => void;
}

const LoginPage = ({ onLogin, onSwitchToSignup }: LoginPageProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    regNumber: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.login({
        regNumber: formData.regNumber,
        password: formData.password,
      });
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.cadet.name}!`,
      });
      
      onLogin(response.cadet);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Banner */}
      <div 
        className="h-32 md:h-48 bg-gradient-hero bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${nccFlag})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero/80"></div>
        <div className="relative h-full flex items-center justify-center px-6">
          <div className="text-center text-primary-foreground">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">NCC Attendance Portal</h1>
            <p className="text-lg opacity-90">Cadet Login - Unity & Discipline</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md ncc-card">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Cadet Login</CardTitle>
            <p className="text-muted-foreground">Enter your credentials to access the portal</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <Input
                  id="regNumber"
                  name="regNumber"
                  type="text"
                  placeholder="NCC/2024/XXX"
                  value={formData.regNumber}
                  onChange={handleInputChange}
                  required
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up here
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  Contact your commanding officer if you need assistance
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-6 py-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 NCC Attendance Portal - Service Before Self
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;