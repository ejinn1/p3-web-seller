export type StoreStatus = "INACTIVE" | "ACTIVE" | "SUSPENDED" | "DELETED";

export type StoreInput = {
  name: string;
  profileAssetId?: string | null;
  description?: string | null;
  contact?: string | null;
  contactVisible: boolean;
  snsLinks?: string | null;
  businessHours?: string | null;
  pickupSettings?: string | null;
  address?: string | null;
};

export type Store = StoreInput & {
  id: string;
  ownerUserId: string;
  slug: string;
  cancellationRefundPolicy: string | null;
  settlementAccountStatus: string | null;
  settlementAccountRegisteredAt: string | null;
  status: StoreStatus;
  createdAt: string;
  updatedAt: string;
};

export type WeeklyPickupSetting = {
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  startTime: string;
  endTime: string;
  dailyOrderCapacity: number;
  enabled: boolean;
};

export type StoreSettingsInput = {
  leadTimeMinutes: number;
  preOrderNotice?: string | null;
  cancellationCutoffDays: number;
  weeklyPickupSettings: WeeklyPickupSetting[];
  holidays: string[];
};

export type StoreSettings = StoreSettingsInput & { storeId: string };

export type StoreShareLink = { slug: string; url: string };

export type StoreLocationSearchItem = {
  buildingName: string;
  roadAddress: string;
  jibunAddress: string;
  zipCode: string;
};

export type StoreLocationSearchResult = {
  items: StoreLocationSearchItem[];
};

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type StoreBusinessHours = {
  openDays: DayOfWeek[];
  startTime: string | null;
  endTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
};

export type StoreBusinessHoursInput = {
  openDays: DayOfWeek[];
  startTime: string;
  endTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
};

export type StoreRefundPolicyRule = {
  daysBeforePickup: number;
  refundRate: number;
};

export type StoreRefundPolicy = {
  rules: StoreRefundPolicyRule[];
};

export type StoreRefundPolicyInput = StoreRefundPolicy;

export type StoreDescriptionInput = {
  description: string;
};

export type StoreManagementStatus = {
  storeName: string;
  completedCount: number;
  totalCount: number;
  items: {
    storeInfo: boolean;
    orderForm: boolean;
    notice: boolean;
    photoRegistration: boolean;
    settlementAccount: boolean;
  };
  canActivate: boolean;
  activationBlockedReasons: string[];
};
