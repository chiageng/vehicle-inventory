import { CompareClient } from "./CompareClient";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids = "" } = await searchParams;
  return <CompareClient initialIds={ids.split(",").filter(Boolean)} />;
}
