import { Badge } from "@/components/common/badge";

const toneByStatus = {
  pending: "warning",
  preparing: "accent",
  ready: "success",
  completed: "info",
} as const;

const labelByStatus = {
  pending: "접수 대기",
  preparing: "상품 준비 중",
  ready: "픽업 가능",
  completed: "픽업 완료",
} as const;

type PickupStatusProps = {
  status: keyof typeof labelByStatus;
};

export function PickupStatus({ status }: PickupStatusProps) {
  return <Badge tone={toneByStatus[status]}>{labelByStatus[status]}</Badge>;
}
