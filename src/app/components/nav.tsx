"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="w-full  px-6 py-4 flex justify-between items-center shadow-md">
      {/* Brand / Logo */}
      <Link href="/" className="text-xl font-bold">
        Pharmacy
      </Link>

      {/* Right side: Login or UserProfile */}
      <div>
        {!isLoaded ? null : !isSignedIn ? (
          <Link
            href="/sign-in"
            className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
          >
            Login
          </Link>
        ) : (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8",
              },
            }}
          />
        )}
      </div>
    </nav>
  );
}
