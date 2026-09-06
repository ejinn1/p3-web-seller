export const revenueKeys = {
  all: ["revenue"] as const,
  range: (startDate: string, endDate: string) =>
    [...revenueKeys.all, "range", startDate, endDate] as const,
};
