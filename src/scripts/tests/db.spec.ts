import { test, expect } from "vitest"
import {
  insertTxnFee,
  getTxnFee,
  deleteTxnFee,
  dbHealthCheck,
  convertTxnFeeDB,
} from "../db"
import { TxnFee, TxnFeeDB } from "@/models/txnfeeModel"

const sampleTxnFee: TxnFee = {
  id: "0xsampletxhash",
  timeStamp: Date.now(),
  gasUsed: BigInt(21000),
  gasPrice: BigInt(1000000000),
  priceETHUSDT: 3000.5,
  txnFeeUSDT: 42.01,
}

const sampleTxnFeeDB = Object.fromEntries(
  Object.entries(sampleTxnFee).map(([key, value]) => [key, String(value)]),
) as TxnFeeDB

test("convertTxnFeeDB works (convert values from string to type fields)", () => {
  expect(convertTxnFeeDB(sampleTxnFeeDB)).toEqual(sampleTxnFee)
})

test("postgreSQL DB is up and connected", async () => {
  const res = await dbHealthCheck()
  expect(res).toBe(true)
})

test("insertTxnFee works with sample", async () => {
  const res = await insertTxnFee(sampleTxnFee)
  expect(res).toBe(true)

  await deleteTxnFee(sampleTxnFee.id)
})

test("getTxnFee works with sample", async () => {
  await insertTxnFee(sampleTxnFee)

  const res = await getTxnFee(sampleTxnFee.id)
  expect(res).toEqual(sampleTxnFee)

  await deleteTxnFee(sampleTxnFee.id)
})

test("getTxnFee fails to find tx hash not in DB", async () => {
  const res = await getTxnFee("0xrandomtxhash")
  expect(res).toBe(undefined)
})

test("deleteTxnFee works when data exists", async () => {
  await insertTxnFee(sampleTxnFee)

  const res = await deleteTxnFee(sampleTxnFee.id)
  expect(res).toBe(true)
})

test("deleteTxnFee fails when data does not exist", async () => {
  const res = await deleteTxnFee(sampleTxnFee.id)
  expect(res).toBe(false)
})