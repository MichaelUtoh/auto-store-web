"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/utils/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authApi } from "@/lib/api/auth";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      toast.success("Check your email for reset instructions.");
    } catch {
      toast.error("Failed to send reset email.");
    }
  };

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-primary">
            Check your email
          </h1>
          <p className="text-secondary">
            If an account exists for that email, we&apos;ve sent password reset
            instructions.
          </p>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold text-primary">Forgot password</h1>
        <p className="text-sm text-secondary">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-secondary">
            <Link href="/login" className="text-accent hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
