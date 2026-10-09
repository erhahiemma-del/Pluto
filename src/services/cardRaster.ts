// Draws the card SVG straight onto a canvas (no screenshot library), so image export works the
// same on phones and computers. Shared by the image download, sharing and the animated video.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CardArtboard } from '../components/CardTemplates';
import { CardData } from '../components/CardSvgArtboard';
import { PLUTO_LOGO_URL } from '../constants/brand';
import { blobToDataUrl, getCardFontCSS } from './cardFonts';

type WizardData = {
  recipientName?: string;
  relationship?: string;
  photoUrl?: string;
  photoZoom?: number;
  photoFocusX?: number;
  photoFocusY?: number;
  photoAspect?: number;
  selectedTraits?: string[];
  message?: string;
  creatorFirstName?: string;
  creatorLastName?: string;
  creatorJobTitle?: string;
  creatorCompany?: string;
};

export const cardDataFrom = (d: WizardData): CardData => ({
  recipientName: d.recipientName,
  relationship: d.relationship,
  photoUrl: d.photoUrl,
  photoZoom: d.photoZoom,
  photoFocusX: d.photoFocusX,
  photoFocusY: d.photoFocusY,
  photoAspect: d.photoAspect,
  selectedTraits: d.selectedTraits,
  message: d.message,
  creatorFirstName: d.creatorFirstName,
  creatorLastName: d.creatorLastName,
  creatorJobTitle: d.creatorJobTitle,
  creatorCompany: d.creatorCompany,
});

const toDataUrl = async (src: string) => {
  if (!src || src.startsWith('data:')) return src;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Could not load ${src}`);
  return blobToDataUrl(await res.blob());
};

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not draw the card'));
    img.src = url;
  });

export type CardRenderer = { canvas: HTMLCanvasElement; draw: (t?: number) => Promise<void> };

/** Prepares fonts and photo once, then draws the card (optionally mid-animation) onto a canvas. */
export const createCardRenderer = async (
  data: CardData,
  cardStyle: string,
  size = 1080,
  onProgress?: (p: number) => void
): Promise<CardRenderer> => {
  onProgress?.(0.05);
  const fontCSS = await getCardFontCSS();
  onProgress?.(0.3);
  const frameData = { ...data, photoUrl: await toDataUrl(data.photoUrl || '/african_executive_portrait.jpg') };
  let logoData = '';
  try {
    logoData = await toDataUrl(PLUTO_LOGO_URL);
  } catch {
    // Only the old Classic style uses the logo image; the others draw it as vector
  }
  onProgress?.(0.5);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const draw = async (t?: number) => {
    let svg = renderToStaticMarkup(
      React.createElement(CardArtboard, { cardStyle, data: frameData, animT: t, style: { borderRadius: 0 } })
    );
    svg = svg
      .replace(/@import url\([^)]*\);?/g, '')
      .replace(/<svg([^>]*)>/, (_m, attrs: string) => {
        const sized = attrs.replace(/\swidth="[^"]*"/, ` width="${size}"`).replace(/\sheight="[^"]*"/, ` height="${size}"`);
        return `<svg${sized}><style>${fontCSS}</style>`;
      });
    if (logoData) svg = svg.split(PLUTO_LOGO_URL).join(logoData);
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = await loadImage(url);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  // Warm-up draw so the embedded fonts are decoded before the real one (needed on Safari)
  await draw(undefined);
  onProgress?.(0.7);
  return { canvas, draw };
};

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image'))), 'image/png')
  );

/** The finished card as a PNG file. */
export const generateCardPng = async (
  data: CardData,
  cardStyle: string,
  options: { size?: number; fileName?: string; onProgress?: (p: number) => void } = {}
): Promise<File> => {
  const size = options.size || 1080;
  const renderer = await createCardRenderer(data, cardStyle, size, options.onProgress);
  await new Promise((r) => setTimeout(r, 60));
  await renderer.draw(undefined);
  options.onProgress?.(0.9);
  const blob = await canvasToBlob(renderer.canvas);
  options.onProgress?.(1);
  return new File([blob], options.fileName || 'pluto-thank-you.png', { type: 'image/png' });
};

/** Phones and tablets (where a plain download often goes nowhere visible). */
export const isMobileDevice = () =>
  typeof navigator !== 'undefined' &&
  (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

export const canShareFile = (file: File) =>
  typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

/** Plain browser download of a file. */
export const downloadFile = (file: File) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

/**
 * Save a file to the device. Must be called straight from a tap.
 * Phones: opens the share sheet (Save Image / Save Video / Save to Files). Otherwise a normal download.
 * Returns false if the person closed the share sheet without choosing.
 */
export const saveFileToDevice = async (file: File): Promise<boolean> => {
  if (isMobileDevice() && canShareFile(file)) {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (err: any) {
      if (err?.name === 'AbortError') return false;
      // fall through to a normal download
    }
  }
  downloadFile(file);
  return true;
};
