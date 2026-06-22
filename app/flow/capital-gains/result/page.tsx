// SCREEN ID: SCR-S8
// SCREEN NAME: 양도소득세 결과
// FLOW: 팔 때 > 결과

"use client"

import Link from "next/link"
import { useCapitalGainsFlowStore } from "@/hooks/stores/use-capital-gains-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { calculateCapitalGainsTax } from "@/lib/calculators/capital-gains-tax"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { formatTaxAmount } from "@/lib/utils"

function monthsDiff(a: string, b: string) {
  const da = new Date(a), db = new Date(b)
  return Math.max(0, (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth()))
}
function formatPeriod(months: number) {
  const y = Math.floor(months / 12), m = months % 12
  if (y === 0) return `${m}개월`
  return m === 0 ? `${y}년` : `${y}년 ${m}개월`
}

export default function CapitalGainsResultPage() {
  const store = useCapitalGainsFlowStore()

  const residenceMonths = store.noResidence ? 0 : monthsDiff(store.residenceStartDate, store.residenceEndDate)
  const residenceYears = Math.floor(residenceMonths / 12)
  const isAdj = store.isAdjAtSale ?? true

  const result = calculateCapitalGainsTax({
    acquisitionPrice: store.acquisitionPrice,
    salePrice: store.salePrice,
    necessaryExpenses: store.necessaryExpenses,
    acquisitionDate: store.acquisitionDate,
    saleDate: store.saleDate,
    residencePeriodYears: residenceYears,
    homeCountAtSale: store.is1H1H ? 1 : store.homeCount,
    isAdjustmentArea: isAdj,
  })

  const holdingMonths = monthsDiff(store.acquisitionDate, store.saleDate)
  const holdingYears = Math.floor(holdingMonths / 12)

  const isHousing = store.propertyType === "주택"

  // 비과세 요건 판단 (주택만)
  const meetsHolding = holdingYears >= 2
  const meetsResidence = !(store.isAdjAtAcquisition ?? true) || residenceYears >= 2
  const couldBeExempt = isHousing && store.is1H1H && meetsHolding && meetsResidence

  // 미충족 사유
  const reasons: string[] = []
  if (isHousing && store.is1H1H) {
    if (!meetsHolding) reasons.push(`보유기간 ${formatPeriod(holdingMonths)} (2년 미만)`)
    if (!meetsResidence) reasons.push(`거주기간 ${formatPeriod(residenceMonths)} (2년 미만)`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/flow/capital-gains" className="text-gray-400 hover:text-gray-600">←</Link>
          <h1 className="text-lg font-bold text-gray-900">양도소득세 계산 결과</h1>
        </div>

        {/* 비과세 여부 배너 (주택만) */}
        {isHousing && store.is1H1H && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            result.isExempt
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : couldBeExempt
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}>
            {result.isExempt
              ? "✅ 1세대 1주택 비과세 요건을 충족합니다"
              : reasons.length > 0
              ? `⚠️ 비과세 미충족: ${reasons.join(", ")}`
              : "✅ 1세대 1주택 조건 충족"}
          </div>
        )}

        {/* 총 납부세액 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500 mb-1">최종 납부세액</p>
          <p className={`text-3xl font-bold ${result.isExempt ? "text-emerald-600" : "text-blue-600"}`}>
            {result.isExempt ? "비과세 (0원)" : formatTaxAmount(result.totalTax)}
          </p>
          {!result.isExempt && result.totalTax > 0 && (
            <div className="mt-4 space-y-2 text-sm text-left">
              <div className="flex justify-between text-gray-600">
                <span>양도차익</span>
                <span>{formatTaxAmount(result.realizedGain)}</span>
              </div>
              {result.lthdAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>장기보유특별공제 ({(result.lthdRate * 100).toFixed(0)}%)
                    <span className="ml-1 text-xs text-gray-400">(오래 보유할수록 세금을 깎아주는 제도)</span>
                  </span>
                  <span>−{formatTaxAmount(result.lthdAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>과세표준 <span className="text-xs text-gray-400">(세금 계산 기준 금액)</span></span>
                <span>{formatTaxAmount(result.taxableIncome)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>산출세액</span>
                <span>{formatTaxAmount(result.calculatedTax)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>지방소득세 (10%)</span>
                <span>{formatTaxAmount(result.localIncomeTax)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
                <span>합계</span>
                <span>{formatTaxAmount(result.totalTax)}</span>
              </div>
            </div>
          )}
        </div>

        {/* 분양권 세율 안내 */}
        {store.propertyType === "분양권" && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 px-5 py-4 space-y-1.5">
            <p className="text-sm font-semibold text-amber-800">📌 분양권 양도소득세 세율</p>
            <p className="text-sm text-amber-700">· 보유기간 1년 미만: <span className="font-semibold">70%</span> (지방소득세 포함 77%)</p>
            <p className="text-sm text-amber-700">· 보유기간 1년 이상: <span className="font-semibold">60%</span> (지방소득세 포함 66%)</p>
            <p className="text-sm text-amber-700">· 2년 이상 보유해도 60% — <span className="font-semibold">장기보유특별공제 없음</span></p>
          </div>
        )}

        {/* 산출 근거 */}
        {!result.isExempt && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <p className="text-sm font-semibold text-gray-700 px-4 pt-4 pb-2">산출 근거</p>
            <TaxBreakdownTable rows={result.breakdown} />
          </div>
        )}

        {/* 다주택 절세 비교 버튼 (주택만) */}
        {isHousing && !store.is1H1H && (
          <Link href="/wizard/compare"
            className="block w-full text-center py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            절세 방법 비교하기 (양도 vs 증여 vs 부담부증여)
          </Link>
        )}

        {/* 함께 확인하면 좋은 세금 */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-800">함께 확인하면 좋은 세금</p>
          <div className="space-y-1 text-sm text-blue-700">
            <p>· 보유세 → <Link href="/flow/property" className="underline">재산세 · 종합부동산세</Link></p>
            <p>· 증여 고려 중이라면 → <Link href="/flow/gift" className="underline">증여세 + 취득세</Link></p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="flex-1 text-center py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            처음으로
          </Link>
          <Link href="/flow/capital-gains" className="flex-1 text-center py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            다시 계산
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          이 계산은 참고용이며 실제 세액은 개인 상황에 따라 달라질 수 있습니다.
          정확한 세액은 세무사 상담을 권장합니다.
        </p>
      </div>
      <ScreenIdBadge id="SCR-S8" />
    </div>
  )
}
