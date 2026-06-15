import taxData from "@/data/capital-gains-tax.json"
import { applyProgressiveRate } from "@/lib/utils"
import type { CapitalGainsTaxInput, CapitalGainsTaxResult, BreakdownRow } from "./types"

function monthsBetween(a: string, b: string): number {
  const da = new Date(a), db = new Date(b)
  return (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth())
}

function yearsBetween(a: string, b: string): number {
  return Math.floor(monthsBetween(a, b) / 12)
}

function getLthdRate(
  holdingYears: number,
  isExempt1H: boolean,
  residenceYears: number
): number {
  if (holdingYears < 3) return 0

  if (isExempt1H) {
    const holdRates = taxData.장기보유특별공제["1세대1주택_보유"]
    const liveRates = taxData.장기보유특별공제["1세대1주택_거주"]
    let holdRate = 0, liveRate = 0
    for (const b of holdRates) {
      if (holdingYears >= b.년수이상 && (b.년수미만 === null || holdingYears < b.년수미만)) { holdRate = b.율; break }
    }
    for (const b of liveRates) {
      if (residenceYears >= b.년수이상 && (b.년수미만 === null || residenceYears < b.년수미만)) { liveRate = b.율; break }
    }
    return Math.min(holdRate + liveRate, taxData.장기보유특별공제["1세대1주택_최대_합산율"])
  }

  const brackets = taxData.장기보유특별공제["일반"]
  for (const b of brackets) {
    if (holdingYears >= b.년수이상 && (b.년수미만 === null || holdingYears < b.년수미만)) return b.율
  }
  return 0
}

function isHansiExcluded(saleDate: string): boolean {
  const d = new Date(saleDate)
  const start = new Date(taxData.중과_추가세율.한시배제_시작)
  const end = new Date(taxData.중과_추가세율.한시배제_종료)
  return d >= start && d <= end
}

