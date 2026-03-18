"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
// import { LanguageSelector } from "@/components/shared/language-selector";
import { NavbarAuthButton } from "@/components/shared/navbar-auth-button";
import { useLocale } from "@/lib/locale";
import { CartIcon } from "@/components/shop/cart-icon";
import { siteConfig } from "@/config/site";
import type { NavLink, SiteSettings } from "@/types/cms";

interface NavbarProps {
  links: NavLink[];
  settings: SiteSettings;
}

/**
 * The Deck Lab logo mark — 5 stacked planks of varying length.
 * One plank highlighted in Ember to suggest "next board being placed."
 */
function PlankMark({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 34 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Full-width base plank */}
      <rect x="0" y="0" width="34" height="5" rx="2" fill="#736B62" />
      {/* Ember plank — "being placed", inset to suggest placement */}
      <rect x="0" y="7" width="29" height="5" rx="2" fill="#D4622A" />
      {/* Full-width mid plank */}
      <rect x="0" y="14" width="34" height="5" rx="2" fill="#736B62" />
      {/* Short accent plank */}
      <rect x="0" y="21" width="22" height="5" rx="2" fill="#5C5550" />
      {/* Base plank */}
      <rect x="0" y="28" width="34" height="4" rx="2" fill="#736B62" />
    </svg>
  );
}

export function Navbar({ links, settings }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2A2725] bg-[#1A1918]/95 backdrop-blur-xl">
      {/* Ember accent top-line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-8">
        {/* Logo — plank mark + wordmark */}
        <Link href="/" className="group flex items-center gap-3">
          <PlankMark className="h-7 w-auto transition-opacity group-hover:opacity-85" />
          <span className="font-display text-[1.05rem] font-extrabold tracking-tight text-[#F5F1EC]">
            THE DECK <span className="font-medium opacity-40">LAB</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="rounded-md px-3.5 py-2 text-[0.84rem] font-medium text-[#A8A099] transition-colors hover:text-[#F5F1EC]"
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-1 md:flex">
          {/* <LanguageSelector /> */}
          <ThemeToggle />
          {siteConfig.features.shop && <CartIcon />}
          <div className="mx-1 h-4 w-px bg-[#2A2725]" />
          <NavbarAuthButton />
          <Link href="/login" aria-label="Login">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-[#A8A099] hover:text-[#F5F1EC]">
              <LogIn className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-md p-1.5 text-[#A8A099] transition-colors hover:text-[#F5F1EC] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#2A2725] bg-[#1A1918] md:hidden">
          <nav className="flex flex-col px-4 pb-4 pt-2">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="rounded-md px-3 py-3 text-[0.95rem] font-medium text-[#A8A099] transition-colors hover:text-[#F5F1EC]"
                onClick={() => setMobileOpen(false)}
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-[#2A2725] px-4 py-3">
            <div className="flex items-center gap-1">
              {/* <LanguageSelector /> */}
              <ThemeToggle />
              {siteConfig.features.shop && <CartIcon />}
            </div>
            <NavbarAuthButton />
          </div>
        </div>
      )}
    </header>
  );
}
