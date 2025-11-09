"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isLoaded) return null;

  // Send magic link / code
  const handleSendCode = async () => {
    if (!email) return toast.error("Enter your email first");
    setLoading(true);

    try {
      await signIn.create({ identifier: email, strategy: "email_code" });
      setVerificationSent(true);
      toast.success("Verification code sent to your email!");
    } catch (err: any) {
      console.error("Magic link error:", err);
      toast.error("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // Verify the code
  const handleVerifyCode = async () => {
    if (!code) return toast.error("Enter the verification code");
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Signed in successfully!");
        router.push("/");
      } else {
        toast.error("Verification failed. Try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      toast.error(err.errors?.[0]?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200 rounded-xl">
        <CardHeader>
          <CardTitle className="text-center text-blue-700 text-2xl font-semibold">
            Sign In
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {!verificationSent ? (
            <>
              {/* ✅ Email input with suggestions */}
              <input
                type="email"
                list="email-suggestions"
                placeholder="Enter your school email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                autoComplete="email"
              />

              <Button
                type="button"
                onClick={handleSendCode}
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded-lg transition-colors"
              >
                {loading ? "Sending code..." : "Send Verification Code"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-700 text-center">
                Enter the verification code sent to{" "}
                <strong className="text-blue-700">{email}</strong>
              </p>

              <input
                type="text"
                placeholder="Verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />

              <Button
                type="button"
                onClick={handleVerifyCode}
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded-lg transition-colors"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
