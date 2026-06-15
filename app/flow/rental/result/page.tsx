// SCREEN ID: SCR-R5
// SCREEN NAME: 임대소득세 결과
// FLOW: 임대할 때 > 결과

"use client"

import Link from "next/link"
import { useRentalFlowStore } from "@/hooks/stores/use-rental-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { formatTaxAmount } from "@/lib/utils"

function applyProgressiveRate(amount: number): number {
  if (amount <= 0) return 0
  const brackets = [
    { max: 14000000, rate: 0.06, deduction: 0 },
    { max: 50000000, rate: 0.15, deduction: 1260000 },
    { max: 88000000, rate: 0.24, deduction: 5760000 },
    { max: 150000000, rate: 0.35, deduction: 15440000 },
    { max: 300000000, rate: 0.38, deduction: 19940000 },
    { max: 500000000, rate: 0.40, deduction: 25940000 },
    { max: 1000000000, rate: 0.42, deduction: 35940000 },
    { max: null, rate: 0.45, deduction: 65940000 },
  ]
  for (const b of brackets) {
    if (b.max === null || amount <= b.max) {
      return Math.max(0, Math.floor(amount * b.rate - b.deduction))
    }
  }
  return 0
}

export default function RentalResultPage() {
  const store = useRentalFlowStore()
  const { rentalType, deposit, monthlyRent, chonsaDeposit, homeCount, hasOtherIncome } = store

  // 연간 임대수입
  const annualRentIncome = rentalType === "전세"
    ? Math.floor(chonsaDeposit * 0.04)   // 간주임대료 (3주택 이상부터 과세, 여기선 표시용)
    : monthlyRent * 12

  // 비과세 판정
  const isExempt = homeCount === 1  // 1주택자: 기준시가 12억 이하 가정

  // 2주택자 전세 비과세
  const isChonsaExempt = homeCount === 2 && rentalType === "전세"

  // 분리과세 (14%) 계산
  // 등록임대주택 필요경비율 60%, 미등록 50%
  const expenseRate = 0.50  // 미등록 가정
  const basicDeduction = 4000000  // 400만원
  const netIncome = Math.max(0, annualRentIncome * (1 - expenseRate) - basicDeduction)
  const separateTax = Math.floor(netIncome * 0.14)
  const localTax = Math.floor(separateTax * 0.1)
  const separateTotal = separateTax + localTax

  // 종합과세 계산 (다른 소득 있을 때 참고용)
  const comprehensiveBase = Math.max(0, annualRentIncome * (1 - expenseRate) - basicDeduction)
  const comprehensiveTax = applyProgressiveRate(comprehensiveBase)
  const comprehensiveLocalTax = Math.floor(comprehensiveTax * 0.1)
  const comprehensiveTotal = comprehensiveTax + comprehensiveLocalTax

  const betterSeparate = separateTotal <= comprehensiveTotal

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/flow/rental" className="text-gray-400 hover:text-gray-600">←</Link>
          <h1 className="text-lg font-bold text-gray-900">임대소득세 계산 결과</h1>
        </div>

        {/* 비과세·간주임대료 안내 */}
        {isExempt && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✅ 1주택자 임대소득은 기준시가 12억원 이하 주택의 경우 비과세입니다
          </div>
        )}
        {isChonsaExempt && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✅ 2주택자 전세 임대는 비과세입니다 (월세는 과세)
          </div>
        )}
        {homeCount >= 3 && rentalType === "전세" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            ⚠️ 3주택 이상 전세는 간주임대료가 과세됩니다
          </div>
        )}

        {/* 연간 임대수입 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-3">연간 임대수입 요약</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{rentalType === "전세" ? "간주임대료 (4%)" : "연간 월세 수입"}</span>
              <span>{formatTaxAmount(annualRentIncome)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>필요경비 공제 ({Math.round(expenseRate * 100)}%)</span>
              <span>−{formatTaxAmount(Math.floor(annualRentIncome * expenseRate))}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>기본공제 (400만원)</span>
              <span>−{formatTaxAmount(basicDeduction)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
              <span>과세표준 (세금 계산 기준 금액)</span>
              <span>{formatTaxAmount(netIncome)}</span>
            </div>
          </div>
        </div>

        {/* 분리과세 vs 종합과세 비교 */}
        {!isExempt && !isChonsaExempt && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-gray-700">분리과세 vs 종합과세 비교</p>
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl border-2 p-3 text-center ${betterSeparate ? "border-emerald-400 bg-emerald-50" : "border-gray-200"}`}>
                <p className="text-xs text-gray-500 mb-1">분리과세 (14%)</p>
                <p className="font-bold text-gray-900">{formatTaxAmount(separateTotal)}</p>
                {betterSeparate && <p className="text-xs text-emerald-600 mt-1 font-medium">절세 추천</p>}
              </div>
              <div className={`rounded-xl border-2 p-3 text-center ${!betterSeparate ? "border-emerald-400 bg-emerald-50" : "border-gray-200"}`}>
                <p className="text-xs text-gray-500 mb-1">종합과세</p>
                <p className="font-bold text-gray-900">{formatTaxAmount(comprehensiveTotal)}</p>
                {!betterSeparate && <p className="text-xs text-emerald-600 mt-1 font-medium">절세 추천</p>}
              </div>
            </div>
            {hasOtherIncome && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                다른 소득이 있을 경우 종합과세 시 합산 세율이 높아질 수 있어요. 실제 세율은 전체 소득에 따라 달라집니다.
              </p>
            )}
          </div>
        )}

        {/* 함께 확인하면 좋은 세금 */}
        <div className="bg-teal-50 rounded-2xl border border-teal-100 p-4 space-y-2">
          <p className="text-sm font-semibold text-teal-800">함께 확인하면 좋은 세금</p>
          <div className="space-y-1 text-sm text-teal-700">
            <p>· 보유세 → <Link href="/flow/property" className="underline">재산세 · 종합부동산세</Link></p>
            <p>· 나중에 팔 때 → <Link href="/flow/capital-gains" className="underline">양도소득세</Link></p>
          </div>
        </div>

        <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
          ※ 간주임대료는 기준금리 적용 방식(3주택 이상 3억 초과분)이 실제 계산 방식입니다. 위 계산은 4% 적용 참고용입니다.
        </p>

        <div className="flex gap-3">
          <Link href="/" className="flex-1 text-center py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            처음으로
          </Link>
          <Link href="/flow/rental" className="flex-1 text-center py-3 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
            다시 계산
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          이 계산은 참고용이며 실제 세액은 개인 상황에 따라 달라질 수 있습니다.
          정확한 세액은 세무사 상담을 권장합니다.
        </p>
      </div>
      <ScreenIdBadge id="SCR-R5" />
    </div>
  )
}
