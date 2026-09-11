export const settlementAccountKeys = {
  all: ["settlement-account"] as const,
  banks: () => [...settlementAccountKeys.all, "banks"] as const,
  detail: () => [...settlementAccountKeys.all, "detail"] as const,
};
