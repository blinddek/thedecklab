"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/locale";
import { subscribeNewsletter } from "@/lib/newsletter/actions";
import { isEnabled } from "@/config/features";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
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

          {/* Newsletter signup */}
          {isEnabled("newsletter") && (
            <div className="flex-shrink-0 md:max-w-sm">
              <NewsletterForm />
            </div>
          )}
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
          <p className="font-mono text-[11px] text-[#D4622A]/60">Design. Build. Live.</p>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const { t } = useLocale();
  const [state, formAction, isPending] = useActionState(subscribeNewsletter, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(t({ en: "You're subscribed!", af: "Jy is ingeteken!" }));
      formRef.current?.reset();
    }
    if (state?.error) toast.error(state.error);
  }, [state, t]);

  return (
    <div>
      <h3 className="mb-1 font-display text-[11px] font-bold uppercase tracking-widest text-[#F5F1EC]">
        {t({ en: "Stay in the loop", af: "Bly op hoogte" })}
      </h3>
      <p className="mb-3 text-sm">
        {t({
          en: "Tips, project ideas and offers — straight to your inbox.",
          af: "Wenke en aanbiedinge na jou inkassie.",
        })}
      </p>
      <form ref={formRef} action={formAction} className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder={t({ en: "your@email.com", af: "jou@epos.com" })}
          className="flex-1 rounded-lg border border-[#333028] bg-[#242220] px-3 py-2 text-sm text-[#F5F1EC] placeholder:text-[#6B6560] focus:outline-none focus:ring-2 focus:ring-[#D4622A]/30"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4622A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B5501E] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {t({ en: "Subscribe", af: "Teken in" })}
        </button>
      </form>
    </div>
  );
}
