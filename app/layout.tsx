import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "./components/auth/session-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import { ToastProvider } from "@/app/components/ui/use-toast";
import { WishlistProvider } from "@/hooks/use-wishlist";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "GlamBazar - Jewelry & Cosmetics",
    template: "%s | GlamBazar",
  },
  description:
    "Premium jewelry and cosmetics e-commerce platform with same-day delivery in Kanpur",
  keywords: [
    "jewelry",
    "cosmetics",
    "e-commerce",
    "diamonds",
    "makeup",
    "skincare",
  ],
  authors: [{ name: "GlamBazar Team" }],
  creator: "GlamBazar",
  publisher: "GlamBazar",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://glam-bazaar.vercel.app/",
    title: "GlamBazar - Jewelry & Cosmetics",
    description: "Premium jewelry and cosmetics e-commerce platform",
    siteName: "GlamBazar",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlamBazar - Jewelry & Cosmetics",
    description: "Premium jewelry and cosmetics e-commerce platform",
    creator: "@glambazar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.variable}>
      <body className={`font-sans antialiased min-h-screen bg-background`}>
        <SessionProvider session={session}>
          <ToastProvider>
            <WishlistProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </WishlistProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}