import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Heart, Stethoscope, Droplets, UserCog, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRole, UserRole } from "@/contexts/RoleContext";

type AuthMode = "login" | "register";

const roles = [
  { id: "patient", label: "Patient", icon: User },
  { id: "doctor", label: "Doctor", icon: Stethoscope },
  { id: "donor", label: "Donor", icon: Droplets },
  { id: "admin", label: "Admin", icon: UserCog },
  { id: "health_worker", label: "Health Worker", icon: Heart },
];

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("patient");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setRole, setUserName } = useRole();

  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  const handleLogin = async (data: LoginForm) => {
    try {
      const response = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      if (!response.ok) throw new Error("Invalid credentials");
      
      const resData = await response.json();
      localStorage.setItem("token", resData.token);
      localStorage.setItem("userId", String(resData.user.id));   // Bug #1 fix
      localStorage.setItem("userRole", resData.user.role);
      localStorage.setItem("userName", resData.user.name);       // Bug #2 fix
      
      // Bug #5 fix: role from backend is already lowercase without ROLE_ prefix
      const roleStr = resData.user.role.replace("ROLE_", "").toLowerCase() as UserRole;
      setRole(roleStr);
      setUserName(resData.user.name);
      toast({ title: "Welcome back!", description: `Signed in successfully` });
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (error) {
      toast({ title: "Login Failed", description: "Invalid email or password", variant: "destructive" });
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    try {
      const response = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          role: selectedRole
        })
      });

      if (!response.ok) throw new Error("Registration failed");
      
      const resData = await response.json();
      localStorage.setItem("userId", String(resData.user.id));
      localStorage.setItem("userName", resData.user.name);
      setRole(selectedRole as UserRole);
      if (data.name) setUserName(data.name);
      
      toast({ title: "Account created!", description: "Welcome to Maternal-Guard. Please sign in." });
      setMode("login");
    } catch (error) {
      toast({ title: "Registration Failed", description: "Email might already be in use", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 rounded-full border-2 border-primary-foreground" />
          <div className="absolute bottom-32 right-16 w-60 h-60 rounded-full border border-primary-foreground" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full border border-primary-foreground" />
        </div>
        <div className="relative z-10 text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-primary-foreground">
            Maternal-Guard
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            AI-Driven Maternal Care & Emergency Donor Network
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4 text-center">
            <div className="p-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10">
              <p className="text-xs font-bold text-primary-foreground">AI Risk Engine</p>
              <p className="text-[10px] text-primary-foreground/70 mt-0.5">Clinical ML</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10">
              <p className="text-xs font-bold text-primary-foreground">SOS Network</p>
              <p className="text-[10px] text-primary-foreground/70 mt-0.5">Blood Donors</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10">
              <p className="text-xs font-bold text-primary-foreground">Maternal Care</p>
              <p className="text-[10px] text-primary-foreground/70 mt-0.5">Field Sync</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-heading font-bold text-xl">Maternal-Guard</h1>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "login"
                ? "Sign in to access your dashboard"
                : "Join the maternal care network"}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                mode === "login"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                mode === "register"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Register
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@hospital.com"
                  {...loginForm.register("email", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...loginForm.register("password", { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="medical" size="lg" className="w-full">
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all",
                          selectedRole === role.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Dr. Smith" {...registerForm.register("name", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+1 234 567" {...registerForm.register("phone", { required: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="doctor@hospital.com" {...registerForm.register("email", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerForm.register("password", { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="medical" size="lg" className="w-full">
                Create Account
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
