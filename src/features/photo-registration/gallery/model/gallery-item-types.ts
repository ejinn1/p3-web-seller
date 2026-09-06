import type { AssetDeliveryVariant } from "@/features/assets/model/asset-types";

export type GalleryItemStatus = "VISIBLE" | "HIDDEN";

export type GalleryItem = {
  id: string;
  storeId: string;
  assetId: string;
  deliveryUrl: string | null;
  sortOrder: number;
  featured: boolean;
  status: GalleryItemStatus;
  createdAt: string;
  updatedAt: string;
  variants: AssetDeliveryVariant[];
};

export type CreateGalleryItemInput = Pick<
  GalleryItem,
  "assetId" | "sortOrder" | "featured"
>;
