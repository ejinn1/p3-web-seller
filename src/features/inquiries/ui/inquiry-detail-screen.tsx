"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SellerResponsiveFrame } from "@/components/widgets/seller-responsive-frame";
import { useCurrentUserQuery } from "@/features/auth/model/auth-queries";
import {
  getInquiryDetailHref,
  isInquiryDocumentState,
  parseInquiryEntrySource,
  parseInquiryScreenState,
} from "@/features/inquiries/model/inquiry-detail-state";
import { useSellerInquiryListStomp } from "@/features/inquiries/model/inquiry-list-stomp";
import {
  useMarkSellerInquiryReadMutation,
  useMarkSellerOrderFormSubmissionViewedMutation,
  useRequestSellerOrderFormRevisionMutation,
  useReplaceSellerOrderConfirmationMutation,
  useSendSellerOrderConfirmationMutation,
} from "@/features/inquiries/model/inquiry-mutations";
import {
  applyPriceDrafts,
  buildSendOrderConfirmationRequest,
  calculateInquiryOrderPrice,
} from "@/features/inquiries/model/inquiry-order-confirmation";
import {
  applyOrderConfirmationPreview,
  toInquiryChatMessages,
} from "@/features/inquiries/model/inquiry-adapters";
import {
  useSellerInquiryQuery,
  useSellerInquiryTimelineQuery,
  useSellerOrderConfirmationPreviewQuery,
} from "@/features/inquiries/model/inquiry-queries";
import { useSellerInquiryStomp } from "@/features/inquiries/model/inquiry-stomp";
import type {
  InquiryChatMessage,
  InquiryTimelineItemResponse,
} from "@/features/inquiries/model/inquiry-types";
import { InquiryChatScreen } from "@/features/inquiries/ui/inquiry-chat-screen";
import { InquiryOrderDocumentScreen } from "@/features/inquiries/ui/inquiry-order-document-screen";
import { InquiryPaymentRequestModal } from "@/features/inquiries/ui/inquiry-payment-request-modal";
import { InquiryPriceSheet } from "@/features/inquiries/ui/inquiry-price-sheet";
import { getSellerBackHref } from "@/lib/navigation/seller-back-routes";

const EMPTY_PRICE_DRAFTS: Record<string, number> = {};

