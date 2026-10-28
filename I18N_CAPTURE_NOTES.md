# 실제 앱 언어별 웹사이트 캡처 — 2026-10-28

## 진행 상태

| 앱 언어 | AppleLocale | 실제 PNG / WebP / 매핑 | 상태 |
|---|---|---:|---|
| English (`en`) | `en_US` | 8 / 8 / 8 | 완료 |
| 日本語 (`ja`) | `ja_JP` | 8 / 8 / 8 | 완료 |
| 简体中文 (`zh-Hans`) | `zh_CN` | 8 / 8 / 8 | 완료 |
| 繁體中文 (`zh-Hant`) | `zh_TW` | 8 / 8 / 8 | 완료 |

기존 한국어 8장과 새 번역 언어 4개 × 8장, 총 40장의 실제 앱 화면을 사용합니다. `i18n/screenshots.json`은 실제로 캡처하고 WebP로 인코딩한 32장만 매핑합니다. 한국어 이미지나 다른 화면을 번역본으로 복제하지 않았습니다. 영어·일본어·간체는 기존 전용 기기에서, 번체는 별도 전용 기기에서 촬영했습니다(아래 재현 기록 참고).

## 캡처 출처

- 절차 기준: 기존 `CAPTURE_NOTES.md`.
- 실행 앱: `/Users/hjw/Developer/donup/DerivedData/Build/Products/Debug-iphonesimulator/donup.app`.
- 기존 Debug Simulator 빌드 재사용. `CFBundleIdentifier=com.ugi.donup`, 표시 버전 `1.8.12`, 빌드 `202610222242`. 이번 작업에서 재빌드하지 않았다. 이 버전 문자열을 현재 소스 브랜치나 App Store 최신 버전의 증거로 사용하지 않는다.
- 앱의 5개 지원 언어는 `donup/DonupLocalization.swift`에서 확인했다. 실제 언어 선택 키는 `donup.localization.preference.v2`다.
- 실제 캡처 플래그와 seed: `donup/donupApp.swift`의 `donupInitialSelectedTabForLaunchEnvironment()` 및 `prepareDonupAppStoreScreenshotDataIfNeeded(in:)`.
- 자동화·돈워리 진입 및 대화 fixture: `donup/DonupProMarketingScreenshots.swift`의 `DonupProMarketingCaptureModifier`와 `prepareDonupProMarketingExtras(in:settings:now:)`.
- 기존 Debug 바이너리에 해당 환경변수 이름이 포함되어 있고, 각 화면이 실제 앱에서 표시되는 것을 확인했다. 소스·번역 파일은 수정하지 않았다.
- 원본 위치: `/Users/hjw/Developer/donup/output/website-i18n-20261028/{en,ja,zh-Hans}/*.png`.
- 빌드 경로·바이너리 SHA-256·소스 열람 시점의 HEAD·인코더 버전은 원본 폴더의 `capture-provenance.json`, 반복 캡처의 실행 인자와 PNG SHA-256은 `capture-log.jsonl`에 보존한다. 기존 빌드의 정확한 소스 커밋은 별도로 입증하지 않았다.

## 기기와 데이터 범위

- 영어·일본어·간체 캡처 대상: `DonUp Website iPhone16ProMax 20261028`.
- UUID: `0B234C19-9CF0-4AB0-9C3D-C669CE6BFA80`.
- 기종/런타임: iPhone 16 Pro Max / iOS 26.5.
- 원본/웹 해상도: **1320 × 2868**. 크롭·리사이즈·문구 합성·가짜 UI·이미지 생성 없이 실제 앱 화면 전체를 보존한다.
- `DONUP_APP_STORE_SCREENSHOTS=1`은 매 실행 로컬 저장소를 삭제하고 합성 샘플 거래·예산·자산을 seed한다. 이 플래그는 위 폐기용 UUID에만 전달했다. 실기기와 개인 시뮬레이터에는 적용하지 않았다.
- 개인 계정 로그인과 실거래/실시간 AI 요청은 하지 않았다. 돈워리 대화는 앱에 내장된 샘플 응답을 실제 `DonworryView`로 렌더링한 것이다.
- 상태바: 9:41 / Wi-Fi 활성·3칸 / 셀룰러 4칸 / 배터리 charged·100%. 배터리 표시는 앱이 받은 실제 시뮬레이터 상태바 출력이다.

## 화면과 실행 설정

