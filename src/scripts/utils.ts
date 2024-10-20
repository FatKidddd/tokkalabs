import { Web3 } from "web3";

const web3 = new Web3();

export function calculateTxnFeeUSDT(gasPrice: bigint, gasUsed: bigint, priceETHUSDT: number) {
  const txnFeeEth = parseFloat(web3.utils.fromWei(gasPrice * gasUsed, 'ether'));
  return priceETHUSDT * txnFeeEth;
}
