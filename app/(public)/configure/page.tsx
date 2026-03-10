import type { Metadata } from "next";
import Image from "next/image";
import { DeckConfigurator } from "@/components/configurator/deck-configurator";

export const metadata: Metadata = {
  title: "Design Your Deck — The Deck Lab",
  description:
    "Configure your custom deck online. Choose materials, set dimensions, pick your board style, and get an instant quote.",
};

export default function ConfigurePage() {
  return (
    <>
      {/* Photo header */}
      <div className="relative h-48 w-full overflow-hidden sm:h-56">
        <Image
          src="/images/pexels-cottonbro-4934513.jpg"
          alt="Deck boards close-up"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1918]/60 to-[#1A1918]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-4">
          <span className="mb-2 flex items-center gap-3">
            <span className="h-px w-6 bg-primary" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[2px] text-primary">
              Step-by-step designer
            </span>
            <span className="h-px w-6 bg-primary" />
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#F5F1EC] sm:text-4xl">
            Design Your Deck
          </h1>
          <p className="mt-2 text-sm text-[#A8A099]">
            Configure your deck step by step and get an instant quote.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <DeckConfigurator />
      </section>
    </>
  );
}
