import { generatePageMetadata } from "@/lib/seo/metadata";
import { getActiveKits } from "@/lib/shop/queries";
import { KitCard } from "@/components/shop/kit-card";

export async function generateMetadata() {
  return generatePageMetadata("shop", {
    title: "Decking Kits | The Deck Lab",
    description:
      "Complete decking kits with everything you need. Choose a kit, add to cart, and get building.",
  });
}

export default async function KitsPage() {
  const kits = await getActiveKits();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">
        Decking Kits
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Complete kits with all the materials you need for your deck project
      </p>

      {kits.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          No kits available at the moment. Check back soon!
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {kits.map((kit) => (
            <KitCard key={kit.id} kit={kit} />
          ))}
        </div>
      )}
    </div>
  );
}
