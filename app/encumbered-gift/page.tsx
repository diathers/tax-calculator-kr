// SCREEN ID: SCR-X7
// SCREEN NAME: 부담부증여 계산기 (전문가용)

"use client"

import { CalculatorShell } from "@/components/layout/calculator-shell"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { ResultSummaryCard } from "@/components/results/result-summary-card"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { ShareButton } from "@/components/results/share-button"
import { useEncumberedGiftStore } from "@/hooks/stores/use-encumbered-gift-store"
import { formatTaxAmount } from "@/lib/utils"
import type { EncumberedGiftInput } from "@/lib/calculators/types"

const RELATIONSHIP_OPTS: { value: EncumberedGiftInput["relationship"]; label: string }[] = [
  { value: "배우자", label: "배우자" },
  { value: "직계존속", label: "직계존속" },
  { value: "직계비속", label: "직계비속" },
  { value: "기타친족", label: "기타 친족" },
]

export default function EncumberedGiftPage() {
  const { input, result, setInput, calculate, reset } = useEncumberedGiftStore()

  return (
    <CalculatorShell
      title="부담부증여 계산기"
      description="전세보증금 등 채무를 포함한 부담부증여의 세금을 계산합니다. 수증자 증여세 + 증여자 양도소득세 동시 계산."
      onReset={reset}
      result={result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 text-center">
              <p className="text-xs text-orange-700 mb-1">수증자 납부 (증여세)</p>
              <p className="text-xl font-bold text-orange-800">{formatTaxAmount(result.giftTax)}</p>
            </div>
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
              <p className="text-xs text-green-700 mb-1">증여자 납부 (양도소득세)</p>
              <p className="text-xl font-bold text-green-800">{formatTaxAmount(result.capitalGainsTax)}</p>
            </div>
          </div>
          <ResultSummaryCard
            totalTax={result.totalTax}
            label="부담부증여 총 세액"
            subItems={[
              { label: "단순 증여 시 세액 (비교)", amount: result.simpleGiftTax },
              {
                label: result.comparison >= 0 ? "부담부증여가 절세 효과" : "단순증여가 유리",
                amount: Math.abs(result.comparison),
              },
            ]}
          />
          <TaxBreakdownTable rows={result.breakdown} />
          <ShareButton params={input} />
        </div>
      )}
    >
      <div className="space-y-5">
        <KoreanNumberInput
          label="증여재산 시가"
          value={input.propertyValue}
          onChange={(v) => setInput({ propertyValue: v })}
          required
        />
        <KoreanNumberInput
          label="채무 인수액 (전세보증금, 대출 등)"
          value={input.debtAssumed}
          onChange={(v) => setInput({ debtAssumed: v })}
          helpText="채무 인수액 부분은 증여자가 양도소득세 납부"
          required
        />
        <KoreanNumberInput
          label="증여자 취득가액"
          value={input.donorAcquisitionPrice}
          onChange={(v) => setInput({ donorAcquisitionPrice: v })}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">증여자 취득일</label>
            <input
              type="date"
              value={input.donorAcquisitionDate}
              onChange={(e) => setInput({ donorAcquisitionDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">증여일</label>
            <input
              type="date"
              value={input.giftDate}
              onChange={(e) => setInput({ giftDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">증여자 실제 거주기간 (년)</label>
          <input
            type="number" min="0" max="50"
            value={input.donorResidencePeriodYears}
            onChange={(e) => setInput({ donorResidencePeriodYears: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">증여자와의 관계 (증여세 공제 기준)</label>
          <div className="flex gap-2 flex-wrap">
            {RELATIONSHIP_OPTS.map((r) => (
              <button
                key={r.value}
                onClick={() => setInput({ relationship: r.value })}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  input.relationship === r.value
                    ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {input.relationship === "직계존속" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={input.isMinor}
                onChange={(e) => setInput({ isMinor: e.target.checked })}
                className="w-4 h-4 text-teal-600"
              />
              <span className="text-sm text-gray-700">수증자 미성년자</span>
            </label>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={input.isAdjustmentArea}
              onChange={(e) => setInput({ isAdjustmentArea: e.target.checked })}
              className="w-4 h-4 text-teal-600"
            />
            <span className="text-sm text-gray-700">조정대상지역 (양도소득세 계산에 반영)</span>
          </label>
        </div>

        <button
          onClick={calculate}
          disabled={input.propertyValue === 0 || input.debtAssumed === 0 || input.debtAssumed >= input.propertyValue}
          className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          부담부증여 계산하기
        </button>
        {input.debtAssumed >= input.propertyValue && input.propertyValue > 0 && (
          <p className="text-xs text-red-500 text-center">채무 인수액이 증여재산 시가보다 작아야 합니다.</p>
        )}
      </div>
      <ScreenIdBadge id="SCR-X7" />
    </CalculatorShell>
  )
}
