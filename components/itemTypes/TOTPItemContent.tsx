import React from 'react';
import { TOTPItem } from '../types/ItemTypes';
import { TOTPField } from '../fields/TOTPField';

interface TOTPItemContentProps {
  item: TOTPItem;
  copiedField: string | null;
  handleCopy: (text: string, field: string) => void;
}

export const TOTPItemContent: React.FC<TOTPItemContentProps> = ({ 
  item, 
  copiedField, 
  handleCopy 
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <TOTPField
        totpSeed={item.totp_seed_ct}
        onCopy={(val) => handleCopy(val, 'totp')}
        copied={copiedField === 'totp'}
      />
    </div>
  );
};
