import express from "express"
import txnFeeRouter from "./routes/txnfeeRoutes"
import { processLive } from "@/scripts/live"
import swaggerUi from "swagger-ui-express"
import * as swaggerDoc from "./swagger"

// Live
processLive()

// Express server
const app = express()

app.use(express.json())

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.use("/txnfee", txnFeeRouter)

const port = 3000
app.listen(port, () => console.log(`Server running on port ${port}`))
