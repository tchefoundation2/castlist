// Farcaster SDK type definitions

declare global {
  interface Window {
    farcaster?: {
      signIn: () => Promise<{ fid: number; username: string; pfp_url: string; message: string; signature: string; nonce: string; } | { error: string; }>;
      getUser: () => Promise<{ fid: number; username: string; pfp_url: string; } | null>;
      actions?: {
        ready: () => void;
        signIn: (options: { nonce: string; acceptAuthAddress?: boolean }) => Promise<any>;
      };
      quickAuth?: {
        getToken: () => Promise<{ token: string; }>;
        fetch: (url: string, options?: RequestInit) => Promise<Response>;
      };
      context?: {
        get: () => Promise<{ user?: { fid: number; username: string; pfp_url: string; } }>;
      };
      wallet?: {
        getEthereumProvider: () => Promise<any>;
      };
    };
  }
}

export {};