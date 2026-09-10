export type InquiryScreenState =
  | "chat"
  | "order-form"
  | "confirmation-draft"
  | "confirmation-priced"
  | "confirmation-view"
  | "order-history";

export type InquiryDocumentMode = Exclude<InquiryScreenState, "chat">;

const states = new Set<InquiryScreenState>([
  "chat",
  "order-form",
  "confirmation-draft",
  "confirmation-priced",
  "confirmation-view",
  "order-history",
]);

export function parseInquiryScreenState(
  value: string | null,
): InquiryScreenState {
  return value && states.has(value as InquiryScreenState)
    ? (value as InquiryScreenState)
    : "chat";
}

export function getInquiryDetailHref(
  inquiryId: string,
  state: InquiryScreenState,
  options?: {
    modal?: "payment-request";
    sheet?: "price";
    submissionId?: string;
  },
) {
  const params = new URLSearchParams();

  if (state !== "chat") {
    params.set("state", state);
  }
  if (options?.submissionId) {
    params.set("submissionId", options.submissionId);
  }
  if (options?.sheet) {
    params.set("sheet", options.sheet);
  }
  if (options?.modal) {
    params.set("modal", options.modal);
  }

  const query = params.toString();
  return `/seller/inquiries/${inquiryId}${query ? `?${query}` : ""}`;
}

export function isInquiryDocumentState(state: InquiryScreenState) {
  return state !== "chat";
}
