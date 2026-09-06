# Section 14 Common Foundation

## Source Proof

- Figma file: `wihada`
- fileKey: `wA5OisVQ2hQ6BZO5e7sTPy`
- page: `flowmap`
- pageId: `0:1`
- section: `Section 14`
- sectionId: `1915:22410`
- section bounds: `9905 x 7339`
- screenshot: `https://www.figma.com/api/mcp/asset/9f00e13f-be79-4b33-bd69-e05674d39bca.png`

Confirmed with `use_figma` by reading `figma.root.children`, selecting `page.name === "flowmap"`, then running `await figma.setCurrentPageAsync(page)`.

Do not use `flowchart`, `Wireframe`, `prototype`, or `DesignSystem` as screen implementation sources. `DesignSystem` is token reference only.

## Frame Inventory

| Area | Node ID | Direct Frame / Section Children |
| --- | --- | --- |
| `판매자 홈` | `1327:25345` | `판매자 홈` `1326:18047`, `홈/오늘픽업선택` `1326:17852`, `오늘픽업/주문확인서` `972:10590`, `오늘픽업/채팅방` `1326:18183`, `상담 대기/상담대기` `1327:25346`, `상담 대기 /주문서 작성 고객` `977:11336`, `상담 대기 /주문서 미작성 고객` `1290:16618`, `주문서 보기` `1327:24109`, `수정 요청` `1326:23493`, `수정요청` `1327:25515`, `판매자 사이드바` `1165:16037`, annotation sections `1326:23406`, `1326:23408` |
| `판매자 주문내역` | `1327:25959` | `주문내역` `1327:24031`, `필터진입` `1219:22852`, `필터 옵션선택` `1241:23091`, `필터 선택완료` `1326:19236`, `주문내역/선택` `1327:23951`, `필터직접선택` `1241:23322`, `직접선택/시작일` `1241:23571`, `직접선택/종료일` `1241:23840`, `직접선택/완료` `1241:23971`, `직접선택/확인` `1241:24159`, `직접선택 필터 선택완료` `1241:24217`, `주문내역 상세` `1327:24750` |
| `판매자 상담` | `1165:16229` | `상담/홈` `1327:25189`, `상담/나가기` `1327:25640`, `상담/채팅방` `1165:16230`, `주문서 보기` `1327:25728`, `주문확인서 작성` `1737:21854`, `주문확인서 작성` `1737:22421`, `가격기입 모달` `1737:22017`, `가격기입 완료 모달` `1737:22083`, `주문확인서 오류` `1737:22118`, `결제요청 모달` `1241:24628`, `결제요청` `1165:17110`, `결제완료` `1327:25839`, `주문내역` `1241:24468`, `주문확인서` `1241:24554` |
| `매출분석` | `1326:22880` | `매출분석/홈` `1290:15920`, `S33 결제와 매출` `1326:23041`, `할인` `1327:24915`, `취소` `1327:24988`, `취소 내역` `1327:25036` |
| `주문 캘린더` | `1327:25960` | `주문 캘린더` `1275:14217`, `주문 캘린더/홈/월 선택` `1290:15852`, `주문 캘린더/날짜 선택` `1327:24452`, `주문 캘린더/주문내역` `1327:24670`, `주문내역 상세` `1327:24821` |
| `계정설정` | `1165:16175` | `S36 계정 설정` `1165:16109` |

## Prototype Reactions

`Section 14` subtree reaction node count is `0`.

Route, overlay, and state mapping below is therefore a logical draft from frame names, modal/sheet labels, and spatial grouping. It is not confirmed prototype wiring.

## Route / State / API Draft

| Area | Route Candidate | UI State / Overlay Candidate | API Contract Candidate |
| --- | --- | --- | --- |
| `판매자 홈` | `/seller/home` or `/seller/dashboard` | default, today pickup selected, waiting inquiry states, sidebar, order form view, revision request modal/chat state | `GET /seller/dashboard`, `GET /seller/orders/calendar/today`, `GET /seller/inquiries` |
| `판매자 주문내역` | `/seller/orders`, `/seller/orders/[orderId]` | status/date filter sheet, custom date picker, selected filter, selected order, detail | `GET /seller/orders`, `GET /seller/orders/{orderId}`, `PATCH /seller/orders/{orderId}/pickup`, `POST /seller/orders/{orderId}/refund` |
| `판매자 상담` | `/seller/inquiries`, `/seller/inquiries/[inquiryId]` | chat home/list, exit/trash state, chat room, order form view, confirmation create/edit, price sheet, send confirmation modal, payment requested, payment completed | `GET /seller/inquiries`, `PATCH /seller/inquiries/{inquiryId}/read`, `PATCH /seller/inquiries/{inquiryId}/trash`, `PATCH /seller/inquiries/{inquiryId}/restore`, `GET /seller/inquiries/{inquiryId}`, `GET /seller/inquiries/{inquiryId}/events`, `GET /seller/inquiries/{inquiryId}/order-form-submissions`, `GET /seller/inquiries/{inquiryId}/confirmations/preview`, `POST /seller/inquiries/{inquiryId}/confirmations` |
| `매출분석` | `/seller/revenue` | home, payment/revenue detail, discount, cancel, cancel history | `GET /seller/dashboard/revenue?startDate=&endDate=`, `GET /seller/dashboard` |
| `주문 캘린더` | `/seller/orders/calendar` | month picker, date selected, order list for selected date, order detail | `GET /seller/orders/calendar/today`, `GET /seller/orders/calendar/week`, `GET /seller/orders/calendar/month?year=&month=&status=` |
| `계정설정` | `/seller/account` or `/seller/settings` | setting list rows | `GET /seller/store`, `GET /seller/store/settings`, `GET /seller/store/share-link`, auth/session endpoints as needed |

