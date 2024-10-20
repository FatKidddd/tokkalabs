import { test, expect } from 'vitest';
import { EventLog } from 'web3';
import { createTxnFeeFromSwapEvent } from './live';

test('createTxnFeeFromSwapEvent works with sample swapEvent and binance data', async () => {
  const swapEventSample: EventLog = {
    address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
    blockHash: '0x885b8ab831d7b3860872035194998b200dfb54048a680e015ed3f1374bbb110e',
    blockNumber: 21006281n,
    data: '0x000000000000000000000000000000000000000000000000000000001e639ce8fffffffffffffffffffffffffffffffffffffffffffffffffd545ddfe3feeb5f0000000000000000000000000000000000004be8273804bc20f72956dde22b9d000000000000000000000000000000000000000000000000897d5ab2ebc0e27c000000000000000000000000000000000000000000000000000000000003037f',
    logIndex: 40n,
    topics: [
      '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67',
      '0x0000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
      '0x0000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad'
    ],
    transactionHash: '0xb010f6b0d74657c5e4735b46b451b307b4f0ff7b927b9b1a2042fb2aea634c8e',
    transactionIndex: 25n,
    returnValues: {
      '0': '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      '1': '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      '2': 509844712n,
      '3': -192425667885864097n,
      '4': 1539573791614773368224777597234077n,
      '5': 9907174479790924412n,
      '6': 197503n,
      __length__: 7,
      sender: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      recipient: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      amount0: 509844712n,
      amount1: -192425667885864097n,
      sqrtPriceX96: 1539573791614773368224777597234077n,
      liquidity: 9907174479790924412n,
      tick: 197503n
    },
    event: 'Swap',
    signature: '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67',
    raw: {
      data: '0x000000000000000000000000000000000000000000000000000000001e639ce8fffffffffffffffffffffffffffffffffffffffffffffffffd545ddfe3feeb5f0000000000000000000000000000000000004be8273804bc20f72956dde22b9d000000000000000000000000000000000000000000000000897d5ab2ebc0e27c000000000000000000000000000000000000000000000000000000000003037f',
      topics: [
        '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67',
        '0x0000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
        '0x0000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad'
      ]
    }
  };

  const latestETHUSDTSample: [number, number] = [2650, Date.now()];

  const txnFee = await createTxnFeeFromSwapEvent(swapEventSample, latestETHUSDTSample);

  const { timeStamp, ...withoutTimeStamp } = txnFee;

  expect(withoutTimeStamp).toEqual({
    binanceETHUSDT: 2650,
    gasPrice: 9671994085n,
    gasUsed: 479914n,
    id: "0xb010f6b0d74657c5e4735b46b451b307b4f0ff7b927b9b1a2042fb2aea634c8e",
    txnFeeUSDT: 12.300572228668027,
  });
});

