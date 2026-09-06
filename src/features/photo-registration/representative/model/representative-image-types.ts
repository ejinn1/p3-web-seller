import type { AssetVariant } from "@/features/assets/model/asset-types";

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
  variants: AssetVariant[];
};

export type CreateRepresentativeImageInput = Pick<
  RepresentativeImage,
  "assetId" | "sortOrder"
>;
