// SCREEN ID: SCR-X3
// SCREEN NAME: 보유세 계산기 (전문가용)

"use client"

import { useEffect } from "react"
import { CalculatorShell } from "@/components/layout/calculator-shell"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { ResultSummaryCard } from "@/components/results/result-summary-card"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { ShareButton } from "@/components/results/share-button"
import { usePropertyTaxStore } from "@/hooks/stores/use-property-tax-store"
import { useWizardStore } from "@/hooks/stores/use-wizard-store"

export default function PropertyTaxPage() {
  const { input, result, setInput, calculate, reset } = usePropertyTaxStore()
  const wizard = useWizardStore()

  useEffect(() => {
    const updates: Parameters<typeof setInput>[0] = {}
    if (wizard.officialPrice > 0) updates.officialPrice = wizard.officialPrice
    if (wizard.homeCount && wizard.homeCount !== "법인") updates.homeCount = wizard.homeCount
    updates.isAdjustmentArea = wizard.isAdjustmentArea ?? true
    if (wizard.homeCount === 1) updates.is1H1H = true
    if (Object.keys(updates).length) setInput(updates)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CalculatorShell
      title="보유세 계산기"
      description="재산세와 종합부동산세를 통합 계산합니다. 2025년 기준 공정시장가액비율 60% 적용."
      onReset={reset}
      result={result && (
        <div className="space-y-4">
          <ResultSummaryCard
            totalTax={result.grandTotal}
            label="보유세 총합계"
            subItems={[
              { label: "재산세 합계", amount: result.propertyTaxTotal },
              { label: "종부세 합계", amount: result.compreTaxTotal },
            ]}
          />
          <TaxBreakdownTable rows={result.breakdown} />
          <ShareButton params={input} />
        </div>
      )}
    >
      <div className="space-y-5">
        <KoreanNumberInput
          label="공시가격"
          value={input.officialPrice}
          onChange={(v) => setInput({ officialPrice: v })}
          helpText="국토교통부 부동산 공시가격 알리미에서 확인 가능"
          required
        />

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">보유 주택 수</label>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                onClick={() => setInput({ homeCount: n })}
                className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                  input.homeCount === n
                    ? "border-purple-500 bg-purple-50 text-purple-700 font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {n === 3 ? "3주택+" : `${n}주택`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={input.is1H1H}
              onChange={(e) => setInput({ is1H1H: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-700">1세대 1주택자 (종부세 12억 공제, 고령자·장기보유 공제)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={input.isAdjustmentArea}
              onChange={(e) => setInput({ isAdjustmentArea: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-700">조정대상지역 (2주택 이상 시 종부세 중과)</span>
          </label>
        </div>

        {input.is1H1H && (
          <div className="grid grid-cols-2 gap-3 p-4 bg-purple-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">소유자 나이 (세)</label>
              <input
                type="number"
                min="0" max="100"
                value={input.ownerAge}
                onChange={(e) => setInput({ ownerAge: Number(e.target.value) })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">60세+ 고령자 공제</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">보유기간 (년)</label>
              <input
                type="number"
                min="0" max="50"
                value={input.holdingYears}
                onChange={(e) => setInput({ holdingYears: Number(e.target.value) })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">5년+ 장기보유 공제</p>
            </div>
          </div>
        )}

        <button
          onClick={calculate}
          disabled={input.officialPrice === 0}
          className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          보유세 계산하기
        </button>
      </div>
      <ScreenIdBadge id="SCR-X3" />
    </CalculatorShell>
  )
}
