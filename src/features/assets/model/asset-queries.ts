import { type Query, useQueries, useQuery } from "@tanstack/react-query";
import { getAsset, getAssets } from "@/features/assets/api/assets-api";
import { assetKeys } from "@/features/assets/api/asset-keys";
import type { Asset } from "@/features/assets/model/asset-types";

export function useAssetsQuery(enabled = true) {
  return useQuery({ queryKey: assetKeys.list(), queryFn: getAssets, enabled });
}

export function useAssetQuery(assetId: string, enabled = true) {
  return useQuery({
    queryKey: assetKeys.detail(assetId),
    queryFn: () => getAsset(assetId),
    enabled: enabled && Boolean(assetId),
  });
}

export function useAssetQueries(assetIds: string[]) {
  return useQueries({
    queries: [...new Set(assetIds)].map((assetId) => ({
      queryKey: assetKeys.detail(assetId),
      queryFn: () => getAsset(assetId),
      refetchInterval: (
        query: Query<Asset, Error, Asset, ReturnType<typeof assetKeys.detail>>,
      ) => {
        const status = query.state.data?.status;

        return status === "UPLOADED" || status === "PROCESSING" ? 2000 : false;
      },
    })),
  });
}
