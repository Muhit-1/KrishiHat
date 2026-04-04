"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/providers/locale-provider";

export default function ResetPasswordPage() {
  const t = useT();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) window.location.href = "/login";
    else alert(json.message);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.set_new_password")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("token")} />
            <Input label={t("auth.new_password")} type="password" error={errors.password?.message} {...register("password")} />
            <Input label={t("auth.confirm_new_password")} type="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
            <Button type="submit" className="w-full" isLoading={isSubmitting}>{t("auth.reset_password_btn")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}