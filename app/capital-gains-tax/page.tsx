// SCREEN ID: SCR-X2
// SCREEN NAME: 양도소득세 계산기 (전문가용)

"use client"

import { CalculatorShell } from "@/components/layout/calculator-shell"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { ResultSummaryCard } from "@/components/results/result-summary-card"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { ShareButton } from "@/components/results/share-button"
import { useCapitalGainsTaxStore } from "@/hooks/stores/use-capital-gains-tax-store"

export default function CapitalGainsTaxPage() {
  const { input, result, setInput, calculate, reset } = useCapitalGainsTaxStore()

  return (
    <CalculatorShell
      title="양도소득세 계산기"
      description="부동산 매도 시 발생하는 양도소득세를 계산합니다. 1세대1주택 비과세, 장기보유특별공제, 다주택 중과 자동 판단."
      onReset={reset}
      result={result && (
        <div className="space-y-4">
          <ResultSummaryCard
            totalTax={result.totalTax}
            isExempt={result.isExempt}
            exemptReason={result.exemptReason}
            subItems={result.isExempt ? [] : [
              { label: "산출세액", amount: result.calculatedTax },
              { label: "지방소득세 (10%)", amount: result.localIncomeTax },
            ]}
          />
          {!result.isExempt && <TaxBreakdownTable rows={result.breakdown} />}
          {result.isExempt && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <p className="font-medium mb-1">비과세 요건 충족</p>
              <p>{result.exemptReason}</p>
            </div>
          )}
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
          label="필요경비 (취득세, 법무사비, 중개수수료 등)"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">양도일</label>
            <input
              type="date"
              value={input.saleDate}
              onChange={(e) => setInput({ saleDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">실제 거주기간 (년)</label>
          <input
            type="number"
            min="0"
            max="50"
            value={input.residencePeriodYears}
            onChange={(e) => setInput({ residencePeriodYears: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">조정대상지역 1세대1주택 비과세: 거주 2년 필수</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">양도 시점 보유 주택 수</label>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                onClick={() => setInput({ homeCountAtSale: n })}
                className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                  input.homeCountAtSale === n
                    ? "border-green-500 bg-green-50 text-green-700 font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {n === 3 ? "3주택+" : `${n}주택`}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={input.isAdjustmentArea}
            onChange={(e) => setInput({ isAdjustmentArea: e.target.checked })}
            className="w-4 h-4 text-green-600"
          />
          <span className="text-sm text-gray-700">조정대상지역 (다주택 중과, 거주요건 적용)</span>
        </label>

        <button
          onClick={calculate}
          disabled={input.acquisitionPrice === 0 || input.salePrice === 0}
          className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          양도소득세 계산하기
        </button>
      </div>
      <ScreenIdBadge id="SCR-X2" />
    </CalculatorShell>
  )
}
