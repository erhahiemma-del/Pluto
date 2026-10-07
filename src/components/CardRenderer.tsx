import React from 'react';
import { CardSvgArtboard, CardData, CardSvgArtboardProps } from './CardSvgArtboard';

export type { CardData };
export type CardRendererProps = CardSvgArtboardProps;

export const CardRenderer: React.FC<CardRendererProps> = (props) => {
  return <CardSvgArtboard {...props} />;
};
