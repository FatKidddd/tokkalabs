import express from 'express';
import { getTxnFee, postProcessTimePeriod } from '@/controllers/txnfeeController';

const router = express.Router();

/**
 * @swagger
 * /txnfee:
 *   get:
 *     summary: Get Uniswapv3 USDC/ETH txn fee in USDT
 *     description: Returns USDT fee with ...
 *     responses:
 *       200:
 *         description: Returns txn with fields [tx_hash, timeStamp, gasUsed, gasPrice, binance rate, USDT fee].
 *       500:
 *         description: Internal server error.
 */
router.get('/', getTxnFee);


/**
 * @swagger
 * /txnfee/process:
 *   post:
 *     summary: Batch process Uniswapv3 USDC/ETH txn fees in USDT
 *     description: Returns USDT fee with ...
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startTime
 *               - endTime
 *             properties:
 *               startTime:
 *                 type: number
 *                 description: milliseconds timestamp to process txns from
 *               endTime:
 *                 type: number
 *                 description: milliseconds timestamp
 *     responses:
 *       201:
 *         description: Returns historical list of txns with fields [tx_hash, timeStamp, gasUsed, gasPrice, binance rate, USDT fee].
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */
router.post('/process', postProcessTimePeriod);


export default router;
