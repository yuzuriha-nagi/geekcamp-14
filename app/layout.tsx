import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import SupabaseListener from "@/components/SupabaseListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebSchool",
  description: "Web-based school management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          margin: 0,
        }}
      >
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <SupabaseListener />
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
