import { CAMPAIGN_URL } from '../constants/brand';
import React, { useState } from 'react';
import { generateCardImage } from '../services/cardGenerator';
import {
  Linkedin,
  Download,
  Mail,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Twitter,
  Instagram
} from 'lucide-react';
import { useWizard } from '../context/WizardContext';

interface ShareComponentProps {
  cardElementId?: string;
  recipientName?: string;
  creatorEmail?: string;
}

export const ShareComponent = ({
  cardElementId = 'card-preview-export',
  recipientName,
  creatorEmail,
}: ShareComponentProps) => {
  const { state } = useWizard();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInstaTip, setShowInstaTip] = useState(false);

  const targetRecipient = recipientName || state.data.recipientName || 'Hassan Emeka';
  const targetEmail = creatorEmail || state.data.creatorEmail;

  // Fixed Campaign URL as mandated by Section 24
  const campaignUrl = CAMPAIGN_URL;

  // Section 23 suggested share copy
  const [customShareCopy, setCustomShareCopy] = useState(
    `Someone went the extra mile for me.\nI wanted them to know.\n\n#ThoseWhoWentTheExtraMile\n${campaignUrl}`
  );

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(customShareCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const dataUrl = await generateCardImage(cardElementId);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `pluto-thank-you-${targetRecipient.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      console.warn('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleSendToInbox = async () => {
    if (!targetEmail) return;
    setSendingEmail(true);
    try {
      const dataUrl = await generateCardImage(cardElementId);
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, dataUrl }),
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch (error) {
      console.warn('Sending email failed:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleNativeShare = async () => {
    try {
      const dataUrl = await generateCardImage(cardElementId);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File(
        [blob],
        `pluto-thank-you-${targetRecipient.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`,
        { type: 'image/png' }
      );

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `Thank You Card for ${targetRecipient}`,
          text: customShareCopy,
          url: campaignUrl,
        });
      } else {
        await handleCopyText();
      }
    } catch (error) {
      console.warn('Native share failed:', error);
    }
  };

  // Channel share links
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(customShareCopy)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Someone went the extra mile for me. I wanted them to know.\n\n${campaignUrl}`
  )}&hashtags=ThoseWhoWentTheExtraMile`;

  return (
    <div className="w-full space-y-4">
      {/* Editable Share Message Preview */}
      <div className="text-left bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">
            Share message:
          </label>
          <button
            type="button"
            onClick={handleCopyText}
            className="text-xs font-semibold text-[#00875A] hover:underline flex items-center space-x-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy message'}</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={customShareCopy}
          onChange={(e) => setCustomShareCopy(e.target.value)}
          className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00875A]"
        />
      </div>

      {/* Social Platform Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* LinkedIn */}
        <a
          href={linkedinShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 text-xs transition-colors shadow-2xs"
        >
          <Linkedin className="w-4 h-4 fill-current shrink-0" />
          <span>LinkedIn</span>
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 text-xs transition-colors shadow-2xs"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span>WhatsApp</span>
        </a>

        {/* X / Twitter */}
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 bg-black hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 text-xs transition-colors shadow-2xs"
        >
          <Twitter className="w-4 h-4 shrink-0" />
          <span>X / Twitter</span>
        </a>

        {/* Instagram Tip */}
        <button
          type="button"
          onClick={() => setShowInstaTip(!showInstaTip)}
          className="py-2.5 px-3 bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] hover:opacity-90 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 text-xs transition-opacity shadow-2xs cursor-pointer"
        >
          <Instagram className="w-4 h-4 shrink-0" />
          <span>Instagram</span>
        </button>
      </div>

      {showInstaTip && (
        <div className="p-3 bg-pink-50 border border-pink-200 text-pink-900 rounded-xl text-xs font-semibold text-center animate-fadeIn">
          📸 Download your square card and share it directly to your Instagram feed or story!
        </div>
      )}

      {/* Native Web Share Button (Mobile) */}
      <button
        type="button"
        onClick={handleNativeShare}
        className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
      >
        <Share2 className="w-4 h-4 text-[#00875A]" />
        <span>Share via Mobile App / Device</span>
      </button>
    </div>
  );
};
