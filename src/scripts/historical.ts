import axios from 'axios';
import { ETHERSCAN_API_KEY, ETHERSCAN_API_URL, UNISWAP_USDC_ETH_POOL_ADDRESS } from './constants';
import { TxnFee } from '@/models/txnfeeModel';
import { calculateTxnFeeUSDT } from './utils';
import _ from 'lodash';

interface HistoricalTxn {
  blockNumber: string,
  timeStamp: string,
  hash: string,
  nonce: string,
  blockHash: string,
  from: string,
  contractAddress: string,
  to: string,
  value: string,
  tokenName: string,
  tokenSymbol: string,
  tokenDecimal: string,
  transactionIndex: string,
  gas: string,
  gasPrice: string,
  gasUsed: string,
  cumulativeGasUsed: string,
  input: string,
  confirmations: string,
};

async function getHistoricalTxnsByBlockRange(startBlock: number, endBlock: number) {
  const averageQueryBlockRange = 30000;
  const timesToQuery = Math.ceil((endBlock - startBlock) / averageQueryBlockRange);
  // add zod range limit here
  const finalTxnFees: TxnFee[] = [];
  for (let i = 0; i < timesToQuery; i++) {
    const partialTxnFees = await queryHistoricalTxns(
      startBlock + averageQueryBlockRange * i,
      Math.min(endBlock, startBlock + averageQueryBlockRange * (i + 1))
    );

    const pricesETHUSDT = await Promise.all(
      partialTxnFees.map(partialTxnFee => getBinancePrice(partialTxnFee.timeStamp))
    );

    const txnFees = _.zipWith(partialTxnFees, pricesETHUSDT, (partialTxnFee, priceETHUSDT) => {
      const txnFee: TxnFee = {
        ...partialTxnFee,
        priceETHUSDT,
        txnFeeUSDT: calculateTxnFeeUSDT(partialTxnFee.gasPrice, partialTxnFee.gasUsed, priceETHUSDT)
      };
      return txnFee;
    });

    // write to db
  }
  return finalTxnFees;
}

async function queryHistoricalTxns(startBlock: number, endBlock: number) {
  // about ~30000 blocks range assuming 10000 long result is returned
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'account',
        action: 'tokentx',
        address: UNISWAP_USDC_ETH_POOL_ADDRESS,
        page: 1,
        offset: 10000, // page * offset max can only be 10000
        startblock: startBlock,
        endblock: endBlock,
        sort: 'asc',
        apikey: ETHERSCAN_API_KEY
      }
    });

    const transactions: HistoricalTxn[] = response.data.result;

    // because of different transfer instructions in one transaction
    const incompleteTxnFees: { [id: string]: Omit<TxnFee, "priceETHUSDT" | "txnFeeUSDT"> } = {};
    transactions.forEach(tx => {
      incompleteTxnFees[tx.hash] = {
        id: tx.hash,
        timeStamp: parseInt(tx.timeStamp),
        gasUsed: BigInt(tx.gasUsed),
        gasPrice: BigInt(tx.gasPrice)
      };
    });
    return incompleteTxnFees;
  } catch (error) {
    console.error('Error fetching transactions from Etherscan:', error);
    return {};
  }
}


async function getBinancePrice(timeStamp: number) {
  const timePadding = 2 * 1000; // 2 seconds on each side

  const baseUrl = 'https://api.binance.com/api/v3/klines';
  try {
    const response = await axios.get(baseUrl, {
      params: {
        symbol: 'ETHUSDT',
        interval: '1s',
        startTime: timeStamp - timePadding,
        endTime: timeStamp + timePadding,
        limit: 10,
      }
    });
    const klines = response.data;
    console.log(klines);
    return getAvgPriceFromKlines(klines);
  } catch (error) {
    console.error('Error fetching klines from Binance:', error);
  }
}

function getAvgPriceFromKlines(klines: any[]) {
  // add type + zod for validation here in future
  const sumOfAvg = klines.reduce((prev, cur) => (parseFloat(klines[2]) + parseFloat(klines[3])) / 2); // mid = (high + low) price
  const avgPrice = sumOfAvg / klines.length;
  return avgPrice;
}

/*
"result": [
        {
            "blockNumber": "12376729",
            "timeStamp": "1620250931",
            "hash": "0x125e0b641d4a4b08806bf52c0c6757648c9963bcda8681e4f996f09e00d4c2cc",
            "nonce": "266",
            "blockHash": "0x3496d03e6efd9a02417c713fa0de00915b78581a2eaf0e8b3fce435a96ab02c7",
            "from": "0xb2ef52180d1e5f4835f4e343251286fa84743456",
            "contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "to": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
            "value": "2995507735",
            "tokenName": "USDC",
            "tokenSymbol": "USDC",
            "tokenDecimal": "6",
            "transactionIndex": "59",
            "gas": "5816729",
            "gasPrice": "64000000000",
            "gasUsed": "5201405",
            "cumulativeGasUsed": "9213436",
            "input": "deprecated",
            "confirmations": "8629889"
        },
        {
            "blockNumber": "12376729",
            "timeStamp": "1620250931",
            "hash": "0x125e0b641d4a4b08806bf52c0c6757648c9963bcda8681e4f996f09e00d4c2cc",
            "nonce": "266",
            "blockHash": "0x3496d03e6efd9a02417c713fa0de00915b78581a2eaf0e8b3fce435a96ab02c7",
            "from": "0xc36442b4a4522e871399cd717abdd847ab11fe88",
            "contractAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "to": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
            "value": "999999999871526563",
            "tokenName": "Wrapped Ether",
            "tokenSymbol": "WETH",
            "tokenDecimal": "18",
            "transactionIndex": "59",
            "gas": "5816729",
            "gasPrice": "64000000000",
            "gasUsed": "5201405",
            "cumulativeGasUsed": "9213436",
            "input": "deprecated",
            "confirmations": "8629889"
        },
*/

