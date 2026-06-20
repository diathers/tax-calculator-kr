// SCREEN ID: SCR-A8
// SCREEN NAME: 취득세 결과
// FLOW: 살 때 > 결과

"use client"

import Link from "next/link"
import { useAcquisitionFlowStore } from "@/hooks/stores/use-acquisition-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { calculateAcquisitionTax } from "@/lib/calculators/acquisition-tax"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { formatTaxAmount } from "@/lib/utils"

function formatDeadline(d: string): string {
  if (!d) return ""
  const [y, m, day] = d.split("-")
  return `${y}년 ${parseInt(m)}월 ${parseInt(day)}일`
}

function deadlineHint(type: string): string {
  if (type === "매매" || type === "신축") return "취득일로부터 60일 이내"
  if (type === "증여") return "취득일이 속하는 달의 말일부터 3개월 이내"
  if (type === "상속") return "취득일이 속하는 달의 말일부터 6개월 이내"
  return ""
}

export default function AcquisitionResultPage() {
  const store = useAcquisitionFlowStore()
  const {
    acquisitionType, homeCount, isAdjustmentArea, acquisitionPrice,
    officialPrice, exclusiveArea, isTemporary2House, isFirstTimeBuyer,
    isBirthRelated, isInheritanceSpecial, isDivorceSplit, acquisitionDate,
    donorHomeCount,
  } = store

  const hcNum = homeCount === "법인" ? 4 : homeCount as 1 | 2 | 3 | 4

  const result = calculateAcquisitionTax({
    acquisitionType,
    acquisitionPrice,
    officialPrice: officialPrice || undefined,
    homeCountAfter: hcNum,
    isAdjustmentArea: isAdjustmentArea ?? true,
    exclusiveArea: exclusiveArea || undefined,
    isCorporation: homeCount === "법인",
    isTemporary2House,
    isFirstTimeBuyer,
    isBirthRelated,
    isInheritanceSpecial,
    isDivorceSplit,
    acquisitionDate: acquisitionDate || undefined,
    donorHomeCount: donorHomeCount ?? undefined,
  })

  // 입력 요약 배지
  const badges: string[] = []
  badges.push(acquisitionType)
  if (acquisitionType === "매매") {
    badges.push(homeCount === "법인" ? "법인" : `${homeCount}주택`)
    badges.push(isAdjustmentArea ? "조정대상지역" : isAdjustmentArea === false ? "비조정" : "조정대상지역(추정)")
  }
  if (acquisitionType === "증여") {
    badges.push(isAdjustmentArea ? "조정대상지역" : isAdjustmentArea === false ? "비조정" : "조정대상지역(추정)")
    if (donorHomeCount) badges.push(`증여자 ${donorHomeCount}`)
  }
  if (isTemporary2House) badges.push("일시적2주택")
  if (exclusiveArea > 0) badges.push(`전용 ${exclusiveArea}㎡`)

  const showDiscountSection = !!(result.discount > 0 || result.acquisitionType === "매매")
  const otherDiscounts = result.acquisitionType === "매매" && result.discount === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <Link href="/flow/acquisition" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
          <h1 className="text-lg font-bold text-gray-900">취득세 계산 결과</h1>
        </div>

        {/* 입력 요약 배지 */}
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b, i) => (
            <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
              {b}
            </span>
          ))}
        </div>

        {/* 세액 내역 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs text-gray-500 mb-1">최종 납부세액</p>
            <p className="text-3xl font-bold text-blue-600">{formatTaxAmount(result.totalTax)}</p>
          </div>
          <div className="px-5 py-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>취득세 본세 ({(result.mainRate * 100).toFixed(2).replace(/\.?0+$/, "")}%)</span>
              <span>{formatTaxAmount(result.acquisitionTax)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>지방교육세 ({(result.eduRate * 100).toFixed(2).replace(/\.?0+$/, "")}%)</span>
              <span>{formatTaxAmount(result.localEducationTax)}</span>
            </div>
            {result.ruralSpecialTax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>농어촌특별세</span>
                <span>{formatTaxAmount(result.ruralSpecialTax)}</span>
              </div>
            )}
            {result.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{result.discountReason}</span>
                <span>−{formatTaxAmount(result.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2.5">
              <span>합계</span>
              <span>{formatTaxAmount(result.totalTax)}</span>
            </div>
          </div>
        </div>

        {/* 신고납부 기한 */}
        {result.deadlineDate && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 px-5 py-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">📅 신고납부 기한</p>
            <p className="text-base font-bold text-amber-900">{formatDeadline(result.deadlineDate)}까지</p>
            <p className="text-xs text-amber-600 mt-0.5">{deadlineHint(acquisitionType)}</p>
          </div>
        )}

        {/* 감면 안내 */}
        {otherDiscounts && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 px-5 py-4 space-y-2">
            <p className="text-sm font-semibold text-emerald-800">📋 감면 제도 안내</p>
            <div className="space-y-1.5 text-sm text-emerald-700">
              {result.acquisitionType === "매매" && (
                <>
                  <p>· <span className="font-medium">생애최초 취득 감면</span>: 최대 200만원 (취득가 제한 없음)</p>
                  <p>· <span className="font-medium">출산·양육 감면</span>: 최대 500만원</p>
                  <p className="text-xs text-emerald-600">위 조건에 해당하시면 이전 단계에서 선택해 주세요</p>
                </>
              )}
            </div>
          </div>
        )}
        {result.discount > 0 && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 px-5 py-3">
            <p className="text-sm text-emerald-800">
              ✅ <span className="font-semibold">{result.discountReason}</span> 적용 중 (−{formatTaxAmount(result.discount)})
            </p>
          </div>
        )}

        {/* 상세 산출 근거 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <p className="text-sm font-semibold text-gray-700 px-4 pt-4 pb-2">상세 산출 근거</p>
          <TaxBreakdownTable rows={result.breakdown} />
        </div>

        {/* 함께 확인하면 좋은 세금 */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-800">함께 확인하면 좋은 세금</p>
          <div className="space-y-1 text-sm text-blue-700">
            <p>· 취득 후 보유 시 → <Link href="/flow/property" className="underline">재산세 · 종합부동산세</Link></p>
            {acquisitionType === "매매" && (
              <p>· 나중에 팔 때 → <Link href="/flow/capital-gains" className="underline">양도소득세</Link></p>
            )}
            {acquisitionType === "증여" && (
              <p>· 증여세 별도 납부 → <Link href="/flow/gift" className="underline">증여세 계산</Link></p>
            )}
            {acquisitionType === "상속" && (
              <p>· 상속세 별도 납부 → <Link href="/flow/inheritance" className="underline">상속세 계산</Link></p>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          <Link href="/" className="flex-1 text-center py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            처음으로
          </Link>
          <Link href="/flow/acquisition" className="flex-1 text-center py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            다시 계산
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          이 계산은 참고용이며 실제 세액은 개인 상황에 따라 달라질 수 있습니다.
          정확한 세액은 세무사 상담을 권장합니다.
        </p>
      </div>
      <ScreenIdBadge id="SCR-A8" />
    </div>
  )
}
