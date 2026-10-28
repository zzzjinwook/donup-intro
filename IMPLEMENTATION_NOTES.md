# 소개 페이지 개편 구현 메모 (2026-10-28)

배포 전 검수와 인계를 위한 메모입니다. 배포 산출물에 포함할 필요는 없습니다.

## 상태

- 구현 완료: `index.html`, `styles.css`, `script.js` 전면 교체, `assets/screens/` 신규.
- 커밋·푸시·배포 안 함. 배포 설정 파일(`package.json`, `scripts/`, `_headers`, `404.html`, `README.md`, `.gitignore`)은 손대지 않음.
- 레퍼런스 pickle.com/ko는 화면 구성과 인터랙션만 참고. 문구·로고·이미지·캐릭터는 사용하지 않음.

## assets/screens 출처

모든 앱 화면은 공개용 샘플 데이터 캡처에서 만들었다. 실제 개인 가계부 캡처는 사용하지 않는다.

원본 폴더: `/Users/hjw/Developer/donup/output/appstore-hook-concepts-v3-real-ui-original-mockups/source-screens/`

샘플 근거: 같은 폴더 상위의 `README.md`. iPhone 17 Pro 시뮬레이터, iOS 26.5, 한국어. `DONUP_APP_STORE_SCREENSHOTS=1`이 현재 날짜 기준으로 생성하는 실제 앱 샘플데이터. `donupUITests.testAppStoreHookRealUIScreenshots()`로 재캡처 가능.

| 파일 | 원본 | 크기 |
| --- | --- | --- |
| `compose.jpg` | `light-pink/compose.png` | 720×1565, 124KB |
| `compose-dark.jpg` | `dark-pink/compose.png` | 720×1565, 128KB |
| `history.jpg` | `light-pink/history.png` | 720×1565, 120KB |
| `home.jpg` | `light-pink/home.png` | 720×1565, 108KB |
| `statistics.jpg` | `light-pink/statistics.png` | 720×1565, 112KB |
| `donworry.jpg` | `light-pink/donworry.png` | 720×1565, 88KB |
| `donup-icon-256.png` | 이 저장소 `assets/donup-app-icon.png` 축소 | 256×256, 16KB |

변환: `sips --resampleWidth 720 -s format jpeg -s formatOptions 78`. 로컬에 WebP 인코더가 없어 JPEG를 사용했다.

### 검토 후 제외한 소재

개인 데이터일 가능성이 있어 넣지 않았다.

- `output/donup-intro-20261019/assets/budget.png`, `recurring.png`: `output/recurring-tab-concepts-30-20261016/README.md`에 각각 "2026-10-16 예산 카테고리 캡처", "사용자 첨부 정기 지출 화면"으로 기록됨.
- `output/statistics-report-flat-20261027/*`: 데이터 출처 기록 없음.
- 이 저장소의 `assets/payment-message-lockscreen.png`: 실기기(SKT) 잠금화면, 실제 가맹점명 노출.

페이지가 참조하는 기존 자산은 `assets/donup-app-icon.png`(og:image, apple-touch-icon)뿐이다. 나머지 7월 자산은 참조하지 않으며 삭제하지 않았다.

## 문구의 사실 근거 (donup 저장소)

- 사진·촬영 AI 무료 하루 1회(합산): `donup/DonupProFeaturePolicy.swift` `donupFreeImageEntryDailyLimit = 1`.
- 결제 문자·Apple Pay 자동화는 Pro: 같은 파일 `canUsePaymentMessageAutomation`, `canUseApplePayAutomation`.
- Pro 항목(지갑, 자산, 돈워리 3→20회, 색상, JSON 내보내기)과 "계정 동기화와 자동 백업은 무료": `donup/LedgerProPaywallPage.swift` `paywallSlides`.
- AI는 선택·철회 가능, Supabase(싱가포르)를 거쳐 OpenAI 또는 Cerebras(미국): `donup/DonupAIPrivacy.swift`.
- Apple·Google 로그인: `donup/DonupAccountStore.swift`.
- 설정 경로 "마이페이지 > 내역 기록 자동화": `donup/LedgerSettingsPage.swift` `navigationTitle("내역 기록 자동화")`.
- iOS 26 이상: App Store lookup `minimumOsVersion=26.0`(donup-codex 확인).
- 가격 숫자는 쓰지 않음. "앱의 Pro 화면과 App Store 결제 화면에서 확인"으로 안내.