## Common Frontend Decisions

- New Section 14 screens should use `SellerScreenShell` from `src/features/seller-shell/ui/seller-screen-shell.tsx`.
- Mobile viewport must use actual browser width. Do not add mobile `max-w-[390px]` wrappers.
- Desktop preview may use `lg:max-w-[390px]` only.
- Do not render Figma iPhone status bar content such as `9:41`, battery, Wi-Fi, or `statusbar.svg`.
- Figma local variable collections confirmed: `Semantic` with `Mobile` and `Desktop` modes, and `Primitive` with `Value` mode.
- Figma text style names confirmed: `Display/lg`, `Display/sm`, `Heading/lg`, `Heading/md`, `Body/md`, `Body/sm`, `Label/md`, `Label/sm`, `Label/xs`, `Number/lg`, `Number/md`.
- Keep the current feature split: `features/<domain>/api`, `features/<domain>/model`, `features/<domain>/ui`.
- Keep API access through `src/lib/api/client.ts` and typed hooks through React Query.
- Mock fixtures should live inside the owning feature, for example `src/features/orders/model/order-fixtures.ts` or `src/features/inquiries/model/inquiry-fixtures.ts`, and must satisfy the real response types.
- Do not create separate mock-only UI components.
- Date strings from Java `LocalDate`, `LocalTime`, and `Instant` should remain strings in TypeScript response models and be formatted at the UI boundary.
- Image fields must follow the image contract from `agent_harnes.md`: render `deliveryUrl`, do not synthesize S3 fallback URLs.

## Ownership Boundaries

Safe for parallel tasks:

- New route files under each owned route, for example `src/app/(seller)/seller/orders/**`, `src/app/(seller)/seller/inquiries/**`, `src/app/(seller)/seller/revenue/**`, `src/app/(seller)/seller/account/**`.
- New feature folders: `src/features/dashboard/**`, `src/features/orders/**`, `src/features/inquiries/**`, `src/features/revenue/**`, `src/features/seller-account/**`.
- Feature-local fixture, API, query, mutation, model, and UI files.

Coordinate before editing:

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/lib/api/client.ts`
- `src/providers/query-provider.tsx`
- `src/components/ui/**`
- `src/features/seller-shell/**`
- Existing implemented domains: `src/features/store/**`, `src/features/order-form/**`, `src/features/notice/**`, `src/features/photo-registration/**`, `src/features/onboarding/**`, `src/features/auth/**`

High conflict risk:

- Replacing global header/nav/sidebar behavior.
- Changing existing token names or global CSS variable values.
- Changing existing API client error/auth behavior.
- Reusing `/seller` for authenticated home without resolving the current login route conflict.

## Parallel Task Split

- Home/dashboard task owns `판매자 홈` frames and dashboard summary route/state.
- Orders task owns `판매자 주문내역` frames, order filters, and order detail route/state.
- Inquiries/chat task owns `판매자 상담` frames, chat timeline, confirmation flow, and modal/sheet state.
- Revenue task owns `매출분석` frames and revenue date-range state.
- Calendar task owns `주문 캘린더` frames and calendar period/date selection state.
- Account task owns `계정설정` frame and account/settings list state.
- Shell task, if needed later, owns `src/features/seller-shell/**`, global navigation, and route conflict resolution.

## Known Current Repo State

- `package.json` scripts: `dev`, `build`, `start`, `lint`, `format`, `format:check`.
- No `typecheck` script yet; `npm run build` is the current TypeScript validation fallback.
- Existing dev server check found no listeners on ports `3000`, `3001`, or `3002`.
- Existing mobile screens frequently use `max-w-[390px]`; new Section 14 work should not copy this mobile constraint.
- `BottomSheet` currently constrains to `max-w-[390px]` at all viewports, so sheet ownership should be coordinated before Section 14 sheet-heavy tasks change it.
