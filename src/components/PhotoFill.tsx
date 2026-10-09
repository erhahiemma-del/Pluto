import React from 'react';

/** How the person framed the photo in the Photo step (all optional). */
export type PhotoFraming = {
  photoZoom?: number; // 1 = fill the frame, higher = closer
  photoFocusX?: number; // 0–1, point of the photo kept in the centre of the frame
  photoFocusY?: number;
  photoAspect?: number; // natural width / height of the photo
};

/**
 * Draws a photo filling a frame, keeping the chosen focus point centred and applying the zoom.
 * Without framing info it falls back to a plain centred "cover" fit.
 */
export const PhotoFill: React.FC<{
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  framing?: PhotoFraming;
  clipPath?: string;
}> = ({ href, x, y, width, height, framing, clipPath }) => {
  const aspect = framing?.photoAspect;
  if (!aspect || !isFinite(aspect) || aspect <= 0) {
    return <image href={href} x={x} y={y} width={width} height={height} preserveAspectRatio="xMidYMid slice" clipPath={clipPath} />;
  }
  const zoom = Math.min(4, Math.max(1, framing?.photoZoom || 1));
  const fx = Math.min(1, Math.max(0, framing?.photoFocusX ?? 0.5));
  const fy = Math.min(1, Math.max(0, framing?.photoFocusY ?? 0.5));
  // Smallest size that covers the frame, then zoomed
  const base = Math.max(width / aspect, height);
  const H = base * zoom;
  const W = H * aspect;
  // Put the focus point in the middle, but never leave a gap at the frame edges
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const ix = clamp(x + width / 2 - fx * W, x + width - W, x);
  const iy = clamp(y + height / 2 - fy * H, y + height - H, y);
  const img = <image href={href} x={ix.toFixed(2)} y={iy.toFixed(2)} width={W.toFixed(2)} height={H.toFixed(2)} preserveAspectRatio="none" />;
  return clipPath ? <g clipPath={clipPath}>{img}</g> : img;
};
