import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAdminDeckTypes,
  getAdminRates,
  getAdminBoardDirections,
  getAdminBoardProfiles,
  getAdminFinishOptions,
  getAdminExtras,
  getAdminMaterials,
  getAdminBoardDimensions,
  getPricingSettings,
} from "@/lib/admin/configurator-actions";
import { DeckTypesTab } from "./deck-types-tab";
import { MaterialRatesTab } from "./material-rates-tab";
import { BoardOptionsTab } from "./board-options-tab";
import { FinishesTab } from "./finishes-tab";
import { ExtrasTab } from "./extras-tab";
import { CalculatorConstantsTab } from "./calculator-constants-tab";

export default async function AdminConfiguratorPage() {
  const [
    materials,
    deckTypes,
    rates,
    directions,
    profiles,
    finishes,
    extras,
    dimensions,
    settings,
  ] = await Promise.all([
    getAdminMaterials(),
    getAdminDeckTypes(),
    getAdminRates(),
    getAdminBoardDirections(),
    getAdminBoardProfiles(),
    getAdminFinishOptions(),
    getAdminExtras(),
    getAdminBoardDimensions(),
    getPricingSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurator</h1>
        <p className="text-sm text-muted-foreground">
          Manage deck types, material rates, board options, and pricing.
        </p>
      </div>

      <Tabs defaultValue="rates">
        <TabsList className="flex-wrap">
          <TabsTrigger value="rates">Material Rates</TabsTrigger>
          <TabsTrigger value="deck-types">Deck Types</TabsTrigger>
          <TabsTrigger value="board-options">Board Options</TabsTrigger>
          <TabsTrigger value="finishes">Finishes</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
          <TabsTrigger value="constants">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="mt-4">
          <MaterialRatesTab materials={materials} rates={rates} />
        </TabsContent>

        <TabsContent value="deck-types" className="mt-4">
          <DeckTypesTab deckTypes={deckTypes} extras={extras} />
        </TabsContent>

        <TabsContent value="board-options" className="mt-4">
          <BoardOptionsTab
            directions={directions}
            profiles={profiles}
            dimensions={dimensions}
            materials={materials}
          />
        </TabsContent>

        <TabsContent value="finishes" className="mt-4">
          <FinishesTab finishes={finishes} materials={materials} />
        </TabsContent>

        <TabsContent value="extras" className="mt-4">
          <ExtrasTab extras={extras} materials={materials} />
        </TabsContent>

        <TabsContent value="constants" className="mt-4">
          <CalculatorConstantsTab settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
