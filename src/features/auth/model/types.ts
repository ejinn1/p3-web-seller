export type UserRole = "BUYER" | "SELLER" | "OPERATOR";
export type UserStatus = "ACTIVE" | "WITHDRAWN" | "BANNED";
export type SignupProvider = "GOOGLE" | "KAKAO";

export type UserSync = {
  registered: boolean;
  registrationRequired: boolean;
  role: UserRole | null;
  status: UserStatus | null;
  nextRoute: string;
};

export type UserProfile = {
  userId: string;
  email: string;
  phoneNumber: string | null;
  signupProvider: SignupProvider | null;
  profileAssetId: string | null;
  profileImageDeliveryUrl: string | null;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  nextRoute: string;
};

export type UpdateUserProfileInput = Pick<UserProfile, "email" | "name"> & {
  profileAssetId?: string | null;
};
