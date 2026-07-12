"use client";

import { ClassifiedsManager } from "@/components/ClassifiedsManager";
import { PageHeader } from "@/components/ui";
import { PERSONAS } from "@/lib/mock-data";
import { useDemo } from "@/lib/store";

export default function SellerClassifiedsPage() {
  const { listings } = useDemo();
  const mine = listings.filter((l) => l.sellerName === PERSONAS.seller.name);

  return (
    <div>
      <PageHeader
        title="Classified listings"
        description="Aggregator — publish your live listings to Carlist.my, Mudah.my and Facebook Marketplace from one place."
      />
      <ClassifiedsManager listings={mine} />
    </div>
  );
}
