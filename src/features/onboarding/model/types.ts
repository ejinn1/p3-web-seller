export type SellerOnboardingStatus =
  "PENDING" | "HELD" | "APPROVED" | "REJECTED";

export type SellerOnboardingInput = {
  storeName: string;
  phoneNumber: string;
  address: string;
  detailAddress?: string | null;
  snsLink?: string | null;
};

export type SellerOnboarding = {
  id: string;
  status: SellerOnboardingStatus;
  createdAt: string;
};

export type CurrentSellerOnboarding = SellerOnboarding &
  Omit<SellerOnboardingInput, "detailAddress"> & {
    rejectionReason: string | null;
    reviewedAt: string | null;
  };

export type OnboardingLocation = {
  address: string;
  buildingName: string;
  jibunAddress: string;
  zipCode: string;
};

export type OnboardingLocationSearchResult = {
  items: {
    buildingName: string;
    roadAddress: string;
    jibunAddress: string;
    zipCode: string;
  }[];
};
