export type AssetStatus =
  "UPLOADED" | "PROCESSING" | "READY" | "FAILED" | "DELETED";

export type AssetVariantType = "THUMBNAIL" | "MEDIUM" | "LARGE";

export type AssetDeliveryVariant = {
  type: AssetVariantType;
  deliveryUrl: string | null;
  width: number;
  height: number;
};

export type Asset = {
  id: string;
  uploadedBy: string;
  originalFilename: string;
  contentType: string;
  size: number;
  deliveryUrl: string | null;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
};

export type UploadedAsset = { assetId: string; deliveryUrl: string | null };
