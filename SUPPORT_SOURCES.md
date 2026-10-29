# Help content provenance — 2026-10-28

Editorial starting point: `/Users/hjw/Documents/Obsidian Vault/DonUp/돈워리 FAQ.md` (2026-10-15, 76-question draft) and `돈워리 질문 설계.md`. Draft statements marked for verification were not treated as established behavior. `support-content.json` is the public, reviewed subset: 31 questions in 8 categories, 6 featured on the home page. This note is excluded from deployment.

## Current app sources

Paths below are relative to `/Users/hjw/Developer/donup`.

- Account/storage/sign-in linkage/deletion/AI transfers and consent: `donup/LedgerLegalDocuments.swift`, `donup/DonupAIPrivacy.swift`, `donup/DonupAccountStore.swift`. Legal document JSON is separately exported from the actual Swift models; help is explanatory copy, not a replacement policy.
- `photo`, `automation`, `themes`, `free-pro`: `donup/DonupProFeaturePolicy.swift` and `donup/LedgerProPaywallPage.swift`. Free camera/photo input total one per day; payment SMS/Apple Pay automation and additional theme accents are Pro. Free theme accents: coral, pink, mint.
- `manual`, `sentence`, `currency`: app composer and AI privacy flow; descriptive examples require the user to review analysis results.
- `automation`, `import`, `export`, `backup-sync`, `pricing`, `purchase-restore`, `cancel`: `donup/LedgerSettingsPage.swift`, `donup/LedgerProPaywallPage.swift`. Import and basic account sync are free; JSON export/restore is Pro. Actual prices are directed to app/store rather than frozen numbers.
- Automatic local backups: `donup/DonupLedgerSnapshotStore.swift`, `donupAutomaticBackupRetentionLimit = 10`; settings explains once on days the app is opened, not continuous server backup.
- `restore-deleted`: `donup/LedgerDeletedEntryArchive.swift`, 30-day retention and 200-entry cap.
- `card-date`, `one-month`, `recurring-history`, `budget-ratio`: `donup/LedgerBudgetSettingsPage.swift`, current payment-method and recurring-date settings. Monthly-only settings distinguish current month from future months.
- `donworry`, `donworry-limit`: `donup/DonworryClient.swift`, daily free 3 / Pro 20. Donworry advice is not a guarantee of accuracy.
- `shared-ledger`, `leave-shared`: `donup/LedgerSharedWalletViews.swift`; `donup/DonupSharedWalletSnapshotProtection.swift` preserves shared state when applying a personal backup.
- `navigation`: `donup/ContentView.swift`, current home/history/budget/statistics navigation and capture controls.
- Contact email: `support@donup.app`, already public in app legal/support documents.

## Deliberately excluded

Unconfirmed release promises, exact store prices, assurances of end-to-end encryption or inaccessible server plaintext, blanket claims of zero AI retention, unsupported recovery guarantees, and draft answers still needing current behavior verification. Screenshots are public fixture data and generated illustrations are decorative; neither is evidence of security guarantees.

## 요금제 비교표 보완 (2026-10-28)

홈 `#pricing`은 다운로드 안내 장면 바로 위입니다. 5개 언어에 같은 11개 비교 항목을 제공합니다.

- 자산관리(예금·투자·부채, 순자산 추이·자산 비중·수익률): `donup/LedgerProPaywallPage.swift`의 assets 슬라이드, `ContentView.swift`의 `canAccessAssets`, `LedgerScreen.swift`의 자산 진입 가드. 개인·공유 지갑 모두 Pro 이용자만 이용할 수 있습니다. 2026-10-28 사용자 요청으로 공유 지갑 무료 예외를 제거했습니다.
- 추가 지갑: `LedgerWalletContext.swift`의 `ledgerCanAddWallet`. 무료는 기본 지갑 외 직접 만든 개인·공유 지갑 합산 1개, Pro는 생성 개수 제한 없음. 초대로 참여한 공유 지갑 수와 구분합니다.
- 고속 이미지 분석: `LedgerSettingsPage.swift`의 `usesCerebrasImageAnalysis` 바인딩과 Pro 비활성화 처리.
- 결제·이미지 자동 기록: `LedgerEntryAutomationSettingsPage`의 Pro 표시 4개(결제 문자, 카드/은행 알림, Apple Pay, 후면 탭), `DonupProFeaturePolicy`의 실행 권한 검사. 빠른 작성 단축어는 무료입니다.
- 홈 문구 편집: `LedgerSettingsPreferencePages.swift`의 고정·시간대별 편집 UI Pro 가드.
- JSON 파일 백업·복원: `LedgerSettingsPage.swift`의 `handleDonupDataImportTap`, `performDonupDataImport`, `handleDataExportTap` Pro 가드. 무료 계정 동기화·자동 백업과 별개입니다.
- 사진/촬영 합산 하루 1회: `DonupProFeaturePolicy.swift`. Pro는 제한 없음.
- 돈워리: `DonworryClient.swift`의 무료 3회/Pro 20회 일일 요청 한도.
- 테마: `DonupProFeaturePolicy.swift` 무료 3색, `LedgerProPaywallPage.swift` 프리미엄 14색.

앱 소스 경로는 `/Users/hjw/Developer/donup` 기준입니다. 서버 동작을 바꾸거나 실제 결제하지 않고 소스의 접근 제한을 대조했습니다.

- 2026-10-29: 월간·연간에 7일 무료체험 배지 추가. `Donup.storekit`의 두 `introductoryOffer`는 `free`/`P1W`, `DonupProStore.refreshSevenDayFreeTrialEligibility`는 해당 두 상품의 오퍼와 구독 그룹 자격을 확인합니다. 웹은 개인별 자격을 알 수 없으므로 최초 1회·대상자 한정·국가별 별도 동의 및 갱신 조건 안내를 함께 표시합니다. 평생 요금제에는 배지를 표시하지 않습니다. 행 강조는 CSS hover/active/focus-visible이며 감소된 동작 설정을 존중합니다.

- 2026-10-29 정정: 한국 App Store 무료체험의 유료 전환에는 별도 동의가 필요하며 미동의 시 갱신되지 않습니다. 앱 `LedgerProPaywallPage.swift`의 `pro.paywall.trial-renewal-disclosure`와 `LedgerLegalDocuments.swift` 제4조, 사이트 기존 `legal-content.json`이 이미 이 조건을 명시합니다. 요금제 안내도 5개 언어에서 같은 조건으로 맞췄습니다. 공식 근거: https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/consent-for-subscription-offer-conversions/ 및 https://developer.apple.com/news/?id=bo1b122z . 지역별 스토어 조건을 적용하므로 전 세계에 무조건 자동 전환 또는 무조건 종료라고 안내하지 않습니다.
