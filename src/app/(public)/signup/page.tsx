"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, MailCheck } from "lucide-react";
import { useState } from "react";
import { useT } from "@/providers/locale-provider";

export default function SignupPage() {
  const t = useT();
  const [serverError, setServerError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) setVerificationSent(json.data.maskedEmail);
      else setServerError(json.message || t("errors.server_error"));
    } catch {
      setServerError(t("errors.network"));
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 rounded-full p-4">
                <MailCheck className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">{t("auth.check_email")}</h2>
            <p className="text-muted-foreground">
              {t("auth.verification_sent_to")}{" "}
              <span className="font-semibold text-foreground">{verificationSent}</span>
            </p>
            <p className="text-sm text-muted-foreground">{t("auth.verification_expires")}</p>
            <div className="pt-2 space-y-2">
              <Link href="/login">
                <Button className="w-full">{t("auth.go_to_login")}</Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                {t("auth.didnt_receive")}{" "}
                <button
                  onClick={async () => {
                    await fetch("/api/auth/resend-verification", { method: "POST" });
                    alert(t("auth.resend_email"));
                  }}
                  className="text-primary hover:underline"
                >
                  {t("auth.resend")}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("auth.create_account")}</CardTitle>
          <p className="text-muted-foreground text-sm">{t("auth.join_krishihat")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input label={t("auth.full_name")} placeholder="Your full name" error={errors.fullName?.message} {...register("fullName")} />
            <Input label={t("auth.email")} type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
            <Input label={t("auth.phone")} type="tel" placeholder="01XXXXXXXXX" error={errors.phone?.message} {...register("phone")} />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{t("auth.register_as_label")}</label>
              <select
                {...register("role")}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="buyer">{t("auth.buyer_bn")}</option>
                <option value="seller">{t("auth.seller_bn")}</option>
              </select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>

            <Input label={t("auth.password")} type="password" placeholder={t("auth.min_password_hint")} error={errors.password?.message} {...register("password")} />
            <Input label={t("auth.confirm_password")} type="password" placeholder={t("auth.repeat_password")} error={errors.confirmPassword?.message} {...register("confirmPassword")} />

            {serverError && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{serverError}</p>
            )}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>{t("auth.create_account")}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t("auth.have_account")}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">{t("auth.login")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}