import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "SAHAAY — Your Financial Journey Partner",
  description: "One financial context. One guided journey. No starting over.",
  icons: {
    icon: "/images/sahaay_symbol.png",
    apple: "/images/sahaay_symbol.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#101B35] flex flex-col antialiased selection:bg-[#D9FF32] selection:text-[#101B35]">
        <LanguageProvider>
          <Header />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
