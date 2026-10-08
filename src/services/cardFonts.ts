// Self-hosted card fonts, embedded as data URIs so exported images and videos
// always use the right typefaces (no dependency on Google Fonts at export time).
import jakarta400 from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff2?url';
import jakarta500 from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.woff2?url';
import jakarta600 from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2?url';
import jakarta700 from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2?url';
import jakarta800 from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2?url';
import jakarta400i from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-italic.woff2?url';
import jakarta500i from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-italic.woff2?url';
import caveat700 from '@fontsource/caveat/files/caveat-latin-700-normal.woff2?url';

const FACES: { family: string; weight: string; style: string; url: string }[] = [
  { family: 'Plus Jakarta Sans', weight: '400', style: 'normal', url: jakarta400 },
  { family: 'Plus Jakarta Sans', weight: '500', style: 'normal', url: jakarta500 },
  { family: 'Plus Jakarta Sans', weight: '600', style: 'normal', url: jakarta600 },
  { family: 'Plus Jakarta Sans', weight: '700', style: 'normal', url: jakarta700 },
  { family: 'Plus Jakarta Sans', weight: '800 900', style: 'normal', url: jakarta800 },
  { family: 'Plus Jakarta Sans', weight: '400', style: 'italic', url: jakarta400i },
  { family: 'Plus Jakarta Sans', weight: '500', style: 'italic', url: jakarta500i },
  { family: 'Caveat', weight: '700', style: 'normal', url: caveat700 },
];

export const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

let cached: Promise<string> | null = null;

/** @font-face CSS with every card font inlined. Cached after the first call. */
export const getCardFontCSS = (): Promise<string> => {
  if (!cached) {
    cached = Promise.all(
      FACES.map(async (f) => {
        const res = await fetch(f.url);
        const data = await blobToDataUrl(await res.blob());
        return `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};font-display:block;src:url(${data}) format('woff2');}`;
      })
    )
      .then((rules) => rules.join('\n'))
      .catch((err) => {
        cached = null;
        throw err;
      });
  }
  return cached;
};

/** Plain @font-face CSS pointing at the bundled files, for on-screen rendering. */
export const cardFontFaceCSS = FACES.map(
  (f) => `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};font-display:swap;src:url(${f.url}) format('woff2');}`
).join('\n');
