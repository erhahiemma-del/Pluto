// Builds a short animated MP4 of the card: ~1.5s intro, then the finished card holds still.
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { CARD_ANIMATION_SECONDS } from '../components/CardTemplates';
import { CardData } from '../components/CardSvgArtboard';
import { createCardRenderer } from './cardRaster';

const SIZE = 1080;
const FPS = 30;
const TOTAL_SECONDS = 6; // LinkedIn needs at least 3s; 6s reads as "animate in, then a still banner"
const START_AT = 0.25; // first frame already shows the photo, so the thumbnail isn't blank

export type CardVideo = { blob: Blob; extension: 'mp4' | 'webm' };

/** Renders card frames at a given animation time onto a canvas. */
const makeFrameRenderer = (data: CardData, cardStyle: string) => createCardRenderer(data, cardStyle, SIZE);

const pickAvcCodec = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !('VideoEncoder' in window)) return null;
  for (const codec of ['avc1.640028', 'avc1.4d0028', 'avc1.42e028', 'avc1.42001f']) {
    try {
      const { supported } = await VideoEncoder.isConfigSupported({ codec, width: SIZE, height: SIZE, bitrate: 6_000_000, framerate: FPS });
      if (supported) return codec;
    } catch {
      // try next
    }
  }
  return null;
};

/** Best path: WebCodecs + MP4 (Chrome, Edge, Safari 16.4+, Android). Frames are encoded as fast as they render. */
const encodeMp4 = async (
  codec: string,
  renderer: { canvas: HTMLCanvasElement; draw: (t?: number) => Promise<void> },
  onProgress?: (p: number) => void
): Promise<Blob> => {
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: SIZE, height: SIZE, frameRate: FPS },
    fastStart: 'in-memory',
  });
  let failure: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      failure = e;
    },
  });
  encoder.configure({ codec, width: SIZE, height: SIZE, bitrate: 6_000_000, framerate: FPS, avc: { format: 'avc' } });

  const totalFrames = TOTAL_SECONDS * FPS;
  const animEnd = CARD_ANIMATION_SECONDS + 0.05;
  let finished = false;
  for (let i = 0; i < totalFrames; i++) {
    if (failure) throw failure;
    const t = START_AT + i / FPS;
    if (t <= animEnd) await renderer.draw(t);
    else if (!finished) {
      await renderer.draw(undefined);
      finished = true;
    }
    const frame = new VideoFrame(renderer.canvas, { timestamp: Math.round((i * 1_000_000) / FPS), duration: Math.round(1_000_000 / FPS) });
    encoder.encode(frame, { keyFrame: i % (FPS * 2) === 0 });
    frame.close();
    if (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
    onProgress?.((i + 1) / totalFrames);
  }
  await encoder.flush();
  if (failure) throw failure;
  encoder.close();
  muxer.finalize();
  return new Blob([muxer.target.buffer], { type: 'video/mp4' });
};

/** Fallback: record the canvas in real time with MediaRecorder (MP4 where supported, otherwise WebM). */
const recordFallback = async (
  renderer: { canvas: HTMLCanvasElement; draw: (t?: number) => Promise<void> },
  onProgress?: (p: number) => void
): Promise<CardVideo> => {
  // Pre-render the intro frames so playback runs at a steady rate
  const introFrames: ImageBitmap[] = [];
  const fps = 24;
  for (let t = START_AT; t <= CARD_ANIMATION_SECONDS + 0.05; t += 1 / fps) {
    await renderer.draw(t);
    introFrames.push(await createImageBitmap(renderer.canvas));
    onProgress?.(0.5 * (t / CARD_ANIMATION_SECONDS));
  }
  await renderer.draw(undefined);
  const finalFrame = await createImageBitmap(renderer.canvas);

  const out = document.createElement('canvas');
  out.width = SIZE;
  out.height = SIZE;
  const octx = out.getContext('2d')!;
  octx.drawImage(introFrames[0] || finalFrame, 0, 0);

  const mimeType = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find(
    (m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)
  );
  if (!mimeType) throw new Error('Video export is not supported in this browser');
  const stream = out.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((r) => (recorder.onstop = () => r()));
  recorder.start();

  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const idx = Math.floor(elapsed * fps);
      octx.drawImage(idx < introFrames.length ? introFrames[idx] : finalFrame, 0, 0);
      onProgress?.(0.5 + 0.5 * Math.min(1, elapsed / TOTAL_SECONDS));
      if (elapsed >= TOTAL_SECONDS) return resolve();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  recorder.stop();
  await done;
  introFrames.forEach((b) => b.close());
  finalFrame.close();
  const type = mimeType.startsWith('video/mp4') ? 'video/mp4' : 'video/webm';
  return { blob: new Blob(chunks, { type }), extension: type === 'video/mp4' ? 'mp4' : 'webm' };
};

export const generateCardVideo = async (
  data: CardData,
  cardStyle: string,
  onProgress?: (p: number) => void
): Promise<CardVideo> => {
  const renderer = await makeFrameRenderer(data, cardStyle);
  const codec = await pickAvcCodec();
  if (codec) {
    try {
      return { blob: await encodeMp4(codec, renderer, onProgress), extension: 'mp4' };
    } catch (err) {
      console.warn('MP4 encode failed, falling back to recording:', err);
    }
  }
  return recordFallback(renderer, onProgress);
};
