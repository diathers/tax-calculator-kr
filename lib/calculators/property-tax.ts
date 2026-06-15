import taxData from "@/data/property-tax.json"
import { applyProgressiveRate } from "@/lib/utils"
import type { PropertyTaxInput, PropertyTaxResult, BreakdownRow } from "./types"

export function calculatePropertyTax(input: PropertyTaxInput): PropertyTaxResult {
  const { officialPrice, homeCount, is1H1H, isAdjustmentArea, ownerAge, holdingYears } = input
  const ptData = taxData.재산세
  const ctData = taxData.종부세

  // 재산세
  const propertyTaxBase = Math.floor(officialPrice * ptData.공정시장가액비율)
  const propertyTax = applyProgressiveRate(propertyTaxBase, ptData.주택_세율.map(b => ({
    과표이하: b.과표이하,
    세율: b.세율,
    누진공제: b.누진공제,
  })))
  const localEducationTax = Math.floor(propertyTax * ptData.지방교육세율)
  const propertyTaxTotal = propertyTax + localEducationTax

  // 종합부동산세
  const basicDeduction = is1H1H ? ctData.기본공제["1세대1주택"] : ctData.기본공제["일반"]
  const compreTaxBase = Math.max(0, Math.floor((officialPrice - basicDeduction) * ctData.공정시장가액비율))

  let compreTax = 0
  let ruralSpecialTax = 0
  let seniorDiscount = 0
  let longHoldDiscount = 0

  if (compreTaxBase > 0) {
    const useHeavyRate = (isAdjustmentArea && homeCount === 2) || homeCount >= 3
    const brackets = useHeavyRate ? ctData.주택_중과_세율 : ctData.주택_일반_세율
    const rawCompreTax = applyProgressiveRate(compreTaxBase, brackets.map(b => ({
      과표이하: b.과표이하,
      세율: b.세율,
      누진공제: b.누진공제,
    })))

    // 1세대1주택자 세액공제
    if (is1H1H) {
      // 고령자공제
      let seniorRate = 0
      for (const b of ctData["1세대1주택_고령자_공제"]) {
        if ((b.나이미만 === null || ownerAge < b.나이미만) && ownerAge >= b.나이이상) {
          seniorRate = b.율; break
        }
      }
      // 장기보유공제
      let longRate = 0
      for (const b of ctData["1세대1주택_장기보유_공제"]) {
        if ((b.년수미만 === null || holdingYears < b.년수미만) && holdingYears >= b.년수이상) {
          longRate = b.율; break
        }
      }
      const combinedRate = Math.min(seniorRate + longRate, ctData.공제_최대합산율)
      const totalDiscount = Math.floor(rawCompreTax * combinedRate)
      // breakdown 표시용: 합산 한도(80%) 초과 시 비율로 분배
      const sumRate = seniorRate + longRate
      if (sumRate > 0) {
        seniorDiscount = Math.floor(totalDiscount * seniorRate / sumRate)
        longHoldDiscount = totalDiscount - seniorDiscount
      }
      compreTax = Math.max(0, rawCompreTax - totalDiscount)
    } else {
      compreTax = rawCompreTax
    }

    // 재산세 중복 공제 (이중과세 조정)
    const propertyTaxCredit = propertyTaxBase > 0
      ? Math.floor(propertyTax * (compreTaxBase / propertyTaxBase))
      : 0
    compreTax = Math.max(0, compreTax - propertyTaxCredit)

    ruralSpecialTax = Math.floor(compreTax * ctData.농어촌특별세율)
  }

  const compreTaxTotal = compreTax + ruralSpecialTax
  const grandTotal = propertyTaxTotal + compreTaxTotal

  const breakdown: BreakdownRow[] = [
    { label: "공시가격", amount: officialPrice, type: "base" },
    { label: `재산세 과세표준 (공정시장가액비율 ${ptData.공정시장가액비율 * 100}%)`, amount: propertyTaxBase, type: "base", indent: true },
    { label: "재산세", amount: propertyTax, type: "tax" },
    { label: "지방교육세 (재산세의 20%)", amount: localEducationTax, type: "tax", indent: true },
    { label: "재산세 합계", amount: propertyTaxTotal, type: "base", highlight: true },
  ]

  if (compreTaxBase > 0) {
    breakdown.push({ label: `종부세 과세표준 (공시가 - ${(basicDeduction / 100000000).toFixed(0)}억 공제)`, amount: compreTaxBase, type: "base" })
    if (seniorDiscount > 0) breakdown.push({ label: "고령자 공제", amount: -seniorDiscount, type: "deduction", indent: true })
    if (longHoldDiscount > 0) breakdown.push({ label: "장기보유 공제", amount: -longHoldDiscount, type: "deduction", indent: true })
    breakdown.push({ label: "종합부동산세", amount: compreTax, type: "tax" })
    breakdown.push({ label: "농어촌특별세 (종부세의 20%)", amount: ruralSpecialTax, type: "tax", indent: true })
    breakdown.push({ label: "종부세 합계", amount: compreTaxTotal, type: "base", highlight: true })
  } else {
    breakdown.push({ label: `종합부동산세 (공시가 ${(basicDeduction / 100000000).toFixed(0)}억 이하 비과세)`, amount: 0, type: "info" })
  }

  breakdown.push({ label: "보유세 총합계", amount: grandTotal, type: "total", highlight: true })

  return {
    propertyTaxBase, propertyTax, localEducationTax, propertyTaxTotal,
    compreTaxBase, compreTax, seniorDiscount, longHoldDiscount, ruralSpecialTax, compreTaxTotal,
    grandTotal, breakdown,
  }
}