export function calculateCapitalGainsTax(input: CapitalGainsTaxInput): CapitalGainsTaxResult {
  const {
    acquisitionPrice, salePrice, necessaryExpenses,
    acquisitionDate, saleDate,
    residencePeriodYears, homeCountAtSale, isAdjustmentArea,
  } = input

  const holdingMonths = monthsBetween(acquisitionDate, saleDate)
  const holdingYears = yearsBetween(acquisitionDate, saleDate)
  const realizedGain = salePrice - acquisitionPrice - necessaryExpenses

  if (realizedGain <= 0) {
    return {
      realizedGain, lthdRate: 0, lthdAmount: 0, taxableIncome: 0,
      taxRate: 0, calculatedTax: 0, localIncomeTax: 0, totalTax: 0,
      isExempt: false, exemptReason: "양도차익이 없습니다.", isShortTerm: false, isSurtax: false,
      breakdown: [
        { label: "양도차익", amount: realizedGain, type: "base" },
        { label: "납부세액", amount: 0, type: "total", highlight: true },
      ],
    }
  }

  // 단기 판정
  const isShortTerm1Y = holdingMonths < 12
  const isShortTerm2Y = holdingMonths < 24 && !isShortTerm1Y
  const isShortTerm = isShortTerm1Y || isShortTerm2Y

  // 1세대1주택 비과세 판정
  const meetsHolding = holdingYears >= taxData.비과세["1주택_보유년수"]
  const meetsResidence = !isAdjustmentArea || residencePeriodYears >= taxData.비과세["조정지역_거주년수"]
  const is1H1H = homeCountAtSale === 1 && meetsHolding && meetsResidence
  const 고가주택 = taxData.비과세["고가주택_기준"]

  let taxableGain = realizedGain
  let isExempt = false
  let exemptReason = ""

  if (is1H1H && !isShortTerm) {
    if (salePrice <= 고가주택) {
      isExempt = true
      exemptReason = "1세대 1주택 비과세"
    } else {
      // 고가주택 초과분 비율 과세
      taxableGain = Math.floor(realizedGain * (salePrice - 고가주택) / salePrice)
      exemptReason = `고가주택 (${(고가주택 / 100000000).toFixed(0)}억 초과분 과세)`
    }
  }

  if (isExempt) {
    return {
      realizedGain, lthdRate: 0, lthdAmount: 0, taxableIncome: 0,
      taxRate: 0, calculatedTax: 0, localIncomeTax: 0, totalTax: 0,
      isExempt: true, exemptReason, isShortTerm: false, isSurtax: false,
      breakdown: [
        { label: "양도차익", amount: realizedGain, type: "base" },
        { label: exemptReason, amount: 0, type: "info" },
        { label: "납부세액", amount: 0, type: "total", highlight: true },
      ],
    }
  }

  // 다주택 중과
  const isSurtaxApplicable = isAdjustmentArea && homeCountAtSale >= 2 && !isHansiExcluded(saleDate)
  const isSurtax = isSurtaxApplicable && !isShortTerm
  let surtaxRate = 0
  if (isSurtax) {
    surtaxRate = homeCountAtSale === 2
      ? taxData.중과_추가세율.조정2주택
      : taxData.중과_추가세율["조정3주택이상"]
  }

  // 장기보유특별공제 (단기·중과 시 미적용)
  let lthdRate = 0, lthdAmount = 0
  if (!isShortTerm && !isSurtax) {
    lthdRate = getLthdRate(holdingYears, is1H1H, residencePeriodYears)
    lthdAmount = Math.floor(taxableGain * lthdRate)
  }

  const afterLthd = taxableGain - lthdAmount
  const basicDeduction = taxData.기본공제
  const taxableIncome = Math.max(0, afterLthd - basicDeduction)

  // 세율 적용
  let calculatedTax = 0
  let taxRate = 0

  if (isShortTerm1Y) {
    taxRate = taxData.단기_세율["1년미만"]
    calculatedTax = Math.floor(taxableIncome * taxRate)
  } else if (isShortTerm2Y) {
    taxRate = taxData.단기_세율["2년미만"]
    calculatedTax = Math.floor(taxableIncome * taxRate)
  } else {
    const baseTax = applyProgressiveRate(taxableIncome, taxData.일반_세율_구간.map(b => ({
      과표이하: b.max,
      세율: b.rate,
      누진공제: b.deduction,
    })))
    if (isSurtax) {
      calculatedTax = baseTax + Math.floor(taxableIncome * surtaxRate)
      taxRate = (baseTax / (taxableIncome || 1)) + surtaxRate
    } else {
      calculatedTax = baseTax
      taxRate = taxableIncome > 0 ? baseTax / taxableIncome : 0
    }
  }

  const localIncomeTax = Math.floor(calculatedTax * taxData.지방소득세율)
  const totalTax = calculatedTax + localIncomeTax

  const breakdown: BreakdownRow[] = [
    { label: "양도가액", amount: salePrice, type: "base" },
    { label: "취득가액", amount: -acquisitionPrice, type: "deduction" },
    { label: "필요경비", amount: -necessaryExpenses, type: "deduction" },
    { label: "양도차익", amount: realizedGain, type: "base", highlight: true },
  ]

  if (exemptReason) {
    breakdown.push({ label: exemptReason, amount: 0, type: "info" })
    breakdown.push({ label: "과세 대상 양도차익", amount: taxableGain, type: "base" })
  }

  if (lthdAmount > 0) {
    breakdown.push({ label: `장기보유특별공제 (${(lthdRate * 100).toFixed(0)}%)`, amount: -lthdAmount, type: "deduction" })
  }
  breakdown.push({ label: "기본공제", amount: -basicDeduction, type: "deduction" })
  breakdown.push({ label: "과세표준", amount: taxableIncome, type: "base", highlight: true })
  breakdown.push({ label: `산출세액 (${isShortTerm1Y ? "단기70%" : isShortTerm2Y ? "단기60%" : isSurtax ? `중과+${(surtaxRate * 100).toFixed(0)}%` : "일반"})`, amount: calculatedTax, type: "tax" })
  breakdown.push({ label: "지방소득세 (10%)", amount: localIncomeTax, type: "tax" })
  breakdown.push({ label: "최종 납부세액", amount: totalTax, type: "total", highlight: true })

  return {
    realizedGain, lthdRate, lthdAmount, taxableIncome,
    taxRate, calculatedTax, localIncomeTax, totalTax,
    isExempt, exemptReason, isShortTerm, isSurtax,
    breakdown,
  }
}