## 검증

- 1440px 전 섹션 시각 확인. 390px·320px에서 모든 스크롤 위치 `scrollWidth == clientWidth == innerWidth`.
- 기능 미리보기: 자동 넘김, 정지/재생 버튼, 직접 선택 시 자동 정지, 화살표/Home/End 키, tab `aria-controls` ↔ panel `aria-labelledby` 갱신, 비활성 화면 `aria-hidden`.
- FAQ 열고 닫기(`aria-expanded`, `hidden`), 콘솔 오류 0, 참조 이미지 누락 0, 경로는 모두 `./` 상대 경로.
- donup-codex 교차 검수: 320/390/768/1440px 가로 넘침 없음, 이미지 깨짐 0.
- Codex 최종 확인: 동작 줄이기에서 기본 정지 및 사용자의 명시적 재생 전환 통과. 비활성 화면 4개는 접근성 트리에서 제외되고 활성 화면 1개만 노출됨.
- `npm test`와 `node --check script.js`, `git diff --check` 통과. Cloudflare 로컬 실행에서 정상 문서/스타일 200, `.git/config`, `.claude/settings.json`, 없는 경로는 404 확인.
- 위 샘플 캡처 원본 README와 재캡처 테스트 존재를 Codex가 독립적으로 확인함. 공개용 이미지 7개와 앱 아이콘만 배포하며 미사용 기존 이미지와 이 메모는 제외함.

## 미확인

- 실제 iPhone Safari, 저사양 기기 성능.
- 외부 폰트: `styles.css`가 jsDelivr의 Pretendard v1.3.9 dynamic subset을 불러온다(기존 페이지도 같은 CDN 사용). 실패하면 시스템 글꼴로 대체된다.

## Cloudflare 배포 — Codex, 2026-10-28

- 사용자 승인 후 Wrangler 4.154.0을 `account:read`, `user:read`, `pages:write`, `offline_access` 범위로 연결.
- Pages 프로젝트 `donup-intro`, 운영 브랜치 `main`. 최초 생성 때 CLI의 Workers 자동 전환을 피하기 위해 `pages project create … --force` 사용. 이후 Pages 배포는 일반 `pages deploy` 사용.
- 운영 URL: https://donup-intro.pages.dev/
- 배포 URL: https://1dd2f895.donup-intro.pages.dev
- 배포 ID: `1dd2f895-8118-4a38-9537-9d175da5c80e`. 작업트리 변경분을 `--commit-dirty=true`로 표시해 직접 업로드. Git 커밋·푸시 안 함.
- 공개 HTML/CSS/JS/home 이미지의 SHA-256이 로컬 `dist`와 일치. 내부 `.git`, `.claude`, 이 인계 문서 및 없는 경로 모두 HTTP 404. 정상 콘텐츠는 200, 보안 헤더 적용 확인.
- 공개 브라우저에서 기능 탭·FAQ·390px 모바일 넘침 없음/깨진 이미지 없음 확인. Python urllib 기본 요청은 Cloudflare 1010으로 차단됐지만 일반 브라우저와 curl은 정상. 차단 설정을 변경하지 않음.
- 기존 GitHub Pages와 App Store 마케팅 URL은 변경하지 않았고, Supabase 백엔드 설정도 유지.

## 2차: 평면 조각과 법적 문서 레이아웃 — Claude, 2026-10-28

### 카테고리 조각
- 사용자 요청으로 모든 `.candy`의 광택·안쪽 그림자·바깥 입체 그림자·이모지 그림자를 제거했다. 이제 `background: hsl(var(--hue) 78% 76%)` 한 장의 평면 색이다(`styles.css`).
- 언덕 장면과 개인정보 카드 오브젝트는 요청 범위 밖이라 그대로 두었다.

