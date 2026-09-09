import { getJson, sendJson } from "@/lib/api/client";
import type {
  CreateRepresentativeImageInput,
  RepresentativeImage,
  UpdateRepresentativeImageInput,
} from "@/features/photo-registration/representative/model/representative-image-types";

export const getRepresentativeImages = () =>
  getJson<RepresentativeImage[]>("/seller/representative-images");

export const createRepresentativeImage = (
  input: CreateRepresentativeImageInput,
) =>
  sendJson<RepresentativeImage>("/seller/representative-images", "POST", input);

export const updateRepresentativeImage = (
  imageId: string,
  input: UpdateRepresentativeImageInput,
) =>
  sendJson<RepresentativeImage>(
    `/seller/representative-images/${imageId}`,
    "PATCH",
    input,
  );

export const deleteRepresentativeImage = (imageId: string) =>
  sendJson<void>(`/seller/representative-images/${imageId}`, "DELETE");
