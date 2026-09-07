import Image from "next/image";
import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, disabled, ...props }, ref) => (
    <span
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center",
        disabled && "opacity-40",
        className,
      )}
    >
      <input
        className="peer absolute top-[7px] left-0 z-10 m-0 size-[18px] cursor-pointer opacity-0 disabled:cursor-not-allowed"
        disabled={disabled}
        ref={ref}
        type="radio"
        {...props}
      />
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none size-8 peer-checked:hidden peer-focus-visible:rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-700"
        height={32}
        src="/order-form/radio-unchecked.svg"
        width={32}
      />
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[7px] left-0 hidden size-[18px] peer-checked:block peer-focus-visible:rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-700"
        height={18}
        src="/order-form/radio-checked.svg"
        width={18}
      />
    </span>
  ),
);

Radio.displayName = "Radio";
