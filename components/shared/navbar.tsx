"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LanguageSelector } from "@/components/shared/language-selector";
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
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      {/* Ember accent top-line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-8">
        {/* Logo — plank mark + wordmark */}
        <Link href="/" className="group flex items-center gap-3">
          <PlankMark className="h-7 w-auto transition-opacity group-hover:opacity-85" />
          <span className="font-display text-[1.05rem] font-extrabold tracking-tight text-foreground">
            THE DECK <span className="font-medium opacity-50">LAB</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="rounded-md px-3.5 py-2 text-[0.84rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {siteConfig.features.i18n && <LanguageSelector />}
          {siteConfig.features.shop && <CartIcon />}
          <div className="mx-1 h-4 w-px bg-border" />
          <NavbarAuthButton />
          <Link
            href={settings.cta_url}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(212,98,42,0.3)] active:scale-[0.97]"
          >
            {t(settings.cta_label)}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col px-4 pb-4 pt-2">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="rounded-md px-3 py-3 text-[0.95rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <div className="flex items-center gap-2">
              {siteConfig.features.i18n && <LanguageSelector />}
              {siteConfig.features.shop && <CartIcon />}
            </div>
            <div className="flex items-center gap-2">
              <NavbarAuthButton />
              <Link
                href={settings.cta_url}
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {t(settings.cta_label)}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
