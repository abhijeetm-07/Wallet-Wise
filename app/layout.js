import {Inter } from "next/font/google";
import Header from "@/components/header";
import "./globals.css";

const inter=Inter({subsets:["latin"]})

export const metadata = {
  title: "WalletWise: AI-Powered Finance & Expense Splitting App",
  description: "An AI-powered app for smart finance splitting and monthly spending reviews. Gain actionable insights, track shared expenses, and manage your money effortlessly. Start making smarter financial decisions today.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon "></link>
      </head>
      <body
        className={`${inter.className}`}
      >

        <Header />
        <main className="min-h-screen">
            {children}
        </main>
      
      </body>
    </html>
  );
}
