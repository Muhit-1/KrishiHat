import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";
import { LocaleProvider } from "@/providers/locale-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "KrishiHat — Bangladesh Agricultural Marketplace",
    template: "%s | KrishiHat",
  },
  description:
    "Buy and sell agricultural products, bid at live auctions, and check daily market prices across Bangladesh. কৃষিহাট — বাংলাদেশের কৃষি মার্কেটপ্লেস",
  keywords: [
    "agriculture",
    "bangladesh",
    "farming",
    "marketplace",
    "krishihat",
    "কৃষি",
    "বাংলাদেশ",
  ],
  openGraph: {
    title: "KrishiHat — Bangladesh Agricultural Marketplace",
    description: "Buy and sell agricultural products across Bangladesh",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        <LocaleProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}