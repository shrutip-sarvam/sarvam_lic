# Akshar for LIC

React Native (Expo) companion to [akshar.sarvam.ai](https://akshar.sarvam.ai) for LIC field agents. Capture a policyholder visit, group the pages, and log it.

Live web build: **[sarvam-lic.vercel.app](https://sarvam-lic.vercel.app)**.

## Flow

1. Landing (Akshar hero + Continue)
2. Home (Upload card + Recent list)
3. Upload dialog (Camera / Photos / File + Title + Language)
4. Camera (multi-page capture, Done)
5. Submit (name the visit, Upload)
6. Visit appears at the top of Recent

## Quick start

```bash
npm install --legacy-peer-deps
npx expo start          # dev server, scan QR in Expo Go
npm run web             # browser preview
npm run build:web       # static export to dist/ (what Vercel serves)
```

Demo build ships without secrets. Vision extraction is mocked deterministically so the flow works end-to-end offline. To hit a real backend, edit `SARVAM_BASE_URL` in `services/sarvam.api.ts` and proxy auth server-side.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81, Expo 54, Expo Router |
| Language | TypeScript (strict) |
| State | Zustand + AsyncStorage |
| Data | TanStack React Query v5 |
| Fonts | Geist Sans via `@expo-google-fonts/geist` |
| Camera | `expo-camera`, `expo-image-picker`, `expo-document-picker` |
| Image | `expo-image-manipulator`, `expo-file-system` |
| Animation | Reanimated v3, `react-native-gesture-handler` |
| Icons | `react-native-svg` (custom Tatva-style `Icon` component) |
| Web host | Vercel, static export via `expo export --platform web` |

## Design system

Tokens, typography, and layout mirror [`akshar-frontend/src/app/dashboard/page.tsx`](https://github.com/sarvamai/akshar-frontend). Geist Sans is applied globally through `Text.defaultProps` in `app/_layout.tsx`. Primary orange `#CB5534`, foreground `#262626`, background `#FFFFFF`. Full ramp in `components/ui/tokens.ts`.

Tatva text variants used:

| Variant | Size / Weight / Tracking |
|---|---|
| heading-lg | 24 / 700 / -0.6 |
| heading-md | 20 / 700 / -0.4 |
| heading-sm | 16 / 600 / -0.2 |
| body-md | 14 / 400 |
| body-sm | 13 / 400 |

## Project structure

```
app/
  _layout.tsx              root stack, font loader, error boundary
  +html.tsx                web HTML wrapper (viewport, theme-color, PWA meta)
  index.tsx                landing with gradient hero
  (tabs)/index.tsx         home dashboard
  job/upload.tsx           upload dialog + language picker
  job/camera.tsx           multi-page capture
  job/form.tsx             name-the-visit submit screen
  job/scan.tsx             vision extraction (mocked in demo)
assets/
  akshar-logo.ts           mandala SVG
  akshar-upload.svg        upload illustration
components/ui/
  tokens.ts                colors, spacing, radius, typography
  Icon.tsx                 SVG icon set
services/
  sarvam.api.ts            API client
  vision.api.ts            Vision wrapper
  image.processor.ts       resize / compress / base64
store/
  jobs.store.ts            visits, draft photos, draft language
constants/
  languages.ts             23 Indic languages
```

## Web deployment

`vercel.json` points Vercel at `dist/`. Every push to `master` triggers a redeploy. Platform guards (`Platform.OS !== 'web'`) wrap `react-native-get-random-values` and `expo-haptics` so the same codebase runs on native and web.

`app/+html.tsx` pins the viewport, Chrome theme color (`#0A1530`), and iOS PWA meta so the mobile web build behaves like a native-feeling app.

## Languages

23 Indic languages (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Assamese, Urdu, Sanskrit, Nepali, Dogri, Bodo, Punjabi, Odia, Konkani, Maithili, Sindhi, Kashmiri, Manipuri, Santali) plus English. RTL scripts (Urdu, Kashmiri, Sindhi) are handled automatically. Selection persists to `draftLanguage` in `store/jobs.store.ts`.

## Links

- Repo: [github.com/shrutip-sarvam/sarvam_lic](https://github.com/shrutip-sarvam/sarvam_lic)
- Deploy: [sarvam-lic.vercel.app](https://sarvam-lic.vercel.app)
- Reference: [github.com/sarvamai/akshar-frontend](https://github.com/sarvamai/akshar-frontend)