### 개인정보 처리방침·이용약관
- 레퍼런스: https://pickle.com/ko/privacy-policy (흰 바탕 단일 열 712px, 제목→시행일→도입 문단→회색 목차→섹션). 앱 원문에 없는 '짧은 요약'과 표는 만들지 않았다.
- 파일: `privacy.html`, `terms.html`(빌드 토큰 템플릿, JS 없음), `legal.css`(공통 스타일). `en/` 폴더 템플릿은 토큰 방식으로 바꾸면서 삭제했다.
- 빌드 토큰(build.mjs가 치환): `{{LANG}} {{TITLE}} {{SUBTITLE}} {{CANONICAL}} {{KO_CURRENT}} {{EN_CURRENT}} {{LOCALE_PREFIX}} {{PRIVACY_LABEL}} {{TERMS_LABEL}} {{SKIP_LABEL}} {{HOME_LABEL}} {{LANGUAGE_LABEL}} {{DOCUMENTS_LABEL}}`. 자산·홈·언어 전환 링크는 `/` 기준 절대 경로(`/privacy`, `/en/privacy`).
- 본문 마커 `<!-- LEGAL_CONTENT -->`(템플릿마다 정확히 1개)를 아래 구조로 바꾼다. 모든 텍스트는 HTML 이스케이프한다.
  - `header.legal-head > h1{title} + p.legal-date{effectiveDate} + p.legal-lead{subtitle}`
  - `nav.legal-toc[aria-labelledby=legal-toc-title] > h2#legal-toc-title{목차|Contents} + ol > li > a[href=#section-N]{sections[N-1].title}`
  - `section.legal-section#section-N[aria-labelledby=section-N-title] > h2#section-N-title{title} + p{body[i]}…` (N은 1부터)
  - 조 제목에 '제N조'/'Article N.'이 있어 목차 목록 번호는 CSS로 숨긴다. 숫자를 덧붙이지 않는다.
  - 확장용 스타일만 있음: `h3`, `ul/ol`, `div.legal-table > table`.
- `index.html`의 개인정보·약관 링크 2곳씩을 `./privacy`, `./terms`(같은 탭)로 바꿨다.

### 검증(스크래치 미리보기)
- `legal-content.json`(ko·en 개인정보 14조, 약관 10조)을 위 계약대로 스크래치 폴더에 렌더해 확인했다. 저장소에는 렌더 결과를 넣지 않았다.
- 1440px: 본문 열 712px, 목차·조 제목·문단 확인. 390px 영어 개인정보: `scrollWidth == clientWidth`, 14개 섹션, `lang=en`.
- 265px처럼 아주 좁은 폭에서 브랜드·언어 버튼 글자가 끊기던 문제를 `white-space: nowrap`으로 고쳤다.
- 미확인: Codex 빌드 결과물(dist)의 실제 출력, 배포된 사이트의 법적 페이지, 실제 iPhone Safari.

## 2차 배포·내용 대조 — Codex, 2026-10-28

- `legal-content.json`: iOS `LedgerLegalDocuments.swift`를 `scripts/export-legal-content.mjs`로 실제 Swift 실행해 추출. 한국어·영어 각 개인정보 14조, 이용약관 10조 및 모든 문단/제목/시행일을 보존. 빌드 테스트가 4개 HTML의 전체 문단과 목차/언어/경로를 대조한다.
- 앱: 내장 문서는 그대로 유지, 공통 `websiteURL(for:)`와 ‘웹에서 보기’ 링크 추가. 5개 앱 언어의 URL assert, Swift 구문 검사, 기존 legal navigation 테스트 통과. 전체 앱 빌드·실기기 실행·스토어 출시는 안 함.
- Pages 배포: https://e5dacdf8.donup-intro.pages.dev (운영 https://donup-intro.pages.dev). 4개 법적 문서 경로, 메인, CSS의 공개 응답이 로컬 산출물과 일치.
- 공개 페이지 `.candy` 18개에서 gradient/shadow/emoji filter가 모두 none. 법적 문서 영어 전환·목차 이동, 320px 넘침 없음. 한국어·영어 4개 문서는 JS 없이 정적으로 제공된다.
- Supabase `legal`만 v27 ACTIVE로 배포, verify_jwt=false 유지. `privacy`/`terms`는 새 사이트 308 redirect; lang/locale/Accept-Language 선택 유지. 원래 project-ref 및 donup.supabase.co 양쪽에서 직접 확인. `support` 한국어·영어는 200 유지. 백엔드 데이터/인증 설정은 변경하지 않음.
- 테스트: 웹 빌드·전체 문단 대조, redirect 13개, 기존 앱 legal navigation, Swift 구문 검사 통과. 커밋·푸시하지 않음.

## 운영 주소 단축 — Codex, 2026-10-28

