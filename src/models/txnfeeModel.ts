export interface TxnFee {
  id: string; // tx_hash
  timeStamp: number;
  gasUsed: number;
  gasPrice: number;
  binanceUSDTperETH: number;
  txFeeUSDT: number; // (gasUsed * gasPrice) * binance USDT / ETH
};
