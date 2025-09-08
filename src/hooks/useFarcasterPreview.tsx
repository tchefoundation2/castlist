import { useState, useEffect } from 'react';

export interface FarcasterPreviewInfo {
  isInPreview: boolean;
  isFarcasterClient: boolean;
  userAgent: string;
}

export const useFarcasterPreview = (): FarcasterPreviewInfo => {
  const [previewInfo, setPreviewInfo] = useState<FarcasterPreviewInfo>({
    isInPreview: false,
    isFarcasterClient: false,
    userAgent: ''
  });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isInPreview = window.location.hostname.includes('farcaster.xyz') || 
                       window.location.hostname.includes('preview');
    const isFarcasterClient = !!window.farcaster || 
                             userAgent.includes('Farcaster') ||
                             userAgent.includes('Warpcast');

    setPreviewInfo({
      isInPreview,
      isFarcasterClient,
      userAgent
    });
  }, []);

  return previewInfo;
};
