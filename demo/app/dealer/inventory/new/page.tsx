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
        title="Add vehicle"
        description="Same guided flow as sellers, plus consignment support. Plate lookup auto-fills the spec."
      />
      <ListingWizard mode="dealer" initialPlate={plate} doneHref="/dealer/inventory" />
    </div>
  );
}
