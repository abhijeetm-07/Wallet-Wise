"use client";

import React from "react";
import BarLoader from "react-spinners/BarLoader";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { useStoreUser } from "@/hooks/use-store-user";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";

const Header = () => {
  const { isLoading } = useStoreUser();
  const path = usePathname();

  return (
    <header className="fixed top-0 w-full border-b bg-white backdrop-blur z-50 support-[backdrop-filter]: bg-white/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img
            // ✅ FIX: Changed to ABSOLUTE path (starts with /)
            src="/logos/logo.png" 
            alt="WalletWise Logo"
            width={200}
            height={80}
            className="h-12 w-auto object-contain"
          />
        </Link>

        {path === "/" && (
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-green-600 transition"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:text-green-600 transition"
            >
              How It Works
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Authenticated>
            <Link href="/dashboard">
              <Button 
                variant={"outline"} 
                className="hidden md:inline-flex items-center gap-2 hover:bg-green-600 hover:border-green-600 hover:text-white border-green-600 text-green-600"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>
            <UserButton/>
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode="modal">
              <Button variant={"ghost"}>Sign In</Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button className="bg-green-600 hover:bg-green-800 border-none">
                Get Started
              </Button>
            </SignUpButton>
          </Unauthenticated>
        </div>
      </nav>
      {isLoading && <BarLoader width={"100%"} color="#36d7b7" />}
    </header>
  );
};

export default Header;