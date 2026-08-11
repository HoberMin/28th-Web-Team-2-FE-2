import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MAP_STORES } from "@/app/(tabs)/stores/_data";
import { getStoreDetailData } from "./_data";
import { StoreDetailClient } from "./_store-detail-client";

interface StoreDetailPageProps {
  params: Promise<{ storeId: string }>;
}

export async function generateMetadata({ params }: StoreDetailPageProps): Promise<Metadata> {
  const { storeId } = await params;
  const store = MAP_STORES.find((candidate) => candidate.id === storeId);
  return { title: store ? `${store.name} 가게 상세` : "가게 상세" };
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { storeId } = await params;
  const store = MAP_STORES.find((candidate) => candidate.id === storeId);
  if (!store) notFound();

  return <StoreDetailClient store={store} detail={getStoreDetailData(store)} />;
}