- 사용자 요청에 따라 Pages 프로젝트 `donup`을 생성하고 운영 주소를 https://donup.pages.dev/ 로 이전. 배포 https://d35b2574.donup.pages.dev.
- canonical/OG, 빌드/배포 명령, 앱의 `websiteURL(for:)`, Supabase legal 이동 목적지를 새 주소로 통일. 문서 내용 변경 없음. 웹 테스트·13개 redirect 테스트·앱 모델 추출/5언어 URL 검증 통과.
- 기존 `donup-intro` 프로젝트는 `legacy-redirect/`의 301 전용 배포로 유지(배포 aed93376). 루트·한국어/영어 약관 4개 경로의 이동을 검증.
- 새 사이트 브라우저 접속 및 문서4개/메인 HTTP200·로컬 산출물 일치 확인. 초기 로컬 DNS의 NXDOMAIN 캐시가 남아 curl 검증에는 공개 DNS(1.1.1.1) 결과를 --resolve로 지정했고 TLS 인증서 검증은 그대로 유지.
- 별도 유료 도메인 구매/연결, 앱 배포, Git 커밋·푸시는 안 함.

## 3차: 전면 재개편 — Claude, 2026-10-28

### 바뀐 파일(Claude 범위)
- `index.html`(머리말 canonical/og는 Codex 수정 유지), `styles.css`, `script.js`
- 신규 `support.html`, `security.html`, 공통 `support.css`, `support.js`
- `privacy.html`/`terms.html`/`legal.css`는 이번에 수정하지 않음(토큰 계약 유지).

