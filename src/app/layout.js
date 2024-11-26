
"use client";
import localFont from "next/font/local";
import "./globals.css";

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



import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
      <footer className="bg-black shadow-md mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600 font-grotesk text-[#00f5d0]">
            <p className="text-sm font-grotesk">
              {new Date().getFullYear()} Copyrights@Hackerz.
            </p>
          </div>
        </div>
      </footer>
    </html>
  );
}
