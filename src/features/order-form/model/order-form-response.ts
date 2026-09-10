import {
  orderFormCategories,
  type OrderFormCategorySlug,
} from "@/features/order-form/model/order-form-categories";
import type {
  OrderForm,
  OrderFormOption,
} from "@/features/order-form/model/order-form-api-types";
import type {
  OrderFormDraftOption,
  OrderFormDraftOptionType,
} from "@/features/order-form/model/order-form-draft";

type OrderFormDraftSnapshot = {
  optionsByCategory: Partial<
    Record<OrderFormCategorySlug, OrderFormDraftOption[]>
  >;
  templateId: string | null;
};

type OptionSettings = {
  helperText?: unknown;
  placeholder?: unknown;
};

function parseSettings(settings: string | null): OptionSettings {
  if (!settings) return {};

  try {
    const parsed: unknown = JSON.parse(settings);
    return parsed && typeof parsed === "object"
      ? (parsed as OptionSettings)
      : {};
  } catch {
    return {};
  }
}

function isDraftOptionType(
  inputType: OrderFormOption["inputType"],
): inputType is OrderFormDraftOptionType {
  return inputType !== "TEXT";
}

function toDraftOption(option: OrderFormOption): OrderFormDraftOption {
  if (!isDraftOptionType(option.inputType)) {
    throw new Error("현재 편집 화면에서 지원하지 않는 주문서 옵션이 있습니다.");
  }

  const settings = parseSettings(option.settings);

  return {
    description:
      typeof settings.helperText === "string" ? settings.helperText : "",
    example:
      typeof settings.placeholder === "string" ? settings.placeholder : "",
    label: option.label,
    price:
      option.price === null
        ? (option.priceLabel ?? "")
        : option.price.toLocaleString("ko-KR"),
    type: option.inputType,
  };
}

export function toOrderFormDraftSnapshot(
  orderForm: OrderForm | null,
): OrderFormDraftSnapshot {
  if (!orderForm) {
    return { optionsByCategory: {}, templateId: null };
  }

  const optionsByCategory: OrderFormDraftSnapshot["optionsByCategory"] = {};

  for (const category of orderFormCategories) {
    const group = orderForm.groups.find(
      (candidate) => candidate.category === category.apiCategory,
    );

    if (!group) continue;
    const optionGroup = group.optionGroups[0];
    if (
      group.optionGroups.length !== 1 ||
      optionGroup.selectionType !== "SINGLE"
    ) {
      throw new Error("현재 편집 화면에서 지원하지 않는 주문서 구성입니다.");
    }

    optionsByCategory[category.slug] = optionGroup.options
      .filter((option) => option.active)
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(toDraftOption);
  }

  return { optionsByCategory, templateId: orderForm.id };
}
