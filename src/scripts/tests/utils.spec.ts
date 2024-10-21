import { test, expect } from "vitest"
import { calculateTxnFeeUSDT } from "../utils"

test("calculateTxnFeeUSDT work for sample", () => {
  const gasPrice = BigInt(199612213130)
  const gasUsed = BigInt(279269)
  const priceETHUSDT = 3259
  const txnFeeUSDT = calculateTxnFeeUSDT(gasPrice, gasUsed, priceETHUSDT)

  expect(txnFeeUSDT).toBe(181.67459476129383)
})
