"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "icon";
  showLabel?: boolean;
}

export function WishlistButton({
  productId,
  className,
  size = "icon",
  showLabel = false,
}: WishlistButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(productId));
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const [pending, setPending] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Sign in to save items to your wishlist");
      router.push("/login");
      return;
    }
    setPending(true);
    const wasInWishlist = isInWishlist;
    try {
      await toggleItem(productId);
      toast.success(
        wasInWishlist ? "Removed from wishlist" : "Saved to wishlist"
      );
    } catch {
      toast.error("Could not update wishlist");
    } finally {
      setPending(false);
    }
  };

  const filled = isInWishlist;

  if (showLabel) {
    return (
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn("gap-2", className)}
        onClick={handleClick}
        disabled={pending}
        aria-pressed={filled}
        aria-label={filled ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={cn("h-5 w-5", filled && "fill-primary text-primary")}
        />
        {filled ? "Saved" : "Save to wishlist"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      className={cn(
        "shadow-card",
        size === "sm" && "h-9 w-9 min-w-9",
        className
      )}
      onClick={handleClick}
      disabled={pending}
      aria-pressed={filled}
      aria-label={filled ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          filled && "fill-primary text-primary"
        )}
      />
    </Button>
  );
}
