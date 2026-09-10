import { getAssetDeliveryUrl } from "@/features/assets/model/asset-delivery";
import type { Asset } from "@/features/assets/model/asset-types";
import type { OrderReferenceAsset } from "@/features/orders/model/order-types";

export function getReferenceAssetIds(
  references: Array<string | null | undefined>,
) {
  return uniqueValues(
    references.filter(
      (reference): reference is string =>
        typeof reference === "string" &&
        reference.length > 0 &&
        !isDeliveryUrl(reference),
    ),
  );
}

export function getReferenceThumbnailUrl(
  references: readonly string[] | null | undefined,
  referenceAssetById: Map<string, Asset>,
  referenceAssets?: readonly OrderReferenceAsset[] | null,
) {
  const referenceAssetUrl = getReferenceAssetThumbnailUrl(referenceAssets);

  if (referenceAssetUrl) {
    return referenceAssetUrl;
  }

  for (const reference of references ?? []) {
    if (isDeliveryUrl(reference)) {
      return reference;
    }

    const deliveryUrl = referenceAssetById.get(reference)?.deliveryUrl;

    if (deliveryUrl) {
      return deliveryUrl;
    }
  }

  return null;
}

export function getReferenceAssetThumbnailUrl(
  referenceAssets?: readonly OrderReferenceAsset[] | null,
) {
  const sortedAssets = [...(referenceAssets ?? [])].sort(
    (first, second) => first.sortOrder - second.sortOrder,
  );

  for (const asset of sortedAssets) {
    const deliveryUrl = getAssetDeliveryUrl(asset.deliveryUrl, asset.variants, [
      "THUMBNAIL",
      "MEDIUM",
      "LARGE",
    ]);

    if (deliveryUrl) {
      return deliveryUrl;
    }
  }

  return null;
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function isDeliveryUrl(value: string) {
  return /^(https?:|data:|blob:|\/)/.test(value);
}
