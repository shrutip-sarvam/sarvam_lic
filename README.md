# Akshar — Intelligent Document Digitisation

> Built on [Sarvam Vision](https://akshar.sarvam.ai) · 23 Indian languages · React Native (Expo)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Expo dev server
npx expo start

# Scan the QR code with Expo Go (Android/iOS) or run:
npm run android   # Android emulator
npm run ios       # iOS simulator (macOS only)
npm run web       # Browser
```

The demo build ships without API keys and uses a deterministic mock for
Vision extraction. To run against a real backend, edit the `SARVAM_BASE_URL`
and add auth in `services/sarvam.api.ts` and `services/vision.api.ts`
(recommended: route through a server-side proxy rather than embedding
secrets in the client bundle).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (Expo Router) |
| Language | TypeScript (strict mode) |
| Styling | NativeWind v4 (Tailwind CSS for RN) |
| State | Zustand + AsyncStorage persistence |
| API calls | TanStack React Query v5 |
| Camera | expo-camera + expo-image-picker |
| Image processing | expo-image-manipulator |
| Animations | React Native Reanimated v3 |
| Bottom sheets | @gorhom/bottom-sheet |
| Lists | @shopify/flash-list |
| Haptics | expo-haptics |

## Project Structure

```
akshar/
├── app/                    # Expo Router file-based routes
│   ├── (tabs)/             # Tab navigator (Home, Camera, Settings)
│   └── document/           # Document viewer + editor
├── components/
│   ├── camera/             # CameraCapture, CaptureControls, EdgeDetector, CropPreview
│   ├── document/           # BlockCard, ExtractedBlocks, SourceViewer, VisualGrounding, CorrectionPanel
│   ├── upload/             # UploadDropzone, UploadProgress
│   └── shared/             # LanguageChip, ScriptBadge, FormatSelector
├── hooks/                  # useCameraPermissions, useDocumentProcessor, useSarvamVision, useVisualGrounding
├── services/               # sarvam.api.ts, image.processor.ts, export.service.ts, storage.service.ts
├── store/                  # documents.store.ts, settings.store.ts (Zustand)
├── types/                  # block.types.ts, api.types.ts
└── constants/              # languages.ts (23 langs), theme.ts
```

## Supported Languages

23 Indian languages: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada,
Malayalam, Assamese, Urdu, Sanskrit, Nepali, Dogri, Bodo, Punjabi, Odia, Konkani,
Maithili, Sindhi, Kashmiri, Manipuri, Santali, English.

RTL languages: Urdu, Kashmiri, Sindhi — handled automatically.

## Key Features

- **Camera capture** with auto edge detection, multi-page capture, crop & deskew
- **Visual grounding** — tap any extracted block to see its exact location in the source scan
- **Agent corrections** — describe changes in plain text, applied document-wide
- **23 language support** including 3 RTL scripts
- **Export** as HTML, JSON, or Markdown
- **Offline history** — last 20 documents cached locally

---
*Powered by Sarvam Vision · [akshar.sarvam.ai](https://akshar.sarvam.ai)*
