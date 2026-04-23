"use client";

import Link from "next/link";
import { Package, PlusCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
      <p className="mt-1 text-secondary">
        Welcome back{user?.firstName ? `, ${user.firstName}` : ""}.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products"
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-surface p-6 text-primary transition-colors hover:border-accent hover:bg-muted/50"
        >
          <div className="rounded-lg bg-accent/10 p-3">
            <Package className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold">Manage products</h2>
            <p className="text-sm text-secondary">
              View, edit, or delete products
            </p>
          </div>
        </Link>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-surface p-6 text-primary transition-colors hover:border-accent hover:bg-muted/50"
        >
          <div className="rounded-lg bg-accent/10 p-3">
            <PlusCircle className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold">Add product</h2>
            <p className="text-sm text-secondary">
              Create a new product with images
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
