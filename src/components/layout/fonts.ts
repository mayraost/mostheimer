import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';

/**
 * Font setup shared by every rendered document: the [locale] layout and the
 * route-group 404 (src/app/(frontend)/not-found.tsx).
 *
 * Display + body text: Space Grotesk (tight tracking lives in the utility
 * layer). Code/metadata: JetBrains Mono.
 *
 * Both shells use the SAME font instances, so each document references the
 * same files and next/font de-duplicates them.
 */
const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

/** <body> classes: font variables, font-family token, smoothing. */
export const BODY_FONT_CLASS = `${spaceGrotesk.variable} ${jetbrainsMono.variable} font-body antialiased`;
