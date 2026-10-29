# Product Marketing Context

**Document version:** v1 (초안)
**Last updated:** 2026-10-29

> 이 문서는 Claude가 앱 소스(`zzzjinwook/donup-ios`), App Store 한국 페이지, donup.app 본문을 대조해 작성한 **초안**입니다. 사용자(제품 소유자)가 확정한 포지셔닝·타깃·목표가 아닙니다. "미확인"으로 표시한 항목은 근거가 없어 비워 둔 것이며, 추측으로 채우지 마세요. 숫자·후기·순위를 지어내지 않습니다.

## Product Overview

**One-liner:** 문장·음성·사진으로 수입과 지출을 기록하고 예산·소비 통계를 보는 iPhone 가계부 앱. (사이트 홈 정의문과 동일)
**What it does:**
- 기록: 직접 입력, "점심 12,000원, 커피 4,500원" 같은 문장·음성 AI 입력, 영수증·결제 캡처 사진 AI 입력
- 자동 기록(Pro): 단축어 자동화로 결제 문자·카드/은행 알림·Apple Pay·후면 탭에서 내역 기록
- 예산·정기 지출(회차별 금액 변경 포함)·소비 통계, 돈의 흐름 상세
- 돈워리(DonWorry): 내 가계부 기록을 바탕으로 질문에 답하고 차트를 보여주는 AI 대화
- 자산관리(Pro): 예금·투자·부채, 순자산 추이·자산 비중·수익률
- 공유 가계부: 초대한 사람과 내역·예산·자산을 함께 보고 작성
- 계정 동기화·자동 백업(무료), JSON 내보내기·복원(Pro), 다른 가계부 파일 가져오기(엑셀·CSV·PDF·이미지·문서·JSON, 무료, AI 동의 필요)
**Product category:** 개인 재무 / 가계부 앱 (App Store 카테고리: 금융)
**Product type:** iOS 앱. App Store 호환성 표기: iPhone iOS 26.0+, iPad iPadOS 26.0+. Android(Google Play)는 "준비 중"으로만 표기.
**Business model:** 무료 다운로드 + 선택형 DonUp Pro. 한국 App Store 기준 월간 ₩1,900 / 연간 ₩15,000 / 평생 ₩29,900. 월간·연간은 대상자에 한해 최초 1회 7일 무료체험. 국가·지역별 가격은 다름.
**Languages:** 한국어, 영어, 일본어, 중국어 간체, 중국어 번체 (앱·웹 동일, 앱 안에서 언어 선택 가능)
**Seller:** JINWOOK HONG (App Store 판매자 표기)

## Target Audience

**Target companies:** 해당 없음(B2C)
**Decision-makers:** 개인 사용자 본인
**Primary use case:** 매일 쓴 돈을 빠르게 남기고, 이번 달 지출·예산 상태를 확인하기
**Jobs to be done:**
- 쓴 돈을 잊기 전에 한 줄(또는 말 한마디, 사진 한 장)로 남기기
- 결제할 때마다 따로 입력하지 않고 자동으로 쌓이게 하기
- 이번 달 얼마 썼고 예산이 얼마 남았는지 바로 보기
- 가족·연인과 같은 가계부를 함께 쓰기
**Use cases:** 위 기능 목록 참고
**타깃 세그먼트(연령·직업·지역 비중):** 미확인 — 사용자 확인 필요. 데이터 없이 "MZ세대", "직장인" 등으로 단정하지 말 것.

## Personas

B2C 앱이라 생략. 실제 사용자 조사 자료가 생기면 추가.

## Problems & Pain Points

**Core problem (제품 설계에서 읽히는 가설, 사용자 확인 필요):** 가계부는 입력이 번거로워 며칠 쓰다 그만두게 된다.
**Why alternatives fall short:** 미확인 — 경쟁 앱 비교 근거 없음.
**What it costs them:** 미확인
**Emotional tension:** 미확인

## Competitive Landscape

미확인 — 사용자 확인 필요. 경쟁 앱 이름·약점을 사이트나 FAQ에 쓰지 않는다(현재 방침).

## Differentiation

확인된 기능 사실만. "최초·유일·1위" 같은 비교 주장은 근거가 없으므로 쓰지 않는다.
- 입력 방식이 많다: 문장·음성·사진 AI 입력 + 결제 문자/Apple Pay 단축어 자동 기록
- 한 문장에 여러 내역을 적어도 나눠서 기록
- AI는 선택: 'AI 데이터 사용'을 허용하지 않아도 직접 입력과 일반 가계부 기능 사용 가능, 언제든 철회 가능
- 같은 앱 안에 예산·통계·자산(Pro)·공유 가계부·AI 대화(돈워리)
- 5개 언어 현지화
- 무료 범위가 넓다: 기록·예산·정기 지출·통계·계정 동기화·자동 백업·가져오기

## Objections

실제 도움말 FAQ에서 확인된 우려와 답변.

