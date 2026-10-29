# DonUp fire-your-seo-agency 적용 기록

2026-10-29. 적용 원본: https://github.com/leopard627/fire-your-seo-agency @ 5f7249f7eff119703f2a509d0dc5e21b7b3ccc4c. 스킬은 ~/.codex/skills/fire-your-seo-agency에 설치했으며 이번 작업에서는 직접 읽어 적용했다. 근거 없는 인용 보장·검색량·순위 주장은 채택하지 않았다.

## 적용 전후

| 레인 | 전 | 이번 적용 후 |
|---|---|---|
| SEO | 정적 HTML, canonical/hreflang, 실제 404, 25개 사이트맵 정상 | 실제 편집 근거가 있는 15개 URL에 lastmod. 네이버/Bing 소유확인 메타 유지. 배포 전 자동 테스트 |
| AEO | FAQ 34개, 가져오기 답은 지원 조건과 단계 부족 | 5개 언어의 지원 파일·13MB·무료/Pro 구분·암호 처리·대체 저장 주의·5단계, 자동 기록 AI 동의/로그인/iOS 27 조건을 본문과 FAQ JSON-LD에 함께 반영 |
| GEO | 공개 본문/JSON-LD/llms.txt 있음 | 본문 조건을 라벨-값/순서 목록으로 제공. 검색 인용이 실제 발생했는지는 아직 미확인 |
| LLMO | llms.txt 기기 표기가 iPhone뿐 | 도움말·App Store 표기와 같게 iPhone/iPad, iOS/iPadOS 26 이상으로 보완. 공식 도움말 피드 경로 추가 |
| NEO | 네이버 미등록 | 사용자가 약관과 보안문자를 직접 완료한 뒤 소유확인, 사이트맵 제출. RSS 등록 상태는 아래 증빙 참조 |
| 콘텐츠 운영 | 별도 갱신 피드/백로그 없음 | 기존 FAQ를 원장으로 facts/steps/updated 관리, 5개 언어 RSS 자동 생성. content/backlog.md에 발행·갱신·측정 기준 |

- 운영 배포: f186b13e (https://donup.app/). 최초 Cloudflare 내부 배포 오류는 같은 산출물 재시도로 해소했다.
- IndexNow: 공개 키를 배포하고 25개 운영 페이지의 소스 리비전을 확인한 후 HTTP 202로 접수. 키 검증 대기이며 색인 성공을 뜻하지 않는다. 같은 빌드 재실행은 `no changed pages`로 제출 0건. 실패 시 성공 이력을 덮어쓰지 않는다.
- 운영 HTML은 Cloudflare 이메일 보호가 마크업을 바꾸므로 바이트 전체 비교는 적합하지 않았다. 빌드에서 생성한 `donup-page-revision`을 운영 HTML과 비교하도록 원인을 수정했다. Cloudflare 보호 설정은 변경하지 않았다.
- 네이버·Bing 등록은 각 계정의 수동 메타 소유확인. GSC 권한을 Bing에 추가 제공하거나 기존 DNS·메일·보안 설정을 바꾸지 않았다.
- RSS는 블로그를 가장한 글 목록이 아니라 실제 수정된 공식 도움말 2건이다. 기존 FAQ URL/앵커를 유지한다.

## 검증

- Node 테스트 21/21, git diff --check 통과. FAQ 본문/JSON-LD/RSS 일치, 날짜 유효성, IndexNow 호스트·중복·추가/변경/삭제·배포 리비전 검증 포함.
- 5개 언어 × 320/1280px에서 확장한 가져오기 FAQ 접근성 위반 0, 가로 넘침 0. axe-core 4.14.0 WCAG 2/2.1/2.2 AA 및 best-practice 범위. 모든 접근성 문제의 부재를 보장하지는 않는다.
- 운영 curl: /와 /support, 5개 언어 RSS, sitemap, llms 200. 모든 XML 파싱 통과. RSS Content-Type application/rss+xml. 미존재 경로와 내부 content/.cache 경로는 404.
- 설치·상세 증빙: /Users/hjw/Developer/donup/output/website-fire-seo-20261029/ (claude-audit.md, help-copy.json, help-audit.json, public-checks.json, indexnow-result.json 및 화면 캡처).
- 스킬의 tools/validate.py는 스킬 저장소 자체 검증용이고 사이트 SEO 검사기가 아니므로 사이트 검증으로 오인해 실행하지 않았다. 이미지 재압축은 이전 작업에서 무손실 검증을 마쳤고 이번에 이미지 변경이 없어 반복하지 않았다.

## 측정과 범위

- 2026-11-12 수동 재측정: GSC/Bing/네이버 색인 상태와 노출·클릭, 데이터 갱신일, AI 답변에서 실제 인용한 URL. 현재 신규 등록 보고서는 집계 중이므로 미집계를 0으로 보고하지 않는다.
- 2026-11-26: 첫 28일 검색어 Top 20으로 기존 FAQ 확장 또는 새 가이드 필요성을 결정한다. 대조 기간이 없는 증가율은 산출하지 않는다.
- 실제 순위·클릭·AI 인용 증가는 아직 검증되지 않았다. 색인/수집 요청 접수는 순위나 노출 보장이 아니다.
- 신규 블로그·대량 랜딩·백링크 구매·가공 후기·외부 홍보 게시·분석 추적기·정기 자동화는 추가하지 않았다. 실기기 Safari와 새 PageSpeed 재측정도 이번 범위에서 생략했다(이미지/폰트/주요 렌더링 변경 없음).
- 커밋·푸시 없음. 앱 파일과 기존 미커밋 변경을 보존했다.

## 외부 계정 최종 상태

- 네이버: donup.app 소유확인 완료, sitemap.xml 제출 목록에 2026-10-29 23:45:30 등록 확인. RSS 추가 보안문자도 사용자가 직접 완료했고 https://donup.app/feed.xml 등록(26.10.29 23:58:04)을 확인했다. 사이트맵을 다시 제출하지 않는다.
- Bing: 수동 메타 소유확인 완료. sitemap.xml 제출 후 최종 Success 및 25개 URL 발견 확인. DonUp SEO 2026-10-29 이름의 25페이지 Site Scan을 시작했고 Queued 상태. 자동 메일 알림은 선택하지 않았다.
- Bing AI Performance: Microsoft Copilots and Partners 범위의 보고서 화면에 No data available. 모든 AI의 실제 인용 수가 0이라는 뜻으로 해석하지 않는다.
- 기존 Google Search Console은 등록·사이트맵 성공·홈/도움말 재수집 요청 상태를 유지한다. 이미 접수된 URL을 반복 요청하지 않았다.
