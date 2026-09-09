type ShareStoreLinkInput = {
  storeName: string;
  url: string;
};

export type ShareStoreLinkResult = "copied" | "shared" | "cancelled";

export async function shareStoreLink({
  storeName,
  url,
}: ShareStoreLinkInput): Promise<ShareStoreLinkResult> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: `${storeName} 스토어`,
        url,
      });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard API is unavailable.");
  }

  await navigator.clipboard.writeText(url);
  return "copied";
}
