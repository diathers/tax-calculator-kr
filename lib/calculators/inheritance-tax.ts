import taxData from "@/data/inheritance-tax.json"
import { applyProgressiveRate } from "@/lib/utils"
import type { InheritanceTaxInput, InheritanceTaxResult, BreakdownRow } from "./types"

export function calculateInheritanceTax(input: InheritanceTaxInput): InheritanceTaxResult {
  const {
    totalEstate, financialAssets, debts, funeralCost,
    spouseAlive, spouseInheritance, childCount, minorChildCount, minorChildAges,
    applyResidenceDeduction, residenceValue,
  } = input
  const d = taxData.공제

  const actualFuneralCost = Math.min(funeralCost, d.장례비_한도)
  const taxableEstate = Math.max(0, totalEstate - debts - actualFuneralCost)

  // 금융재산 공제
  const financialDeduction = Math.min(
    Math.floor(financialAssets * d.금융재산_공제율),
    d.금융재산_최대
  )

  // 인적공제
  const childDeduction = childCount * d.자녀_1인당
  const minorDeduction = minorChildAges.reduce((sum, age) => {
    const years = Math.max(0, 19 - age)
    return sum + years * d.미성년_1년당
  }, 0)
  const personalDeduction = taxData.공제.기초공제 + childDeduction + minorDeduction
  const lumpSumDeduction = d.일괄공제

  // 유리한 공제 자동 선택
  const appliedDeduction = Math.max(personalDeduction, lumpSumDeduction)

  // 배우자 공제
  const spouseDeduction = spouseAlive
    ? Math.max(d.배우자_최소, Math.min(spouseInheritance, d.배우자_최대))
    : 0

  // 동거주택 공제
  const residenceDeduction = applyResidenceDeduction
    ? Math.min(Math.floor(residenceValue * d.동거주택_공제율), d.동거주택_한도)
    : 0

  const totalDeduction = appliedDeduction + spouseDeduction + financialDeduction + residenceDeduction
  const taxableBase = Math.max(0, taxableEstate - totalDeduction)

  const calculatedTax = applyProgressiveRate(taxableBase, taxData.세율_구간.map(b => ({
    과표이하: b.과표이하,
    세율: b.세율,
    누진공제: b.누진공제,
  })))

  const filingDiscount = Math.floor(calculatedTax * taxData.신고세액공제율)
  const totalTax = Math.max(0, calculatedTax - filingDiscount)

  const usedLumpSum = appliedDeduction === lumpSumDeduction && personalDeduction < lumpSumDeduction

  const breakdown: BreakdownRow[] = [
    { label: "상속재산 총액", amount: totalEstate, type: "base" },
    { label: "채무", amount: -debts, type: "deduction", indent: true },
    { label: `장례비용 (한도 ${(d.장례비_한도 / 10000).toFixed(0)}만원)`, amount: -actualFuneralCost, type: "deduction", indent: true },
    { label: "상속세 과세가액", amount: taxableEstate, type: "base", highlight: true },
    { label: usedLumpSum ? "일괄공제 (5억)" : "기초공제+인적공제", amount: -appliedDeduction, type: "deduction",
      tooltip: `기초공제 ${(d.기초공제 / 10000).toFixed(0)}만 + 인적공제 ${(( personalDeduction - d.기초공제) / 10000).toFixed(0)}만 vs 일괄공제 5억 → 유리한 방식 자동 적용` },
  ]

  if (spouseDeduction > 0) breakdown.push({ label: "배우자공제", amount: -spouseDeduction, type: "deduction", indent: true })
  if (financialDeduction > 0) breakdown.push({ label: "금융재산공제", amount: -financialDeduction, type: "deduction", indent: true })
  if (residenceDeduction > 0) breakdown.push({ label: "동거주택공제", amount: -residenceDeduction, type: "deduction", indent: true })

  breakdown.push({ label: "과세표준", amount: taxableBase, type: "base", highlight: true })
  breakdown.push({ label: "산출세액", amount: calculatedTax, type: "tax" })
  breakdown.push({ label: "신고세액공제 (3%)", amount: -filingDiscount, type: "deduction" })
  breakdown.push({ label: "최종 납부세액", amount: totalTax, type: "total", highlight: true })

  return {
    taxableEstate, financialDeduction, personalDeduction, lumpSumDeduction, appliedDeduction,
    spouseDeduction, residenceDeduction, totalDeduction, taxableBase, calculatedTax, filingDiscount, totalTax, breakdown,
  }
}
