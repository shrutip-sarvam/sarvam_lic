export interface Language {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  scriptFamily: 'devanagari' | 'dravidian' | 'eastern' | 'perso-arabic' | 'other';
  rtl: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', scriptFamily: 'devanagari', rtl: false },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', scriptFamily: 'devanagari', rtl: false },
  { code: 'sa-IN', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', scriptFamily: 'devanagari', rtl: false },
  { code: 'ne-IN', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', scriptFamily: 'devanagari', rtl: false },
  { code: 'doi-IN', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', scriptFamily: 'devanagari', rtl: false },
  { code: 'mai-IN', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', scriptFamily: 'devanagari', rtl: false },
  { code: 'kok-IN', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', scriptFamily: 'devanagari', rtl: false },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil Script', scriptFamily: 'dravidian', rtl: false },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu Script', scriptFamily: 'dravidian', rtl: false },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada Script', scriptFamily: 'dravidian', rtl: false },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam Script', scriptFamily: 'dravidian', rtl: false },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', scriptFamily: 'eastern', rtl: false },
  { code: 'as-IN', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali', scriptFamily: 'eastern', rtl: false },
  { code: 'od-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia Script', scriptFamily: 'eastern', rtl: false },
  { code: 'mni-IN', name: 'Manipuri', nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ', script: 'Meitei Mayek', scriptFamily: 'eastern', rtl: false },
  { code: 'sat-IN', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', scriptFamily: 'other', rtl: false },
  { code: 'ur-IN', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', scriptFamily: 'perso-arabic', rtl: true },
  { code: 'ks-IN', name: 'Kashmiri', nativeName: 'کٲشُر', script: 'Perso-Arabic', scriptFamily: 'perso-arabic', rtl: true },
  { code: 'sd-IN', name: 'Sindhi', nativeName: 'سنڌي', script: 'Perso-Arabic', scriptFamily: 'perso-arabic', rtl: true },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati Script', scriptFamily: 'other', rtl: false },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', scriptFamily: 'other', rtl: false },
  { code: 'brx-IN', name: 'Bodo', nativeName: 'बड़ो', script: 'Devanagari', scriptFamily: 'devanagari', rtl: false },
  { code: 'en-IN', name: 'English', nativeName: 'English', script: 'Latin', scriptFamily: 'other', rtl: false },
];

export const RTL_LANGUAGE_CODES = LANGUAGES.filter((l) => l.rtl).map((l) => l.code);

export const LANGUAGE_MAP: Record<string, Language> = LANGUAGES.reduce(
  (acc, lang) => ({ ...acc, [lang.code]: lang }),
  {}
);
