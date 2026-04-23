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

export default function LoginPage() {
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
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold text-primary">Sign in</h1>
        <p className="text-sm text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
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
          className="space-y-4"
        >
          {error && (
            <p className="rounded-md bg-error/10 p-3 text-sm text-error">
              {error}
            </p>
          )}
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
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-primary"
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
              className="rounded border-gray-300"
            />
            <Label htmlFor="remember" className="font-normal">
              Remember me
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-secondary">
            <Link href="/forgot-password" className="text-accent hover:underline">
              Forgot password?
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
