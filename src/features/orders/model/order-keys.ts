export const orderKeys = {
  all: ["seller-orders"] as const,
  detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const,
  list: () => [...orderKeys.all, "list"] as const,
};
