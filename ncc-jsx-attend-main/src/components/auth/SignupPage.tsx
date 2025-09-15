import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import nccFlag from "@/assets/nccflagm.jpg";
import { apiService, Cadet } from "@/services/api";

interface SignupPageProps {
  onSignup: (cadetData: Cadet) => void;
  onSwitchToLogin: () => void;
}

const SignupPage = ({ onSignup, onSwitchToLogin }: SignupPageProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    regNumber: '',
    company: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const companies = ['A Company', 'B Company', 'C Company'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.signup({
        name: formData.name,
        regNumber: formData.regNumber,
        company: formData.company,
        phone: formData.phone,
        password: formData.password,
      });
      
      toast({
        title: "Account Created Successfully",
        description: `Welcome to NCC, ${formData.name}!`,
      });
      
      onSignup(response.cadet);
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again.",
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

  const handleCompanyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      company: value
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
            <p className="text-lg opacity-90">Cadet Registration - Join the Corps</p>
          </div>
        </div>
      </div>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md ncc-card">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Cadet Registration</CardTitle>
            <p className="text-muted-foreground">Create your NCC portal account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

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
                <Label htmlFor="company">Company</Label>
                <Select value={formData.company} onValueChange={handleCompanyChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 XXXXXXXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 characters)"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-primary hover:underline font-medium"
                  >
                    Login here
                  </button>
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
            © 2024 NCC Attendance Portal - Service Before Self
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SignupPage;