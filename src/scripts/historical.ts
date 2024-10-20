import axios from 'axios';
import { ETHERSCAN_API_KEY, ETHERSCAN_API_URL, UNISWAP_USDC_ETH_POOL_ADDRESS } from './constants';

// Function to fetch transactions from Etherscan
async function fetchTransactions() {
  try {
    const response = await axios.get(`${ETHERSCAN_API_URL}`, {
      params: {
        module: 'account',
        action: 'tokentx',
        address: UNISWAP_USDC_ETH_POOL_ADDRESS,
        page: 1,
        offset: 100,
        startblock: 0, // change these
        endblock: 21005992, // change these
        sort: 'asc',
        apikey: ETHERSCAN_API_KEY
      }
    });

    const transactions = response.data.result;

    // Map the transaction data to get [tx hash, timestamp, gas used, gas price]
    const txData = transactions.map(tx => {
      return [
        tx.hash,
        parseInt(tx.timeStamp),
        BigInt(tx.gasUsed),
        BigInt(tx.gasPrice)
      ];
    });

    return txData;
  } catch (error) {
    console.error('Error fetching transactions from Etherscan:', error);
    return [];
  }
}

// Function to fetch ETH/USDT price from Binance API
async function getETHPriceInUSDT() {
  try {
    const response = await axios.get(BINANCE_API_URL, {
      params: {
        symbol: 'ETHUSDT'  // Fetching average price for ETH/USDT
      }
    });

    const ethPrice = parseFloat(response.data.price);
    return ethPrice;
  } catch (error) {
    console.error('Error fetching ETH price from Binance:', error);
    return null;
  }
}

// Function to add USDT value to each transaction based on gas price and ETH price
async function addUSDTFeeToTransactions(txData) {
  const ethPriceInUSDT = await getETHPriceInUSDT();
  if (!ethPriceInUSDT) {
    console.error('Unable to fetch ETH price. Skipping fee calculations.');
    return txData;
  }

  const updatedTxData = txData.map(tx => {
    const [txHash, timestamp, gasUsed, gasPriceWei] = tx;
    const gasPriceGwei = gasPriceWei / 1e9;
    const txFeeETH = (gasUsed * gasPriceGwei) / 1e9; // Convert to ETH (Wei to Ether)
    const txFeeUSDT = txFeeETH * ethPriceInUSDT;
    return [...tx, txFeeUSDT];
  });
  return updatedTxData;
}

// Main function to run the entire process
(async () => {
  // Step 1: Fetch transactions from Etherscan
  const transactions = await fetchTransactions();
  if (transactions.length === 0) {
    console.log('No transactions found.');
    return;
  }

  // Step 2: Add USDT fee to each transaction
  const transactionsWithUSDT = await addUSDTFeeToTransactions(transactions);

  // Output the final result
  console.log('Transactions with USDT fee:', transactionsWithUSDT);
})();

// Function to query Binance API for candlestick data
async function getBinanceKlines(symbol, interval, startTime, endTime) {
  const baseUrl = 'https://api.binance.com/api/v3/klines';

  try {
    // Prepare query parameters
    const params = {
      symbol: symbol,       // e.g., 'ETHUSDT'
      interval: interval,   // e.g., '1m' for 1-minute candlesticks
      startTime: startTime, // Optional: start time in milliseconds
      endTime: endTime,     // Optional: end time in milliseconds
      limit: 500            // Optional: Max number of results (default: 500)
    };

    // Send the GET request
    const response = await axios.get(baseUrl, { params });

    // The response data contains an array of klines
    const klines = response.data;

    // Print the first kline for demonstration
    console.log('Kline:', klines[0]);

    return klines;
  } catch (error) {
    console.error('Error fetching klines from Binance:', error);
  }
}



// Example Usage
// Define the symbol and interval, and optional start and end times
const symbol = 'ETHUSDT';
const interval = '1m';  // 1-minute interval
const startTime = Date.now() - 60 * 60 * 1000;  // 1 hour ago in milliseconds
const endTime = Date.now();  // Current time

// Query Binance API
getBinanceKlines(symbol, interval, startTime, endTime);



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

