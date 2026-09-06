export type AssetStatus =
  "UPLOADED" | "PROCESSING" | "READY" | "FAILED" | "DELETED";

export type AssetVariantType = "THUMBNAIL" | "MEDIUM" | "LARGE";

export type AssetVariant = {
  type: AssetVariantType;
  deliveryUrl: string;
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