모든 실행에 `DONUP_APP_STORE_SCREENSHOTS=1`, `DONUP_UI_TEST_REDUCE_MOTION=1`을 적용했다. 아래 열은 각각 `DONUP_APP_STORE_SCREENSHOT_INITIAL_TAB`, `DONUP_APP_STORE_SCREENSHOT_THEME_MODE`, `DONUP_APP_STORE_SCREENSHOT_THEME_ACCENT`, `DONUP_PRO_MARKETING_SCREEN` 값이다.

| basename | initial tab | theme mode | accent | marketing screen |
|---|---|---|---|---|
| `home-pink-light` | `home` | `light` | `pink` | 없음 |
| `history-mint-light` | `history` | `light` | `mint` | 없음 |
| `budget-mint-light` | `budget` | `light` | `mint` | 없음 |
| `statistics-skyblue-light` | `my` | `light` | `skyBlue` | 없음 |
| `home-pink-dark` | `home` | `dark` | `pink` | 없음 |
| `home-skyblue-light` | `home` | `light` | `skyBlue` | 없음 |
| `automation-pink-dark` | `home` | `dark` | `pink` | `automation` |
| `donworry-pink-light` | `home` | `light` | `pink` | `donworry` |

자동화·돈워리는 추가로 `DONUP_PRO_MARKETING_SCREENSHOTS=1`을 사용했다. 그 외 화면은 `DONUP_PRO_MARKETING_SCREENSHOTS=0`, 빈 `DONUP_PRO_MARKETING_SCREEN`으로 분리했다. 통계 탭의 실제 raw value는 `my`다.

실행 인자는 `-donup.localization.preference.v2 <언어> -AppleLanguages '(<언어>)' -AppleLocale <위 표의 로케일>`이다. 환경변수는 각 `simctl launch` 호출에 한정해 `SIMCTL_CHILD_` 접두어로 전달했다. 전역 simulator 환경을 변경하지 않았다.

```sh
# 이 UUID는 로컬 데이터를 지우는 screenshot fixture 전용 폐기용 기기다.
SIMCTL_CHILD_DONUP_APP_STORE_SCREENSHOTS=1 \
SIMCTL_CHILD_DONUP_UI_TEST_REDUCE_MOTION=1 \
SIMCTL_CHILD_DONUP_APP_STORE_SCREENSHOT_INITIAL_TAB=home \
SIMCTL_CHILD_DONUP_APP_STORE_SCREENSHOT_THEME_MODE=light \
SIMCTL_CHILD_DONUP_APP_STORE_SCREENSHOT_THEME_ACCENT=pink \
SIMCTL_CHILD_DONUP_PRO_MARKETING_SCREENSHOTS=0 \
SIMCTL_CHILD_DONUP_PRO_MARKETING_SCREEN='' \
xcrun simctl launch --terminate-running-process \
  0B234C19-9CF0-4AB0-9C3D-C669CE6BFA80 com.ugi.donup \
  -donup.localization.preference.v2 en -AppleLanguages '(en)' -AppleLocale en_US

xcrun simctl io 0B234C19-9CF0-4AB0-9C3D-C669CE6BFA80 screenshot \
  /Users/hjw/Developer/donup/output/website-i18n-20261028/en/home-pink-light.png

/opt/homebrew/bin/cwebp -q 88 \
  /Users/hjw/Developer/donup/output/website-i18n-20261028/en/home-pink-light.png \
  -o assets/screens/iphone16promax/en/home-pink-light.webp
```

`history-mint-light`는 기존 한국어 선정본처럼 반복 지출 제안 아래의 거래 목록 끝부분을 보여준다. 이동은 CUA로 Device Hub의 지정 기기 창을 직접 스크롤/드래그했으며 UI 테스트를 실행하지 않았다. 첫 위치는 `history-mint-light.initial.png`로 보존하고 WebP와 매핑에서는 제외했다.

## 현재 확인된 표시와 한계

