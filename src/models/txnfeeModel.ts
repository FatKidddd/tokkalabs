export interface TxnFee {
  id: string // tx_hash
  timeStamp: number
  gasUsed: bigint
  gasPrice: bigint
  priceETHUSDT: number
  txnFeeUSDT: number // (gasUsed * gasPrice) * binance USDT / ETH
}

export type TxnFeeDB = {
  [K in keyof TxnFee]: string
}
