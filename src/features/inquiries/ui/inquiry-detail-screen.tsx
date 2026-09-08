"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import {
  getInquiryDetailHref,
  isInquiryDocumentState,
  parseInquiryScreenState,
} from "@/features/inquiries/model/inquiry-detail-state";
import { useSendSellerOrderConfirmationMutation } from "@/features/inquiries/model/inquiry-mutations";
import {
  applyPriceDrafts,
  buildSendOrderConfirmationRequest,
  calculateInquiryOrderPrice,
} from "@/features/inquiries/model/inquiry-order-confirmation";
import { useSellerInquiryQuery } from "@/features/inquiries/model/inquiry-queries";
import { useSellerInquiryStomp } from "@/features/inquiries/model/inquiry-stomp";
import { InquiryChatScreen } from "@/features/inquiries/ui/inquiry-chat-screen";
import { InquiryOrderDocumentScreen } from "@/features/inquiries/ui/inquiry-order-document-screen";
import { InquiryPaymentRequestModal } from "@/features/inquiries/ui/inquiry-payment-request-modal";
import { InquiryPriceSheet } from "@/features/inquiries/ui/inquiry-price-sheet";

const EMPTY_PRICE_DRAFTS: Record<string, number> = {};

export function InquiryDetailScreen({ inquiryId }: { inquiryId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inquiryQuery = useSellerInquiryQuery(inquiryId);
  const inquiry = inquiryQuery.data;
  const state = parseInquiryScreenState(searchParams.get("state"));
  const sheet = searchParams.get("sheet");
  const modal = searchParams.get("modal");
  const stomp = useSellerInquiryStomp(inquiryId, Boolean(inquiry));
  const sendConfirmationMutation =
    useSendSellerOrderConfirmationMutation(inquiryId);
  const [priceDraftState, setPriceDraftState] = useState<{
    drafts: Record<string, number>;
    inquiryId: string;
  }>({ drafts: {}, inquiryId });
  const [paymentRequestErrorState, setPaymentRequestErrorState] = useState<{
    inquiryId: string;
    message: string | null;
  }>({ inquiryId, message: null });

  const priceDrafts =
    priceDraftState.inquiryId === inquiryId
      ? priceDraftState.drafts
      : EMPTY_PRICE_DRAFTS;
  const paymentRequestError =
    paymentRequestErrorState.inquiryId === inquiryId
      ? paymentRequestErrorState.message
      : null;
  const documentOrder = useMemo(
    () => (inquiry ? applyPriceDrafts(inquiry.order, priceDrafts) : null),
    [inquiry, priceDrafts],
  );
  const priceRequiredOptions = useMemo(
    () => inquiry?.order.options.filter((option) => option.needsPrice) ?? [],
    [inquiry],
  );
  const priceCalculation = useMemo(
    () =>
      inquiry ? calculateInquiryOrderPrice(inquiry.order, priceDrafts) : null,
    [inquiry, priceDrafts],
  );
  const canRequestPayment = Boolean(
    documentOrder?.orderFormSubmissionId &&
    documentOrder.pickupAt &&
    priceCalculation &&
    priceCalculation.totalAmount > 0 &&
    priceCalculation.missingOptionIds.length === 0,
  );

  const navigate = (
    nextState: Parameters<typeof getInquiryDetailHref>[1],
    overlay?: Parameters<typeof getInquiryDetailHref>[2],
  ) => router.push(getInquiryDetailHref(inquiryId, nextState, overlay));

  if (inquiryQuery.isError) {
    return <InquiryDetailState message="상담을 불러오지 못했습니다." />;
  }

  if (inquiryQuery.isLoading || !inquiry || !documentOrder) {
    return <InquiryDetailState message="상담을 불러오는 중입니다." />;
  }

  const displayInquiry = { ...inquiry, order: documentOrder };

  const handleSendPaymentRequest = async () => {
    if (!canRequestPayment || sendConfirmationMutation.isPending) {
      return;
    }

    setPaymentRequestErrorState({ inquiryId, message: null });

    try {
      await sendConfirmationMutation.mutateAsync(
        buildSendOrderConfirmationRequest(inquiry.order, priceDrafts),
      );
      navigate("chat");
    } catch (error) {
      setPaymentRequestErrorState({
        inquiryId,
        message:
          error instanceof Error
            ? error.message
            : "결제 요청을 처리하지 못했습니다.",
      });
    }
  };

  if (isInquiryDocumentState(state)) {
    return (
      <>
        <InquiryOrderDocumentScreen
          mode={state}
          onBack={() => navigate("chat")}
          onOpenPrice={
            state === "order-form"
              ? undefined
              : () => navigate("confirmation-draft", { sheet: "price" })
          }
          onPrimary={() => {
            if (state === "order-form") {
              navigate("confirmation-draft");
              return;
            }
            navigate("confirmation-priced", { modal: "payment-request" });
          }}
          order={documentOrder}
          paymentRequestDisabled={!canRequestPayment}
          paymentRequestPending={sendConfirmationMutation.isPending}
        />
        {sheet === "price" ? (
          <InquiryPriceSheet
            onClose={() => navigate("confirmation-draft")}
            onConfirm={(nextDrafts) => {
              setPriceDraftState({ drafts: nextDrafts, inquiryId });
              setPaymentRequestErrorState({ inquiryId, message: null });
              navigate("confirmation-priced");
            }}
            options={priceRequiredOptions}
            prices={priceDrafts}
          />
        ) : null}
        {modal === "payment-request" ? (
          <InquiryPaymentRequestModal
            errorMessage={paymentRequestError}
            isPending={sendConfirmationMutation.isPending}
            onCancel={() => navigate("confirmation-priced")}
            onConfirm={handleSendPaymentRequest}
          />
        ) : null}
      </>
    );
  }

  return (
    <InquiryChatScreen
      connectionError={stomp.error?.message}
      inquiry={displayInquiry}
      isConnected={
        stomp.isConnected || !process.env.NEXT_PUBLIC_P3_API_BASE_URL
      }
      onBack={() => router.push("/seller/inquiries")}
      onOpenOrderConfirmation={() => navigate("confirmation-view")}
      onOpenOrderForm={() => navigate("order-form")}
      onOpenOrderHistory={() => navigate("order-history")}
      onSend={stomp.sendMessage}
      onWriteOrderConfirmation={() => navigate("confirmation-draft")}
    />
  );
}

function InquiryDetailState({ message }: { message: string }) {
  return (
    <SellerResponsiveFrame className="items-center justify-center bg-surface-subtle text-[16px] leading-6 tracking-[-0.32px] text-text-secondary">
      {message}
    </SellerResponsiveFrame>
  );
}
