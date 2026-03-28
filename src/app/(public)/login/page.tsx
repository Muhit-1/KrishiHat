"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, CheckCircle, XCircle, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const verified = searchParams.get("verified");
  const verifyError = searchParams.get("verify_error");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setUnverifiedEmail(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.success) {
        const dashboardMap: Record<string, string> = {
          buyer: "/buyer/dashboard",
          seller: "/seller/dashboard",
          moderator: "/moderator/dashboard",
          admin: "/admin/dashboard",
          super_admin: "/super-admin/dashboard",
        };
        router.push(dashboardMap[json.data.role] || "/");
        router.refresh();
      } else if (json.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(json.data?.maskedEmail || null);
        setServerError(json.message);
      } else {
        setServerError(json.message || "Login failed");
      }
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-muted-foreground text-sm">Sign in to KrishiHat</p>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Email verified success banner */}
          {verified === "1" && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Email verified!</p>
                <p className="text-xs mt-0.5">Your account is now active. You can log in below.</p>
              </div>
            </div>
          )}

          {/* Verification error banners */}
          {verifyError === "expired" && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Verification link expired</p>
                <p className="text-xs mt-0.5">Log in to request a new verification link.</p>
              </div>
            </div>
          )}

          {verifyError === "used" && (
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Already verified</p>
                <p className="text-xs mt-0.5">Your email is already verified. Please log in.</p>
              </div>
            </div>
          )}

          {verifyError === "invalid" && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Invalid verification link</p>
                <p className="text-xs mt-0.5">This link is invalid. Please sign up again or contact support.</p>
              </div>
            </div>
          )}

          {/* Unverified email warning with resend option */}
          {unverifiedEmail && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
              <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Email not verified</p>
                <p className="text-xs mt-1">
                  We sent a link to <span className="font-medium">{unverifiedEmail}</span>.{" "}
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/resend-verification", { method: "POST" });
                      alert("Verification email resent! Check your inbox.");
                    }}
                    className="underline hover:no-underline font-medium"
                  >
                    Resend email
                  </button>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {serverError && !unverifiedEmail && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Login
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}