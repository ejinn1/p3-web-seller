import { getJson, sendJson } from "@/lib/api/client";
import type {
  CreateGalleryItemInput,
  GalleryItem,
  UpdateGalleryItemInput,
} from "@/features/photo-registration/gallery/model/gallery-item-types";

export const getGalleryItems = () =>
  getJson<GalleryItem[]>("/seller/gallery-items");

export const createGalleryItem = (input: CreateGalleryItemInput) =>
  sendJson<GalleryItem>("/seller/gallery-items", "POST", input);

export const deleteGalleryItem = (galleryItemId: string) =>
  sendJson<void>(`/seller/gallery-items/${galleryItemId}`, "DELETE");

export const updateGalleryItem = (
  galleryItemId: string,
  input: UpdateGalleryItemInput,
) =>
  sendJson<GalleryItem>(
    `/seller/gallery-items/${galleryItemId}`,
    "PATCH",
    input,
  );
