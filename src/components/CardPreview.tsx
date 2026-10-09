import React, { useEffect, useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { CardData } from './CardSvgArtboard';
import { ANIMATED_STYLES, CARD_ANIMATION_SECONDS, CardArtboard, SQUARE_STYLES } from './CardTemplates';

interface CardPreviewProps {
  id?: string;
  size?: 'export' | 'responsive';
  customData?: CardData;
  debugMode?: boolean;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  id = 'card-preview',
  size = 'responsive',
  customData,
  debugMode = false,
}) => {
  const { state } = useWizard();

  const cardData: CardData = customData || {
    recipientName: state.data.recipientName,
    relationship: state.data.relationship,
    photoUrl: state.data.photoUrl,
    photoZoom: state.data.photoZoom,
    photoFocusX: state.data.photoFocusX,
    photoFocusY: state.data.photoFocusY,
    photoAspect: state.data.photoAspect,
    selectedTraits: state.data.selectedTraits,
    message: state.data.message,
    creatorFirstName: state.data.creatorFirstName,
    creatorLastName: state.data.creatorLastName,
    creatorJobTitle: state.data.creatorJobTitle,
    creatorCompany: state.data.creatorCompany,
  };

  const isExport = size === 'export';
  const cardStyle = state.data.cardStyle || 'bold';

  // Play the short intro animation in the on-screen preview whenever the style changes.
  // The exported image is always the finished, still card.
  const [animT, setAnimT] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (isExport || !ANIMATED_STYLES.includes(cardStyle)) return;
    if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      if (t >= CARD_ANIMATION_SECONDS) {
        setAnimT(undefined);
        return;
      }
      setAnimT(t);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      setAnimT(undefined);
    };
  }, [cardStyle, isExport]);
  const isSquare = SQUARE_STYLES.includes(cardStyle);

  return (
    <div
      className={`card-stage w-full relative aspect-square overflow-hidden select-none ${isSquare ? (isExport ? 'rounded-none' : 'rounded-md') : 'rounded-[32px] sm:rounded-[36px]'}`}
      style={{
        boxShadow: isExport ? 'none' : '0 20px 50px -10px rgba(11, 27, 61, 0.18)',
        backgroundColor: '#FFFFFF',
      }}
    >
      <CardArtboard
        cardStyle={cardStyle}
        animT={animT}
        data={cardData}
        id={id}
        debugMode={debugMode}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};
