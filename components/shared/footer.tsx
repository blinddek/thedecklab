"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale";
import type { FooterSection, SiteSettings } from "@/types/cms";

interface FooterProps {
  readonly sections: FooterSection[];
  readonly settings: SiteSettings;
}

/** Subtle board-grain horizontal rule */
function BoardDivider() {
  return (
    <div
      className="my-8 h-px w-full"
      style={{
        background:
          "repeating-linear-gradient(90deg,transparent 0px,transparent 3px,rgba(201,169,110,0.1) 3px,rgba(201,169,110,0.1) 4px)",
      }}
    />
  );
}

export function Footer({ sections, settings }: FooterProps) {
  const { t } = useLocale();

  return (
    <footer className="bg-[#1A1918] text-[#A8A099]">
      {/* Wood-tone top edge */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            "linear-gradient(90deg,#8B6B42 0%,#C9A96E 15%,#A68B56 30%,#D4B896 45%,#B89B5E 55%,#C4A06A 70%,#A68B56 85%,#C9A96E 100%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-4 py-14 md:px-8">
        {/* Top row */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Logo lockup */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-3">
              {/* Plank mark (inline so no extra Image import) */}
              <svg viewBox="0 0 34 32" fill="none" className="h-6 w-auto" aria-hidden="true">
                <rect x="0" y="0" width="34" height="5" rx="2" fill="#736B62" />
                <rect x="0" y="7" width="29" height="5" rx="2" fill="#D4622A" />
                <rect x="0" y="14" width="34" height="5" rx="2" fill="#736B62" />
                <rect x="0" y="21" width="22" height="5" rx="2" fill="#5C5550" />
                <rect x="0" y="28" width="34" height="4" rx="2" fill="#736B62" />
              </svg>
              <span className="font-display text-[1rem] font-extrabold tracking-tight text-[#F5F1EC]">
                THE DECK <span className="font-medium opacity-40">LAB</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              {t(settings.company_tagline) || "Design. Build. Live."}
            </p>
          </div>

        </div>

        <BoardDivider />

        {/* Link columns */}
        {sections.length > 0 && (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {sections.map((section) => (
              <div key={section.id}>
                <h3 className="mb-4 font-display text-[11px] font-bold uppercase tracking-widest text-[#F5F1EC]">
                  {t(section.title)}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-[#D4622A]"
                      >
                        {t(link.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <BoardDivider />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} {settings.company_name}. All rights reserved.
          </p>
          <p className="text-xs text-[#6B6560]">
            Powered by{" "}
            <a
              href="https://yoros.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#A8A099]"
            >
              Yoros
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