| Objection | Response (사이트·FAQ 근거) |
|-----------|----------|
| 내 금융 정보가 외부 AI로 가나? | 'AI 데이터 사용'을 허용하고 해당 기능을 쓸 때만 필요한 정보가 전달된다. Supabase(싱가포르), OpenAI·Cerebras(미국). 허용은 철회 가능. |
| AI 없이도 쓸 수 있나? | 직접 입력과 일반 가계부 기능은 AI 동의 없이 사용 가능. |
| 폰을 바꾸면 기록이 사라지나? | 같은 DonUp 계정으로 로그인하면 서버에 저장된 기록을 다시 불러온다. 계정 동기화·자동 백업은 무료. |
| 구독이 부담된다 | 기본 기능은 무료. Pro는 월간·연간·평생(1회 결제) 중 선택. |
| AI 결과가 틀리면? | AI 결과는 틀릴 수 있다고 안내하며, 저장 전 금액·날짜·통화·카테고리 확인을 권장한다. |

**Anti-persona:** 미확인. (참고 사실: Android 미지원, iOS/iPadOS 26.0 미만 기기 미지원)

## Switching Dynamics

**Push / Habit / Anxiety:** 미확인
**Pull (확인된 기능):** 다른 가계부 파일(엑셀·CSV·PDF·이미지·문서·JSON)을 미리보기로 확인 후 가져오기. 가져오기는 무료이며 AI 동의가 필요하다.

## Customer Language

**How they describe the problem / How they describe us:** 미확인 — 실제 리뷰·문의 원문이 없다. 지어내지 말 것.
**Words to use (사이트·앱에서 쓰는 표현):** 기록, 내역, 예산, 정기 지출, 통계, 자산관리, 돈워리, 공유 가계부, 'AI 데이터 사용'
**Words to avoid:** 근거 없는 "최고/1위/유일", "완벽한 보안", "자동으로 다 해준다"(단축어 설정과 AI 확인이 필요하므로)
**Glossary:**
| Term | Meaning |
|------|---------|
| 돈워리 (DonWorry) | 가계부 기록을 바탕으로 답하고 차트를 보여주는 AI 대화. 무료 하루 3회, Pro 하루 20회 |
| 지갑 | 기록을 나누는 단위. 무료는 기본 지갑 + 개인·공유 지갑 1개, Pro는 제한 없음 |
| 공유 가계부 | 초대한 참여자와 함께 쓰는 지갑 |
| AI 데이터 사용 | 외부 AI 처리를 허용하는 별도 동의 설정 |
| 내역 기록 자동화 | 마이페이지에서 설정하는 결제 문자·Apple Pay 단축어 자동화(Pro) |

번역 용어는 앱 `Localizable.xcstrings`와 `i18n/app-glossary.json`을 따른다. zh-Hant는 記錄(명사)/紀錄(동사), UI에 明細 금지.

## Brand Voice

| Attribute | Means | Doesn't mean | Example line |
|-----------|-------|--------------|--------------|
| 짧고 쉬운 해요체 | 한 문장에 한 가지 | 과한 감탄·이모지 | "말하면 기록되고, 쓴 돈이 바로 보이는 가계부" |
| 조건을 숨기지 않음 | 무료/Pro, AI 동의, 국가별 가격 차이를 같은 자리에서 밝힘 | 작은 글씨로 미루기 | "AI 입력은 'AI 데이터 사용'을 허용한 경우에 동작해요." |

**Tone by context:** Support — 해결 순서대로, 메뉴 경로 명시. 그 외(Launch/Errors/Sales/Social) 미확인.
**Never use:** 지어낸 평점·리뷰·사용자 수·순위, 확인되지 않은 기기 호환 주장(Mac·Vision Pro는 스토어가 "확인되지 않음"으로 표기)

## Proof Points

**Metrics:** 없음 (사용자 수·평점·다운로드·리텐션 데이터 미확인)
**Customers:** 없음
**Testimonials:** 없음 — 만들지 않는다
**Value themes:**
| Theme | Proof |
|-------|-------|
| 빠른 기록 | 문장·음성·사진 AI 입력, 단축어 자동 기록(기능 존재 사실) |
| 데이터 통제 | 선택형 AI 동의·철회, 처리자·이전 국가 공개(개인정보 처리방침) |
| 넓은 무료 범위 | 홈 무료/Pro 비교표 |

## Goals

**Business goal:** 미확인 — 사용자 확인 필요
**Conversion action (사이트 기준):** App Store 다운로드 버튼, 앱 안 Pro 구매
**Current metrics:** 미확인. 참고: 2026-10-29 Lighthouse 모바일 성능 91·SEO 100(실험실 값, 전환 지표 아님). 사이트에 분석 코드 없음.

## Learnings

| Date | Learning | Evidence | Applies to | Status |
|------|----------|----------|------------|--------|
| | | | | |

## Changelog

- v1 (2026-10-29) — 코드·App Store·사이트 기준 초안. 미확인 항목은 비워 둠.
