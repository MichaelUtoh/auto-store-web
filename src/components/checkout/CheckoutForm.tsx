"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  checkoutSchema,
  type CheckoutFormValues,
} from "@/lib/utils/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PAYMENT_METHODS = [
  { value: "credit_card", label: "Credit card" },
  { value: "debit_card", label: "Debit card" },
  { value: "paypal", label: "PayPal" },
] as const;

interface CheckoutFormProps {
  defaultValues?: Partial<CheckoutFormValues>;
  onSubmit: (data: CheckoutFormValues) => Promise<void>;
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
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "USA",
      paymentMethod: "credit_card",
      billingSameAsShipping: true,
      ...defaultValues,
    },
  });

  const billingSameAsShipping = watch("billingSameAsShipping");

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
        <Label htmlFor="line1">Street address</Label>
        <Input
          id="line1"
          {...register("line1")}
          className="mt-1"
          autoComplete="street-address"
          placeholder="123 Main St"
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
            placeholder="MI"
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
            <p className="mt-1 text-sm text-error">
              {errors.postalCode.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...register("country")}
            className="mt-1"
            autoComplete="country-name"
            placeholder="USA"
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

      <div>
        <Label htmlFor="paymentMethod">Payment method</Label>
        <select
          id="paymentMethod"
          {...register("paymentMethod")}
          className="input-field mt-1 w-full"
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        {errors.paymentMethod && (
          <p className="mt-1 text-sm text-error">
            {errors.paymentMethod.message}
          </p>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-sm text-primary">
        <input
          type="checkbox"
          {...register("billingSameAsShipping")}
          className="h-4 w-4 rounded border-border"
        />
        Billing address is the same as shipping
      </label>
      {!billingSameAsShipping && (
        <p className="text-xs text-secondary">
          A separate billing address will be saved when you place the order.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Placing order…" : "Place order"}
      </Button>
    </form>
  );
}
