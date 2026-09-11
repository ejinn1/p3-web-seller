import { getJson, sendJson } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import type {
  SettlementAccount,
  SettlementAccountInput,
  SettlementBank,
} from "@/features/settlement-account/model/settlement-account-types";

export const getSettlementBanks = () =>
  getJson<SettlementBank[]>("/seller/store/settlement-account/banks");

export async function getSettlementAccount() {
  try {
    return await getJson<SettlementAccount>("/seller/store/settlement-account");
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.code === "SETTLEMENT_ACCOUNT_NOT_FOUND_404"
    ) {
      return null;
    }

    throw error;
  }
}

export const saveSettlementAccount = (input: SettlementAccountInput) =>
  sendJson<SettlementAccount>("/seller/store/settlement-account", "PUT", input);
