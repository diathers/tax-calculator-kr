// SCREEN ID: SCR-X1
// SCREEN NAME: 취득세 계산기 (전문가용)

"use client"

import { useEffect } from "react"
import { CalculatorShell } from "@/components/layout/calculator-shell"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { ResultSummaryCard } from "@/components/results/result-summary-card"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { ShareButton } from "@/components/results/share-button"
import { useAcquisitionTaxStore } from "@/hooks/stores/use-acquisition-tax-store"
import { useWizardStore } from "@/hooks/stores/use-wizard-store"
import type { AcquisitionType } from "@/lib/calculators/types"

const ACQ_TYPES: { value: AcquisitionType; label: string }[] = [
  { value: "매매", label: "매매" },
  { value: "상속", label: "상속" },
  { value: "증여", label: "증여" },
  { value: "신축", label: "신축(원시취득)" },
]

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

export default function AcquisitionTaxPage() {
  const { input, result, setInput, calculate, reset } = useAcquisitionTaxStore()
  const wizard = useWizardStore()

  useEffect(() => {
    const updates: Parameters<typeof setInput>[0] = {}
    if (wizard.propertyPrice > 0) updates.acquisitionPrice = wizard.propertyPrice
    if (wizard.homeCount && wizard.homeCount !== "법인") updates.homeCountAfter = wizard.homeCount
    if (wizard.exclusiveArea > 0) updates.exclusiveArea = wizard.exclusiveArea
    updates.isAdjustmentArea = wizard.isAdjustmentArea ?? true
    if (Object.keys(updates).length) setInput(updates)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isSale = input.acquisitionType === "매매"
  const isGift = input.acquisitionType === "증여"
  const isInheritance = input.acquisitionType === "상속"
  const showHomeCount = isSale || isGift
  const showAdj = isSale || isGift
  const showTemp2 = isSale && input.homeCountAfter === 2 && input.isAdjustmentArea
  const showDiscount = isSale && !input.isCorporation
  const showFirstTimeBuyer = showDiscount && input.homeCountAfter === 1
  const showOfficialPrice = isGift || isInheritance
  const isGiftHeavy = isGift && !input.isDivorceSplit
    && input.isAdjustmentArea
    && (input.officialPrice || input.acquisitionPrice) >= 300_000_000

  const priceLabel = input.acquisitionType === "신축"
    ? "시가표준액 (과세표준)"
    : input.acquisitionType === "상속"
    ? "취득가액 (시가 또는 공시가격)"
    : "취득가액"

  return (
    <CalculatorShell
      title="주택 취득세 계산기"
      description="2026.1.1 기준 · 지방교육세·농어촌특별세 포함"
      onReset={reset}
      result={result && (
        <div className="space-y-4">
          {/* 세율 배지 */}
          <div className="text-center">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {result.summaryLabel}
            </span>
          </div>

          {/* 세액 요약 */}
          <ResultSummaryCard
            totalTax={result.totalTax}
            subItems={[
              { label: `취득세 본세 (${(result.appliedRate * 100).toFixed(2).replace(/\.?0+$/, "")}%)`, amount: result.acquisitionTax },
              { label: `지방교육세 (${(result.eduRate * 100).toFixed(2).replace(/\.?0+$/, "")}%)`, amount: result.localEducationTax },
              ...(result.ruralSpecialTax > 0 ? [{ label: "농어촌특별세", amount: result.ruralSpecialTax }] : []),
              ...(result.discount > 0 ? [{ label: result.discountReason, amount: -result.discount }] : []),
            ]}
          />

          {/* 신고납부 기한 */}
          {result.deadlineDate && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 px-4 py-3">
              <p className="text-xs font-semibold text-amber-700 mb-0.5">📅 신고납부 기한</p>
              <p className="text-sm font-bold text-amber-900">{formatDeadline(result.deadlineDate)}까지</p>
              <p className="text-xs text-amber-600 mt-0.5">{deadlineHint(result.acquisitionType)}</p>
            </div>
          )}

          {/* 상세 산출 근거 */}
          <TaxBreakdownTable rows={result.breakdown} />
          <ShareButton params={input} />
        </div>
      )}
    >
      <div className="space-y-5">

        {/* 1. 취득유형 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">취득유형</label>
          <div className="grid grid-cols-4 gap-1.5">
            {ACQ_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setInput({ acquisitionType: value })}
                className={`py-2 rounded-lg text-xs border font-medium transition-colors ${
                  input.acquisitionType === value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 취득가액 */}
        <KoreanNumberInput
          label={priceLabel}
          value={input.acquisitionPrice}
          onChange={(v) => setInput({ acquisitionPrice: v })}
          required
        />

        {/* 3. 공시가격 (증여·상속) */}
        {showOfficialPrice && (
          <KoreanNumberInput
            label={isGift ? "공시가격 (기준시가, 중과 판단용)" : "공시가격 (기준시가)"}
            value={input.officialPrice ?? 0}
            onChange={(v) => setInput({ officialPrice: v })}
            helpText={isGift ? "조정대상지역 + 공시가 3억 이상이면 12% 중과 적용" : ""}
          />
        )}
        {isGift && isGiftHeavy && (
          <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-xs text-orange-700 -mt-3">
            ⚠️ 현재 조건: 조정대상지역 + 공시가 3억↑ → 증여 취득세 12% 중과 적용
          </div>
        )}

        {/* 4. 주택 수 (매매·증여) */}
        {showHomeCount && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              {isGift ? "증여 후 수증자 주택 수" : "취득 후 주택 수"}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {(["법인", 1, 2, 3, 4] as const).map((n) => (
                <button
                  key={String(n)}
                  onClick={() => setInput({
                    homeCountAfter: n === "법인" ? 4 : n,
                    isCorporation: n === "법인",
                    isTemporary2House: n !== 2 ? false : input.isTemporary2House,
                  })}
                  className={`flex-1 min-w-[48px] py-2 rounded-lg text-xs border font-medium transition-colors ${
                    (n === "법인" ? (input.isCorporation ?? false) : input.homeCountAfter === n && !input.isCorporation)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {n === "법인" ? "법인" : n === 4 ? "4주택+" : `${n}주택`}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">본인·배우자·같은 세대 가족의 주택 합산</p>
          </div>
        )}

        {/* 5. 일시적 2주택 (매매 2주택+조정) */}
        {showTemp2 && (
          <label className="flex items-start gap-2.5 cursor-pointer bg-blue-50 rounded-xl border border-blue-100 px-3 py-2.5">
            <input
              type="checkbox"
              checked={input.isTemporary2House ?? false}
              onChange={(e) => setInput({ isTemporary2House: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">일시적 2주택 특례</p>
              <p className="text-xs text-gray-500">3년 이내 종전 주택 처분 예정 → 일반세율(1~3%) 적용</p>
            </div>
          </label>
        )}

        {/* 6. 조정대상지역 (매매·증여) */}
        {showAdj && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">조정대상지역 여부</label>
            <div className="flex gap-2">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  onClick={() => setInput({ isAdjustmentArea: v })}
                  className={`flex-1 py-2 rounded-lg text-sm border font-medium transition-colors ${
                    input.isAdjustmentArea === v
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {v ? "조정대상지역" : "비조정"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 7. 전용면적 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">전용면적</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { v: 85, label: "85㎡ 이하", desc: "농어촌특별세 없음" },
              { v: 86, label: "85㎡ 초과", desc: "농어촌특별세 0.2% 추가" },
            ] as { v: number; label: string; desc: string }[]).map(({ v, label, desc }) => (
              <button key={v} type="button" onClick={() => setInput({ exclusiveArea: v })}
                className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                  (input.exclusiveArea ?? 0) === v
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 8. 취득일 (선택, 신고기한 계산) */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">취득일 (선택)</label>
          <input
            type="date"
            value={input.acquisitionDate ?? ""}
            onChange={(e) => setInput({ acquisitionDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">입력 시 신고납부 기한을 계산해드립니다</p>
        </div>

        {/* 9. 감면 옵션 (매매) */}
        {showDiscount && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">감면 적용 여부</label>

            {showFirstTimeBuyer && (
              <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 hover:border-blue-200 transition-colors">
                <input
                  type="checkbox"
                  checked={input.isFirstTimeBuyer ?? false}
                  onChange={(e) => {
                    setInput({ isFirstTimeBuyer: e.target.checked })
                    if (e.target.checked) setInput({ isBirthRelated: false })
                  }}
                  className="mt-0.5 w-4 h-4 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">생애최초 주택 취득</p>
                  <p className="text-xs text-gray-500">취득가 제한 없음 · 최대 200만원 감면 (2026년 기준)</p>
                </div>
              </label>
            )}

            <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 hover:border-blue-200 transition-colors">
              <input
                type="checkbox"
                checked={input.isBirthRelated ?? false}
                onChange={(e) => {
                  setInput({ isBirthRelated: e.target.checked })
                  if (e.target.checked) setInput({ isFirstTimeBuyer: false })
                }}
                className="mt-0.5 w-4 h-4 accent-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">출산·양육 주택 취득</p>
                <p className="text-xs text-gray-500">자녀 출산·양육 목적 취득 · 최대 500만원 감면</p>
              </div>
            </label>
          </div>
        )}

        {/* 10. 이혼 재산분할 (증여) */}
        {isGift && (
          <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 hover:border-blue-200 transition-colors">
            <input
              type="checkbox"
              checked={input.isDivorceSplit ?? false}
              onChange={(e) => setInput({ isDivorceSplit: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">이혼 재산분할 취득</p>
              <p className="text-xs text-gray-500">이혼 재산분할에 의한 취득 → 1.5% 적용</p>
            </div>
          </label>
        )}

        {/* 11. 상속 1가구1주택 특례 (상속) */}
        {isInheritance && (
          <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 hover:border-blue-200 transition-colors">
            <input
              type="checkbox"
              checked={input.isInheritanceSpecial ?? false}
              onChange={(e) => setInput({ isInheritanceSpecial: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">1가구1주택 특례 적용</p>
              <p className="text-xs text-gray-500">상속으로 1가구1주택이 되는 경우 → 0.8% 적용</p>
            </div>
          </label>
        )}

        <button
          onClick={calculate}
          disabled={input.acquisitionPrice === 0}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          취득세 계산하기
        </button>
      </div>
      <ScreenIdBadge id="SCR-X1" />
    </CalculatorShell>
  )
}
