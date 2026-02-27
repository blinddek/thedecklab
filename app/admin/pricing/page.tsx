import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getMarkupConfig,
  getAdminMaterials,
  getAdminDeckTypes,
  getAdminBoardDirections,
  getAdminBoardProfiles,
  getAdminFinishOptions,
  getAdminExtras,
} from "@/lib/admin/configurator-actions";
import { MarkupTab } from "./markup-tab";
import { SimulatorTab } from "./simulator-tab";

export default async function AdminPricingPage() {
  const [markups, materials, deckTypes, directions, profiles, finishes, extras] =
    await Promise.all([
      getMarkupConfig(),
      getAdminMaterials(),
      getAdminDeckTypes(),
      getAdminBoardDirections(),
      getAdminBoardProfiles(),
      getAdminFinishOptions(),
      getAdminExtras(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Markup & Pricing</h1>
        <p className="text-sm text-muted-foreground">
          Manage markup cascade and test pricing with the simulator.
        </p>
      </div>

      <Tabs defaultValue="markup">
        <TabsList>
          <TabsTrigger value="markup">Markup Cascade</TabsTrigger>
          <TabsTrigger value="simulator">Pricing Simulator</TabsTrigger>
        </TabsList>

        <TabsContent value="markup" className="mt-4">
          <MarkupTab markups={markups} materials={materials} />
        </TabsContent>

        <TabsContent value="simulator" className="mt-4">
          <SimulatorTab
            materials={materials}
            deckTypes={deckTypes}
            directions={directions}
            profiles={profiles}
            finishes={finishes}
            extras={extras}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
