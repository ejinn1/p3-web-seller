import type { AssetDeliveryVariant } from "@/features/assets/model/asset-types";

export type RepresentativeImageStatus = "ACTIVE" | "HIDDEN";

export type RepresentativeImage = {
  id: string;
  storeId: string;
  assetId: string;
  deliveryUrl: string | null;
  sortOrder: number;
  status: RepresentativeImageStatus;
  createdAt: string;
  updatedAt: string;
  variants: AssetDeliveryVariant[];
};

export type CreateRepresentativeImageInput = Pick<
  RepresentativeImage,
  "assetId" | "sortOrder"
>;
