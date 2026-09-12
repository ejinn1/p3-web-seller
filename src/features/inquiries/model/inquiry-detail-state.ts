export type InquiryScreenState =
  | "chat"
  | "order-form"
  | "confirmation-draft"
  | "confirmation-priced"
  | "confirmation-view"
  | "order-history";

export type InquiryDocumentMode = Exclude<InquiryScreenState, "chat">;
export type InquiryEntrySource = "seller-home";

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
    confirmationId?: string;
    modal?: "payment-request";
    sheet?: "price";
    source?: InquiryEntrySource;
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
  if (options?.confirmationId) {
    params.set("confirmationId", options.confirmationId);
  }
  if (options?.sheet) {
    params.set("sheet", options.sheet);
  }
  if (options?.modal) {
    params.set("modal", options.modal);
  }
  if (options?.source) {
    params.set("source", options.source);
  }

  const query = params.toString();
  return `/seller/inquiries/${inquiryId}${query ? `?${query}` : ""}`;
}

export function parseInquiryEntrySource(
  value: string | null,
): InquiryEntrySource | null {
  return value === "seller-home" ? value : null;
}

export function isInquiryDocumentState(state: InquiryScreenState) {
  return state !== "chat";
}
