import { ListingWizard } from "@/components/ListingWizard";
import { PageHeader } from "@/components/ui";

export default async function DealerNewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ plate?: string }>;
}) {
  const { plate = "" } = await searchParams;

  return (
    <div>
      <PageHeader
        title="Add a car"
        description="Same guided flow as sellers, plus consignment support. Plate / chassis lookup auto-fills the spec."
      />
      <ListingWizard mode="dealer" initialPlate={plate} doneHref="/dealer/inventory" />
    </div>
  );
}
