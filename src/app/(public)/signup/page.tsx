"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations/auth.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout } from "lucide-react";

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      window.location.href = `/${json.data.role}/dashboard`;
    } else {
      alert(json.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-muted-foreground text-sm">Join KrishiHat today</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" placeholder="Your full name" error={errors.fullName?.message} {...register("fullName")} />
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
            <Input label="Phone" type="tel" placeholder="01XXXXXXXXX" error={errors.phone?.message} {...register("phone")} />

            {/* Role selection */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Register as</label>
              <select {...register("role")} className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="buyer">Buyer (ক্রেতা)</option>
                <option value="seller">Seller (বিক্রেতা)</option>
              </select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>

            <Input label="Password" type="password" placeholder="Min 8 characters" error={errors.password?.message} {...register("password")} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>Create Account</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}