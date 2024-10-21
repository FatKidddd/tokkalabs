import swaggerJsdoc from "swagger-jsdoc"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Uniswap USDC/ETH Transaction Fees in USDT",
      version: "1.0.0",
      description: "",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
}

const specs = swaggerJsdoc(options)

module.exports = specs
