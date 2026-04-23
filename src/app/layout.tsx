import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthHydration } from "@/components/auth/AuthHydration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AutoParts – Quality Auto Parts",
  description: "Shop quality auto parts for your vehicle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans">
        <AuthHydration />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
        <CartDrawer />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}
