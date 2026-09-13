export type SettlementBank = {
  code: string;
  name: string;
};

export type SettlementAccount = {
  bankCode: string;
  bankName: string;
  accountNumberMasked: string;
  accountHolderName: string;
  businessRegistrationNumberMasked: string;
  registrationStatus: "REGISTERED";
  verificationStatus: "UNVERIFIED";
  verifiedAt: null;
};

export type SettlementAccountInput = {
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  businessRegistrationNumber: string;
};
