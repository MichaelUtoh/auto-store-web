import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToasterTheme } from "@/components/theme/ToasterTheme";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SupportChatWidget } from "@/components/support/SupportChatWidget";
import { AuthHydration } from "@/components/auth/AuthHydration";
import { NotificationPolling } from "@/components/notifications/NotificationPolling";
import { WishlistHydration } from "@/components/wishlist/WishlistHydration";
import { CartHydration } from "@/components/cart/CartHydration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "247carkiosk – Quality Auto Parts",
  description: "Shop quality auto parts for your vehicle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans">
        <ThemeProvider>
          <AuthHydration />
          <WishlistHydration />
          <CartHydration />
          <NotificationPolling />
          <Header />
          <main className="flex-1 pb-24 lg:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <MobileNav />
          <CartDrawer />
          <SupportChatWidget />
          <ToasterTheme />
        </ThemeProvider>
      </body>
    </html>
  );
}
