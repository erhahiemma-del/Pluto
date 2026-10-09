import React, { useEffect, useRef, useState } from 'react';
import { Linkedin, Share2, Copy, Check, MessageCircle, Twitter, Instagram, Info } from 'lucide-react';
import { CAMPAIGN_URL } from '../constants/brand';
import { useWizard } from '../context/WizardContext';

interface ShareComponentProps {
  cardElementId?: string;
  recipientName?: string;
  /** Called after the card has been shared (used to record the chosen style). */
  onShared?: () => void;
}

type Platform = 'linkedin' | 'whatsapp' | 'x' | 'instagram';

const PLATFORM_NAMES: Record<Platform, string> = {
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  x: 'X',
  instagram: 'Instagram',
};

/** Where each platform's "new post" screen lives (text is pre-filled where the platform allows it). */
const composeUrl = (platform: Platform, text: string) => {
  const t = encodeURIComponent(text);
  switch (platform) {
    case 'linkedin':
      return `https://www.linkedin.com/feed/?shareActive=true&text=${t}`;
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${t}`;
    case 'x':
      return `https://twitter.com/intent/tweet?text=${t}`;
    case 'instagram':
      return 'https://www.instagram.com/';
  }
};


export const ShareComponent = ({ cardElementId = 'card-preview-export', recipientName, onShared }: ShareComponentProps) => {
  const { state } = useWizard();
  const name = (recipientName || state.data.recipientName || '').trim();
  const fileName = `pluto-thank-you-${(name || 'card').toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;

  const [message, setMessage] = useState(
    `${name ? `${name} went the extra mile for me.` : 'Someone went the extra mile for me.'}\nI wanted them to know.\n\n#ThoseWhoWentTheExtraMile\n\nWho went the extra mile for you? Thank them here: ${CAMPAIGN_URL}`
  );
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<Platform | 'device' | null>(null);
  const [notice, setNotice] = useState('');

  // Prepare the card image in the background, so sharing can open instantly on tap
  // (phones only allow the share sheet straight after a tap).
  const fileRef = useRef<File | null>(null);
  const cardStyle = state.data.cardStyle || 'bold';
  const makeFile = async () => {
    const { generateCardPng, cardDataFrom } = await import('../services/cardRaster');
    return generateCardPng(cardDataFrom(state.data), cardStyle, { fileName });
  };
  const cardKey = JSON.stringify([state.data.cardStyle, name, state.data.photoUrl?.length, state.data.message, state.data.selectedTraits]);
  useEffect(() => {
    fileRef.current = null;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const file = await makeFile();
        if (!cancelled) fileRef.current = file;
      } catch {
        // generated on demand instead
      }
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cardKey]);

  const getFile = async () => fileRef.current || makeFile();

  const canShareFiles = (file: File) =>
    typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      return true;
    } catch {
      return false;
    }
  };

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  /** Phones: open the share sheet with the image and message attached. */
  const shareWithDevice = async (file: File) => {
    await navigator.share({ files: [file], text: message });
    onShared?.();
  };

  const handlePlatform = async (platform: Platform) => {
    const ready = fileRef.current;

    // Phones (and some desktops): share the actual image + message via the share sheet
    if (ready && canShareFiles(ready)) {
      setNotice(`Choose ${PLATFORM_NAMES[platform]} from the share options.`);
      try {
        await shareWithDevice(ready);
        setNotice('');
      } catch (err: any) {
        if (err?.name !== 'AbortError') setNotice('Sharing was blocked on this device. Download the card and post it from the app instead.');
        else setNotice('');
      }
      return;
    }

    // Computers: open the platform's post screen, download the image and copy the message
    const win = window.open('about:blank', '_blank'); // opened now so pop-up blockers allow it
    setBusy(platform);
    try {
      const file = await getFile();
      downloadFile(file);
      const copiedOk = await copyMessage();
      if (win) win.location.href = composeUrl(platform, message);
      onShared?.();
      const app = PLATFORM_NAMES[platform];
      const copiedNote = copiedOk ? ' and your message copied' : '';
      setNotice(
        platform === 'instagram'
          ? `Your card has been downloaded${copiedNote}. On Instagram, create a new post, add the downloaded card and paste your message.`
          : `Your card has been downloaded${copiedNote}. In the ${app} window, attach the downloaded card image to your post (paste the message if it isn't already there).`
      );
    } catch (err) {
      console.warn('Share failed:', err);
      win?.close();
      setNotice('Something went wrong preparing your card. Please use Download Card instead.');
    } finally {
      setBusy(null);
    }
  };

  const handleDeviceShare = async () => {
    setBusy('device');
    try {
      const file = await getFile();
      if (canShareFiles(file)) {
        await shareWithDevice(file);
      } else {
        downloadFile(file);
        const copiedOk = await copyMessage();
        setNotice(`Your card has been downloaded${copiedOk ? ' and your message copied' : ''}. Add it to a post in any app.`);
        onShared?.();
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') setNotice('Sharing was blocked on this device. Please use Download Card instead.');
    } finally {
      setBusy(null);
    }
  };

  const btn =
    'py-2.5 px-3 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 text-xs transition-all shadow-2xs cursor-pointer disabled:opacity-70';

  return (
    <div className="w-full space-y-4">
      {/* Editable share message */}
      <div className="text-left bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="share-message" className="text-xs font-bold text-slate-700">
            Your post message
          </label>
          <button
            type="button"
            onClick={copyMessage}
            className="text-xs font-semibold text-[#00875A] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy message'}</span>
          </button>
        </div>
        <textarea
          id="share-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00875A]"
        />
        <p className="text-[11px] text-slate-500">Your card image is shared together with this message. Tag them when you post.</p>
      </div>

      {/* Platforms */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button type="button" onClick={() => handlePlatform('linkedin')} disabled={busy !== null} className={`${btn} bg-[#0A66C2] hover:bg-[#004182]`}>
          <Linkedin className="w-4 h-4 fill-current shrink-0" />
          <span>{busy === 'linkedin' ? 'Preparing…' : 'LinkedIn'}</span>
        </button>
        <button type="button" onClick={() => handlePlatform('whatsapp')} disabled={busy !== null} className={`${btn} bg-[#25D366] hover:bg-[#1EBE5D]`}>
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span>{busy === 'whatsapp' ? 'Preparing…' : 'WhatsApp'}</span>
        </button>
        <button type="button" onClick={() => handlePlatform('x')} disabled={busy !== null} className={`${btn} bg-black hover:bg-slate-800`}>
          <Twitter className="w-4 h-4 shrink-0" />
          <span>{busy === 'x' ? 'Preparing…' : 'X / Twitter'}</span>
        </button>
        <button
          type="button"
          onClick={() => handlePlatform('instagram')}
          disabled={busy !== null}
          className={`${btn} bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] hover:opacity-90`}
        >
          <Instagram className="w-4 h-4 shrink-0" />
          <span>{busy === 'instagram' ? 'Preparing…' : 'Instagram'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-900 rounded-xl text-xs font-semibold text-left flex items-start gap-2 animate-fadeIn" role="status">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      {/* Share sheet (phones) */}
      <button
        type="button"
        onClick={handleDeviceShare}
        disabled={busy !== null}
        className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
      >
        <Share2 className="w-4 h-4 text-[#00875A]" />
        <span>{busy === 'device' ? 'Preparing…' : 'Share to another app'}</span>
      </button>
    </div>
  );
};