### 소개 페이지
- 히어로·소개·마무리의 장식은 모두 `assets/illustrations/*.webp`(투명, 무광)로 교체. CSS 그림자·광택 없음.
- 기능 미리보기: `assets/screens/iphone16promax/` 홈·내역·예산·통계·돈워리 5화면(1320:2868). 알약마다 휴대폰 뒤 배경색이 테마색(pink/mint/sky)으로 바뀌고, 화면은 진행 방향으로 밀려 바뀐다.
- 새 '테마' 섹션: 스크롤 진행도(`--fan`)에 따라 스카이블루·핑크 다크·민트 화면 세 장이 펼쳐진다.
- 자동 기록 이미지는 `automation-pink-dark.webp`. 설정 경로 표기는 '마이페이지 > 내역 기록 자동화'(앱 탭·화면 제목 근거: LedgerBottomNavigation.swift:21, LedgerSettingsPage.swift:604).
- FAQ는 `<!-- HOME_FAQ -->`(details.faq-item) + '도움말 전체 보기' → `./support`.
- 머리글: 기능(#intro)·테마(#themes)·개인정보 보호(./security)·도움말(./support). 860px 이하에서는 도움말만 남긴다. 스크립트는 `#` 링크만 위치 추적.
- 모션: 섹션 진입 순차 등장, 히어로 축소·포인터 패럴랙스, 오브젝트 스크롤 패럴랙스, 휴대폰 진입 확대, 펼침, 마무리 오브젝트 상승, 밤 배경 전환. `prefers-reduced-motion`이면 정지·즉시 표시(테마 화면은 펼친 상태).

### 도움말(/support)
- Codex DOM(`nav.support-nav > a`, `section.support-category > header + details.support-faq`)에 맞춘 스타일. 질문은 오른쪽 열에 쌓이고 주제 머리글은 왼쪽에 고정(860px 이하 한 열).
- JS 점진 향상: 검색(질문+답 텍스트, 공백으로 나눈 모든 단어 일치, 결과 없는 주제 숨김, 질문 제목 강조, Esc/지우기), 주제 카드에 설명·질문 수 추가, `#faq-…`로 들어오면 해당 질문 열기. JS 없으면 전체 문서가 그대로 보인다.
- 주제 아이콘은 `href`별 CSS 마스크(평면 선 아이콘).

### 개인정보 보호(/security)
- pickle 개인정보 보호 페이지 구성(하위 메뉴, 선언 히어로, 원칙 4개, '누가 무엇을 처리하나요?' 카드 4장, 보관과 삭제) 사용. 문구는 앱 처리방침 조항 근거만 사용했고 각 블록 위 주석에 조항을 남겼다(제2·3·4·5·6·7·8·9·10·13조, 도움말 sharing).
- Codex 검수 반영: 공유 가계부 예외 명시, JSON 내보내기 Pro 표시, OpenAI 카드에 '켜 둔 자동 조언 카드도 자동 요청 가능' 추가. 피클의 E2EE·격리·열람 불가·학습 불가류 주장은 쓰지 않음.

### 검증(스크래치 복사본에서 Codex build.mjs로 빌드)
- 1440px: 소개 전 섹션, 도움말(카드 8·주제 8·질문 31), 개인정보 보호 시각 확인. 콘솔 오류 0.
- 320px: `/`, `/support`, `/security`, `/privacy`, `/terms`, `/en/privacy` 모든 스크롤 위치에서 scrollWidth == clientWidth. 머리글에 브랜드·도움말·다운로드(법적 문서는 언어 전환).
- 도움말 검색 '백업' → 3건, 2개 주제만 표시, 주제 카드 숨김.
- `node --check script.js support.js` 통과.
- 미확인: 실제 iPhone Safari, 배포 사이트, 동작 줄이기 실제 에뮬레이션(이번 개편 후), 저사양 기기 스크롤 성능.

### 3차 마무리 — Claude
- 기능 알약 이모지 5개 → 1.8px stroke SVG(집/목록/도넛/막대 차트/말풍선). 현재 알약 아이콘은 강조색.
- 법적 문서 머리글에 `/support`, `/security` 링크(토큰 `{{SITE_NAV_LABEL}} {{SUPPORT_LABEL}} {{SECURITY_LABEL}}`, Codex 빌드 반영). 560px 이하는 도움말만, 420px 이하는 언어 전환을 우선해 사이트 링크를 숨기고 바닥글로 넘긴다.
- 사이트·도움말·개인정보 보호 머리글: 860px 이하 도움말만, 319px 이하 도움말도 숨김(320px에서는 표시).
- 검증: 320/390/768/1440px × `/`, `/support`, `/security`, `/privacy`, `/en/terms` 가로 넘침 0, 머리글 표시 항목 확인. `node --check` 통과.

### 3차 운영 검수 및 배포 — Codex, 2026-10-28
- 운영 배포: `https://donup.pages.dev`, deployment `9479c730` (`https://9479c730.donup.pages.dev`). Git 커밋·푸시는 하지 않았음.
- 개별 생성 일러스트 7개와 iPhone 16 Pro Max/iOS 26.5 실제 Debug 앱 캡처 8개 사용. 출처는 IMAGE_PROMPTS.md/CAPTURE_NOTES.md이며 공개 산출물에서 제외. 실제 계정 데이터는 사용하지 않음.
- Obsidian 돈워리 FAQ와 현재 앱 소스를 대조해 도움말 31문항/8주제, 홈 FAQ 6개 구성. support-content.json이 공통 원문.
- 현재 앱 탭·화면 제목에 따라 자동화 경로는 ‘마이페이지 > 내역 기록 자동화’로 유지하고 도움말도 일치시킴. 법적 문서 바닥글에 도움말/개인정보 보호 링크를 추가해 모바일에서도 접근 가능.
- `npm test` 통과: 공개 파일 제한, 로컬 자산/링크, ID/앵커, FAQ 원문, 한영 법적 문서 원문/조문 수 검사. 앱에서 내보낸 법적 JSON과 사이트 원본 일치 확인.
- 로컬 브라우저 320/390/1440px에서 홈·도움말·보호 페이지 가로 넘침 없음. 키보드 탭/End, 자동 화면 전환, FAQ 검색/빈 결과/초기화/직접 링크, 동작 줄이기 기본 정지, 검정 배경 전환 확인. JS 없이 도움말 31문항 본문이 표시됨.
- 운영 홈·도움말·보호·한영 법적 문서 4개와 CSS/대표 이미지 HTTP 200 및 dist 바이트 일치. 이전 donup-intro.pages.dev/privacy는 새 도메인의 동일 경로로 301.
- 운영 브라우저에서 새 히어로, 도움말 ‘사진’ 검색 4결과, 개인정보 보호 페이지 확인; 도움말 콘솔 오류/경고 0.
- 증거 이미지: /Users/hjw/.codex/visualizations/2026/10/28/01a1803a-a89a-78d2-b01f-5ecd5f0cc846/donup-production-{home,support,security}.png
- 미확인: 실물 iPhone Safari 및 저사양 기기 성능. 앱 배포 바이너리/스토어 릴리스는 이번 작업에 포함하지 않음.

## 사용자 도메인 donup.app 연결 — 2026-10-28
- Cloudflare Registrar 등록 Active, 자동 갱신 켜짐, 만료일 2027-10-28 확인. 계정 de9594923639e93e59203811e9575bd6의 기존 Pages `donup`에 apex `donup.app` 연결. CNAME @ → donup.pages.dev 자동 생성, 최종 Active / SSL enabled 확인.
- 사이트 canonical/OG 이미지 주소, 법적 문서 빌드 canonical, 앱 LedgerLegalDocumentKind.websiteURL(for:), Supabase legal redirect 및 각 테스트를 https://donup.app으로 통일. 법적 본문 JSON은 변경 없음.
- 본 사이트 deployment55fb9682, 이전 donup-intro redirect deploymentf71afba8. Supabase는 legal 함수만 배포.
- 계정 Bulk Redirect list donup_primary_domain(0551080b9868404ba13ff778de2c1abc), rule DonUp primary domain(1d79deeabf7843aeb2efc74627f4db53) Enabled. donup.pages.dev → https://donup.app 301, preserve_query_string/subpath_matching/preserve_path_suffix=true, include_subdomains=false로 배포 미리보기 유지.
- 검증: npm test 통과, legal redirect13테스트 통과, Swift 모델 export의 5언어URL assertion 및 JSON동일성 통과. 홈/도움말/보호/한영법적4경로/CSS/대표이미지 HTTPS200. HTML은 Cloudflare 기본 이메일 난독화만 되돌려 dist동일성 확인(보호 설정 변경 없음). 실제 브라우저 홈페이지와 문의메일 정상 표시. HTTP→HTTPS, pages.dev 경로·쿼리301, donup-intro301, Supabase 원래/vanity호스트 한영308 확인.
- 앱 소스만 수정했고 새 앱 바이너리/스토어 메타데이터는 배포하지 않음. Git커밋푸시 없음. www.donup.app은 이번 연결 범위에 포함하지 않음.
- 증거: /Users/hjw/.codex/visualizations/2026/10/28/01a1803a-a89a-78d2-b01f-5ecd5f0cc846/donup-app-domain-active.png

## Contact button fix — 2026-10-28
- Replaced the external mailto-only CTA with native details#contact on /support. It shows a readable recipient, copy action with status, Gmail web compose, and an explicitly labeled default mail app option. All site inquiry links route to /support#contact.
- The original recipient/link was valid; the user's exact OS/browser handler configuration remains unknown. Browser automation blocked the mailto protocol and was not bypassed.
- Production validation exposed cached old CSS/JS mixed with new HTML. Build now appends a SHA256-based version query to each local CSS/JS reference in public HTML; the build test verifies hashes against asset bytes.
- Final deployment: d44d3689. Tests, JS syntax and diff checks passed. Normal production reload, expand/collapse, direct anchor and copy confirmation passed. Gmail opened the real compose view with the intended recipient; no message was sent. Default mail app still depends on device setup.
- Proof: /Users/hjw/.codex/visualizations/2026/10/28/01a1803a-a89a-78d2-b01f-5ecd5f0cc846/donup-contact-fixed.png

## 카카오톡 공유 미리보기 개선 — 2026-10-28
- 기존 정사각형 앱 아이콘 og:image를 1200×630 전용 카드 assets/donup-share-v1.png(약360KiB)로 교체. Claude social-card.html 디자인, Codex 렌더·검수·배포. 파스텔 히어로, DonUp 워드마크, 큰 한국어 문구, 실제16ProMax 홈/통계 캡처2장, 기존 밥/커피 일러스트 재사용. 소스HTML 배포 제외.
- CUA에서 폰트 loaded와 모든 이미지 로딩 확인 후 1200×630 clip 캡처. 브라우저 반환은 JPEG였으므로 sips로 PNG 포맷 변환. 테스트에서 PNG magic/치수/5MiB미만 검증.
- build.mjs에서 홈/도움말/보호/한영법적7페이지 OG와 Twitter summary_large_image 생성; 각 페이지의 title/description/canonical 사용. 홈 설명은 ‘말하고 찍는 가계부. 소비와 예산을 한눈에.’로 단축.
- 테스트 통과, 운영 이미지 바이트 동일 및 새 메타 확인. 최종 배포 b69de1ca(이미지 최초 e6ca11b0).
- 사용자가 카카오 개발자 로그인. 공식 URL메타정보 도구에서 기존 캐시의 아이콘을 확인한 뒤 초기화(1개 삭제)하고 새 카드로 재수집 확인. 실제 채팅 발송 없음.
