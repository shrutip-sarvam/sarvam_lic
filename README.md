# Akshar for LIC — Field-Agent Document Intelligence

> A React Native (Expo) companion to [akshar.sarvam.ai](https://akshar.sarvam.ai),
> purpose-built for LIC field agents. Capture a policyholder visit, extract the
> claim form on-device, review, and submit — in under a minute.
>
> Deployed to the web at **[sarvam-lic.vercel.app](https://sarvam-lic.vercel.app)**.

---

## What it does

Akshar for LIC is the mobile twin of the Akshar web dashboard. A field agent
arrives at a policyholder's home, scans a claim form with the camera (or picks
an existing PDF / image), reviews the auto-extracted data, and submits the
visit — which then shows up in the Recent list back on the home screen.

The full user journey:

1. **Landing** — branded Akshar hero with gradient, mandala logo, and
   `Continue` CTA.
2. **Home** — Tatva-style dashboard with an `Upload document` card and a
   `Recent` list of past visits.
3. **Upload dialog** — pick Camera, Photo Library, or File, plus a
   `Document Language` picker (23 Indic languages).
4. **Capture** — multi-page camera with a `Done` CTA that groups every shot
   into a single upload.
5. **Scan** — Sarvam Vision runs over each page and returns structured text.
6. **LIC Claim Form** — real claim fields (claimant, policy, claim type, bank)
   pre-filled from extraction, fully editable.
7. **Submit** — the visit lands on the home dashboard in the Recent section.

## Quick start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Start the Expo dev server
npx expo start

# Then either:
#   • scan the QR in Expo Go (Android / iOS), or
npm run android     # Android emulator
npm run ios         # iOS simulator (macOS only)
npm run web         # Browser

# Ship a static web build (what Vercel runs):
npm run build:web
```

The demo build ships **without API keys** and uses a deterministic mock for
Vision extraction so the full flow works end-to-end offline. To run against a
real backend, edit `SARVAM_BASE_URL` and add auth in `services/sarvam.api.ts`
and `services/vision.api.ts` (recommended: route through a server-side proxy
rather than embedding secrets in the client bundle).

## Design system — ported from the Akshar frontend

Every token, typography variant, and layout pattern is sourced directly from
[`akshar-frontend/src/app/dashboard/page.tsx`](https://github.com/sarvamai/akshar-frontend)
and the Tatva design system.

### Fonts

- **Geist Sans** (400 / 500 / 600 / 700) — loaded via
  `@expo-google-fonts/geist` in `app/_layout.tsx`, exactly matching
  Akshar's `--font-geist-sans` default from `next/font/google`.
- Applied globally via `Text.defaultProps` so every `<Text>` inherits Geist
  without per-component wiring.

### Typography (Tatva Text variants)

| Variant | Size / Weight / Tracking | Used for |
|---|---|---|
| `heading-lg` | 24 / 700 / -0.6 | Empty-state title, HowItWorks hero |
| `heading-md` | 20 / 700 / -0.4 | `Welcome back, {Agent}!` |
| `heading-sm` | 16 / 600 / -0.2 | `Recent` section, header title, card headings |
| `body-md` | 14 / 400 | Secondary text, descriptions |
| `body-sm` | 13 / 400 | Card descriptions, meta text |

### Colors

Primary orange `#CB5534`, foreground `#262626`, over `#FFFFFF` — identical to
`akshar-frontend/src/app/globals.css`. See `components/ui/tokens.ts` for the
full ramp (orange, neutral, blue, green, red, amber, dark).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo 54 (Expo Router) |
| Language | TypeScript (strict mode) |
| Fonts | `@expo-google-fonts/geist` (Geist Sans) |
| Styling | StyleSheet with Tatva-aligned design tokens |
| State | Zustand + AsyncStorage persistence |
| Data fetching | TanStack React Query v5 |
| Camera | `expo-camera`, `expo-image-picker`, `expo-document-picker` |
| Image ops | `expo-image-manipulator`, `expo-file-system` |
| Animations | React Native Reanimated v3 |
| Gestures | `react-native-gesture-handler` |
| Lists | `@shopify/flash-list` |
| Bottom sheets | `@gorhom/bottom-sheet` |
| Vector art | `react-native-svg` (Akshar mandala, chevrons, icons) |
| Haptics | `expo-haptics` |
| Web host | Vercel (static export via `expo export --platform web`) |

## Project structure

```
SarvamApp/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root stack + font loader + error boundary
│   ├── index.tsx               # Landing: Akshar hero with gradient + Continue
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tabs container
│   │   └── index.tsx           # Home — 1:1 port of akshar dashboard/page.tsx
│   ├── auth/                   # Sign-in → OTP → Name flow
│   └── job/
│       ├── upload.tsx          # Upload dialog + language picker
│       ├── camera.tsx          # Multi-page capture with Done CTA
│       ├── scan.tsx            # Vision extraction + mock pipeline
│       └── form.tsx            # LIC Claim Form (claimant/policy/claim/bank)
├── assets/
│   ├── akshar-logo.ts          # Mandala SVG as string for react-native-svg
│   ├── akshar-logo.svg         # Reference copy from akshar-frontend/public
│   └── akshar-upload.svg       # Upload illustration from akshar-frontend/public
├── components/
│   ├── ui/
│   │   ├── tokens.ts           # Colors, spacing, radius, font, typography
│   │   └── Icon.tsx            # SVG-based icons (upload, camera, chevrons, …)
│   ├── camera/                 # CameraCapture, CaptureControls, EdgeDetector
│   ├── document/               # BlockCard, ExtractedBlocks, SourceViewer
│   ├── upload/                 # UploadDropzone, UploadProgress, UploadMenu
│   ├── chat/                   # Chat-style correction interface
│   └── shared/                 # LanguageChip, ScriptBadge, FormatSelector
├── hooks/                      # useSarvamVision, useCameraPermissions, useDocumentProcessor
├── services/
│   ├── sarvam.api.ts           # Sarvam API client (no-secrets demo build)
│   ├── vision.api.ts           # Vision endpoint wrapper
│   ├── image.processor.ts      # Resize, compress, base64 helpers
│   ├── export.service.ts       # HTML / JSON / Markdown export
│   └── storage.service.ts      # AsyncStorage wrapper
├── store/
│   ├── jobs.store.ts           # Visits, draft photos, draft language
│   ├── documents.store.ts      # Extracted document cache
│   └── settings.store.ts       # User preferences
├── constants/
│   ├── languages.ts            # 23 Indic languages with native scripts
│   └── theme.ts                # Legacy theme helpers
└── utils/                      # haptics, misc
```

## Supported languages

23 Indian languages — Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati,
Kannada, Malayalam, Assamese, Urdu, Sanskrit, Nepali, Dogri, Bodo, Punjabi,
Odia, Konkani, Maithili, Sindhi, Kashmiri, Manipuri, Santali, English.

RTL languages (Urdu, Kashmiri, Sindhi) are handled automatically. The
Document Language picker in the upload dialog writes to `draftLanguage` in
`store/jobs.store.ts` and is passed through to the Vision call.

## Web deployment (Vercel)

The repo is wired for static export:

```bash
npm run build:web    # writes dist/ via expo export --platform web
```

`vercel.json` points Vercel at `dist/` as the output directory. Every push to
`master` triggers a redeploy of [sarvam-lic.vercel.app](https://sarvam-lic.vercel.app).

Platform-specific guards (`Platform.OS !== 'web'`) wrap
`react-native-get-random-values` and `expo-haptics` so the same codebase runs
cleanly on native, simulator, and the web build.

## Key features

- **Multi-page visit capture** — take N photos, tap `Done`, they ride as one upload
- **On-device preview** — the agent can review every page before extracting
- **Structured LIC Claim Form** — real policy / claimant / bank fields, not a demo
- **Tatva-accurate UI** — typography, spacing, and color taken from the Akshar web app
- **Geist Sans** everywhere — identical to the Akshar dashboard on the web
- **Offline-first** — visits persist via AsyncStorage until the agent submits
- **Decorative Indic-script strip** at the bottom of the dashboard, mirroring
  `/indic-bg.png` on the web

## Repo map

- **App repo**: [github.com/shrutip-sarvam/sarvam_lic](https://github.com/shrutip-sarvam/sarvam_lic)
- **Web deployment**: [sarvam-lic.vercel.app](https://sarvam-lic.vercel.app)
- **Reference frontend**: [github.com/sarvamai/akshar-frontend](https://github.com/sarvamai/akshar-frontend)

---

*Powered by Sarvam Vision · [akshar.sarvam.ai](https://akshar.sarvam.ai)*
