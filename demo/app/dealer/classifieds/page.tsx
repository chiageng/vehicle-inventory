"use client";

import { ClassifiedsManager } from "@/components/ClassifiedsManager";
import { PageHeader } from "@/components/ui";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";

export default function DealerClassifiedsPage() {
  const { listings } = useDemo();
  const mine = listings.filter((l) => l.sellerName === PERSONAS.dealer.name);

  return (
    <div>
      <PageHeader
        title="Classified listings"
        description="Aggregator — one inventory feeds every channel: Carlist.my, Mudah.my and Facebook Marketplace."
      />
      <ClassifiedsManager listings={mine} />
    </div>
  );
}
