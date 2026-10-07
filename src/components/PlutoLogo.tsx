import React from 'react';
import { PLUTO_LOGO_URL } from '../constants/brand';

interface PlutoLogoProps {
  className?: string;
  variant?: 'blue' | 'white';
  showWordmark?: boolean; // Kept for interface compatibility, but official image asset includes full wordmark
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PlutoLogo: React.FC<PlutoLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-11',
    xl: 'h-12 sm:h-14',
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={PLUTO_LOGO_URL}
        alt="Pluto by VerifyMe"
        crossOrigin="anonymous"
        className={`${sizeClasses[size]} w-auto object-contain shrink-0`}
      />
    </div>
  );
};
