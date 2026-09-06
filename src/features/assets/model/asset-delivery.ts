import type {
  AssetDeliveryVariant,
  AssetVariantType,
} from "@/features/assets/model/asset-types";

export function getAssetDeliveryUrl(
  variants: AssetDeliveryVariant[],
  fallbackUrl: string | null,
  preferredType: AssetVariantType = "MEDIUM",
) {
  return (
    variants.find((variant) => variant.type === preferredType)?.deliveryUrl ??
    variants.find((variant) => variant.deliveryUrl)?.deliveryUrl ??
    fallbackUrl
  );
}