export function InquiryDetailScreen({ inquiryId }: { inquiryId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inquiryQuery = useSellerInquiryQuery(inquiryId);
  const timelineQuery = useSellerInquiryTimelineQuery(inquiryId);
  const inquiry = inquiryQuery.data;
  const currentUserQuery = useCurrentUserQuery(
    Boolean(process.env.NEXT_PUBLIC_P3_API_BASE_URL),
  );
  const state = parseInquiryScreenState(searchParams.get("state"));
  const source = parseInquiryEntrySource(searchParams.get("source"));
  const selectedConfirmationId = searchParams.get("confirmationId");
  const selectedSubmissionId = searchParams.get("submissionId");
  const revisionConfirmationId = searchParams.get("revisionConfirmationId");
  const sheet = searchParams.get("sheet");
  const modal = searchParams.get("modal");
  const markedReadInquiryRef = useRef<string | null>(null);
  const viewedSubmissionAttemptRef = useRef<string | null>(null);
  const stomp = useSellerInquiryStomp(inquiryId, Boolean(inquiry));
  useSellerInquiryListStomp(currentUserQuery.data?.userId, Boolean(inquiry));
  const markReadMutation = useMarkSellerInquiryReadMutation(inquiryId);
  const markSubmissionViewedMutation =
    useMarkSellerOrderFormSubmissionViewedMutation(inquiryId);
  const requestRevisionMutation =
    useRequestSellerOrderFormRevisionMutation(inquiryId);
  const sendConfirmationMutation =
    useSendSellerOrderConfirmationMutation(inquiryId);
  const replaceConfirmationMutation =
    useReplaceSellerOrderConfirmationMutation(inquiryId);
  const [priceDraftState, setPriceDraftState] = useState<{
    drafts: Record<string, number>;
    inquiryId: string;
    submissionId: string | null;
  }>({ drafts: {}, inquiryId, submissionId: null });
  const [paymentRequestErrorState, setPaymentRequestErrorState] = useState<{
    inquiryId: string;
    message: string | null;
    submissionId: string | null;
  }>({ inquiryId, message: null, submissionId: null });
  const [revisionRequestErrorState, setRevisionRequestErrorState] = useState<{
    inquiryId: string;
    message: string | null;
    submissionId: string | null;
  }>({ inquiryId, message: null, submissionId: null });
  const [pendingReplacement, setPendingReplacement] = useState<{
    confirmationId: string;
    replacementConfirmationId: string;
  } | null>(null);

  const priceDrafts =
    priceDraftState.inquiryId === inquiryId &&
    priceDraftState.submissionId === selectedSubmissionId
      ? priceDraftState.drafts
      : EMPTY_PRICE_DRAFTS;
  const paymentRequestError =
    paymentRequestErrorState.inquiryId === inquiryId &&
    paymentRequestErrorState.submissionId === selectedSubmissionId
      ? paymentRequestErrorState.message
      : null;
  const revisionRequestError =
    revisionRequestErrorState.inquiryId === inquiryId &&
    revisionRequestErrorState.submissionId === selectedSubmissionId
      ? revisionRequestErrorState.message
      : null;
  const usesSelectedSubmission = isSubmissionDocumentState(state);
  const usesConfirmationDraft =
    state === "confirmation-draft" || state === "confirmation-priced";
  const selectedSubmission =
    selectedSubmissionId && inquiry
      ? (inquiry.timelineContext.submissionsById[selectedSubmissionId] ?? null)
      : null;
  const confirmationPreviewQuery = useSellerOrderConfirmationPreviewQuery(
    inquiryId,
    selectedSubmissionId,
    usesConfirmationDraft && Boolean(selectedSubmission?.sellerViewed),
  );
  const selectedSubmissionOrder =
    selectedSubmissionId && inquiry
      ? (inquiry.ordersBySubmissionId[selectedSubmissionId] ?? null)
      : null;
  const selectedConfirmationOrder =
    selectedConfirmationId && inquiry
      ? (inquiry.confirmationsById[selectedConfirmationId] ?? null)
      : null;
  const revisionConfirmationOrder =
    revisionConfirmationId && inquiry
      ? (inquiry.confirmationsById[revisionConfirmationId] ?? null)
      : null;
  const selectedSubmissionOrderWithPreview = useMemo(
    () =>
      selectedSubmissionOrder && confirmationPreviewQuery.data
        ? applyOrderConfirmationPreview(
            selectedSubmissionOrder,
            confirmationPreviewQuery.data,
          )
        : selectedSubmissionOrder,
    [confirmationPreviewQuery.data, selectedSubmissionOrder],
  );
  const documentSourceOrder =
    state === "confirmation-view" && selectedConfirmationId
      ? selectedConfirmationOrder
      : usesSelectedSubmission
        ? selectedSubmissionOrderWithPreview
        : (inquiry?.order ?? null);
  const documentOrder = useMemo(
    () =>
      documentSourceOrder
        ? applyPriceDrafts(documentSourceOrder, priceDrafts)
        : null,
    [documentSourceOrder, priceDrafts],
  );
  const priceRequiredOptions = useMemo(
    () =>
      documentSourceOrder?.options.filter((option) => option.needsPrice) ?? [],
    [documentSourceOrder],
  );
  const priceCalculation = useMemo(
    () =>
      documentSourceOrder
        ? calculateInquiryOrderPrice(documentSourceOrder, priceDrafts)
        : null,
    [documentSourceOrder, priceDrafts],
  );
  const canRequestPayment = Boolean(
    documentOrder?.orderFormSubmissionId &&
    documentOrder.pickupAt &&
    priceCalculation &&
    priceCalculation.totalAmount > 0 &&
    priceCalculation.missingOptionIds.length === 0,
  );
  const paymentRequestPending =
    sendConfirmationMutation.isPending || replaceConfirmationMutation.isPending;
  const canEditSelectedConfirmation = Boolean(
    selectedConfirmationOrder?.orderFormSubmissionId &&
    (selectedConfirmationOrder.status === "SENT" ||
      selectedConfirmationOrder.status === "REVISION_REQUESTED"),
  );

  const navigate = (
    nextState: Parameters<typeof getInquiryDetailHref>[1],
    options?: Parameters<typeof getInquiryDetailHref>[2],
  ) => router.push(getInquiryDetailHref(inquiryId, nextState, options));

  const startOrderConfirmationDraft = (
    submissionId: string,
    revisionTargetId?: string,
  ) => {
    setPriceDraftState({ drafts: {}, inquiryId, submissionId });
    setPaymentRequestErrorState({
      inquiryId,
      message: null,
      submissionId,
    });
    setPendingReplacement(null);
    navigate("confirmation-draft", {
      revisionConfirmationId: revisionTargetId,
      submissionId,
    });
  };

  const handleDocumentBack = () => {
    if (state === "order-form" && source === "seller-home") {
      router.push("/seller/home?tab=waiting");
      return;
    }

    navigate("chat");
  };

  useEffect(() => {
    if (
      !inquiry ||
      !process.env.NEXT_PUBLIC_P3_API_BASE_URL ||
      markedReadInquiryRef.current === inquiryId
    ) {
      return;
    }

    markedReadInquiryRef.current = inquiryId;
    markReadMutation.mutate(undefined, {
      onError: () => {
        markedReadInquiryRef.current = null;
      },
    });
  }, [inquiry, inquiryId, markReadMutation]);

  useEffect(() => {
    if (state !== "order-form") {
      viewedSubmissionAttemptRef.current = null;
      return;
    }

    if (
      !selectedSubmissionId ||
      !selectedSubmission ||
      selectedSubmission.sellerViewed ||
      viewedSubmissionAttemptRef.current === selectedSubmissionId
    ) {
      return;
    }

    viewedSubmissionAttemptRef.current = selectedSubmissionId;
    markSubmissionViewedMutation.mutate(selectedSubmissionId);
  }, [
    markSubmissionViewedMutation,
    selectedSubmission,
    selectedSubmissionId,
    state,
  ]);

  if (inquiryQuery.isError || timelineQuery.isError) {
    return <InquiryDetailState message="상담을 불러오지 못했습니다." />;
  }

  if (inquiryQuery.isLoading || timelineQuery.isLoading || !inquiry) {
    return <InquiryDetailState message="상담을 불러오는 중입니다." />;
  }

  if (usesSelectedSubmission && !selectedSubmissionId) {
    return <InquiryDetailState message="선택한 주문서 정보가 없습니다." />;
  }

  if (usesSelectedSubmission && !selectedSubmissionOrder) {
    return (
      <InquiryDetailState message="선택한 주문서를 불러오지 못했습니다." />
    );
  }

  if (usesConfirmationDraft && !selectedSubmission?.sellerViewed) {
    return <InquiryDetailState message="주문서를 먼저 확인해주세요." />;
  }

  if (usesConfirmationDraft && confirmationPreviewQuery.isError) {
    return <InquiryDetailState message="주문확인서를 불러오지 못했습니다." />;
  }

  if (usesConfirmationDraft && confirmationPreviewQuery.isLoading) {
    return <InquiryDetailState message="주문확인서를 불러오는 중입니다." />;
  }

  if (
    usesConfirmationDraft &&
    revisionConfirmationId &&
    (!revisionConfirmationOrder ||
      revisionConfirmationOrder.orderFormSubmissionId !== selectedSubmissionId)
  ) {
    return (
      <InquiryDetailState message="수정할 주문확인서 정보를 정확히 연결하지 못했습니다." />
    );
  }

  if (
    state === "confirmation-view" &&
    selectedConfirmationId &&
    !selectedConfirmationOrder
  ) {
    return (
      <InquiryDetailState message="선택한 주문확인서를 불러오지 못했습니다." />
    );
  }

  if (!documentOrder || !documentSourceOrder) {
    return <InquiryDetailState message="주문 정보를 불러오지 못했습니다." />;
  }

  const timelineItems = mergeTimelineItems(
    timelineQuery.data?.pages.map((page) => page.items) ?? [],
  );
  const timelineMessages = toInquiryChatMessages(timelineItems, {
    confirmationAmountsById: inquiry.timelineContext.confirmationAmountsById,
    confirmationSubmissionIdsById:
      inquiry.timelineContext.confirmationSubmissionIdsById,
    orderAmountsById: inquiry.timelineContext.orderAmountsById,
    participantUserId: inquiry.participantUserId,
    startReferenceImageUrl: inquiry.timelineContext.startReferenceImageUrl,
    submissionsById: inquiry.timelineContext.submissionsById,
  });
  const displayInquiry = {
    ...inquiry,
    messages: mergeChatMessages(timelineMessages, inquiry.messages),
    order: documentOrder,
  };

  const handleSendPaymentRequest = async () => {
    if (!canRequestPayment || paymentRequestPending) {
      return;
    }

    setPaymentRequestErrorState({
      inquiryId,
      message: null,
      submissionId: selectedSubmissionId,
    });

    let confirmationWasSent = Boolean(
      pendingReplacement?.confirmationId === revisionConfirmationId,
    );

    try {
      let replacement =
        pendingReplacement?.confirmationId === revisionConfirmationId
          ? pendingReplacement
          : null;

      if (!replacement) {
        const sentConfirmation = await sendConfirmationMutation.mutateAsync(
          buildSendOrderConfirmationRequest(documentSourceOrder, priceDrafts),
        );
        confirmationWasSent = true;

        if (
          revisionConfirmationId &&
          revisionConfirmationOrder?.status === "REVISION_REQUESTED"
        ) {
          replacement = {
            confirmationId: revisionConfirmationId,
            replacementConfirmationId: sentConfirmation.confirmationId,
          };
          setPendingReplacement(replacement);
        }
      }

      if (replacement) {
        await replaceConfirmationMutation.mutateAsync(replacement);
        setPendingReplacement(null);
      }
      navigate("chat");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      setPaymentRequestErrorState({
        inquiryId,
        message: confirmationWasSent
          ? `새 주문확인서는 발행됐지만 기존 주문확인서 연결을 완료하지 못했습니다. 다시 시도해주세요. (${errorMessage})`
          : errorMessage,
        submissionId: selectedSubmissionId,
      });
    }
  };

  const handleRequestOrderFormRevision = async () => {
    const submissionId = documentOrder?.orderFormSubmissionId;

    if (!submissionId || requestRevisionMutation.isPending) {
      return;
    }

    setRevisionRequestErrorState({
      inquiryId,
      message: null,
      submissionId: selectedSubmissionId,
    });

    try {
      await requestRevisionMutation.mutateAsync(submissionId);
      navigate("chat");
    } catch (error) {
      setRevisionRequestErrorState({
        inquiryId,
        message:
          error instanceof Error
            ? error.message
            : "수정 요청을 처리하지 못했습니다.",
        submissionId: selectedSubmissionId,
      });
    }
  };

  if (isInquiryDocumentState(state)) {
    return (
      <>
        <InquiryOrderDocumentScreen
          mode={state}
          onBack={handleDocumentBack}
          onEdit={
            state === "confirmation-view" && canEditSelectedConfirmation
              ? () => {
                  if (
                    selectedConfirmationId &&
                    selectedConfirmationOrder?.orderFormSubmissionId
                  ) {
                    startOrderConfirmationDraft(
                      selectedConfirmationOrder.orderFormSubmissionId,
                      selectedConfirmationId,
                    );
                  }
                }
              : undefined
          }
          onOpenPrice={
            state === "order-form"
              ? undefined
              : () =>
                  navigate("confirmation-draft", {
                    revisionConfirmationId: revisionConfirmationId ?? undefined,
                    sheet: "price",
                    submissionId: selectedSubmissionId ?? undefined,
                  })
          }
          onPrimary={() => {
            if (state === "order-form") {
              if (selectedSubmissionId) {
                startOrderConfirmationDraft(selectedSubmissionId);
              }
              return;
            }
            navigate("confirmation-priced", {
              modal: "payment-request",
              revisionConfirmationId: revisionConfirmationId ?? undefined,
              submissionId: selectedSubmissionId ?? undefined,
            });
          }}
          onRevisionRequest={
            state === "confirmation-view"
              ? undefined
              : handleRequestOrderFormRevision
          }
          order={documentOrder}
          orderConfirmationWriteDisabled={
            state === "order-form" &&
            (!selectedSubmission?.sellerViewed ||
              markSubmissionViewedMutation.isPending)
          }
          paymentRequestDisabled={!canRequestPayment}
          paymentRequestPending={paymentRequestPending}
          revisionRequestDisabled={!documentOrder.orderFormSubmissionId}
          revisionRequestPending={requestRevisionMutation.isPending}
        />
        {sheet === "price" ? (
          <InquiryPriceSheet
            onClose={() =>
              navigate("confirmation-draft", {
                revisionConfirmationId: revisionConfirmationId ?? undefined,
                submissionId: selectedSubmissionId ?? undefined,
              })
            }
            onConfirm={(nextDrafts) => {
              setPriceDraftState({
                drafts: nextDrafts,
                inquiryId,
                submissionId: selectedSubmissionId,
              });
              setPaymentRequestErrorState({
                inquiryId,
                message: null,
                submissionId: selectedSubmissionId,
              });
              navigate("confirmation-priced", {
                revisionConfirmationId: revisionConfirmationId ?? undefined,
                submissionId: selectedSubmissionId ?? undefined,
              });
            }}
            options={priceRequiredOptions}
            prices={priceDrafts}
          />
        ) : null}
        {modal === "payment-request" ? (
          <InquiryPaymentRequestModal
            errorMessage={paymentRequestError}
            isPending={paymentRequestPending}
            onCancel={() =>
              navigate("confirmation-priced", {
                revisionConfirmationId: revisionConfirmationId ?? undefined,
                submissionId: selectedSubmissionId ?? undefined,
              })
            }
            onConfirm={handleSendPaymentRequest}
          />
        ) : null}
        {revisionRequestError ? (
          <p className="sr-only">수정 요청 오류: {revisionRequestError}</p>
        ) : null}
      </>
    );
  }

  return (
    <InquiryChatScreen
      connectionError={stomp.error?.message}
      inquiry={displayInquiry}
      hasOlderMessages={Boolean(timelineQuery.hasNextPage)}
      isLoadingOlderMessages={timelineQuery.isFetchingNextPage}
      isConnected={
        stomp.isConnected || !process.env.NEXT_PUBLIC_P3_API_BASE_URL
      }
      onBack={() => router.push(getSellerBackHref("inquiryDetail"))}
      onOpenOrderConfirmation={(confirmationId) =>
        navigate("confirmation-view", { confirmationId })
      }
      onOpenOrderForm={(submissionId) =>
        navigate("order-form", { submissionId })
      }
      onOpenOrderHistory={(orderId) =>
        router.push(`/seller/orders/${encodeURIComponent(orderId)}`)
      }
      onReviseOrderConfirmation={(confirmationId, submissionId) =>
        startOrderConfirmationDraft(submissionId, confirmationId)
      }
      onLoadOlderMessages={() => void timelineQuery.fetchNextPage()}
      onSend={stomp.sendMessage}
      onWriteOrderConfirmation={(submissionId) =>
        startOrderConfirmationDraft(submissionId)
      }
    />
  );
}

function mergeTimelineItems(pages: InquiryTimelineItemResponse[][]) {
  const itemsById = new Map<string, InquiryTimelineItemResponse>();

  for (const page of [...pages].reverse()) {
    for (const item of page) itemsById.set(item.eventId, item);
  }

  return [...itemsById.values()];
}

function mergeChatMessages(
  timelineMessages: InquiryChatMessage[],
  liveMessages: InquiryChatMessage[],
) {
  const messagesById = new Map(
    timelineMessages.map((message) => [message.id, message]),
  );
  for (const message of liveMessages) messagesById.set(message.id, message);
  return [...messagesById.values()];
}

function isSubmissionDocumentState(
  state: ReturnType<typeof parseInquiryScreenState>,
) {
  return (
    state === "order-form" ||
    state === "confirmation-draft" ||
    state === "confirmation-priced"
  );
}

function InquiryDetailState({ message }: { message: string }) {
  return (
    <SellerResponsiveFrame className="items-center justify-center bg-surface-subtle text-[16px] leading-6 tracking-[-0.32px] text-text-secondary">
      {message}
    </SellerResponsiveFrame>
  );
}
