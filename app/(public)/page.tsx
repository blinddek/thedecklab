import Link from "next/link";
import Image from "next/image";
import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  getHomepageSections,
  getSiteSettings,
  getSiteContent,
} from "@/lib/cms/queries";
import { organizationSchema } from "@/lib/seo/structured-data";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import type { LocalizedString } from "@/types/cms";

export const revalidate = 3600;

export async function generateMetadata() {
  return generatePageMetadata("home");
}

/* ---------- Photo strip divider ---------- */

function WoodStrip({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    <div className="relative h-24 w-full overflow-hidden">
      <Image src={src} alt={alt} fill sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-[#1A1918]/30" />
    </div>
  );
}

/* ---------- Section content types ---------- */

interface HeroContent {
  heading?: LocalizedString;
  subheading?: LocalizedString;
  cta_text?: LocalizedString;
  cta_url?: string;
  cta_secondary_text?: LocalizedString;
  cta_secondary_url?: string;
  background_image?: string;
  stat_boards?: string;
  stat_screws?: string;
  stat_price?: string;
}

interface TrustStatsContent {
  items?: { icon?: string; value?: string; label?: LocalizedString }[];
}

interface HowItWorksContent {
  heading?: LocalizedString;
  subheading?: LocalizedString;
  items?: {
    step?: string;
    icon?: string;
    title?: LocalizedString;
    description?: LocalizedString;
  }[];
}

interface MaterialsContent {
  heading?: LocalizedString;
  subheading?: LocalizedString;
  items?: {
    icon?: string;
    title?: LocalizedString;
    description?: LocalizedString;
    from_price?: string;
    image?: string;
    swatch?: string;
  }[];
}

interface ServicesContent {
  heading?: LocalizedString;
  subheading?: LocalizedString;
  items?: {
    icon?: string;
    title?: LocalizedString;
    description?: LocalizedString;
  }[];
}

interface AboutContent {
  heading?: LocalizedString;
  body?: LocalizedString;
  image?: string;
}

interface CtaContent {
  heading?: LocalizedString;
  body?: LocalizedString;
  button_text?: LocalizedString;
  button_url?: string;
  button_secondary_text?: LocalizedString;
  button_secondary_url?: string;
}

/* ---------- Default wood swatches per material ---------- */

const DEFAULT_SWATCHES: [string, string][] = [
  ["pine", "linear-gradient(135deg,#C9B97A 0%,#A89055 40%,#D4C488 70%,#B0965C 100%)"],
  ["balau", "linear-gradient(135deg,#6B3A1F 0%,#8B4E2A 40%,#5A3018 70%,#7D4526 100%)"],
  ["garapa", "linear-gradient(135deg,#C8A84B 0%,#A88932 40%,#D4B85C 70%,#B09040 100%)"],
  ["composite", "linear-gradient(135deg,#4A4540 0%,#5C534D 40%,#3E3A36 70%,#524C47 100%)"],
];

function getSwatchGradient(title?: string, swatch?: string): string {
  if (swatch) return swatch;
  const lower = title?.toLowerCase() ?? "";
  for (const [key, val] of DEFAULT_SWATCHES) {
    if (lower.includes(key)) return val;
  }
  return "linear-gradient(135deg,#C9A96E,#A68B56)";
}

/* ---------- Designer canvas preview (decorative hero right-panel) ---------- */

function DesignerPreview() {
  const boards = [34, 34, 34, 34, 22, 34, 34, 34, 22, 34];
  const offcutIdxs = new Set([4, 8]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_40px_120px_rgba(0,0,0,0.4)]">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E65A50]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F5BF4F]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#62C554]" />
        </div>
        <div className="ml-2 flex items-center gap-1.5">
          {(["Select", "Draw", "4.5m × 3.2m"] as const).map((label, i) => (
            <span
              key={label}
              className={`rounded px-2.5 py-0.5 font-mono text-[10px] font-medium ${
                i === 2
                  ? "border border-primary/40 bg-primary/10 text-primary"
                  : "border border-border bg-background text-muted-foreground"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="canvas-grid relative h-[320px] sm:h-[360px]">
        {/* Boards */}
        <div className="absolute left-11 top-11 flex flex-col gap-[3px]">
          {boards.map((width, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: decorative static list
              key={i}
              className="h-3 rounded-[2px]"
              style={{
                width: `${width * 5}px`,
                background: offcutIdxs.has(i) ? "#6DAF62" : "#C9A96E",
                animation: `board-in 0.35s ease-out ${i * 55}ms both`,
              }}
            />
          ))}
        </div>

        {/* Joist lines */}
        {[130, 210, 290].map((x) => (
          <div
            key={`j${x}`}
            className="absolute top-10 w-px opacity-20"
            style={{ left: `${x}px`, height: "160px", background: "#8B7355" }}
          />
        ))}

        {/* Dimension labels */}
        <span className="absolute bottom-4 left-11 rounded border border-border bg-card/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          4.5m
        </span>
        <span
          className="absolute top-11 rounded border border-border bg-card/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          style={{ left: "186px" }}
        >
          3.2m
        </span>

        {/* BOM panel */}
        <div className="absolute right-3 top-3 min-w-[148px] rounded-xl border border-border bg-card/90 p-3.5 backdrop-blur-sm">
          <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
            Bill of Materials
          </p>
          {(
            [
              { label: "Boards", value: "31", green: false },
              { label: "Joists", value: "9", green: false },
              { label: "Screws", value: "682", green: false },
              { label: "Offcuts reused", value: "2 boards", green: true },
            ] as const
          ).map((row) => (
            <div key={row.label} className="mb-1 flex justify-between font-mono text-[11px]">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={row.green ? "font-medium text-[#6DAF62]" : "font-medium text-foreground"}>
                {row.value}
              </span>
            </div>
          ))}
          <div className="mt-2.5 border-t border-border pt-2.5">
            <div className="flex justify-between font-mono text-[13px] font-semibold text-primary">
              <span>Total</span>
              <span>R 43,046</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default async function HomePage() {
  const [sections, settings, trustStripContent] = await Promise.all([
    getHomepageSections(),
    getSiteSettings(),
    getSiteContent("trust_strip"),
  ]);

  const sectionMap = Object.fromEntries(
    sections.map((s) => [s.section_key, s.content])
  );

  const hero = sectionMap.hero as HeroContent | undefined;
  const trustStats = sectionMap.trust_stats as TrustStatsContent | undefined;
  const howItWorks = sectionMap.how_it_works as HowItWorksContent | undefined;
  const materials = sectionMap.materials as MaterialsContent | undefined;
  const services = sectionMap.services as ServicesContent | undefined;
  const about = sectionMap.about as AboutContent | undefined;
  const cta = sectionMap.cta as CtaContent | undefined;

  const trustStripValues = (trustStripContent?.values ?? []) as string[];

  // Fallbacks so the page looks great before seed data
  const heroHeading = hero?.heading?.en ?? "Design Your Deck";
  const heroSub =
    hero?.subheading?.en ??
    "Draw your shape. Get an exact bill of materials — down to the last screw. Then order everything or book installation.";
  const heroCta = { text: hero?.cta_text?.en ?? "Start Designing →", url: hero?.cta_url ?? "/configure" };
  const heroCtaSec = { text: hero?.cta_secondary_text?.en ?? "Book a Free Site Visit", url: hero?.cta_secondary_url ?? "/book" };
  const statBoards = hero?.stat_boards ?? "31 boards";
  const statScrews = hero?.stat_screws ?? "682 screws";
  const statPrice = hero?.stat_price ?? "R 43,046";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema(settings)) }}
      />

      {/* ── 1. Hero ── */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[#1A1918]">
        {/* Background deck photo */}
        <Image
          src="/images/pexels-didsss-33312430.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-35"
        />
        {/* Gradient: dark left (text) → translucent right (photo shows through) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1A1918] via-[#1A1918]/80 to-[#1A1918]/20 lg:via-[#1A1918]/75 lg:to-transparent" />
        {/* Ember ambient glow */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[700px] w-[700px] rounded-full bg-primary/[0.07] blur-3xl" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 px-4 py-20 md:px-8 lg:grid-cols-2 lg:gap-16">
          {/* Left — text */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-[2px] text-primary">
                Interactive Deck Designer
              </span>
            </div>

            <h1 className="font-display text-[3rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-foreground sm:text-[3.8rem] lg:text-[4.2rem]">
              {heroHeading.includes("Deck") ? (
                <>
                  {heroHeading.split("Deck")[0]}
                  <span className="text-primary">Deck</span>
                  {heroHeading.split("Deck")[1]}
                </>
              ) : (
                heroHeading
              )}
            </h1>

            <p className="mt-6 max-w-[420px] text-[1.05rem] leading-relaxed text-muted-foreground">
              {heroSub}
            </p>

            {/* Mono stats pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[13px] text-muted-foreground">
              <span className="text-muted-foreground/40">e.g.</span>
              {[statBoards, statScrews, statPrice].map((stat) => (
                <span
                  key={stat}
                  className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-foreground"
                >
                  {stat.startsWith("R ") ? (
                    <>
                      <span className="font-semibold text-primary">R </span>
                      {stat.slice(2)}
                    </>
                  ) : (
                    stat
                  )}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={heroCta.url}
                className="inline-flex items-center rounded-xl bg-primary px-7 py-4 text-[1rem] font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(212,98,42,0.35)] active:scale-[0.97]"
              >
                {heroCta.text}
              </Link>
              <Link
                href={heroCtaSec.url}
                className="inline-flex items-center rounded-xl border border-border px-7 py-4 text-[1rem] font-medium text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
              >
                {heroCtaSec.text}
              </Link>
            </div>

            {settings.whatsapp_number && (
              <p className="mt-5 text-sm text-muted-foreground/60">
                Or{" "}
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replaceAll(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  WhatsApp us
                </a>
              </p>
            )}
          </div>

          {/* Right — designer preview */}
          <div className="hidden lg:block">
            <DesignerPreview />
          </div>
        </div>
      </section>

      {/* ── Wood strip ── */}
      <WoodStrip src="/images/pexels-asphotography-518245.jpg" alt="Natural timber deck boards" />

      {/* ── 2. Trust Stats ── */}
      {trustStats?.items && trustStats.items.length > 0 && (
        <section className="border-b border-border bg-muted/20 py-10">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-4 md:grid-cols-4 md:px-8">
            {trustStats.items.map((stat) => (
              <div key={stat.label?.en ?? stat.value} className="text-center">
                {stat.icon && <span className="mb-1 block text-2xl">{stat.icon}</span>}
                {stat.value && (
                  <span className="block font-mono text-2xl font-semibold text-primary">
                    {stat.value}
                  </span>
                )}
                {stat.label?.en && (
                  <span className="mt-1 block text-sm text-muted-foreground">{stat.label.en}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 3. How It Works ── */}
      {howItWorks?.items && howItWorks.items.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-[1280px] px-4 md:px-8">
            <div className="mb-16 text-center">
              {howItWorks.heading?.en && (
                <h2 className="font-display text-[2.2rem] font-extrabold tracking-[-0.04em]">
                  {howItWorks.heading.en}
                </h2>
              )}
              {howItWorks.subheading?.en && (
                <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                  {howItWorks.subheading.en}
                </p>
              )}
            </div>

            {/* Board-gap grid */}
            <div className="board-gap-grid grid overflow-hidden rounded-2xl sm:grid-cols-3">
              {howItWorks.items.slice(0, 3).map((item, i) => (
                <div
                  key={item.step ?? item.title?.en ?? i}
                  className="card-ember-bar bg-card p-10 md:p-12"
                >
                  <p className="font-mono text-[3rem] font-semibold leading-none text-border">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  {item.title?.en && (
                    <h3 className="mt-5 font-display text-[1.2rem] font-bold tracking-tight">
                      {item.title.en}
                    </h3>
                  )}
                  {item.description?.en && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description.en}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/configure"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                Try the Designer — It&apos;s Free →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Wood strip ── */}
      <WoodStrip src="/images/pexels-fwstudio-33348-139325.jpg" alt="Deck boards with screws" />

      {/* ── 4. Materials ── */}
      {materials?.items && materials.items.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-[1280px] px-4 md:px-8">
            <div className="mb-14">
              {materials.heading?.en && (
                <h2 className="font-display text-[2rem] font-extrabold tracking-[-0.04em]">
                  {materials.heading.en}
                </h2>
              )}
              {materials.subheading?.en && (
                <p className="mt-2 max-w-lg text-muted-foreground">{materials.subheading.en}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {materials.items.map((item) => (
                <Link
                  key={item.title?.en ?? item.from_price}
                  href={`/configure?material=${encodeURIComponent(item.title?.en ?? "")}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                >
                  {/* Wood swatch */}
                  <div
                    className="relative h-24 overflow-hidden"
                    style={{ background: getSwatchGradient(item.title?.en, item.swatch) }}
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title?.en ?? ""}
                        fill
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                        className="object-cover opacity-60 mix-blend-multiply"
                      />
                    )}
                    {/* Grain lines overlay */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background:
                          "repeating-linear-gradient(90deg,transparent 0px,transparent 6px,rgba(0,0,0,0.15) 6px,rgba(0,0,0,0.15) 7px)",
                      }}
                    />
                  </div>

                  <div className="p-5">
                    {item.title?.en && (
                      <h3 className="font-display font-bold tracking-tight transition-colors group-hover:text-primary">
                        {item.title.en}
                      </h3>
                    )}
                    {item.description?.en && (
                      <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                        {item.description.en}
                      </p>
                    )}
                    {item.from_price && (
                      <p className="mt-3 font-mono text-sm font-semibold text-primary">
                        From {item.from_price}/m²
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Services fallback ── */}
      {services?.items && services.items.length > 0 && !materials?.items?.length && (
        <section className="py-24">
          <div className="mx-auto max-w-[1280px] px-4 md:px-8">
            {services.heading?.en && (
              <h2 className="font-display text-[2rem] font-extrabold tracking-tight">
                {services.heading.en}
              </h2>
            )}
            {services.subheading?.en && (
              <p className="mt-2 max-w-lg text-muted-foreground">{services.subheading.en}</p>
            )}
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.items.map((item) => (
                <div
                  key={item.title?.en ?? item.icon}
                  className="card-ember-bar rounded-2xl border border-border bg-card p-7"
                >
                  {item.icon && (
                    <DynamicIcon name={item.icon} className="mb-4 h-7 w-7 text-primary" />
                  )}
                  {item.title?.en && (
                    <h3 className="font-display text-lg font-bold tracking-tight">{item.title.en}</h3>
                  )}
                  {item.description?.en && (
                    <p className="mt-2 text-sm text-muted-foreground">{item.description.en}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. About Snippet ── */}
      {about?.heading?.en && (
        <section className="border-y border-[#2A2725] overflow-hidden">
          <div className="mx-auto max-w-[1280px] grid lg:grid-cols-2 items-stretch">
            {/* Text */}
            <div className="flex flex-col justify-center py-20 px-4 md:px-8 lg:px-16">
              <span className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />
                <span className="font-mono text-[11px] font-medium uppercase tracking-[2px] text-primary">
                  About Us
                </span>
              </span>
              <h2 className="font-display text-[1.9rem] font-extrabold tracking-tight text-[#F5F1EC]">
                {about.heading.en}
              </h2>
              {about.body?.en && (
                <p className="mt-4 leading-relaxed text-[#A8A099]">{about.body.en}</p>
              )}
              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-2 font-medium text-primary hover:text-primary/80"
              >
                Learn more about us →
              </Link>
            </div>
            {/* Photo */}
            <div className="relative min-h-[320px] lg:min-h-0">
              <Image
                src="/images/pexels-lelani-badenhorst-26647525-6790680.jpg"
                alt="Timber deck with chairs overlooking nature"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A1918]/60 to-transparent lg:from-[#1A1918]/80" />
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Trust Strip ── */}
      {trustStripValues.length > 0 && (
        <section className="border-b border-border py-4">
          <div className="mx-auto max-w-[1280px] px-4 md:px-8">
            <p className="text-center font-mono text-xs uppercase tracking-widest text-muted-foreground/60">
              {trustStripValues.join(" · ")}
            </p>
          </div>
        </section>
      )}

      {/* ── Deck lifestyle strip ── */}
      <WoodStrip src="/images/pexels-lelani-badenhorst-26647525-6790680.jpg" alt="Timber deck overlooking nature" />

      {/* ── 8. CTA Banner ── */}
      {cta?.heading?.en && (
        <section className="relative overflow-hidden py-24">
          {/* Wood plank photo */}
          <Image
            src="/images/pexels-rachel-claire-6752176.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Ember overlay */}
          <div className="pointer-events-none absolute inset-0 bg-primary/80" />
          {/* Subtle board-grain texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              background:
                "repeating-linear-gradient(92deg,transparent 0px,transparent 18px,rgba(0,0,0,0.15) 18px,rgba(0,0,0,0.15) 19px)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center md:px-8">
            <h2 className="font-display text-[2.2rem] font-extrabold tracking-tight text-primary-foreground">
              {cta.heading.en}
            </h2>
            {cta.body?.en && (
              <p className="mt-4 text-lg text-primary-foreground/80">{cta.body.en}</p>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {cta.button_text?.en && cta.button_url && (
                <Link
                  href={cta.button_url}
                  className="inline-flex items-center rounded-xl bg-white px-8 py-4 text-[1rem] font-bold text-primary transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
                >
                  {cta.button_text.en}
                </Link>
              )}
              {cta.button_secondary_text?.en && cta.button_secondary_url && (
                <Link
                  href={cta.button_secondary_url}
                  className="inline-flex items-center rounded-xl border-2 border-white/40 px-8 py-4 text-[1rem] font-semibold text-white transition-colors hover:border-white/70"
                >
                  {cta.button_secondary_text.en}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
