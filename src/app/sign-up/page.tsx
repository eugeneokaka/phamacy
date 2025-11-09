"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SignUpPage() {
  const { signUp, isLoaded } = useSignUp();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoaded || !signUp) return <div>Loading...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password || !firstName || !lastName) {
        toast.error("Please fill all fields");
        return;
      }

      // Create user (Clerk userId not yet available)
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Send verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      toast.success("Verification code sent to your email!");
      setStep("verify");
    } catch (err: any) {
      console.error(err);
      toast.error(err.errors?.[0]?.message || err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!code) {
        toast.error("Enter verification code");
        return;
      }

      // Verify email
      await signUp.attemptEmailAddressVerification({ code });

      // ✅ Now Clerk provides the created user ID
      const clerkId = signUp.createdUserId;
      if (!clerkId) throw new Error("Could not get Clerk user ID");

      // Save user in backend
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          clerkId,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      toast.success("Account verified and created successfully!");

      // Reset form
      setStep("form");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setCode("");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.errors?.[0]?.message || err.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div id="clerk-captcha"></div>

      {step === "form" && (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4 p-6 rounded-md shadow-md"
        >
          <h2 className="text-2xl font-bold text-center">Sign Up</h2>
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      )}

      {step === "verify" && (
        <form
          onSubmit={handleVerify}
          className="w-full max-w-md space-y-4 p-6 rounded-md shadow-md"
        >
          <h2 className="text-2xl font-bold text-center">
            Enter Verification Code
          </h2>
          <Input
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Create Account"}
          </Button>
        </form>
      )}
    </div>
  );
}
