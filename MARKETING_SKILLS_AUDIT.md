# Marketing Skills를 적용한 GEO·SEO 후속 검수

2026-10-29, https://donup.app/ 운영 반영. 최종 Cloudflare Pages 배포 `2bdc81e2`.

## 설치와 협업

- [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)의 커밋 `0cd9b3a0ef4c411a1d690419ce843f2a1da32cce`를 확인했습니다.
- `ai-seo`, `seo-audit`, `schema`, `site-architecture`, `product-marketing` 5개를 `~/.codex/skills/`에 설치했습니다. 각 스킬의 참조 문서·MIT 라이선스·원본 커밋을 보존했습니다. 다음 턴부터 자동 인식되며 이번에는 로컬 문서를 직접 읽어 적용했습니다.
- Claude(`jw/neteuweokeu-jeobgeun`) 작성분: 한국어와4개 번역 도움말JSON, 내부 제품 마케팅 초안 `.agents/product-marketing.md`. Codex가 앱·공개 App Store 정보와 대조하고 번역·구조·화면을 검수해 통합했습니다. 검토한6개파일의SHA256을 저장했고 배포 후에도 같은 상태임을 확인했습니다.
- Codex 담당: 스킬 설치, 기술 점검, 탐색 경로·관련 링크·메타데이터·구조화 데이터, 접근성, Search Console, 배포·검증.

## 공개 페이지 변경

1. 도움말에 '시작하기'를 추가했습니다. 앱 정의, iPhone/iPad 지원 조건, Android 준비 중, 지원5개언어·앱 언어 설정을 설명합니다.9개분류·34개문답이며 기존질문ID·홈의주요6개질문을 유지합니다.
2. 무료/Pro 답변에 기본 지갑 외 추가1개 제한과 자산관리·지갑 추가 제한 해제(Pro)를 명확히 썼습니다. 개인·공유 지갑의 자산관리 조건도 같은 자리에서 확인할 수 있습니다.
3. 홈 FAQ에서 해당 도움말로 바로 이동합니다. 도움말의 요금·AI정보 답변은 관련 요금표·개인정보 안내로 연결됩니다. 같은 언어의 경로로 이동합니다.
4. 도움말·개인정보 보호 페이지의 검색 제목과 도움말 설명을 실제 콘텐츠에 맞게 구체화했습니다.5개언어의 OG/Twitter·JSON-LD 제목/설명도 함께 갱신됩니다.
5. 도움말·개인정보 보호·법적 문서20개에 실제 이동 경로를 표시하고 BreadcrumbList의 이름·URL을 일치시켰습니다.
6. MobileApplication을 공식 App Store의 동일 앱으로 연결하고, 실제 지원메일·문의 페이지를 ContactPoint로 명시했습니다. 지원 인력의 언어·사업장 주소·후기·평점 등 미확인 정보는 추가하지 않았습니다.
7. 도움말 hover/직접질문링크의 작은 분홍 글자가 흐리던 문제를 기존 접근성용 강조색으로 수정했습니다.9개분류는 넓은화면에서3열로 정리되고 모바일2열은 유지합니다.

## Search Console 등록 결과

- 현재 로그인한 본인 Google 계정에 도메인 속성 `sc-domain:donup.app`을 등록했습니다.
- Cloudflare DNS에 별도 TXT를 추가해 소유권 인증에 성공했습니다. 기존 Google Workspace 인증 TXT와 MX/SPF/DKIM은 유지했습니다. 새 확인 TXT는 인증 유지에 필요하므로 삭제하지 않습니다.
- `https://donup.app/sitemap.xml` 제출 상태 **성공**, 발견된 페이지 **25개**, 동영상0개입니다. 발견25개를 색인25개로 해석하지 않습니다.
- 홈페이지는 검사 전부터 이미 색인되어 있었습니다.21:17의 이전 크롤링에는 사용자 선언 표준 URL이 `/en/`으로 남아 있었지만,22:36 Google실시간 검사에서는 현재 루트`https://donup.app/`을 읽었고 크롤링·가져오기·색인허용이 모두 정상입니다. Google이 앞으로 선택할 표준URL은 재색인 후에 확인합니다.
- 홈페이지 재수집 요청: **접수 완료**.
- 도움말의 기존 상태는 **발견됨 - 현재 색인이 생성되지 않음**이었습니다. 새 본문의 Google실시간 검사에서는 **Google에 등록할 수 있음**, 탐색 경로 **유효한 항목1개**를 확인했습니다.
- 도움말 재수집 첫 시도는 Google제출 오류였습니다. 실제 접근 검사가 성공한 뒤 재제출해 **접수 완료**를 확인했습니다. 같은 요청을 반복 제출하지 않습니다.
- 새 속성의 전체 실적·색인 보고서는 데이터 처리 중입니다. 반영 시점이나 검색순위·AI인용 증가를 보장하지 않습니다.

