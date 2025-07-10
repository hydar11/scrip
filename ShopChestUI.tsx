import React, { useState } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';

interface Trade {
  id: string;
  name: string;
  description: string;
  input: {
    type: string;
    item?: string;
    amount: number;
    objectType?: number;
    weiAmount?: number;
  };
  output: {
    type: string;
    item: string;
    amount: number;
    objectType: number;
  };
  ethRequired: number;
}

interface ShopChestUIProps {
  trades: Trade[];
  chestEntityId?: string;
  onClose?: () => void;
}

export function ShopChestUI({ trades, chestEntityId, onClose }: ShopChestUIProps) {
  const { address } = useAccount();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { write: executeTrade, data: tradeData } = useContractWrite({
    address: '0x253eb85B3C953bFE3827CC14a151262482E7189C', // World contract
    abi: [
      {
        name: 'call',
        type: 'function',
        inputs: [
          { name: 'systemId', type: 'bytes32' },
          { name: 'callData', type: 'bytes' }
        ],
        outputs: [],
        stateMutability: 'payable'
      }
    ],
    functionName: 'call'
  });

  const { isLoading: isTransactionPending } = useWaitForTransaction({
    hash: tradeData?.hash,
    onSuccess: () => {
      setIsProcessing(false);
      setSelectedTrade(null);
      // You might want to refresh player inventory here
    },
    onError: () => {
      setIsProcessing(false);
      alert('Transaction failed!');
    }
  });

  const handleTrade = async (trade: Trade) => {
    if (!address) {
      alert('Please connect your wallet first!');
      return;
    }

    setSelectedTrade(trade);
    setIsProcessing(true);

    try {
      // This is a simplified example - you'll need to construct the actual call data
      // based on your shop contract's interface
      const systemId = '0x73796b6f720000000000000000000000736b6f72000000000000000000000000'; // Your system ID
      
      // For now, we'll use a placeholder call data
      const callData = '0x'; // You'll need to encode the actual function call

      executeTrade({
        args: [systemId, callData],
        value: BigInt(trade.ethRequired)
      });
    } catch (error) {
      console.error('Trade execution failed:', error);
      setIsProcessing(false);
      alert('Failed to execute trade!');
    }
  };

  return (
    <div className="shop-chest-ui">
      <div className="shop-header">
        <h2>Shop Chest</h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        )}
      </div>
      
      <div className="trades-container">
        {trades.map((trade) => (
          <div key={trade.id} className="trade-item">
            <div className="trade-info">
              <h3>{trade.name}</h3>
              <p>{trade.description}</p>
              
              <div className="trade-details">
                <div className="input">
                  <span>Input: </span>
                  {trade.input.type === 'eth' ? (
                    <span>{trade.input.amount} ETH</span>
                  ) : (
                    <span>{trade.input.amount} {trade.input.item}</span>
                  )}
                </div>
                
                <div className="arrow">→</div>
                
                <div className="output">
                  <span>Output: </span>
                  <span>{trade.output.amount} {trade.output.item}</span>
                </div>
              </div>
            </div>
            
            <button
              className="trade-button"
              onClick={() => handleTrade(trade)}
              disabled={isProcessing || isTransactionPending}
            >
              {isProcessing && selectedTrade?.id === trade.id ? 'Processing...' : 'Trade'}
            </button>
          </div>
        ))}
      </div>
      
      {isTransactionPending && (
        <div className="transaction-status">
          <p>Transaction pending...</p>
        </div>
      )}
    </div>
  );
}

// Default export for module loading
export default ShopChestUI; 
