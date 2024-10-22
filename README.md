# Overview

## Getting Started

1. Clone this repository: `git clone git@github.com:FatKidddd/tokkalabs.git`
2. Navigate to the project directory: `cd tokkalabs`
3. Create a .env file from .env.local, fill in missing API keys `cp .env.local .env`
4. Start server (takes 3 mins to build): `sudo docker-compose up --build`
5. Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs) to interact with Swagger UI
6. To stop server: `sudo docker-compose down`

### DB commands

1. To access db: `sudo docker exec -it txnfeesdb psql -U user -d txnfeesdb`
2. To view all txnfees `SELECT * from txnfees;`

## Scripts

Use `yarn`.

- `start`: Start the server using `tsx src/server.ts`.
- `build`: Build the project using `tsup src`.
- `start:dev`: Start the server in development mode using `tsx watch src/server.ts`.
- `husky:prepare`: Install Husky hooks.
- `test`: Run tests using Vitest.
- `test:lint`: Run linting tests using Vitest.

## Planning

### Endpoints

- GET /transaction_fee/(txn_hash)
- POST /transaction_fee/
  - body: { startTime: timeStamp, endTime: timeStamp }

### Functionality

- (txn hash) -> USDT txn fee

  - find in db
    - if found:
      - retrieve from db
      - return USDT txn fee
    - else:
      - query txn hash from etherscan
        - parse fields
      - using timeStamp, query binance API klines with startTime = timeStamp - epsilon, endTime = timeStamp + epsilon, where epsilon is probably some seconds
        - mid = (low + high) / 2
      - add to db
      - return USDT txn fee

- (Batch job) (startBlock, endBlock) -> transactions with all their prices
  - function that takes in (startBlock, endBlock) -> populate db

### DB schema

1. txn hash
2. timeStamp
3. gasUsed
4. gasPrice
5. binance ETHUSDT price
6. txn fee in USDT

### Notes

Useful Binance API
[live data](https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams) - websocket current avg price
[historical data](https://developers.binance.com/docs/binance-spot-api-docs/rest-api#klinecandlestick-data) - use klines / candlesticks OHLC

Useful Etherscan API
[live data](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-subscribe.html) - websocket ERC20 transfers
[historical](https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-erc20-token-transfer-events-by-address) - convert timestamps into closest blocks, query using start and end blocks

### Further improvements

- Use Redis for caching
- (not implemented) making batch processing more efficient by avoiding repeated queries
- (not implemented) make batch processing able to handle larger query range
- Inaccurate pricing dependent on timeframe given to binance API -> should add in uncertainty / another field for resolution

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[Boilerplate](https://github.com/yan-pi/NodeBoilerplate) with TypeScript, Express, ESLint, Prettier, Husky + Lint-staged, and Vitest
