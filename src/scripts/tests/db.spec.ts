import { test, expect } from "vitest"
import {
  insertTxnFees,
  getTxnFee,
  deleteTxnFee,
  dbHealthCheck,
  convertTxnFeeDB,
  convertTxnFee,
} from "../db"
import { TxnFee } from "@/models/txnfeeModel"

const sampleTxnFee: TxnFee = {
  id: "0xsampletxhash",
  timeStamp: Date.now(),
  gasUsed: BigInt(21000),
  gasPrice: BigInt(1000000000),
  priceETHUSDT: 3000.5,
  txnFeeUSDT: 42.01,
}

const sampleTxnFeeDB = convertTxnFee(sampleTxnFee)

test("convertTxnFeeDB works (convert values from string to type fields)", () => {
  expect(convertTxnFeeDB(sampleTxnFeeDB)).toEqual(sampleTxnFee)
})

test("convertTxnFee works (convert values to string)", () => {
  expect(convertTxnFee(sampleTxnFee)).toEqual(sampleTxnFeeDB)
})

test("postgreSQL DB is up and connected", async () => {
  const res = await dbHealthCheck()
  expect(res).toBe(true)
})

test("insertTxnFees works with sample", async () => {
  const res = await insertTxnFees([sampleTxnFee])
  expect(res).toBe(true)

  await deleteTxnFee(sampleTxnFee.id)
})

test("getTxnFee works with sample", async () => {
  await insertTxnFees([sampleTxnFee])

  const res = await getTxnFee(sampleTxnFee.id)
  expect(res).toEqual(sampleTxnFee)

  await deleteTxnFee(sampleTxnFee.id)
})

test("getTxnFee fails to find tx hash not in DB", async () => {
  const res = await getTxnFee("0xrandomtxhash")
  expect(res).toBe(undefined)
})

test("deleteTxnFee works when data exists", async () => {
  await insertTxnFees([sampleTxnFee])

  const res = await deleteTxnFee(sampleTxnFee.id)
  expect(res).toBe(true)
})

test("deleteTxnFee fails when data does not exist", async () => {
  const res = await deleteTxnFee(sampleTxnFee.id)
  expect(res).toBe(false)
})
