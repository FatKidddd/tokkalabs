import dotenv from "dotenv"
import invariant from "tiny-invariant"
dotenv.config()

export const DB_HOST = process.env.DB_HOST || "localhost"
export const UNISWAP_USDC_ETH_POOL_ADDRESS =
  "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
export const BINANCE_WSS_URL = process.env.BINANCE_WSS_URL as string
export const BINANCE_API_URL = process.env.BINANCE_API_URL as string
export const ETHERSCAN_API_URL = process.env.ETHERSCAN_API_URL as string
export const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY as string
export const INFURA_RPC_WSS_URL = process.env.INFURA_RPC_WSS_URL as string
export const INFURA_API_KEY = process.env.INFURA_API_KEY

invariant(BINANCE_WSS_URL !== undefined, "Add BINANCE_WSS_URL in .env")
invariant(BINANCE_API_URL !== undefined, "Add BINANCE_API_URL in .env")
invariant(ETHERSCAN_API_URL !== undefined, "Add ETHERSCAN_API_URL in .env")
invariant(ETHERSCAN_API_KEY !== undefined, "Add ETHERSCAN_API_KEY in .env")
invariant(INFURA_RPC_WSS_URL !== undefined, "Add INFURA_RPC_WSS_URL in .env")
invariant(INFURA_API_KEY !== undefined, "Add INFURA_API_KEY in .env")
