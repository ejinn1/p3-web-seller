import type {
  AssetVariant,
  AssetVariantType,
} from "@/features/assets/model/asset-types";

export function getAssetDeliveryUrl(
  deliveryUrl: string | null,
  variants: AssetVariant[] | null | undefined,
  preferredTypes: AssetVariantType[],
): string | undefined {
  return (
    preferredTypes
      .map((type) => (variants ?? []).find((variant) => variant.type === type))
      .find((variant) => Boolean(variant?.deliveryUrl))?.deliveryUrl ??
    deliveryUrl ??
    undefined
  );
}
