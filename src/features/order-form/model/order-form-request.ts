import {
  orderFormCategories,
  type OrderFormCategory,
  type OrderFormCategorySlug,
} from "@/features/order-form/model/order-form-categories";
import type {
  CreateOrderFormInput,
  OrderFormOptionInput,
} from "@/features/order-form/model/order-form-api-types";
import type { OrderFormDraftOption } from "@/features/order-form/model/order-form-draft";

type OptionsByCategory = Partial<
  Record<OrderFormCategorySlug, OrderFormDraftOption[]>
>;

function serializeSettings(option: OrderFormDraftOption) {
  const settings: Record<string, number | string> = {};

  if (option.description) {
    settings.helperText = option.description;
  }

  if (option.type === "SELECT_WITH_TEXT") {
    if (option.example) settings.placeholder = option.example;
  }

  if (option.type === "TEXTAREA") {
    if (option.example) settings.placeholder = option.example;
    settings.maxLength = 500;
  }

  return Object.keys(settings).length > 0 ? JSON.stringify(settings) : null;
}

function splitPrice(option: OrderFormDraftOption) {
  if (option.type === "TEXTAREA") {
    return { price: null, priceLabel: null };
  }

  const trimmedPrice = option.price.trim();
  const normalizedPrice = trimmedPrice.replace(/,/g, "");

  if (/^-?\d+$/.test(normalizedPrice)) {
    return { price: Number(normalizedPrice), priceLabel: null };
  }

  return { price: null, priceLabel: trimmedPrice };
}

function toOptionInput(
  category: OrderFormCategory,
  option: OrderFormDraftOption,
  index: number,
): OrderFormOptionInput {
  return {
    active: true,
    inputType: option.type,
    label: option.label || category.label,
    ...splitPrice(option),
    settings: serializeSettings(option),
    sortOrder: index,
    value: `${category.slug}-${index + 1}`,
  };
}

export function hasEveryOrderFormCategory(
  optionsByCategory: OptionsByCategory,
) {
  return orderFormCategories.every(
    (category) => (optionsByCategory[category.slug]?.length ?? 0) > 0,
  );
}

export function buildCreateOrderFormInput(
  storeName: string,
  optionsByCategory: OptionsByCategory,
): CreateOrderFormInput {
  return {
    name: `${storeName} 주문서`.slice(0, 100),
    groups: orderFormCategories.map((category, categoryIndex) => ({
      category: category.apiCategory,
      description: null,
      optionGroups: [
        {
          label: category.label,
          options: (optionsByCategory[category.slug] ?? []).map(
            (option, optionIndex) =>
              toOptionInput(category, option, optionIndex),
          ),
          required: category.required,
          selectionType: "SINGLE",
          sortOrder: 0,
        },
      ],
      sortOrder: categoryIndex,
      title: category.apiTitle,
    })),
  };
}
