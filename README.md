# Overview

## Getting Started

1. Clone this repository: `git clone git@github.com:FatKidddd/tokkalabs.git`
2. Navigate to the project directory: `cd tokkalabs`
3. Install dependencies: `yarn install`
4. Start the server: `yarn start`

## Scripts

Use `yarn`.

- `start`: Start the server using `tsx src/server.ts`.
- `build`: Build the project using `tsup src`.
- `start:dev`: Start the server in development mode using `tsx watch src/server.ts`.
- `husky:prepare`: Install Husky hooks.
- `test`: Run tests using Vitest.
- `test:lint`: Run linting tests using Vitest.


## Planning

### Tasks

- Get transaction fee in USDT for all Uniswap WETH USDC txns with the below functionality

### Endpoints

- GET /transaction_fee/(tx_hash)
- POST /transaction_fee/
  - body: { startTime: timeStamp, endTime: timeStamp }

### Functionality

- (Tx hash) -> USDT tx fee
  - find in db
    - if found:
      - retrieve from db
      - return USDT tx fee
    - else:
      - query tx hash from etherscan
        - parse fields
      - using timeStamp, query binance API klines with startTime = timeStamp - epsilon, endTime = timeStamp + epsilon, where epsiolon is probably some seconds
        - mid = (low + high) / 2
      - add to db
      - return USDT tx fee

- (Batch job) (startTime, endTime) -> transactions with all their prices
  - function that takes in (startTime, endTime) -> populate db
  - split into multiple batches by pagination limit of binance and etherscan api
  - (not implemented) making this more efficient by avoiding repeated queries
    - can be done by querying in db all txns within time period, then make query for every time period gap between each txn.

### DB schema

1. tx hash
2. timeStamp
3. gasUsed
4. gasPrice
5. binance USDT/ETH price
6. tx fee in USDT = (gasUsed * gasPrice) * binance USDT/ETH

### Notes

Useful Binance API
[live data](https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams) - websocket current avg price
[historical data](https://developers.binance.com/docs/binance-spot-api-docs/rest-api#klinecandlestick-data) - use klines / candlesticks OHLC

Useful Etherscan API
[live data]() - websocket ERC20 transfers
[historical]() - convert timestamps into closest blocks, query using start and end blocks

### Further improvements

- Use Redis for caching
- Improve batch processing functionality as mentioned above
- Inaccurate pricing dependent on timeframe given to binance API -> should add in uncertainty / another field for resolution

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[Boilerplate](https://github.com/yan-pi/NodeBoilerplate) with TypeScript, Express, ESLint, Prettier, Husky + Lint-staged, and Vitest

