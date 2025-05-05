
import type { Metadata } from "next";
import { Geist } from "next/font/google"; // Changed from Geist_Sans
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { AuthProvider } from "@/hooks/use-auth"; // Import AuthProvider

const geist = Geist({ // Changed from geistSans
  variable: "--font-geist-sans", // Keep variable name consistent if used elsewhere
  subsets: ["latin"],
});

// Removed Geist_Mono as it's not explicitly used in the design

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
    <html lang="en">
       <body className={`${geist.variable} antialiased flex flex-col min-h-screen`}>
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
