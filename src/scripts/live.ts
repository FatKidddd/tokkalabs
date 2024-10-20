import WebSocket from 'ws';
import { EventLog, Web3 } from 'web3';
import { BINANCE_WSS_URL, INFURA_API_KEY, INFURA_RPC_WSS_URL, UNISWAP_USDC_ETH_POOL_ADDRESS } from './constants';
import { abi } from './contractData';
import invariant from 'tiny-invariant';
import { TxnFee } from '@/models/txnfeeModel';

const web3 = new Web3(
  !INFURA_API_KEY // server is currently down
    ? `${INFURA_RPC_WSS_URL}/${INFURA_API_KEY}`
    : "wss://eth-mainnet.ws.alchemyapi.io/ws/demo"
);

export async function createTxnFeeFromSwapEvent(data: EventLog, latestETHUSDT: [number, number]): Promise<TxnFee> {
  const swapEventTime = Date.now();

  const [transactionReceipt, transaction] = await Promise.all([
    web3.eth.getTransactionReceipt(data.transactionHash as string),
    web3.eth.getTransaction(data.transactionHash as string)
  ]);
  const gasPrice = BigInt(transaction.gasPrice); // might want to use BN here
  const gasUsed = transactionReceipt.gasUsed;
  const [priceETHUSDT, timeStamp] = latestETHUSDT; // priceETHUSDT is 1 eth = ~2600 usdt
  const txnFeeEth = parseFloat(web3.utils.fromWei(gasPrice * gasUsed, 'ether'));

  const delayThreshold = 3 * 1000; // 3 seconds
  invariant(swapEventTime + delayThreshold >= timeStamp, "Latency is too huge which will cause inaccurate prices");
  const feeUSDT = priceETHUSDT * txnFeeEth;

  return {
    id: transactionReceipt.transactionHash,
    timeStamp,
    gasUsed,
    gasPrice,
    binanceETHUSDT: priceETHUSDT,
    txnFeeUSDT: feeUSDT
  };
};

export function processLive() {
  let latestETHUSDT: [number, number] | null = null; // [price, timestamp]

  // Live Binance
  const pair = "ethusdt";
  const ws = new WebSocket(`${BINANCE_WSS_URL}/ws/${pair}@trade`);
  ws.on('message', (data?: string) => {
    if (data) {
      const trade: any = JSON.parse(data); // price is in 8 decimals
      latestETHUSDT = [parseFloat(trade.p), Date.now()];
    }
  });

  // Live pool
  const contractAddress = UNISWAP_USDC_ETH_POOL_ADDRESS;
  const contract = new web3.eth.Contract(abi, contractAddress, web3.getContextObject());
  const swapEvent = contract.events.Swap();

  swapEvent.on("data", (data) => {
    if (latestETHUSDT !== null) {
      createTxnFeeFromSwapEvent(data, latestETHUSDT);
    }
  });
  swapEvent.on("error", (error) => console.log("swapEvent error", error));
}

// - write to db functionality
// - do historical
// - make endpoints
// - write tests
