import { generatePageMetadata } from "@/lib/seo/metadata";
import { getSiteContent } from "@/lib/cms/queries";
import type { LocalizedString } from "@/types/cms";
import Link from "next/link";

export async function generateMetadata() {
  return generatePageMetadata("services");
}

interface ServiceDetailItem {
  icon?: string;
  title: LocalizedString;
  description: LocalizedString;
  features?: string[];
}

interface ServiceDetailContent {
  heading?: LocalizedString;
  intro?: LocalizedString;
  items?: ServiceDetailItem[];
}

export default async function ServicesPage() {
  const content = (await getSiteContent(
    "services_detail"
  )) as ServiceDetailContent | null;

  const heading = content?.heading?.en ?? "Our Services";
  const intro = content?.intro?.en ?? "";
  const services = content?.items ?? [];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8">
      {/* Page Heading */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {heading}
        </h1>
        {intro && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {intro}
          </p>
        )}
      </section>

      {/* Service Sections */}
      {services.length > 0 ? (
        <div className="mt-16 space-y-0">
          {services.map((service, i) => {
            const isEven = i % 2 === 1;
            const serviceKey = service.title?.en ?? `service-${i}`;

            return (
              <div key={serviceKey}>
                <div
                  className={`flex flex-col gap-8 py-12 md:flex-row md:items-center md:gap-16 ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Icon Side */}
                  <div className="flex shrink-0 items-center justify-center md:w-48">
                    {service.icon && (
                      <span className="text-7xl" aria-hidden="true">
                        {service.icon}
                      </span>
                    )}
                  </div>

                  {/* Content Side */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {service.title?.en ?? "Service"}
                    </h2>
                    {service.description?.en && (
                      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
                        {service.description.en
                          .split("\n\n")
                          .map((paragraph, pi) => (
                            <p key={`${serviceKey}-p-${pi}`}>{paragraph}</p>
                          ))}
                      </div>
                    )}

                    {/* Feature Pills */}
                    {service.features && service.features.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {service.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-block rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link
                      href="/contact"
                      className="mt-5 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Get a Quote
                    </Link>
                  </div>
                </div>

                {i < services.length - 1 && <hr className="border-b" />}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted-foreground">
          Services will be listed here soon.
        </p>
      )}

      {/* Bottom CTA */}
      <section className="mt-16 rounded-xl bg-primary px-6 py-12 text-center text-primary-foreground">
        <h2 className="text-2xl font-bold">Need a custom solution?</h2>
        <p className="mx-auto mt-3 max-w-md opacity-90">
          Every deck is different. Tell us what you need and we&apos;ll design
          the perfect solution.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary transition-opacity hover:opacity-90"
        >
          Contact Us
        </Link>
      </section>
    </div>
  );
}
