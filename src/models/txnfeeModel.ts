export interface TxnFee {
  id: string; // tx_hash
  timeStamp: number;
  gasUsed: BigInt;
  gasPrice: BigInt;
  binanceETHUSDT: number;
  txnFeeUSDT: number; // (gasUsed * gasPrice) * binance USDT / ETH
};

