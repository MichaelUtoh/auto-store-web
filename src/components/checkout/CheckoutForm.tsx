"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput } from "@/lib/utils/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CheckoutFormProps {
  defaultValues?: Partial<AddressInput>;
  onSubmit: (data: AddressInput) => Promise<void>;
  isLoading?: boolean;
}

export function CheckoutForm({
  defaultValues,
  onSubmit,
  isLoading,
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "US",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            className="mt-1"
            autoComplete="given-name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-error">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            className="mt-1"
            autoComplete="family-name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-error">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="line1">Address</Label>
        <Input
          id="line1"
          {...register("line1")}
          className="mt-1"
          autoComplete="street-address"
        />
        {errors.line1 && (
          <p className="mt-1 text-sm text-error">{errors.line1.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
        <Input id="line2" {...register("line2")} className="mt-1" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register("city")}
            className="mt-1"
            autoComplete="address-level2"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-error">{errors.city.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            {...register("state")}
            className="mt-1"
            autoComplete="address-level1"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-error">{errors.state.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="postalCode">Postal code</Label>
          <Input
            id="postalCode"
            {...register("postalCode")}
            className="mt-1"
            autoComplete="postal-code"
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-error">{errors.postalCode.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...register("country")}
            className="mt-1"
            autoComplete="country-name"
          />
          {errors.country && (
            <p className="mt-1 text-sm text-error">{errors.country.message}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          className="mt-1"
          autoComplete="tel"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-error">{errors.phone.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Placing order…" : "Place order"}
      </Button>
    </form>
  );
}
