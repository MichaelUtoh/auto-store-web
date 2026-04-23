import Link from "next/link";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search" },
];

export function Navbar() {
  return (
    <nav className="hidden md:flex md:items-center md:gap-6" aria-label="Main">
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="text-sm font-medium text-primary hover:text-accent"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
