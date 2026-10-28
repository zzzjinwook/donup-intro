# DonUp 소개 페이지

정적 HTML·CSS·JavaScript로 만든 돈업 소개 페이지. 웹사이트는 Cloudflare Pages, 앱의 인증·데이터·AI 백엔드는 기존 Supabase를 사용합니다. 웹사이트에는 Supabase 비밀 키가 필요하지 않습니다.

운영 주소: https://donup.app/ (2026-10-28 Cloudflare Registrar 도메인 연결)

Cloudflare Pages 프로젝트 이름은 `donup`입니다. 사용자 지정 도메인 `donup.app`의 DNS CNAME은 `donup.pages.dev`를 가리키며, 배포 대상 프로젝트 이름은 변경하지 않습니다.

## 확인 및 빌드

Node.js 22 이상에서 실행합니다. 앱 런타임 의존성은 없습니다.

```sh
npm test
npm run build
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

`http://127.0.0.1:4173`에서 확인합니다. Python 서버에서는 `/support.html`처럼 확장자를 붙입니다. Pages와 같은 확장자 없는 경로는 `npx --yes wrangler@4.154.0 pages dev dist --port 4174`로 확인합니다. `dist/`에는 공개 페이지·스타일·스크립트, 앱 아이콘, `assets/screens/` 이미지와 `assets/illustrations/`의 WebP만 포함됩니다. `.git/`, `.claude/`, 캡처 원본, 출처 문서와 배포 스크립트는 업로드하지 않습니다.

## 도움말·개인정보 보호 소개·이미지

- `/support`: `support-content.json`의 31개 질문을 빌드 시 HTML에 넣습니다. 홈의 `featured` 질문도 같은 답변을 사용하므로 답변을 수정할 곳은 하나입니다. JavaScript가 없어도 질문을 열고 읽을 수 있습니다.
- `/security`: 사용자에게 데이터 저장과 AI 허용·철회를 설명하는 개인정보 보호 소개입니다. 법적 원문 `/privacy`와 역할을 구분합니다.
- `SUPPORT_SOURCES.md`: 옵시디언 초안과 현재 앱 구현 대조 근거. 배포에서 제외됩니다.
- `IMAGE_PROMPTS.md`: 개별 생성한 카테고리·개인정보 보호 일러스트 7개의 도구·프롬프트·원본 경로. 배포에서 제외됩니다.
- `CAPTURE_NOTES.md`: 실제 iPhone 16 Pro Max / iOS 26.5 캡처, 샘플 데이터와 테마, 재현 조건. 새로운 화면은 `assets/screens/iphone16promax/`의 8개 WebP입니다.

## Cloudflare Pages 배포

Cloudflare 계정으로 인증한 다음 최초 한 번 프로젝트를 생성합니다.

```sh
npx --yes wrangler@4.154.0 login --scopes account:read user:read pages:write
npx --yes wrangler@4.154.0 pages project create donup --production-branch main --force
npm run deploy
```

최초 생성의 `--force`는 Wrangler 4.154.0의 Workers 자동 전환을 피하고 Pages 프로젝트를 만들기 위한 옵션입니다. 이미 생성된 프로젝트에는 생성 명령을 다시 실행하지 않고 `npm run deploy`만 실행합니다.

미리보기 배포는 다음처럼 실행합니다.

```sh
npm run build
npx --yes wrangler@4.154.0 pages deploy dist --project-name donup --branch preview
```

실제 URL은 배포 결과에서 확인합니다. Direct Upload 방식은 GitHub 푸시 자동 배포를 켜지 않습니다. 추후 Git 연결 방식으로 전환하려면 별도 Pages 프로젝트가 필요합니다.

App Store Connect 다음 버전 초안에는 donup.app 링크를 저장했습니다. 공개 스토어 링크는 다음 버전 출시 후 반영됩니다. Supabase 인증·데이터베이스 설정은 변경하지 않았습니다.

## 개인정보 처리방침·이용약관

- 한국어: `/privacy`, `/terms`
- 영어: `/en/privacy`, `/en/terms`
- 기준 원문: iOS 앱의 `donup/LedgerLegalDocuments.swift`. `legal-content.json`은 이 Swift 모델을 실행해 추출한 사본입니다. 법적 문구를 웹에서 따로 수정하지 않습니다.
- `privacy.html`, `terms.html`은 템플릿입니다. `npm run build`가 제목·시행일·모든 조항·목차를 넣어 정적 HTML 4개를 생성합니다. JavaScript 없이 문서와 언어 전환을 이용할 수 있습니다.

앱 원문 변경 시 다음 순서로 재추출·검수·배포합니다(첫 경로는 앱 저장소 위치).

```sh
node /Users/hjw/Developer/donup/scripts/export-legal-content.mjs "$PWD/legal-content.json"
npm test
npm run deploy
```

