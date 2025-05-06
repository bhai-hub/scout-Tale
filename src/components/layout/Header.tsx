
"use client"; // Add this directive because we use hooks

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Mountain, LogOut, LogIn, UploadCloud } from "lucide-react"; // Added icons
import { useAuth } from "@/hooks/use-auth"; // Import auth hook
import { useRouter } from "next/navigation"; // Import router

export default function Header() {
  const { isAdmin, logout } = useAuth(); // Get auth state and logout function
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/"); // Redirect to home after logout
    // Optionally show a toast message
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
           <Mountain className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-primary">
            Scout Tales
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center space-x-4 md:flex">
          <Link href="/" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Vlogs
          </Link>
          {isAdmin && ( // Show Admin Upload only if logged in
             <Link href="/admin/upload" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
                Admin Upload
             </Link>
          )}
        </nav>

         {/* Desktop Auth Button */}
         <div className="hidden md:flex items-center justify-end flex-1 space-x-2">
           {isAdmin ? (
             <Button variant="outline" size="sm" onClick={handleLogout}>
               <LogOut className="mr-2 h-4 w-4" /> Logout
             </Button>
           ) : (
             <Link href="/admin/login" passHref>
               <Button variant="outline" size="sm">
                 <LogIn className="mr-2 h-4 w-4" /> Admin Login
               </Button>
             </Link>
           )}
         </div>


        {/* Mobile Navigation Toggle */}
        <div className="flex flex-1 items-center justify-end space-x-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium pt-10">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                   <Mountain className="h-6 w-6 text-primary" />
                   <span className="text-primary">Scout Tales</span>
                </Link>
                <Link href="/" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  {/* Icon placeholder if needed */} Vlogs
                </Link>
                 {isAdmin && ( // Mobile Admin Upload
                     <Link href="/admin/upload" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                      <UploadCloud className="h-5 w-5" /> Admin Upload
                     </Link>
                 )}
                 {/* Mobile Auth Button/Link */}
                 {isAdmin ? (
                    <Button variant="ghost" onClick={handleLogout} className="flex items-center justify-start gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                       <LogOut className="h-5 w-5" /> Logout
                    </Button>
                 ) : (
                    <Link href="/admin/login" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                       <LogIn className="h-5 w-5" /> Admin Login
                    </Link>
                 )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
