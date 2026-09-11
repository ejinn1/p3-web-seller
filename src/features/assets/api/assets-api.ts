import { apiRequest, getJson, sendJson } from "@/lib/api/client";
import type { Asset, UploadedAsset } from "@/features/assets/model/asset-types";

export const uploadAsset = async (file: File) => {
  const bytes = await file.arrayBuffer();
  const uploadBlob = new Blob([bytes], { type: file.type });

  if (uploadBlob.size === 0 || uploadBlob.size !== file.size) {
    throw new Error("이미지 파일을 읽지 못했어요. 다시 선택해 주세요.");
  }

  const formData = new FormData();
  formData.append("file", uploadBlob, file.name);

  return apiRequest<UploadedAsset>("/assets", {
    method: "POST",
    body: formData,
  });
};

export const getAssets = () => getJson<Asset[]>("/assets");
export const getAsset = (assetId: string) =>
  getJson<Asset>(`/assets/${assetId}`);
export const deleteAsset = (assetId: string) =>
  sendJson<void>(`/assets/${assetId}`, "DELETE");
