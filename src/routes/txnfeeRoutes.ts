import express from "express"
import { queryTxnFee, processBlockRange } from "@/controllers/txnfeeController"

const router = express.Router()

/**
 * @swagger
 * /txnfee/{txn_hash}:
 *   get:
 *     summary: Get Uniswapv3 USDC/ETH txn fee in USDT
 *     description: Returns USDT fee for a specific transaction based on txn_hash.
 *     parameters:
 *       - name: txn_hash
 *         in: path
 *         required: true
 *         description: The transaction hash to retrieve the fee for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns txn with fields [txn_hash, timeStamp, gasUsed, gasPrice, binance rate, USDT fee].
 *       500:
 *         description: Internal server error.
 */
router.get("/:txn_hash", queryTxnFee)

/**
 * @swagger
 * /txnfee/process:
 *   post:
 *     summary: Batch process Uniswapv3 USDC/ETH txn fees in USDT
 *     description: Processes the transaction fees within the specified block range. The block range is limited to 1000 blocks at a time.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startBlock
 *               - endBlock
 *             properties:
 *               startBlock:
 *                 type: number
 *                 description: The starting block number to process.
 *                 example: 14000000
 *               endBlock:
 *                 type: number
 *                 description: The ending block number to process.
 *                 example: 14000100
 *     responses:
 *       201:
 *         description: Returns the processed transaction fees with details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Txn hash.
 *                   timeStamp:
 *                     type: string
 *                     description: Timestamp of txn.
 *                   gasUsed:
 *                     type: string
 *                     description: The amount of gas used.
 *                   gasPrice:
 *                     type: string
 *                     description: The gas price in Gwei.
 *                   priceETHUSDT:
 *                     type: string
 *                     description: Float Binance ETHUSDT.
 *                   txnFeeUSDT:
 *                     type: string
 *                     description: The transaction fee in USDT.
 *             example:
 *               - id: "0xe2b679502b727aa9edc793738003d86063853c307a1622b3935b6ac11a2c5308"
 *                 timeStamp: "1642116237"
 *                 gasUsed: "152544"
 *                 gasPrice: "255193304814"
 *                 priceETHUSDT: "3259.6939999999995"
 *                 txnFeeUSDT: "126.89404438443081"
 *               - id: "0xd3b679502b727aa9edc793738003d86063853c307a1622b3935b6ac11a2c5409"
 *                 timeStamp: "1642116240"
 *                 gasUsed: "162000"
 *                 gasPrice: "255000000000"
 *                 priceETHUSDT: "3260.0000"
 *                 txnFeeUSDT: "130.00000000000000"
 *       400:
 *         description: Invalid block range provided (e.g., block range greater than 10000 or missing required fields).
 *       500:
 *         description: Internal server error.
 */
router.post("/process", processBlockRange)

export default router
