import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Mountain } from "lucide-react"; // Using Mountain as a placeholder logo

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
           <Mountain className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-primary">
            ScoutVlog Central
          </span>
        </Link>
        <nav className="hidden flex-1 items-center space-x-4 md:flex">
          <Link href="/" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Vlogs
          </Link>
          <Link href="/admin/upload" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Admin Upload
          </Link>
          {/* Add other links if needed */}
        </nav>
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
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                   <Mountain className="h-6 w-6 text-primary" />
                   <span className="text-primary">ScoutVlog Central</span>
                </Link>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Vlogs
                </Link>
                 <Link href="/admin/upload" className="text-muted-foreground hover:text-foreground">
                  Admin Upload
                </Link>
                 {/* Add other mobile links */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
         <div className="hidden md:flex items-center justify-end flex-1 space-x-2">
             {/* Placeholder for potential user auth button */}
             {/* <Button variant="outline">Login</Button> */}
         </div>
      </div>
    </header>
  );
}
