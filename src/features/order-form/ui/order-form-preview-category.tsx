import type { OrderFormDraftOption } from "@/features/order-form/model/order-form-draft";
import { OrderFormPreviewOption } from "@/features/order-form/ui/order-form-preview-option";

type OrderFormPreviewCategoryProps = {
  groupName: string;
  options: OrderFormDraftOption[];
  required: boolean;
  title: string;
};

export function OrderFormPreviewCategory({
  groupName,
  options,
  required,
  title,
}: OrderFormPreviewCategoryProps) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="flex items-center gap-1 text-seller-heading-lg font-bold tracking-[-0.6px]">
        {title}
        {required ? (
          <span className="relative -top-1 text-[15px] leading-5 font-semibold tracking-[-0.3px] text-text-error">
            *
          </span>
        ) : null}
      </h2>
      <div className="flex flex-col gap-6">
        {options.map((option, index) => (
          <OrderFormPreviewOption
            groupName={groupName}
            key={`${option.type}-${option.label}-${index}`}
            option={option}
          />
        ))}
      </div>
    </section>
  );
}
