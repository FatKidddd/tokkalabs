import { TxnFee, TxnFeeDB } from "@/models/txnfeeModel"
import { Pool } from "pg"

const pool = new Pool({
  host: "db",
  port: 5432,
  user: "user",
  password: "pass",
  database: "txnfeesdb",
})

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
})

export async function dbHealthCheck() {
  try {
    const client = await pool.connect()
    client.release()
    return true
  } catch (err) {
    return false
  }
}

export async function insertTxnFee(txnFee: TxnFee) {
  const query = `
    INSERT INTO txnfees ("id", "timeStamp", "gasUsed", "gasPrice", "priceETHUSDT", "txnFeeUSDT")
    VALUES ($1, $2, $3, $4, $5, $6)
  `

  const values = [
    txnFee.id,
    txnFee.timeStamp,
    txnFee.gasUsed,
    txnFee.gasPrice,
    txnFee.priceETHUSDT,
    txnFee.txnFeeUSDT,
  ]

  const client = await pool.connect()
  try {
    await client.query(query, values)
    // console.log("Txn fee inserted successfully")
    return true
  } catch (err) {
    console.error("Error inserting txn fee", err)
    return false
  } finally {
    client.release()
  }
}

export async function getTxnFee(txnHash: string): Promise<TxnFee | undefined> {
  const query = "SELECT * FROM txnfees WHERE id = $1"
  const client = await pool.connect()
  try {
    const result = await client.query(query, [txnHash])
    return result.rows.length > 0 ? convertTxnFeeDB(result.rows[0]) : undefined
  } catch (err) {
    console.error("Error getting txn fee", err)
    return undefined
  } finally {
    client.release()
  }
}

export async function deleteTxnFee(txnHash: string) {
  const deleteQuery = "DELETE FROM txnfees WHERE id = $1"

  const client = await pool.connect()
  try {
    const result = await client.query(deleteQuery, [txnHash])
    if (result.rowCount !== null && result.rowCount > 0) {
      // console.log(`Transaction with id ${txnHash} deleted successfully.`)
      return true
    } else {
      // console.log(`No transaction found with id ${txnHash}.`)
      return false
    }
  } catch (err) {
    console.error("Error deleting transaction:", err) // Detailed error message
  } finally {
    client.release()
  }
}

export function convertTxnFeeDB(txnfeeDB: TxnFeeDB | undefined) {
  if (txnfeeDB === undefined) return undefined

  const { id, timeStamp, gasUsed, gasPrice, priceETHUSDT, txnFeeUSDT } =
    txnfeeDB
  const txnfee: TxnFee = {
    id,
    timeStamp: Number(timeStamp),
    gasUsed: BigInt(gasUsed),
    gasPrice: BigInt(gasPrice),
    priceETHUSDT: parseFloat(priceETHUSDT),
    txnFeeUSDT: parseFloat(txnFeeUSDT),
  }
  return txnfee
}

export function convertTxnFee(txnFee: TxnFee | undefined) {
  if (txnFee === undefined) return undefined

  const txnFeeDB = Object.fromEntries(
    Object.entries(txnFee).map(([key, value]) => [key, String(value)]),
  ) as TxnFeeDB
  return txnFeeDB
}
