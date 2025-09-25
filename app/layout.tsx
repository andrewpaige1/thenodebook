import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Auth0Provider } from '@auth0/nextjs-auth0';
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import { Analytics } from '@vercel/analytics/next';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Mindthred",
  description: "Understand the concepts for your coursework",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Auth0Provider>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <Menu />
        {children}
      <Footer />
      <Analytics />
      </body>
      </Auth0Provider>
    </html>
  );
}
