export interface SessionState {
  isActive: boolean;
  expiresAt: number | null;
  remainingTime: number;
  isWarning: boolean;
}

export interface SessionManager {
  startSession: () => void;
  endSession: () => void;
  extendSession: () => void;
  getSessionState: () => SessionState;
  isSessionValid: () => boolean;
  getRemainingTime: () => number;
}

export interface DecryptionSession {
  itemId: string;
  decryptedAt: number;
  expiresAt: number;
}
