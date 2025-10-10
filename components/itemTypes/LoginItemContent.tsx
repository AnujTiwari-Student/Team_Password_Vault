import React from 'react';
import { LoginItem } from '../types/ItemTypes';
import { UsernameField } from '../fields/UsernameField';
import { PasswordField } from '../fields/PasswordField';
import { URLField } from '../fields/URLField';
import { TOTPField } from '../fields/TOTPField';

interface LoginItemContentProps {
  item: LoginItem;
  copiedField: string | null;
  handleCopy: (text: string, field: string) => void;
}

export const LoginItemContent: React.FC<LoginItemContentProps> = ({ 
  item, 
  copiedField, 
  handleCopy 
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {item.url && (
        <URLField
          url={item.url}
          onCopy={(val) => handleCopy(val, 'url')}
          copied={copiedField === 'url'}
        />
      )}

      {item.username_ct && (
        <UsernameField
          value={item.username_ct}
          onCopy={(val) => handleCopy(val, 'username')}
          copied={copiedField === 'username'}
        />
      )}

      {item.password_ct && (
        <PasswordField
          value={item.password_ct}
          onCopy={(val) => handleCopy(val, 'password')}
          copied={copiedField === 'password'}
        />
      )}

      {item.totp_seed_ct && (
        <TOTPField
          totpSeed={item.totp_seed_ct}
          onCopy={(val) => handleCopy(val, 'totp')}
          copied={copiedField === 'totp'}
        />
      )}
    </div>
  );
};