## 검증

- Node 테스트17/17, 빌드30페이지/5개언어, `git diff --check` 통과.
- 실제 JSON-LD의 질문/답변34개가5개언어본문과 같은 데이터인지 확인했습니다. 링크·앵커·언어·대표URL·지원연결·경로레이블도 검사합니다.
- axe-core4.14.0:5개언어×4종문서의320px20개검사 위반0/넘침0. 이어서 새도움말을5개언어×320/1280px10회, 질문을열고직접연결된강조상태로검사해 위반0/넘침0을 확인했습니다. 등장애니메이션중불투명도영향을피하도록 동작줄이기조건에서검사했습니다. 최초 한국어 해시이동은 빌드전 HTML을 유지한 탭이어서 전체문서를 다시로드한 뒤 검수했습니다.
- Schema.org 검사기에서홈·영문법적문서 그래프 코드표본 오류0/경고0. Google실시간 검사도 실제도움말 BreadcrumbList를 유효하게 인식했습니다. 이는 Google의 모든 리치결과 이용 자격이나 FAQ리치결과 노출을 뜻하지 않습니다.
- 공개정규URL25개에서canonical·메타·JSON-LD·관련링크·34개답변을 확인했습니다. 내부제품마케팅초안은 공개요청404로 배포되지 않습니다.
- [최신모바일PageSpeed](https://pagespeed.web.dev/analysis/https-donup-app/5gm6vc5yvn?form_factor=mobile): 성능90, 접근성100, SEO100, 권장사항100. LCP2.9초/TBT10ms/CLS0.009. 단일실험실실행값이며 직전91점과의1점차이를 이번변경의 인과효과로 판정하지 않습니다.
- App Store lookup 현재공개정보: 앱ID6770472441, 최소iOS26.0, iosUniversal/iPad지원, 언어5개. 앱소스의 마이페이지>앱언어 설정과 대조했습니다. App Store공개버전은1.8.12이므로 개발중1.9.0을 출시된버전으로표기하지 않았습니다.

## 증거와 후속 확인

실행기록·설치SHA·화면·JSON: `/Users/hjw/Developer/donup/output/website-marketing-skills-20261029/`.

- `installation.json`, `reviewed-content-hashes.json`, `public-facts.json`, `help-final-audit.json`
- `search-console-ownership.jpg`, `search-console-sitemap-success.jpg`
- `google-home-index-history.txt`, `google-home-live.txt`, `google-home-index-requested.jpg`
- `google-support-index-before.txt`, `google-support-live.jpg`, `google-support-index-requested.jpg`
- `support-about-public.jpg`, `pagespeed-mobile-after.txt`, `summary.json`

검색 노출/클릭·비브랜드질문·AI인용의 실제성과, 재수집 후 색인/대표URL 선택은 아직 확인되지 않았습니다. 실제iPhone Safari·VoiceOver검수는 하지 않았고, 자동검사결과는 전체접근성준수인증이 아닙니다. 커밋·푸시·유료서비스·추가추적코드·예약작업은 만들지 않았습니다.

## 근거 자료

- [설치한스킬원본](https://github.com/coreyhaines31/marketingskills/tree/0cd9b3a0ef4c411a1d690419ce843f2a1da32cce/skills): 기존페이지의 실제질문·조건·공식출처·관련링크를 보강하고, 스킬문서의 인용상승수치를 사이트성과예측으로 사용하지 않았습니다.
- [Google의AI검색가이드](https://developers.google.com/search/docs/appearance/ai-features): 사람에게유용한콘텐츠·표준검색요건을기본으로 삼습니다.
- [Google조직구조화데이터](https://developers.google.com/search/docs/appearance/structured-data/organization), [탐색경로](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb): 확인된연락처와실제탐색구조만표현합니다.

- 추가 AI접근 점검: Cloudflare AI Crawl Control의 OAI-SearchBot/ChatGPT-User/Claude-SearchBot/PerplexityBot 및 다른 크롤러 개별차단 스위치는 모두 꺼져 있음을 읽기 확인했습니다. 설정은 변경하지 않았습니다. 같은 네트워크에서 검색봇 User-Agent로 한 HTTP 표본과 실제 공급자의 IP/검색 인용 여부는 별개입니다. OpenAI 웹열기 도구는 이 URL을 가져오지 못했으므로 해당 도구의 실제검색경로 접근까지 통과했다고 주장하지 않습니다. Google실시간 가져오기는 성공했습니다.
