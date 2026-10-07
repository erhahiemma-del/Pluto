import { toPng } from 'html-to-image';

export const generateCardImage = async (
  elementId: string,
  options?: { highRes?: boolean }
): Promise<string> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Ensure any pending web fonts are fully loaded
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Non-blocking fallback
    }
  }

  const isHighRes = options?.highRes;

  return await toPng(element, {
    width: 1080,
    height: 1080, // Canonical 1080x1080 canvas
    pixelRatio: isHighRes ? 1.4815 : 1, // 1080 * 1.4815 ≈ 1600x1600 px high-resolution export
    skipFonts: true, // Prevents html-to-image from accessing cross-origin Google Fonts stylesheets via sheet.cssRules
    cacheBust: true,
  });
};
