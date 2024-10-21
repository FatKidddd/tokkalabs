import { test, expect } from 'vitest';
import { getAvgPriceFromKlines, getBinancePrice, getHistoricalTxnsByBlockRange, queryHistoricalTxns } from '../historical';

test('getHistoricalTxnsByBlockRange should work', async () => {
  const sampleStartBlock = 14000000;
  const sampleEndBlock = 15000000;
  // const res = await getHistoricalTxnsByBlockRange(sampleStartBlock, sampleEndBlock);
});

test('queryHistoricalTxns should work', async () => {
  const startBlock = 12376729;
  const endBlock = 12376729;
  const res = await queryHistoricalTxns(startBlock, endBlock);
  expect(res).toEqual({
    "0x125e0b641d4a4b08806bf52c0c6757648c9963bcda8681e4f996f09e00d4c2cc": {
      "gasPrice": 64000000000n,
      "gasUsed": 5201405n,
      "id": "0x125e0b641d4a4b08806bf52c0c6757648c9963bcda8681e4f996f09e00d4c2cc",
      "timeStamp": 1620250931,
    }
  });
});

test('getAvgPriceFromKlines should work', () => {
  const sampleKlines = [
    [1729523811000, '2671.10000000', '2671.10000000', '2671.10000000', '2671.10000000', '1.68700000', 1729523811999, '4506.14570000', 3, '1.68700000', '4506.14570000', '0'],
    [1729523812000, '2671.10000000', '2671.36000000', '2671.10000000', '2671.36000000', '5.01390000', 1729523812999, '13393.73169100', 105, '5.01390000', '13393.73169100', '0'],
    [1729523813000, '2671.36000000', '2671.36000000', '2671.36000000', '2671.36000000', '0.01800000', 1729523813999, '48.08448000', 1, '0.01800000', '48.08448000', '0'],
    [1729523814000, '2671.35000000', '2671.35000000', '2671.35000000', '2671.35000000', '0.05420000', 1729523814999, '144.78717000', 1, '0.00000000', '0.00000000', '0']
  ];
  const res = getAvgPriceFromKlines(sampleKlines);
  expect(res).toBe(2671.26);
});

test('getBinancePrice should work', async () => {
  const sampleTime = 1729523812241; // gives above sampleKlines
  const samplePrice = await getBinancePrice(sampleTime);
  expect(samplePrice).toBe(2671.26);
});




