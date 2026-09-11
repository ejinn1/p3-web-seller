export type SettlementAccountHolderType = "PERSONAL" | "BUSINESS";

export type SettlementBank = {
  code: string;
  name: string;
};

export type SettlementAccount = {
  bankCode: string;
  bankName: string;
  accountNumberMasked: string;
  accountHolderName: string;
  holderType: SettlementAccountHolderType;
  verificationStatus: "VERIFIED";
  verifiedAt: string;
};

export type PersonalSettlementAccountInput = {
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  holderType: "PERSONAL";
  birthDate: string;
};

export type BusinessSettlementAccountInput = {
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  holderType: "BUSINESS";
  businessRegistrationNumber: string;
};

export type SettlementAccountInput =
  PersonalSettlementAccountInput | BusinessSettlementAccountInput;
