export const inquiryKeys = {
  all: ["seller", "inquiries"] as const,
  detail: (inquiryId: string) =>
    [...inquiryKeys.all, inquiryId, "detail"] as const,
  list: () => [...inquiryKeys.all, "list"] as const,
};
