// SCREEN ID: SCR-G7
// SCREEN NAME: 증여세 결과
// FLOW: 증여할 때 > 결과

"use client"

import Link from "next/link"
import { useGiftFlowStore } from "@/hooks/stores/use-gift-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { calculateGiftTax } from "@/lib/calculators/gift-tax"
import { calculateAcquisitionTax } from "@/lib/calculators/acquisition-tax"
import { calculateEncumberedGift } from "@/lib/calculators/encumbered-gift"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { formatTaxAmount } from "@/lib/utils"

const today = new Date().toISOString().split("T")[0]

function toGiftRel(r: string): "배우자" | "직계존속" | "직계비속" | "기타친족" {
  if (r === "타인") return "기타친족"
  return r as "배우자" | "직계존속" | "직계비속" | "기타친족"
}

export default function GiftResultPage() {
  const store = useGiftFlowStore()
  const { relationship, propertyValue, hasDebt, debtAmount, donorAcquisitionPrice,
    donorAcquisitionDate, isAdjustmentArea, recipientHomeCount,
    isMinor, isGenerationSkip, hasPriorGifts, priorGifts10Y } = store

  const adj = isAdjustmentArea ?? true
  const rel = toGiftRel(relationship)

  // 증여세
  const giftResult = calculateGiftTax({
    giftValue: propertyValue,
    relationship: rel,
    isMinor,
    priorGifts10Y: hasPriorGifts ? priorGifts10Y : 0,
    isGenerationSkip,
    isMarriageOrBirth: false,
  })

  // 수증자 취득세
  const recipientHC = Math.min(recipientHomeCount + 1, 4) as 1 | 2 | 3 | 4
  const recipientAcqResult = calculateAcquisitionTax({
    acquisitionType: "증여",
    acquisitionPrice: propertyValue,
    officialPrice: propertyValue,
    homeCountAfter: recipientHC,
    isAdjustmentArea: adj,
  })

  // 부담부증여
  const encResult = hasDebt && debtAmount > 0 && donorAcquisitionPrice > 0
    ? calculateEncumberedGift({
        propertyValue,
        debtAssumed: debtAmount,
        donorAcquisitionPrice,
        donorAcquisitionDate,
        giftDate: today,
        donorResidencePeriodYears: 0,
        relationship: rel,
        isAdjustmentArea: adj,
        isMinor,
      })
    : null

  const simpleTotal = giftResult.totalTax + recipientAcqResult.totalTax
  const encTotal = encResult
    ? encResult.giftTax + encResult.capitalGainsTax + recipientAcqResult.totalTax
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/flow/gift" className="text-gray-400 hover:text-gray-600">←</Link>
          <h1 className="text-lg font-bold text-gray-900">증여세 계산 결과</h1>
        </div>

        {/* 일반 증여 요약 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 mb-3">일반 증여 세부담</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>증여세 (수증자 납부)</span>
              <span>{formatTaxAmount(giftResult.totalTax)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>취득세 (수증자 납부, {recipientAcqResult.summaryLabel})</span>
              <span>{formatTaxAmount(recipientAcqResult.totalTax)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
              <span>합계 세부담</span>
              <span className="text-orange-600 text-lg">{formatTaxAmount(simpleTotal)}</span>
            </div>
          </div>
        </div>

        {/* 증여세 산출 근거 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <p className="text-sm font-semibold text-gray-700 px-4 pt-4 pb-2">증여세 산출 근거</p>
          <TaxBreakdownTable rows={giftResult.breakdown} />
        </div>

        {/* 부담부증여 비교 */}
        {hasDebt && encResult && encTotal !== null && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-gray-700">일반증여 vs 부담부증여 비교</p>
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl border-2 p-3 text-center ${encTotal < simpleTotal ? "border-gray-200" : "border-orange-400 bg-orange-50"}`}>
                <p className="text-xs text-gray-500 mb-1">일반증여</p>
                <p className="font-bold text-gray-900">{formatTaxAmount(simpleTotal)}</p>
                {simpleTotal <= encTotal && <p className="text-xs text-orange-600 mt-1 font-medium">더 유리</p>}
              </div>
              <div className={`rounded-xl border-2 p-3 text-center ${encTotal < simpleTotal ? "border-emerald-400 bg-emerald-50" : "border-gray-200"}`}>
                <p className="text-xs text-gray-500 mb-1">부담부증여</p>
                <p className="font-bold text-gray-900">{formatTaxAmount(encTotal)}</p>
                {encTotal < simpleTotal && <p className="text-xs text-emerald-600 mt-1 font-medium">절세 추천</p>}
              </div>
            </div>
            {encTotal < simpleTotal && (
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                부담부증여 선택 시 {formatTaxAmount(simpleTotal - encTotal)} 절세 가능
              </p>
            )}
          </div>
        )}

        {/* 함께 확인하면 좋은 세금 */}
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4 space-y-2">
          <p className="text-sm font-semibold text-orange-800">함께 확인하면 좋은 세금</p>
          <div className="space-y-1 text-sm text-orange-700">
            <p>· 양도 vs 증여 비교 → <Link href="/wizard/compare" className="underline">절세 방법 비교</Link></p>
            <p>· 취득 후 보유 시 → <Link href="/flow/property" className="underline">재산세 · 종합부동산세</Link></p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="flex-1 text-center py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            처음으로
          </Link>
          <Link href="/flow/gift" className="flex-1 text-center py-3 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">
            다시 계산
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          이 계산은 참고용이며 실제 세액은 개인 상황에 따라 달라질 수 있습니다.
          정확한 세액은 세무사 상담을 권장합니다.
        </p>
      </div>
      <ScreenIdBadge id="SCR-G7" />
    </div>
  )
}
