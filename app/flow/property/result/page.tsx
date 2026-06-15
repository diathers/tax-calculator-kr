// SCREEN ID: SCR-O4
// SCREEN NAME: 보유세 결과
// FLOW: 보유할 때 > 결과

"use client"

import Link from "next/link"
import { usePropertyFlowStore } from "@/hooks/stores/use-property-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { calculatePropertyTax } from "@/lib/calculators/property-tax"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { formatTaxAmount } from "@/lib/utils"

export default function PropertyResultPage() {
  const store = usePropertyFlowStore()
  const { officialPrice, homeCount, isAdjustmentArea } = store

  const hc: 1 | 2 | 3 = homeCount === "법인" ? 3 : homeCount
  const is1H1H = hc === 1

  const result = calculatePropertyTax({
    officialPrice,
    homeCount: hc,
    is1H1H,
    isAdjustmentArea,
    ownerAge: 50,
    holdingYears: 5,
  })

  // 재산세 분납: 상반기(7월) 절반, 하반기(9월) 나머지
  const propertyTaxH1 = Math.floor(result.propertyTaxTotal / 2)
  const propertyTaxH2 = result.propertyTaxTotal - propertyTaxH1

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/flow/property" className="text-gray-400 hover:text-gray-600">←</Link>
          <h1 className="text-lg font-bold text-gray-900">보유세 계산 결과</h1>
        </div>

        {/* 연간 총합 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500 mb-1">연간 보유세 총합계</p>
          <p className="text-3xl font-bold text-purple-600">{formatTaxAmount(result.grandTotal)}</p>
          <div className="mt-4 space-y-2 text-sm text-left">
            <div className="flex justify-between text-gray-600">
              <span>재산세 합계</span>
              <span>{formatTaxAmount(result.propertyTaxTotal)}</span>
            </div>
            {result.compreTaxBase > 0 ? (
              <div className="flex justify-between text-gray-600">
                <span>종합부동산세 합계</span>
                <span>{formatTaxAmount(result.compreTaxTotal)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-gray-400 text-xs">
                <span>종합부동산세</span>
                <span>비과세 (공시가 기준 이하)</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
              <span>합계</span>
              <span>{formatTaxAmount(result.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* 재산세 납부 일정 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">재산세 납부 일정</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">7월 (상반기)</p>
              <p className="font-bold text-gray-900">{formatTaxAmount(propertyTaxH1)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">9월 (하반기)</p>
              <p className="font-bold text-gray-900">{formatTaxAmount(propertyTaxH2)}</p>
            </div>
          </div>
          {result.compreTaxBase > 0 && (
            <p className="text-xs text-gray-500">종합부동산세는 매년 12월 납부</p>
          )}
        </div>

        {/* 산출 근거 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <p className="text-sm font-semibold text-gray-700 px-4 pt-4 pb-2">산출 근거</p>
          <TaxBreakdownTable rows={result.breakdown} />
        </div>

        {/* 함께 확인하면 좋은 세금 */}
        <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4 space-y-2">
          <p className="text-sm font-semibold text-purple-800">함께 확인하면 좋은 세금</p>
          <div className="space-y-1 text-sm text-purple-700">
            <p>· 팔 때 → <Link href="/flow/capital-gains" className="underline">양도소득세</Link></p>
            <p>· 증여 고려 중이라면 → <Link href="/flow/gift" className="underline">증여세 + 취득세</Link></p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="flex-1 text-center py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            처음으로
          </Link>
          <Link href="/flow/property" className="flex-1 text-center py-3 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors">
            다시 계산
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          이 계산은 참고용이며 실제 세액은 개인 상황에 따라 달라질 수 있습니다.
          정확한 세액은 세무사 상담을 권장합니다.
        </p>
      </div>
      <ScreenIdBadge id="SCR-O4" />
    </div>
  )
}
