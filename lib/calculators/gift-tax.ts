import giftTaxData from "@/data/gift-tax.json"
import { applyProgressiveRate } from "@/lib/utils"
import type { GiftTaxInput, GiftTaxResult, BreakdownRow } from "./types"

function getDeductionLimit(input: GiftTaxInput): number {
  const { relationship, isMinor } = input
  const d = giftTaxData.공제_한도
  if (relationship === "배우자") return d.배우자
  if (relationship === "직계존속") return isMinor ? d.직계존속_미성년 : d.직계존속_성인
  if (relationship === "직계비속") return d.직계비속
  return d.기타친족
}

export function calculateGiftTax(input: GiftTaxInput): GiftTaxResult {
  const deductionLimit = getDeductionLimit(input)
  const priorUsed = Math.min(input.priorGifts10Y, deductionLimit)
  const remainingDeduction = Math.max(0, deductionLimit - priorUsed)
  const baseDeduction = Math.min(input.giftValue, remainingDeduction)

  // 혼인·출산 추가공제: 직계존속 → 성인 수증자, 최대 1억원 (상증세법 제53조의2, 2024.1.1~)
  const marriageBirthExtra =
    input.isMarriageOrBirth && input.relationship === "직계존속" && !input.isMinor
      ? giftTaxData.공제_한도.혼인출산_추가공제
      : 0
  const extraDeduction = Math.min(Math.max(0, input.giftValue - baseDeduction), marriageBirthExtra)
  const deduction = baseDeduction + extraDeduction
  const taxableBase = Math.max(0, input.giftValue - deduction)

  const brackets = giftTaxData.세율_구간.map(b => ({
    과표이하: b.과표이하,
    세율: b.세율,
    누진공제: b.누진공제,
  }))
  const calculatedTax = applyProgressiveRate(taxableBase, brackets)

  const filingDiscount = Math.floor(calculatedTax * giftTaxData.신고세액공제율)
  const afterFiling = calculatedTax - filingDiscount
  const surtax = input.isGenerationSkip ? Math.floor(afterFiling * giftTaxData.세대생략_할증율) : 0
  const totalTax = afterFiling + surtax

  const breakdown: BreakdownRow[] = [
    { label: "증여재산가액", amount: input.giftValue, type: "base" },
    { label: `증여재산공제 (${input.relationship})`, amount: -baseDeduction, type: "deduction" },
  ]
  if (extraDeduction > 0) {
    breakdown.push({ label: "혼인·출산 추가공제", amount: -extraDeduction, type: "deduction" })
  }
  breakdown.push(
    { label: "과세표준", amount: taxableBase, type: "base", highlight: true },
    { label: "산출세액", amount: calculatedTax, type: "tax" },
    { label: "신고세액공제 (3%)", amount: -filingDiscount, type: "deduction" },
  )
  if (surtax > 0) {
    breakdown.push({ label: "세대생략 할증 (30%)", amount: surtax, type: "surcharge" })
  }
  breakdown.push({ label: "최종 납부세액", amount: totalTax, type: "total", highlight: true })

  return { deduction, taxableBase, calculatedTax, filingDiscount, surtax, totalTax, breakdown }
}
