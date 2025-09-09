import React, { useEffect, useState } from 'react';
import Button from './Button';

interface EthereumProvider {
  on: (event: string, listener: any) => void;
  removeListener: (event: string, listener: any) => void;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isMetaMask?: boolean;
  selectedAddress?: string;
  chainId?: string;
  networkVersion?: string;
  addEventListener: (event: string, listener: any) => void;
  removeEventListener: (event: string, listener: any) => void;
}

const EthereumProviderTest: React.FC = () => {
  const [provider, setProvider] = useState<EthereumProvider | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [chainChangedCount, setChainChangedCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev].slice(0, 10));
  };

  useEffect(() => {
    // Check if Farcaster SDK is available
    if (!window.farcaster || !window.farcaster.wallet) {
      addLog('⚠️ Farcaster SDK not available');
      return;
    }

    const initProvider = async () => {
      try {
        addLog('🔄 Getting Ethereum provider...');
        const ethProvider = await window.farcaster.wallet.getEthereumProvider();
        
        if (!ethProvider) {
          addLog('⚠️ Ethereum provider not available');
          return;
        }

        addLog('✅ Ethereum provider obtained');
        setProvider(ethProvider);

        // Get initial chain ID
        try {
          const currentChainId = await ethProvider.request({ method: 'eth_chainId' });
          setChainId(currentChainId);
          addLog(`🔗 Current chain ID: ${currentChainId}`);
        } catch (error) {
          addLog(`❌ Error getting chain ID: ${error}`);
        }

        // Set up chain changed listener
        const handleChainChanged = (newChainId: string) => {
          setChainId(newChainId);
          setChainChangedCount(prev => prev + 1);
          addLog(`🔄 Chain changed to: ${newChainId}`);
        };

        // Add event listener
        ethProvider.addEventListener('chainChanged', handleChainChanged);

        // Clean up
        return () => {
          if (ethProvider) {
            ethProvider.removeEventListener('chainChanged', handleChainChanged);
          }
        };
      } catch (error) {
        addLog(`❌ Error initializing provider: ${error}`);
      }
    };

    initProvider();
  }, []);

  const handleRequestAccounts = async () => {
    if (!provider) {
      addLog('⚠️ Provider not available');
      return;
    }

    try {
      addLog('🔄 Requesting accounts...');
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      addLog(`✅ Accounts: ${accounts.join(', ')}`);
    } catch (error) {
      addLog(`❌ Error requesting accounts: ${error}`);
    }
  };

  const handleSwitchChain = async () => {
    if (!provider) {
      addLog('⚠️ Provider not available');
      return;
    }

    try {
      // Switch between Ethereum mainnet and Optimism
      const targetChainId = chainId === '0x1' ? '0xa' : '0x1';
      addLog(`🔄 Switching to chain: ${targetChainId}`);
      
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
      
      addLog('✅ Chain switch requested');
    } catch (error) {
      addLog(`❌ Error switching chain: ${error}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
      <h2 className="text-xl font-bold mb-4">Ethereum Provider Test</h2>
      
      <div className="mb-4">
        <p className="text-sm mb-1">Provider Status: {provider ? '✅ Connected' : '❌ Not Connected'}</p>
        <p className="text-sm mb-1">Current Chain ID: {chainId || 'Unknown'}</p>
        <p className="text-sm mb-1">Chain Changed Events: {chainChangedCount}</p>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <Button onClick={handleRequestAccounts} variant="secondary" size="sm">
          Request Accounts
        </Button>
        <Button onClick={handleSwitchChain} variant="secondary" size="sm">
          Switch Chain
        </Button>
      </div>
      
      <div className="mt-4">
        <h3 className="text-md font-semibold mb-2">Logs:</h3>
        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md text-xs h-32 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          ) : (
            <p>No logs yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EthereumProviderTest;