// SCREEN ID: SCR-I5
// SCREEN NAME: 상속세 결과
// FLOW: 상속받을 때 > 결과

"use client"

import Link from "next/link"
import { useInheritanceFlowStore } from "@/hooks/stores/use-inheritance-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { calculateInheritanceTax } from "@/lib/calculators/inheritance-tax"
import { calculateAcquisitionTax } from "@/lib/calculators/acquisition-tax"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { formatTaxAmount } from "@/lib/utils"

export default function InheritanceResultPage() {
  const store = useInheritanceFlowStore()
  const { propertyValue, spouseAlive, childCount, minorChildCount, otherEstateValue, recipientHomeCount, isInheritanceSpecial } = store

  const totalEstate = propertyValue + otherEstateValue
  const minorAges = Array.from({ length: minorChildCount }, () => 10) // 10세 가정

  // 상속세
  const spouseShare = spouseAlive ? Math.floor(totalEstate * 0.5) : 0
  const inhResult = calculateInheritanceTax({
    totalEstate,
    financialAssets: 0,
    debts: 0,
    funeralCost: 5000000,
    spouseAlive,
    spouseInheritance: spouseShare,
    childCount,
    minorChildCount,
    minorChildAges: minorAges,
    applyResidenceDeduction: false,
    residenceValue: 0,
  })

  // 상속 취득세
  const acqResult = calculateAcquisitionTax({
    acquisitionType: "상속",
    acquisitionPrice: propertyValue,
    homeCountAfter: Math.min(recipientHomeCount + 1, 4) as 1 | 2 | 3 | 4,
    isAdjustmentArea: false,
    isInheritanceSpecial: isInheritanceSpecial ?? false,
  })

  const grandTotal = inhResult.totalTax + acqResult.totalTax

  const usedLumpSum = inhResult.appliedDeduction === inhResult.lumpSumDeduction
    && inhResult.personalDeduction < inhResult.lumpSumDeduction

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/flow/inheritance" className="text-gray-400 hover:text-gray-600">←</Link>
          <h1 className="text-lg font-bold text-gray-900">상속세 계산 결과</h1>
        </div>

        {/* 공제 방식 안내 */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {usedLumpSum
            ? "✅ 일괄공제(5억원)가 기초공제+인적공제보다 유리합니다"
            : "✅ 기초공제(2억원)+인적공제가 일괄공제보다 유리합니다"}
        </div>

        {/* 총 납부세액 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500 mb-1">최종 납부세액 (상속세 + 취득세)</p>
          <p className="text-3xl font-bold text-red-600">{formatTaxAmount(grandTotal)}</p>
          <div className="mt-4 space-y-2 text-sm text-left">
            <div className="flex justify-between text-gray-600">
              <span>상속세</span>
              <span>{formatTaxAmount(inhResult.totalTax)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>취득세 (상속, {acqResult.summaryLabel})</span>
              <span>{formatTaxAmount(acqResult.totalTax)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
              <span>합계</span>
              <span>{formatTaxAmount(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* 상속세 산출 근거 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <p className="text-sm font-semibold text-gray-700 px-4 pt-4 pb-2">상속세 산출 근거</p>
          <TaxBreakdownTable rows={inhResult.breakdown} />
        </div>

        {/* 함께 확인하면 좋은 세금 */}
        <div className="bg-red-50 rounded-2xl border border-red-100 p-4 space-y-2">
          <p className="text-sm font-semibold text-red-800">함께 확인하면 좋은 세금</p>
          <div className="space-y-1 text-sm text-red-700">
            <p>· 상속받은 주택 보유 시 → <Link href="/flow/property" className="underline">재산세 · 종합부동산세</Link></p>
            <p>· 나중에 팔 때 → <Link href="/flow/capital-gains" className="underline">양도소득세</Link></p>
          </div>
        </div>

        <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
          ※ 배우자 상속분은 법정비율(1/2) 기준으로 계산되었습니다. 실제 협의분할 결과에 따라 달라질 수 있습니다.
        </p>

        <div className="flex gap-3">
          <Link href="/" className="flex-1 text-center py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            처음으로
          </Link>
          <Link href="/flow/inheritance" className="flex-1 text-center py-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
            다시 계산
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          이 계산은 참고용이며 실제 세액은 개인 상황에 따라 달라질 수 있습니다.
          정확한 세액은 세무사 상담을 권장합니다.
        </p>
      </div>
      <ScreenIdBadge id="SCR-I5" />
    </div>
  )
}
