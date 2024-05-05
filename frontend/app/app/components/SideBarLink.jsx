"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideBarLink({ children, href }) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={
        href == pathname
          ? "flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
          : "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      }
    >
      {children}
    </Link>
  );
}
