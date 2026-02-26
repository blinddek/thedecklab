import type { Metadata } from "next";
import { DeckConfigurator } from "@/components/configurator/deck-configurator";

export const metadata: Metadata = {
  title: "Design Your Deck — The Deck Lab",
  description:
    "Configure your custom deck online. Choose materials, set dimensions, pick your board style, and get an instant quote.",
};

export default function ConfigurePage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Design Your Deck
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configure your deck step by step and get an instant quote.
        </p>
      </div>
      <DeckConfigurator />
    </section>
  );
}
