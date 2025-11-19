"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center shadow-md">
      {/* Brand / Logo */}
      <Link href="/" className="text-xl font-bold">
        Pharmacy
      </Link>

      {/* Right side: Links or UserProfile */}
      <div className="flex items-center space-x-4">
        {!isLoaded ? null : !isSignedIn ? (
          <Link
            href="/sign-in"
            className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
          >
            Login
          </Link>
        ) : (
          <>
            {/* Only visible to logged-in users */}
            <div className="flex gap-4">
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
            </div>

            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                },
              }}
            />
          </>
        )}
      </div>
    </nav>
  );
}
