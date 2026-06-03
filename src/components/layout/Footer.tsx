import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { FooterSupportLink } from "@/components/support/FooterSupportLink";

const links = [
  { href: "/products", label: "Products" },
  { href: "/parts", label: "Part finder" },
  { href: "/q", label: "Community Q&A" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search" },
  { href: "/cart", label: "Cart" },
  { href: "/account/orders", label: "Orders" },
];

export function Footer() {
  return (
    <footer className="mt-auto hidden border-t border-border bg-muted/40 lg:block">
      <div className="page-container flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">
            AutoParts
          </Link>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-secondary">
            Quality auto parts for your vehicle. Shop with confidence.
          </p>
        </div>
        <div className="flex flex-col items-start gap-6 sm:items-end">
          <ThemeToggle />
          <nav className="flex flex-wrap items-center gap-6" aria-label="Footer navigation">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-secondary transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <FooterSupportLink />
          </nav>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-sm text-secondary">
        © {new Date().getFullYear()} AutoParts. All rights reserved.
      </div>
    </footer>
  );
}
