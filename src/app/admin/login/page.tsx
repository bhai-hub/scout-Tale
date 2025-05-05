
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth"; // Import useAuth hook

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { login, isAdmin } = useAuth(); // Use the auth hook

  // Redirect if already logged in
  if (isAdmin) {
     if (typeof window !== 'undefined') { // Ensure this runs client-side
       router.push("/admin/upload");
     }
     return null; // Render nothing while redirecting
  }


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Simulate authentication check
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Basic check (replace with real auth logic)
    if (username === "admin" && password === "password") {
      login(); // Update auth state
      toast({
        title: "Login Successful",
        description: "Redirecting to admin dashboard...",
        variant: "default",
      });
      router.push("/admin/upload"); // Redirect to upload page
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
    // No need to reset fields on failure, let user correct
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin area.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
                className="text-base md:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
                autoComplete="current-password"
                className="text-base md:text-sm"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging In...
                </div>
              ) : (
                 <>
                 <LogIn className="mr-2 h-4 w-4" /> Login
                 </>
              )}
            </Button>
             <p className="text-xs text-center text-muted-foreground">
                Use username: <code className="font-mono bg-muted px-1 py-0.5 rounded">admin</code> and password: <code className="font-mono bg-muted px-1 py-0.5 rounded">password</code>
             </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
