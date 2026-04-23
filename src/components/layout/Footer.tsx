import Link from "next/link";

const links = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search" },
  { href: "/cart", label: "Cart" },
  { href: "/account/orders", label: "Orders" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-muted/30">
      <div className="container mx-auto flex flex-col gap-8 px-4 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-lg font-semibold text-primary">
            AutoParts
          </Link>
          <p className="mt-2 text-sm text-secondary">
            Quality auto parts for your vehicle.
          </p>
        </div>
        <nav className="flex flex-wrap gap-6" aria-label="Footer navigation">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-secondary hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-gray-200 px-4 py-4 text-center text-sm text-secondary">
        © {new Date().getFullYear()} AutoParts. All rights reserved.
      </div>
    </footer>
  );
}
