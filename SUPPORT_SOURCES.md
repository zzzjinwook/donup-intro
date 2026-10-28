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
