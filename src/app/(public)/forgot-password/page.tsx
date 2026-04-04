"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/providers/locale-provider";

export default function ForgotPasswordPage() {
  const t = useT();
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.reset_password")}</CardTitle>
          <p className="text-muted-foreground text-sm">{t("auth.reset_instructions")}</p>
        </CardHeader>
        <CardContent>
          {isSubmitSuccessful ? (
            <div className="text-center py-4">
              <p className="text-green-700 font-medium">{t("auth.reset_link_sent")}</p>
              <Link href="/login" className="text-primary text-sm hover:underline mt-2 inline-block">
                {t("auth.back_to_login")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label={t("auth.email")} type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
              <Button type="submit" className="w-full" isLoading={isSubmitting}>{t("auth.send_reset_link")}</Button>
              <Link href="/login" className="block text-center text-sm text-muted-foreground hover:underline">
                {t("auth.back_to_login")}
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}