- 영어·일본어·간체의 홈/예산/통계/자동화/돈워리 및 내역 대표 PNG를 `view_image`로 확인했다. 거래명과 결제수단도 해당 앱 언어로 seed된 것을 확인했다.
- 이는 선택된 실제 화면의 언어 확인이며, 앱 전체의 번역 완료나 모든 문자열의 번역 품질을 보증하지 않는다. 원본 샘플 데이터·고유명사·통화 표기를 이미지에서 고치지 않았다. KRW/ウォン 등 원화 샘플 금액은 그대로다.
- 일본어 홈의 긴 기본 지갑 이름은 앱에서 말줄임표로 표시된다. 홈 인사말이 길어 하단 카드의 노출 범위도 언어마다 달라진다.
- 영어 통계 카드의 `Expenses`가 `Expense` / `s` 두 줄로 나뉘는 실제 레이아웃을 보존했다. 영어 예산 상단은 가로 스크롤되는 탭 제목 일부가 오른쪽 화면 밖에 있다.
- 영어 최초 홈 캡처에서 금액 첫 숫자가 보이지 않은 이미지는 `en/home-pink-light.initial.png`로 보존했다. 같은 화면을 재실행해 `1,983.6K` 전체가 표시된 새 원본을 확인한 뒤 최종 `home-pink-light.png`와 WebP에 사용했다. 이미지 수정으로 보정하지 않았다.
- 내역 하단 촬영/음성 버튼의 확장·축소 상태와 카테고리 정렬은 실제 앱의 런타임 상태이며 언어별 픽셀 일치를 보장하지 않는다.
- 테스트·웹 빌드·커밋·배포는 실행하지 않았다. 통합 UI·SNS 카드 검수는 부모/병행 작업의 범위다.

## 3언어 매핑 인계

영어·일본어·간체 각 8개 WebP와 대응 매핑을 모두 저장한 뒤 `i18n/screenshots.json` 소유권을 부모 작업에 인계했다. 이 작업은 인계 후 JSON을 더 쓰지 않는다. 부모 작업이 번체를 병합하고 이 문서에 별도 출처 단락을 추가한다. 간체 내역은 최종 CUA 드래그에서 실제 거래 목록 끝까지 이동하는 데 성공했고, 그 상태를 새 PNG로 캡처했으므로 미완료 화면이나 다른 화면 대체는 없다.

파일/경로/해상도/중복/실제 WebP 디코딩 검증 결과와 최종 선택본의 SHA-256은 원본 폴더의 `capture-validation.json`에 남긴다. 최초 위치와 보류 캡처(`*.initial.png`)는 웹 매핑에 포함하지 않는다.

## 최종 검증 — 영어·일본어·간체 24장

- PNG 24장과 WebP 24장이 모두 1320 × 2868이며, 세 언어의 각 8개 매핑 경로가 실제 파일로 연결됨을 확인했다.
- WebP 전부를 `webpinfo`로 확인하고 `dwebp`로 끝까지 디코딩했다. PNG·WebP 각각 24개의 SHA-256이 모두 다르고, 어느 WebP도 기존 한국어 WebP와 해시가 같지 않다. WebP 합계는 2,308,782 bytes다.
- 대표 원본 20장을 `view_image`로 직접 확인했다. 그중 세 언어의 내역·자동화·돈워리에서는 실제 언어별 거래명/메뉴/샘플 대화를 확인했다. 대표 화면에서 남은 한국어 샘플 문구는 발견하지 않았으나 앱 전체 번역 완료를 뜻하지 않는다.
- 보조 OCR 전수 검사는 macOS Vision의 TextRecognition `e5rtError`(code 13, compute operation 생성 실패)로 두 번째 이미지 처리 중 중단됐다. OCR 전수 통과나 모든 문자열의 언어 검증을 주장하지 않는다. 캡처 파일 자체와 WebP 디코딩 검증은 통과했다.
- 원본·실행 기록은 보존했다. 캡처를 마친 뒤 위 지정 UUID의 앱만 종료하고 해당 시뮬레이터를 원래 Shutdown 상태로 돌렸다. 기기 삭제나 erase는 하지 않았다.

## Traditional Chinese (Taiwan) follow-up

- Captured by the coordinating agent on a second dedicated disposable iPhone 16 Pro Max / iOS 26.5 simulator, A12941D6-F89B-4B03-956F-FD082C33E69F. Same existing Debug simulator app and synthetic screenshot fixture as the other languages.
- Language arguments: -donup.localization.preference.v2 zh-Hant -AppleLanguages (zh-Hant) -AppleLocale zh_TW.
- All 8 PNG originals, mapping and exact launch flags are in /Users/hjw/Developer/donup/output/website-i18n-20261028/zh-Hant/. Status bar 9:41, Wi-Fi, charged100%; 1320×2868, cwebp q88.
- History was recaptured after a native Device Hub swipe past the repeated recurring suggestions, showing actual localized sample transactions. Home and history were visually checked; no text compositing or image retouching.
- Names, amounts, currency and conversation content are public synthetic fixtures. Localized UI and fixture content were rendered by the app.
