import { noticeCategories } from "@/features/notice/model/notice-categories";
import type {
  NoticeCollection,
  UpdateNoticesInput,
} from "@/features/notice/model/notice-api-types";
import {
  createNoticeDraftItem,
  type NoticeDraftState,
} from "@/features/notice/model/notice-draft";

export function toNoticeDraftSnapshot(
  notices: NoticeCollection,
): NoticeDraftState["itemsByType"] {
  const itemsByType: NoticeDraftState["itemsByType"] = {};

  for (const category of noticeCategories) {
    const notice = notices.notices.find(
      (candidate) => candidate.type === category.type,
    );
    itemsByType[category.type] = (notice?.items ?? [])
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((item) => item.content)
      .filter((content) => content.trim())
      .map(createNoticeDraftItem);
  }

  return itemsByType;
}

export function toUpdateNoticesInput(
  itemsByType: NoticeDraftState["itemsByType"],
): UpdateNoticesInput {
  return {
    notices: noticeCategories.map((category) => ({
      items: (itemsByType[category.type] ?? [])
        .map((item) => item.content.trim())
        .filter(Boolean)
        .map((content) => ({ content })),
      type: category.type,
    })),
  };
}
