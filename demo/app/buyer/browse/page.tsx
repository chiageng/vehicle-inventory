import { redirect } from "next/navigation";

/** /buyer and /buyer/browse were merged — keep old links working. */
export default async function BrowseRedirect({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  redirect(q ? `/buyer?q=${encodeURIComponent(q)}` : "/buyer");
}
