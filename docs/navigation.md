# Navigation

## Back Navigation Policy

판매자 웹의 상단 뒤로가기는 브라우저 히스토리의 이전 항목이 아니라 앱 안에서의 논리적 상위 목적지로 이동한다.

기본 원칙:

- 메뉴에서 진입하는 최상위 업무 화면은 판매자 홈(`/seller/home`)으로 돌아간다.
- 목록에서 진입하는 상세 화면은 해당 목록으로 돌아간다.
- 스토어 관리 하위 설정 화면은 스토어 관리(`/seller/store-management`)로 돌아간다.
- 작성/미리보기/카테고리 편집 화면은 해당 도메인의 홈 화면으로 돌아간다.
- 캘린더 안의 날짜 목록과 상세처럼 같은 route의 query state로 표현되는 화면은 이전 UI state로 돌아간다.
- 브라우저 히스토리 back은 사용하지 않고, 명시적인 `backHref` 또는 state 전환 callback을 사용한다.

현재 코드 기준 route mapping은 `src/lib/navigation/seller-back-routes.ts`에서 관리한다.

| 화면 | 기본 뒤로가기 |
| --- | --- |
| `/seller/inquiries` | `/seller/home` |
| `/seller/inquiries/[inquiryId]` | `/seller/inquiries` |
| `/seller/orders` | `/seller/home` |
| `/seller/orders/[orderId]` | `/seller/orders` |
| `/seller/orders/calendar` | `/seller/home` |
| `/seller/orders/calendar?view=list` | `/seller/orders/calendar` |
| `/seller/orders/calendar?view=detail` | `/seller/orders/calendar?view=list` |
| `/seller/revenue` | `/seller/home` |
| `/seller/revenue?view=*` | `/seller/revenue` |
| `/seller/store-management` | `/seller/home`, 초기 설정 미완료 시 `/auth/role` |
| `/seller/store-information` | `/seller/store-management` |
| `/seller/order-form` | `/seller/store-management` |
| `/seller/order-form/[category]` | `/seller/order-form` |
| `/seller/order-form/preview` | `/seller/order-form` |
| `/seller/notice` | `/seller/store-management` |
| `/seller/notice/[category]` | `/seller/notice` |
| `/seller/notice/preview` | `/seller/notice` |
| `/seller/photo-registration/representative` | `/seller/store-management` |
| `/seller/photo-registration/gallery` | `/seller/photo-registration/representative` |
| `/seller/account-settings` | `/seller/home` |
| `/onboarding`, `/onboarding/pending`, `/onboarding/rejected` | `/seller` |
