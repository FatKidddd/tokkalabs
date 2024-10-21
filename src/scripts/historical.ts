import axios from "axios"
import {
  ETHERSCAN_API_KEY,
  ETHERSCAN_API_URL,
  UNISWAP_USDC_ETH_POOL_ADDRESS,
} from "./constants"
import { TxnFee } from "@/models/txnfeeModel"
import { calculateTxnFeeUSDT } from "./utils"
import _ from "lodash"

interface HistoricalTxn {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  from: string
  contractAddress: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  transactionIndex: string
  gas: string
  gasPrice: string
  gasUsed: string
  cumulativeGasUsed: string
  input: string
  confirmations: string
}

export async function getHistoricalTxnsByBlockRange(
  startBlock: number,
  endBlock: number,
) {
  // let's set hard limit for block range for now,
  // max 1000 blocks if not batch processing will be too slow
  // so this averageQueryBlockRange = 30000 is useless for now,
  // will be useful later on if want to batch process large ranges
  if (endBlock - startBlock > 1000) {
    return "Only up till 1000 blocks range accepted for now"
  }

  // about ~30000 blocks range assuming used max 10000 length result from etherscan query
  const averageQueryBlockRange = 30000
  const timesToQuery = Math.ceil(
    (endBlock - startBlock) / averageQueryBlockRange,
  )

  const finalTxnFees: (TxnFee | undefined)[][] = []
  for (let i = 0; i < timesToQuery; i++) {
    const partialTxnFees = await queryHistoricalTxns(
      startBlock + averageQueryBlockRange * i,
      Math.min(endBlock, startBlock + averageQueryBlockRange * (i + 1)),
    )

    const pricesETHUSDT = await Promise.all(
      Object.values(partialTxnFees).map((partialTxnFee) =>
        // timestamp here is in seconds
        getBinancePrice(partialTxnFee.timeStamp * 1000),
      ),
    )

    const txnFees = _.zipWith(
      Object.values(partialTxnFees),
      pricesETHUSDT,
      (partialTxnFee, priceETHUSDT) => {
        if (!priceETHUSDT) {
          console.log("Got an undefined price")
          return undefined
        }
        const txnFee: TxnFee = {
          ...partialTxnFee,
          priceETHUSDT,
          txnFeeUSDT: calculateTxnFeeUSDT(
            partialTxnFee.gasPrice,
            partialTxnFee.gasUsed,
            priceETHUSDT,
          ),
        }
        return txnFee
      },
    )

    finalTxnFees.push(txnFees)
  }
  return finalTxnFees
}

export async function queryHistoricalTxns(
  startBlock: number,
  endBlock: number,
) {
  // about ~30000 blocks range assuming 10000 long result is returned
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: "account",
        action: "tokentx",
        address: UNISWAP_USDC_ETH_POOL_ADDRESS,
        page: 1,
        offset: 10000, // page * offset max can only be 10000
        startblock: startBlock,
        endblock: endBlock,
        sort: "asc",
        apikey: ETHERSCAN_API_KEY,
      },
    })

    const transactions: HistoricalTxn[] = response.data.result

    // because of different transfer instructions in one transaction
    const incompleteTxnFees: {
      [id: string]: Omit<TxnFee, "priceETHUSDT" | "txnFeeUSDT">
    } = {}
    transactions.forEach((tx) => {
      incompleteTxnFees[tx.hash] = {
        id: tx.hash,
        timeStamp: parseInt(tx.timeStamp),
        gasUsed: BigInt(tx.gasUsed),
        gasPrice: BigInt(tx.gasPrice),
      }
    })
    return incompleteTxnFees
  } catch (error) {
    console.error("Error fetching transactions from Etherscan:", error)
    return {}
  }
}

type Kline = [number, string, string, string, ...unknown[]]

export function getAvgPriceFromKlines(klines: Kline[]) {
  // add type + zod for validation here in future
  const sumOfMidPrices = klines.reduce((prev, cur) => {
    const midPrice = (parseFloat(cur[2]) + parseFloat(cur[3])) / 2
    return prev + midPrice
  }, 0) // mid = (high + low) price
  const avgPrice = sumOfMidPrices / klines.length
  return avgPrice
}

export async function getBinancePrice(timeStamp: number) {
  const timePadding = 2 * 1000 // 2 * 2 = 4 bars

  const baseUrl = "https://api.binance.com/api/v3/klines"
  try {
    const response = await axios.get(baseUrl, {
      params: {
        symbol: "ETHUSDT",
        interval: "1s",
        startTime: timeStamp - timePadding,
        endTime: timeStamp + timePadding,
        limit: 10,
      },
    })
    const klines = response.data
    return getAvgPriceFromKlines(klines)
  } catch (error) {
    console.error("Error fetching klines from Binance:", error)
  }
}
