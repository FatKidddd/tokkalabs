import { DB_HOST } from "@/constants"
import { TxnFee, TxnFeeDB } from "@/models/txnfeeModel"
import { Pool } from "pg"

const pool = new Pool({
  host: DB_HOST,
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

export async function insertTxnFees(txnFees: TxnFee[]) {
  // Base query for inserting multiple rows
  const baseQuery = `
        INSERT INTO txnfees ("id", "timeStamp", "gasUsed", "gasPrice", "priceETHUSDT", "txnFeeUSDT")
        VALUES
    `

  // Generate the placeholders dynamically depending on the number of rows
  const valuePlaceholders = txnFees
    .map(
      (_, i) =>
        `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${
          i * 6 + 5
        }, $${i * 6 + 6})`,
    )
    .join(", ")

  // Combine the base query with the generated value placeholders
  const query = baseQuery + valuePlaceholders

  // Flatten the values into a single array
  const values = txnFees.flatMap((txnFee) => [
    txnFee.id,
    txnFee.timeStamp,
    txnFee.gasUsed,
    txnFee.gasPrice,
    txnFee.priceETHUSDT,
    txnFee.txnFeeUSDT,
  ])

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
