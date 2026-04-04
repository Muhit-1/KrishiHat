"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, CheckCircle, XCircle, Mail, Clock } from "lucide-react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/providers/locale-provider";

function LoginForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const { refetch } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const verified = searchParams.get("verified");
  const verifyError = searchParams.get("verify_error");
  const reason = searchParams.get("reason");
  const returnTo = searchParams.get("returnTo");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
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
        toastSuccess(t("auth.welcome_back"), "");
        await refetch();
        const dashboardMap: Record<string, string> = {
          buyer: "/marketplace",
          seller: "/seller/dashboard",
          moderator: "/moderator/dashboard",
          admin: "/admin/dashboard",
          super_admin: "/super-admin/dashboard",
        };
        const destination = returnTo && returnTo.startsWith("/") ? returnTo : dashboardMap[json.data.role] || "/";
        router.push(destination);
      } else if (json.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(json.data?.maskedEmail || null);
        setServerError(json.message);
      } else {
        toastError(t("auth.login") + " failed", json.message || t("errors.server_error"));
        setServerError(json.message || t("errors.server_error"));
      }
    } catch {
      toastError(t("errors.network"), "");
      setServerError(t("errors.network"));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("auth.welcome_back")}</CardTitle>
          <p className="text-muted-foreground text-sm">{t("auth.signin_to")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {reason === "session_expired" && (
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t("auth.session_expired")}</p>
                <p className="text-xs mt-0.5">{t("auth.session_expired_desc")}</p>
              </div>
            </div>
          )}
          {verified === "1" && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t("auth.email_verified")}</p>
                <p className="text-xs mt-0.5">{t("auth.email_verified_desc")}</p>
              </div>
            </div>
          )}
          {verifyError === "expired" && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t("auth.link_expired")}</p>
                <p className="text-xs mt-0.5">{t("auth.link_expired_desc")}</p>
              </div>
            </div>
          )}
          {verifyError === "used" && (
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t("auth.already_verified")}</p>
                <p className="text-xs mt-0.5">{t("auth.already_verified_desc")}</p>
              </div>
            </div>
          )}
          {verifyError === "invalid" && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t("auth.invalid_link")}</p>
                <p className="text-xs mt-0.5">{t("auth.invalid_link_desc")}</p>
              </div>
            </div>
          )}
          {unverifiedEmail && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
              <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t("auth.email_not_verified")}</p>
                <p className="text-xs mt-1">
                  {t("auth.email_not_verified_desc")}{" "}
                  <span className="font-medium">{unverifiedEmail}</span>.{" "}
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/resend-verification", { method: "POST" });
                      alert(t("auth.resend_email"));
                    }}
                    className="underline hover:no-underline font-medium"
                  >
                    {t("auth.resend_email")}
                  </button>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input label={t("auth.email")} type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
            <Input label={t("auth.password")} type="password" placeholder={t("auth.password_placeholder")} error={errors.password?.message} {...register("password")} />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                {t("auth.forgot_password")}
              </Link>
            </div>
            {serverError && !unverifiedEmail && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{serverError}</p>
            )}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>{t("auth.login")}</Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.no_account")}{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">{t("auth.signup")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="text-muted-foreground text-sm">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}