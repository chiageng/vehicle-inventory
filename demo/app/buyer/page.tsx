import { MarketplaceClient } from "./MarketplaceClient";

export default async function BuyerMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return <MarketplaceClient initialQuery={q} />;
}
