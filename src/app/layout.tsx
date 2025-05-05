
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // Import GeistSans
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { AuthProvider } from "@/hooks/use-auth"; // Import AuthProvider

// Removed the instantiation:
// const geistSans = GeistSans({
//   variable: "--font-geist-sans",
// });

export const metadata: Metadata = {
  title: "ScoutVlog Central",
  description: "A vlog website for scout agencies.", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply GeistSans.className directly to the html tag
    <html lang="en" className={GeistSans.className}>
       {/* Removed geistSans.variable and font-sans from body */}
       <body className={`antialiased flex flex-col min-h-screen`}>
        <AuthProvider> {/* Wrap components with AuthProvider */}
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
            {children}
            </main>
            <Footer />
            <Toaster /> {/* Add Toaster component here */}
        </AuthProvider>
       </body>
    </html>
  );
}
