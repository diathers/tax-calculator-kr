// SCREEN ID: SCR-X6
// SCREEN NAME: 법인 양도소득세 계산기 (전문가용)

"use client"

import { CalculatorShell } from "@/components/layout/calculator-shell"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { ResultSummaryCard } from "@/components/results/result-summary-card"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { ShareButton } from "@/components/results/share-button"
import { useCorporateGainsTaxStore } from "@/hooks/stores/use-corporate-gains-tax-store"
import type { CorporateGainsTaxInput } from "@/lib/calculators/types"

export default function CorporateGainsTaxPage() {
  const { input, result, setInput, calculate, reset } = useCorporateGainsTaxStore()

  return (
    <CalculatorShell
      title="법인 양도소득세 계산기"
      description="법인이 부동산을 양도할 때 부과되는 세금을 추정합니다. 실제 세액은 법인 전체 과세표준에 따라 달라집니다."
      onReset={reset}
      result={result && (
        <div className="space-y-4">
          <ResultSummaryCard
            totalTax={result.estimatedTax}
            label="추정 세액"
            subItems={[
              { label: "양도차익", amount: result.gain },
              { label: `기본세율 (${(result.baseRate * 100).toFixed(0)}%)`, amount: Math.floor(result.gain * result.baseRate) },
              ...(result.additionalRate > 0 ? [{ label: `추가 과세 (+${(result.additionalRate * 100).toFixed(0)}%)`, amount: Math.floor(result.gain * result.additionalRate) }] : []),
            ]}
          />
          <TaxBreakdownTable rows={result.breakdown} />
          <ShareButton params={input} />
        </div>
      )}
    >
      <div className="space-y-5">
        <KoreanNumberInput
          label="취득가액"
          value={input.acquisitionPrice}
          onChange={(v) => setInput({ acquisitionPrice: v })}
          required
        />
        <KoreanNumberInput
          label="양도가액"
          value={input.salePrice}
          onChange={(v) => setInput({ salePrice: v })}
          required
        />
        <KoreanNumberInput
          label="필요경비"
          value={input.necessaryExpenses}
          onChange={(v) => setInput({ necessaryExpenses: v })}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">취득일</label>
            <input
              type="date"
              value={input.acquisitionDate}
              onChange={(e) => setInput({ acquisitionDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">양도일</label>
            <input
              type="date"
              value={input.saleDate}
              onChange={(e) => setInput({ saleDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">법인 유형</label>
          <div className="space-y-2">
            {(["일반법인", "중소기업", "부동산법인"] as CorporateGainsTaxInput["corporateType"][]).map((t) => (
              <button
                key={t}
                onClick={() => setInput({ corporateType: t })}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-colors ${
                  input.corporateType === t
                    ? "border-gray-500 bg-gray-100 text-gray-800 font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {t}
                {t === "부동산법인" && <span className="text-xs text-gray-400 ml-2">+20% 추가</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={input.isNonBusinessLand}
              onChange={(e) => setInput({ isNonBusinessLand: e.target.checked })}
              className="w-4 h-4 text-gray-600"
            />
            <span className="text-sm text-gray-700">비사업용 토지 (+10% 추가 과세)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={input.isUnregistered}
              onChange={(e) => setInput({ isUnregistered: e.target.checked })}
              className="w-4 h-4 text-gray-600"
            />
            <span className="text-sm text-gray-700">미등기 양도 (+40% 추가 과세)</span>
          </label>
        </div>

        <button
          onClick={calculate}
          disabled={input.acquisitionPrice === 0 || input.salePrice === 0}
          className="w-full py-3 rounded-xl bg-gray-700 text-white font-semibold text-sm hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          법인 양도소득세 계산하기
        </button>
      </div>
      <ScreenIdBadge id="SCR-X6" />
    </CalculatorShell>
  )
}
