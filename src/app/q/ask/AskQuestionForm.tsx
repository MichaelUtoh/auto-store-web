"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  createQuestionSchema,
  type CreateQuestionInput as FormInput,
} from "@/lib/utils/validators";
import { questionsApi } from "@/lib/api/questions";
import { productsApi } from "@/lib/api/products";
import { useAuthStore } from "@/store/useAuthStore";
import type { Category } from "@/types/product";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useGarageStore } from "@/store/useGarageStore";

export default function AskQuestionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdFromQuery = searchParams.get("product_id") ?? "";
  const garageVehicle = useGarageStore((s) => s.vehicle);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const [categories, setCategories] = useState<Category[]>([]);

  const defaultContext = productIdFromQuery
    ? "product"
    : ("vehicle" as FormInput["contextType"]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      title: "",
      body: "",
      productId: productIdFromQuery,
      categoryId: "",
      make: "",
      model: "",
      year: "",
      contextType: defaultContext,
    },
  });

  const contextType = watch("contextType");

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      const redirect = `/login?redirect=${encodeURIComponent(
        `/q/ask${productIdFromQuery ? `?product_id=${productIdFromQuery}` : ""}`
      )}`;
      router.replace(redirect);
    }
  }, [hasHydrated, isAuthenticated, router, productIdFromQuery]);

  useEffect(() => {
    if (productIdFromQuery) {
      setValue("productId", productIdFromQuery);
      setValue("contextType", "product");
    }
  }, [productIdFromQuery, setValue]);

  useEffect(() => {
    if (garageVehicle && !productIdFromQuery) {
      setValue("make", garageVehicle.make);
      setValue("model", garageVehicle.model);
      setValue("year", String(garageVehicle.year));
    }
  }, [garageVehicle, productIdFromQuery, setValue]);

  useEffect(() => {
    productsApi
      .getCategories()
      .then((res) => {
        const data = (res as { data?: Category[] }).data ?? res;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  const onSubmit = async (data: FormInput) => {
    try {
      const created = await questionsApi.create({
        title: data.title,
        body: data.body,
        productId:
          data.contextType === "product" ? data.productId : undefined,
        categoryId:
          data.contextType === "category" ? data.categoryId : undefined,
        make: data.contextType === "vehicle" ? data.make : undefined,
        model: data.contextType === "vehicle" ? data.model : undefined,
        year:
          data.contextType === "vehicle" && data.year
            ? Number(data.year)
            : undefined,
      });
      toast.success("Question posted");
      router.push(`/q/${created.slug}`);
    } catch {
      toast.error("Could not post question. Check your details and try again.");
    }
  };

  if (!hasHydrated || !isAuthenticated) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-secondary">
          Redirecting to sign in…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader>
        <h1 className="text-2xl font-bold text-foreground">Ask a question</h1>
        <p className="text-sm text-secondary">
          Include product or vehicle context so mechanics can help accurately.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} className="mt-2" />
            {errors.title && (
              <p className="mt-1 text-sm text-error">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="body">Details</Label>
            <textarea
              id="body"
              {...register("body")}
              rows={6}
              className="input-field mt-2 min-h-[140px] resize-y"
            />
            {errors.body && (
              <p className="mt-1 text-sm text-error">{errors.body.message}</p>
            )}
          </div>

          {!productIdFromQuery && (
            <div>
              <Label>Context</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    { value: "product", label: "Product" },
                    { value: "category", label: "Category" },
                    { value: "vehicle", label: "Vehicle" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("contextType", value)}
                    className={cn(
                      "rounded-pill px-4 py-2 text-sm font-medium transition-colors",
                      contextType === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-secondary"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {contextType === "product" && (
            <div>
              {productIdFromQuery ? (
                <input type="hidden" {...register("productId")} />
              ) : (
                <>
                  <Label htmlFor="productId">Product ID</Label>
                  <Input
                    id="productId"
                    {...register("productId")}
                    className="mt-2"
                    placeholder="Paste product UUID"
                  />
                </>
              )}
              {productIdFromQuery && (
                <p className="mt-2 text-xs text-secondary">
                  Asking about a specific product.{" "}
                  <Link
                    href={`/products/${productIdFromQuery}`}
                    className="underline"
                  >
                    View product
                  </Link>
                </p>
              )}
              {errors.productId && (
                <p className="mt-1 text-sm text-error">
                  {errors.productId.message}
                </p>
              )}
            </div>
          )}

          {contextType === "category" && (
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                {...register("categoryId")}
                className="select-field mt-2"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-error">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          )}

          {contextType === "vehicle" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="make">Make</Label>
                <Input id="make" {...register("make")} className="mt-2" />
                {errors.make && (
                  <p className="mt-1 text-sm text-error">{errors.make.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" {...register("model")} className="mt-2" />
                {errors.model && (
                  <p className="mt-1 text-sm text-error">{errors.model.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="year">Year (optional)</Label>
                <Input
                  id="year"
                  type="number"
                  {...register("year")}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "Posting…" : "Post question"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
