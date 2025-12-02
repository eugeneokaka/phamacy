"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full px-6 py-4 shadow-md bg-white relative">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          Pharmacy
        </Link>

        {/* Hamburger Button (Mobile) */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {!isLoaded ? null : !isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/transactions"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Transactions
              </Link>
              <Link
                href="/prescriptions"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Prescriptions
              </Link>
              <Link
                href="/new"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                New Medicine
              </Link>

              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: { userButtonAvatarBox: "w-8 h-8" },
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mt-4 flex flex-col space-y-4">
          {!isLoaded ? null : !isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/transactions"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Transactions
              </Link>
              <Link
                href="/prescriptions"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Prescriptions
              </Link>
              <Link
                href="/new"
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                New Medicine
              </Link>

              {/* User Button */}
              <div className="mt-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: { userButtonAvatarBox: "w-8 h-8" },
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
