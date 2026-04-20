# Akshar — Intelligent Document Digitisation

> Built on [Sarvam Vision](https://akshar.sarvam.ai) · 23 Indian languages · React Native (Expo)

## Quick Start

```bash
# 1. Install dependencies (already done)
npm install

# 2. Copy env file and add your Sarvam API key
cp .env.example .env
# Edit .env and set EXPO_PUBLIC_SARVAM_API_KEY

# 3. Start Expo dev server
npx expo start

# Scan the QR code with Expo Go (Android/iOS) or run:
npm run android   # Android emulator
npm run ios       # iOS simulator (macOS only)
npm run web       # Browser
```

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

## Environment Variables

```env
EXPO_PUBLIC_SARVAM_API_KEY=your_key_here
EXPO_PUBLIC_SARVAM_API_BASE_URL=https://api.sarvam.ai
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
