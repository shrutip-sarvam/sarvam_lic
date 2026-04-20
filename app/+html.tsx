/**
 * Web-only HTML wrapper — lets us pin the viewport, theme color, touch
 * behaviour and status-bar chrome so the mobile web build matches the
 * native app as closely as possible.
 *
 * Expo Router renders this at build time on the web; it has no runtime
 * effect on iOS / Android builds.
 */
import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Cover the notch, prevent browser zoom, fill the viewport on phones.  */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />

        {/* Chrome & Safari address-bar tint, matching the Akshar hero gradient.  */}
        <meta name="theme-color" content="#0A1530" />
        <meta name="color-scheme" content="light" />

        {/* iOS home-screen "PWA" polish.                                         */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Akshar for LIC" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        <meta name="description" content="Akshar for LIC — field-agent document intelligence. Capture, extract, and submit a policyholder visit in seconds." />

        <title>Akshar for LIC</title>

        {/* Reset the scroll view so the page can't bounce on mobile web.        */}
        <ScrollViewStyleReset />

        {/* Body & html locked to the viewport so nothing overflows horizontally */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// Force full-bleed layout + kill horizontal overflow + crisper font rendering.
const responsiveBackground = `
html, body {
  margin: 0;
  padding: 0;
  background-color: #FFFFFF;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}
#root {
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
}
* {
  -webkit-tap-highlight-color: transparent;
}
`;
