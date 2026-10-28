# iPhone 16 Pro Max website captures — 2026-10-28

All website screenshots are actual app renders, not generated or composited UI. The source PNGs are preserved at `/Users/hjw/Developer/donup/output/website-16promax-20261028/`.

- Device: dedicated `DonUp Website iPhone16ProMax 20261028`, UUID `0B234C19-9CF0-4AB0-9C3D-C669CE6BFA80`, iOS 26.5, 1320 × 2868.
- App: `/Users/hjw/Developer/donup`, scheme `donup`, Debug build, simulator-only, bundle `com.ugi.donup`. Build passed with `CODE_SIGNING_ALLOWED=NO`; log `/tmp/donup-website-16pm-build.log`.
- Source data: existing `prepareDonupAppStoreScreenshotDataIfNeeded` in `donup/donupApp.swift`. `DONUP_APP_STORE_SCREENSHOTS=1` seeds public synthetic amounts, categories, entries and assets. No personal account was signed in.
- Launch flags: `DONUP_APP_STORE_SCREENSHOT_INITIAL_TAB`, `DONUP_APP_STORE_SCREENSHOT_THEME_MODE`, `DONUP_APP_STORE_SCREENSHOT_THEME_ACCENT`; `DONUP_UI_TEST_REDUCE_MOTION=1`, Korean language and locale. Status bar set to 9:41, Wi-Fi, 100% battery.
- Donworry uses existing `DONUP_PRO_MARKETING_SCREENSHOTS=1` and `DONUP_PRO_MARKETING_SCREEN=donworry` (automation capture uses `automation`), defined in `donup/DonupProMarketingScreenshots.swift`. The question and answer are synthetic sample conversation content rendered by the real app. No live AI request was made.
- Capture: `xcrun simctl io <UUID> screenshot <path>` after accessibility inspection. Encoding: `cwebp -q 88`, full resolution, no crop, no visual retouching.

## Published selection

| File under assets/screens/iphone16promax | Actual view | Theme |
|---|---|---|
| home-pink-light.webp | Home and monthly expense graph | Pink, light |
| budget-mint-light.webp | Budget donut and category usage | Mint, light |
| home-skyblue-light.webp | Home and monthly expense graph | Sky blue, light |
| statistics-skyblue-light.webp | Statistics overview and assets | Sky blue, light |
| home-pink-dark.webp | Home and monthly expense graph | Pink, dark |
| history-mint-light.webp | Transaction history, scrolled past recurring suggestions | Mint, light |
| automation-pink-dark.webp | Automation settings and Pro labels | Pink, dark |
| donworry-pink-light.webp | Donworry sample question and advice | Pink, light |

The raw compose capture was rejected because an empty input and obstructing keyboard hid the feature. History was recaptured after scrolling below repeated sample-data suggestions to actual transactions; the published file is that later capture. Existing older screenshots are retained in source history, not used for the new feature showcase.
