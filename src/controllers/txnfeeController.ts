import { convertTxnFee, getTxnFee } from "@/scripts/db"
import { getHistoricalTxnsByBlockRange } from "@/scripts/historical"
import { Request, Response } from "express"

export const queryTxnFee = async (req: Request, res: Response) => {
  const txnHash = req.path.slice(1) // first character of slug is a /
  try {
    const txnFeeDB = await getTxnFee(txnHash)
    if (!txnFeeDB) {
      res.json({ message: "Txn fee not found" })
    } else {
      res.json(txnFeeDB)
    }
  } catch (error) {
    res.status(500).json({ message: "Error getting txn fee", error })
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
      const historicalTxnFeesDB = historicalTxnFees.map(convertTxnFee)
      res.json(historicalTxnFeesDB)
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to process time period", error })
  }
}
