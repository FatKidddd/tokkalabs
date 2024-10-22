import { TxnFee } from "@/models/txnfeeModel"
import { convertTxnFee, getTxnFee, insertTxnFees } from "@/scripts/db"
import {
  getBinancePrice,
  getHistoricalTxnsByBlockRange,
} from "@/scripts/historical"
import { calculateTxnFeeUSDT } from "@/scripts/utils"
import { Request, Response } from "express"
import { Web3 } from "web3"

const web3 = new Web3()

export const queryTxnFee = async (req: Request, res: Response) => {
  const txnHash = req.path.slice(1) // first character of slug is a /
  try {
    const txnFeeDB = await getTxnFee(txnHash)
    if (!txnFeeDB) {
      const [transactionReceipt, transaction] = await Promise.all([
        web3.eth.getTransactionReceipt(txnHash),
        web3.eth.getTransaction(txnHash),
      ])
      const block = await web3.eth.getBlock(transactionReceipt.blockNumber)
      const gasPrice = BigInt(transaction.gasPrice)
      const gasUsed = transactionReceipt.gasUsed
      const timeStamp = Number(block.timestamp)
      const priceETHUSDT = await getBinancePrice(timeStamp * 1000) // to ms
      if (!priceETHUSDT) {
        res.json({ message: "Binance api down" })
        return
      }
      const txnFeeUSDT = calculateTxnFeeUSDT(gasPrice, gasUsed, priceETHUSDT)
      const txnFeeDB = convertTxnFee({
        id: txnHash,
        timeStamp,
        gasPrice,
        gasUsed,
        priceETHUSDT,
        txnFeeUSDT,
      })
      res.json(txnFeeDB)
    } else {
      res.json(txnFeeDB)
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting txn fee, invalid hash", error })
  }
}

interface BlockRange {
  startBlock: number
  endBlock: number
}

export const processBlockRange = async (req: Request, res: Response) => {
  try {
    const data: BlockRange = req.body
    const { startBlock, endBlock } = data
    // let's set hard limit for block range for now which is based on etherscan api query limit
    if (endBlock - startBlock > 10000) {
      res
        .status(400)
        .json({ message: "Only up till 10000 blocks range accepted for now" })
    } else {
      const historicalTxnFees = await getHistoricalTxnsByBlockRange(
        startBlock,
        endBlock,
      )

      const filteredTxnFees = historicalTxnFees.filter(
        (txnFee) => txnFee !== undefined,
      ) as TxnFee[]

      // insert to db
      insertTxnFees(filteredTxnFees)

      // return to user
      const historicalTxnFeesDB = filteredTxnFees.map(convertTxnFee)
      res.json(historicalTxnFeesDB)
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to process time period", error })
  }
}