기존 Supabase `legal/privacy`, `legal/terms`는 새 사이트로 308 이동합니다. 기존 `lang`, `locale`, `Accept-Language`에 따른 한국어/영어 선택을 유지합니다. `legal/support`는 기존 지원 안내를 유지합니다. 신규 웹 문서를 먼저 배포한 후 앱 저장소의 `legal` 함수만 배포합니다.

## 이전 주소

`donup-intro.pages.dev` 프로젝트는 `legacy-redirect/`만 배포해 모든 경로를 `donup.app`의 같은 경로로 301 이동합니다. 앱 소스와 Supabase legal 함수도 새 주소를 직접 사용합니다. 앱 소스의 변경은 다음 앱 릴리스부터 적용됩니다. 이전 주소의 이동 규칙을 다시 배포하려면 `npm run deploy:legacy-redirect`를 실행합니다.

`donup.pages.dev`는 Cloudflare 계정의 Bulk Redirect 목록 `donup_primary_domain`과 규칙 `DonUp primary domain`으로 `https://donup.app`에 301 이동합니다. 쿼리·하위 경로·경로 접미사는 보존하고, 배포별 미리보기 서브도메인은 포함하지 않습니다. 이 규칙은 DNS CNAME 대상을 바꾸지 않습니다.

## 링크 공유 미리보기

공유 이미지는 `assets/donup-share-v1.png`(1200×630)입니다. `social-card.html`은 원본 디자인으로 배포에서 제외하며, 기존 일러스트와 실제 앱 캡처를 사용합니다. 수정할 때 1200×630 영역을 캡처하고 실제 PNG 형식인지 확인합니다. `scripts/build.mjs`가 각 공개 페이지의 제목·설명·대표 주소와 공통 공유 이미지를 OG/Twitter 메타 태그로 출력합니다. 이미지 변경 시 파일명도 올려 외부 이미지 캐시를 구분하세요. 카카오 URL 메타정보 관리 도구에서 `https://donup.app/`의 캐시를 초기화한 뒤 재조회할 수 있습니다.

## 다국어 페이지

앱의 `DonupSupportedLanguage`와 같은 한국어(`ko`), 영어(`en`), 일본어(`ja`), 중국어 간체(`zh-Hans`), 중국어 번체·대만(`zh-Hant`)를 지원합니다. 한국어는 `/`, 나머지는 `/en/`, `/ja/`, `/zh-Hans/`, `/zh-Hant/` 아래에서 소개·도움말·개인정보 보호·처리방침·이용약관을 모두 읽을 수 있습니다.

- `i18n/source.json`: 한국어 템플릿·동적 UI 문구의 원문. `i18n/<언어>.json`은 동일한 키를 가진 번역입니다. 문구를 추가하면 4개 언어에도 같은 키를 추가합니다.
- `i18n/app-glossary.json`: 현재 앱 `Localizable.xcstrings`의 용어를 추출한 참고 자료. 앱의 `scripts/validate_localizations.py` 내 `EXACT_GLOSSARY`와 함께 번역 기준으로 사용합니다.
- `i18n/support-<언어>.json`: 한국어 `support-content.json`과 동일한 ID·질문·문단 구조를 갖는 도움말 번역입니다.
- `legal-content.json`: 앱에서 추출한 한국어·영어 법적 원문입니다. `i18n/legal-<언어>.json`은 영어 원문과 조항·문단 순서를 맞춘 일본어·중국어 번역이며, 해당 페이지에 번역본 안내와 영어 원문 링크를 표시합니다.
- `i18n/screenshots.json`: 언어별 실제 iPhone 캡처 경로. `I18N_CAPTURE_NOTES.md`에 출처와 재현 조건을 기록합니다. 글자가 없는 일러스트는 공통으로 사용합니다.
- `language.js`: 첫 홈 방문 시 브라우저 언어를 선택하고, 사용자가 직접 고른 언어를 우선합니다. 페이지 안의 언어 전환은 현재 질문/섹션 위치와 URL 쿼리를 유지합니다. JavaScript를 꺼도 언어 메뉴·문서·도움말은 읽을 수 있습니다.
- 빌드는 언어별 HTML, canonical/hreflang, SNS 메타데이터, 사이트맵을 생성합니다. 소스 JSON과 작업 문서는 배포하지 않습니다.

공유 이미지 원본을 다시 만들 때는 앱 화면을 준비한 뒤 `node scripts/social-previews.mjs`를 실행합니다. 저장소 루트를 제공하는 로컬 서버에서 `.local-preview/social-<언어>.html`을 1200×630으로 캡처해 `assets/donup-share-<언어>.png`에 저장하고 다시 빌드합니다. `.local-preview/`는 Git과 배포에서 제외됩니다.
