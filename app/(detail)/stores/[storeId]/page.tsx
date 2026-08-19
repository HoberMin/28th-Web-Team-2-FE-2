import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MAP_STORES } from "@/app/(tabs)/stores/_data";
import { getStoreDetailData, getTemporaryStoreDetailContext } from "./_data";
import { StoreDetailClient } from "./_store-detail-client";

interface StoreDetailPageProps {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function resolveStore(
  storeId: string,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const prototypeStore = MAP_STORES.find((candidate) => candidate.id === storeId);
  if (prototypeStore) {
    return { store: prototypeStore, dataSource: "temporary" as const };
  }
  if (storeId !== "temporary") return null;

  const context = getTemporaryStoreDetailContext(searchParams);
  return {
    store: context.store,
    dataSource: context.hasBackendSummary ? ("backend-summary" as const) : ("temporary" as const),
  };
}

export async function generateMetadata({ params, searchParams }: StoreDetailPageProps): Promise<Metadata> {
  const { storeId } = await params;
  const store = resolveStore(storeId, await searchParams)?.store;
  return { title: store ? `${store.name} 가게 상세` : "가게 상세" };
}

export default async function StoreDetailPage({ params, searchParams }: StoreDetailPageProps) {
  const { storeId } = await params;
  const resolved = resolveStore(storeId, await searchParams);
  if (!resolved) notFound();

  return (
    <StoreDetailClient
      store={resolved.store}
      detail={getStoreDetailData(resolved.store)}
      dataSource={resolved.dataSource}
    />
  );
}
