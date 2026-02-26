import { generatePageMetadata } from "@/lib/seo/metadata";
import { getSiteContent } from "@/lib/cms/queries";
import { siteConfig } from "@/config/site";
import type { LocalizedString } from "@/types/cms";
import Link from "next/link";

export async function generateMetadata() {
  return generatePageMetadata("about");
}

interface ProcessStep {
  step: string;
  title: LocalizedString;
  description: LocalizedString;
}

interface ValueItem {
  title: LocalizedString;
  description: LocalizedString;
}

interface AboutContent {
  heading?: LocalizedString;
  body?: LocalizedString;
  mission?: LocalizedString;
  process?: ProcessStep[];
  values?: ValueItem[];
  service_area?: LocalizedString;
}

export default async function AboutPage() {
  const content = (await getSiteContent("about")) as AboutContent | null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8">
      {/* Hero Heading */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {content?.heading?.en ?? "About The Deck Lab"}
        </h1>
        {content?.mission?.en && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {content.mission.en}
          </p>
        )}
      </section>

      {/* Story Section */}
      {content?.body?.en ? (
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold">Our Story</h2>
          <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
            {content.body.en.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto mt-16 max-w-3xl">
          <p className="text-muted-foreground">{siteConfig.description}</p>
        </section>
      )}

      {/* How It Works */}
      {content?.process && content.process.length > 0 && (
        <section className="mt-20">
          <h2 className="text-center text-2xl font-bold">How It Works</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            From your first click to enjoying your new deck.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {content.process.map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {item.title.en}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description.en}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why The Deck Lab */}
      {content?.values && content.values.length > 0 && (
        <section className="mt-20">
          <h2 className="text-center text-2xl font-bold">
            Why Choose The Deck Lab
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {content.values.map((value, i) => (
              <div key={i} className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold">{value.title.en}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {value.description.en}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Service Area */}
      {content?.service_area?.en && (
        <section className="mt-20 text-center">
          <h2 className="text-2xl font-bold">Service Area</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {content.service_area.en}
          </p>
        </section>
      )}

      {/* CTA */}
      <section className="mt-20 rounded-xl bg-primary px-6 py-12 text-center text-primary-foreground">
        <h2 className="text-2xl font-bold">Ready to design your deck?</h2>
        <p className="mx-auto mt-3 max-w-md opacity-90">
          Use our configurator to get an instant quote, or book a free site
          visit.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/configure"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary transition-opacity hover:opacity-90"
          >
            Design Your Deck
          </Link>
          <Link
            href="/contact"
            className="inline-block rounded-lg border border-white/50 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
