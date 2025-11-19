"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SignUpPage() {
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!signUpLoaded) return <div>Loading...</div>;

  // 1️⃣ CREATE USER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password || !firstName || !lastName) {
        toast.error("Please fill all fields");
        return;
      }

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      toast.success("Verification code sent to your email!");
      setStep("verify");
    } catch (err: any) {
      console.error(err);
      toast.error(err.errors?.[0]?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ VERIFY CODE + AUTO LOGIN
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!code) {
        toast.error("Enter verification code");
        return;
      }

      const verify = await signUp.attemptEmailAddressVerification({ code });

      if (verify.status !== "complete") {
        throw new Error("Incorrect verification code");
      }

      const clerkId = signUp.createdUserId;
      if (!clerkId) throw new Error("Cannot get user ID");

      // Save user in your backend
      await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, clerkId }),
      });

      toast.success("Email verified! Logging you in...");

      // 🔥 AUTO-LOG IN & ACTIVATE SESSION
      await setActive({ session: signUp.createdSessionId });

      // 🔃 REFRESH APP STATE
      router.refresh();

      // Redirect to dashboard (change this if needed)
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.errors?.[0]?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
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
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
        </form>
      )}
    </div>
  );
}
