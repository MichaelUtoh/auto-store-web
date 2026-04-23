"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/types/user";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<Partial<User>>();

  useEffect(() => {
    let cancelled = false;
    usersApi
      .getProfile()
      .then((profile) => {
        if (cancelled) return;
        reset(profile);
        useAuthStore.getState().setUser(profile);
      })
      .catch(() => {
        const u = useAuthStore.getState().user;
        if (!cancelled && u) {
          reset({
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            phone: u.phone ?? "",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const onSubmit = async (data: Partial<User>) => {
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile(data);
      useAuthStore.getState().setUser(updated);
      reset(updated);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-secondary">
          Loading…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-primary">Profile</h2>
        <p className="text-sm text-secondary">Update your account details.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...register("lastName")} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1"
              disabled
            />
            <p className="mt-1 text-xs text-secondary">
              Email cannot be changed.
            </p>
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
