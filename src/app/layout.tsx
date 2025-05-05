
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // Import GeistSans from geist/font/sans
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { AuthProvider } from "@/hooks/use-auth"; // Import AuthProvider

const geistSans = GeistSans({ // Instantiate GeistSans
  variable: "--font-geist-sans", // Keep variable name consistent
  // subsets are not typically needed for Geist from geist/font
});

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
       {/* Apply the font variable to the body */}
       <body className={`${geistSans.variable} font-sans antialiased flex flex-col min-h-screen`}> {/* Added font-sans */}
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
