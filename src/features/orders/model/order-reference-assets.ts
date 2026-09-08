import type { Asset } from "@/features/assets/model/asset-types";

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
) {
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

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function isDeliveryUrl(value: string) {
  return /^(https?:|data:|blob:|\/)/.test(value);
}
