import { calculateGiftTax } from "./gift-tax"
import { calculateCapitalGainsTax } from "./capital-gains-tax"
import type { EncumberedGiftInput, EncumberedGiftResult, BreakdownRow } from "./types"

export function calculateEncumberedGift(input: EncumberedGiftInput): EncumberedGiftResult {
  const {
    propertyValue, debtAssumed, donorAcquisitionPrice,
    donorAcquisitionDate, giftDate, donorResidencePeriodYears,
    relationship, isAdjustmentArea, isMinor,
  } = input

  // 수증자 과세분 → 증여세 (시가 - 채무인수액)
  const giftPortion = propertyValue - debtAssumed
  const giftResult = calculateGiftTax({
    giftValue: giftPortion,
    relationship,
    isMinor,
    priorGifts10Y: 0,
    isGenerationSkip: false,
    isMarriageOrBirth: false,
  })

  // 증여자 과세분 → 양도소득세 (채무인수액 부분)
  // 취득가액 안분: 원취득가액 × (채무인수액 ÷ 증여재산시가)
  const allocatedAcquisitionPrice = Math.floor(donorAcquisitionPrice * (debtAssumed / propertyValue))
  const capitalResult = calculateCapitalGainsTax({
    acquisitionPrice: allocatedAcquisitionPrice,
    salePrice: debtAssumed,
    necessaryExpenses: 0,
    acquisitionDate: donorAcquisitionDate,
    saleDate: giftDate,
    residencePeriodYears: donorResidencePeriodYears,
    homeCountAtSale: 1,
    isAdjustmentArea,
  })

  // 비교: 단순 증여 시 세액 (채무 없이 전체 가액 증여)
  const simpleGiftResult = calculateGiftTax({
    giftValue: propertyValue,
    relationship,
    isMinor,
    priorGifts10Y: 0,
    isGenerationSkip: false,
    isMarriageOrBirth: false,
  })

  const giftTax = giftResult.totalTax
  const capitalGainsTax = capitalResult.totalTax
  const totalTax = giftTax + capitalGainsTax
  const simpleGiftTax = simpleGiftResult.totalTax
  const comparison = simpleGiftTax - totalTax // 양수 = 부담부증여가 유리

  const breakdown: BreakdownRow[] = [
    { label: "증여재산 시가", amount: propertyValue, type: "base" },
    { label: "채무 인수액 (전세보증금 등)", amount: debtAssumed, type: "info" },
    { label: "순증여액 (시가 - 채무)", amount: giftPortion, type: "base" },
    { label: "", amount: 0, type: "info" },
    { label: "▶ 수증자 납부: 증여세", amount: giftTax, type: "tax", highlight: true },
    { label: "  - 증여재산공제", amount: -giftResult.deduction, type: "deduction", indent: true },
    { label: "  - 과세표준", amount: giftResult.taxableBase, type: "base", indent: true },
    { label: "", amount: 0, type: "info" },
    { label: "▶ 증여자 납부: 양도소득세 (채무 안분)", amount: capitalGainsTax, type: "tax", highlight: true },
    { label: `  - 안분 취득가액 (${donorAcquisitionPrice.toLocaleString()}원 × ${debtAssumed}/${propertyValue})`, amount: allocatedAcquisitionPrice, type: "info", indent: true },
    { label: "  - 양도차익", amount: capitalResult.realizedGain, type: "base", indent: true },
    { label: "", amount: 0, type: "info" },
    { label: "부담부증여 총 세액", amount: totalTax, type: "total", highlight: true },
    { label: "단순 증여 시 세액 (비교)", amount: simpleGiftTax, type: "info" },
    {
      label: comparison >= 0 ? `부담부증여가 ${comparison.toLocaleString()}원 유리` : `단순증여가 ${Math.abs(comparison).toLocaleString()}원 유리`,
      amount: Math.abs(comparison),
      type: comparison >= 0 ? "deduction" : "surcharge",
      highlight: true,
    },
  ]

  return { giftPortion, giftTax, capitalGainsPortion: debtAssumed, capitalGainsTax, totalTax, simpleGiftTax, comparison, breakdown }
}
