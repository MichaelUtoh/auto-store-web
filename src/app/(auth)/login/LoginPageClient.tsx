"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/utils/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      await login(data.email, data.password);
      await new Promise((r) => setTimeout(r, 0));
      const user = useAuthStore.getState().user;
      const isAdmin = user?.role?.toLowerCase() === "admin";
      const target =
        redirectTo?.startsWith("/") &&
        (redirectTo !== "/admin" || isAdmin)
          ? redirectTo
          : isAdmin
            ? "/admin"
            : "/products";
      router.push(target);
      router.refresh();
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader>
        <h1 className="text-2xl font-bold text-primary">Sign in</h1>
        <p className="text-sm text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardHeader>
      <CardContent>
        <form
          method="post"
          action="/login"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {error && (
            <p className="rounded-2xl bg-error/10 p-4 text-sm text-error">
              {error}
            </p>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="mt-2"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="pr-16"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-error">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              {...register("remember")}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <Label htmlFor="remember" className="font-normal text-secondary">
              Remember me
            </Label>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-secondary">
            <Link
              href="/forgot-password"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
