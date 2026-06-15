import type { CorporateGainsTaxInput, CorporateGainsTaxResult, BreakdownRow } from "./types"

const CORP_TAX_BRACKETS = [
  { max: 200000000,    rate: 0.09 },
  { max: 20000000000,  rate: 0.19 },
  { max: 300000000000, rate: 0.21 },
  { max: null,         rate: 0.24 },
]

function getBaseRate(gain: number): number {
  for (const b of CORP_TAX_BRACKETS) {
    if (b.max === null || gain <= b.max) return b.rate
  }
  return 0.24
}

export function calculateCorporateGainsTax(input: CorporateGainsTaxInput): CorporateGainsTaxResult {
  const { acquisitionPrice, salePrice, necessaryExpenses, corporateType, isNonBusinessLand, isUnregistered } = input

  const gain = salePrice - acquisitionPrice - necessaryExpenses

  if (gain <= 0) {
    return {
      gain, baseRate: 0, additionalRate: 0, totalRate: 0, estimatedTax: 0,
      breakdown: [{ label: "양도차익", amount: gain, type: "base" }, { label: "납부세액", amount: 0, type: "total", highlight: true }],
    }
  }

  const baseRate = getBaseRate(gain)
  let additionalRate = 0

  if (isUnregistered) {
    additionalRate += 0.40
  } else if (isNonBusinessLand) {
    additionalRate += 0.10
  }
  if (corporateType === "부동산법인") {
    additionalRate += 0.20
  }

  const totalRate = Math.min(baseRate + additionalRate, 0.99)
  const estimatedTax = Math.floor(gain * totalRate)

  const breakdown: BreakdownRow[] = [
    { label: "양도가액", amount: salePrice, type: "base" },
    { label: "취득가액", amount: -acquisitionPrice, type: "deduction" },
    { label: "필요경비", amount: -necessaryExpenses, type: "deduction" },
    { label: "양도차익", amount: gain, type: "base", highlight: true },
    { label: `법인세 기본세율 (${(baseRate * 100).toFixed(0)}%)`, amount: Math.floor(gain * baseRate), type: "tax" },
  ]
  if (additionalRate > 0) {
    breakdown.push({ label: `추가 과세 (${(additionalRate * 100).toFixed(0)}%)`, amount: Math.floor(gain * additionalRate), type: "surcharge", indent: true })
  }
  breakdown.push({ label: "추정 세액 합계", amount: estimatedTax, type: "total", highlight: true })
  breakdown.push({ label: "※ 실제 납부세액은 법인 전체 과세표준에 따라 달라집니다", amount: 0, type: "info" })

  return { gain, baseRate, additionalRate, totalRate, estimatedTax, breakdown }
}
