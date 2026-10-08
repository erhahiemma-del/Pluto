import React from 'react';
import { useWizard } from '../context/WizardContext';
import { CardData } from './CardSvgArtboard';
import { CardArtboard, SQUARE_STYLES } from './CardTemplates';

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
    selectedTraits: state.data.selectedTraits,
    message: state.data.message,
    creatorFirstName: state.data.creatorFirstName,
    creatorLastName: state.data.creatorLastName,
    creatorJobTitle: state.data.creatorJobTitle,
    creatorCompany: state.data.creatorCompany,
  };

  const isExport = size === 'export';
  const isSquare = SQUARE_STYLES.includes(state.data.cardStyle || 'classic');

  return (
    <div
      className={`card-stage w-full relative aspect-square overflow-hidden select-none ${isSquare ? (isExport ? 'rounded-none' : 'rounded-md') : 'rounded-[32px] sm:rounded-[36px]'}`}
      style={{
        boxShadow: isExport ? 'none' : '0 20px 50px -10px rgba(11, 27, 61, 0.18)',
        backgroundColor: '#FFFFFF',
      }}
    >
      <CardArtboard
        cardStyle={state.data.cardStyle || 'classic'}
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
