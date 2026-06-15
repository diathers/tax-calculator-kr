// SCREEN ID: SCR-X4
// SCREEN NAME: 증여세 계산기 (전문가용)

"use client"

import { useEffect } from "react"
import { CalculatorShell } from "@/components/layout/calculator-shell"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { ResultSummaryCard } from "@/components/results/result-summary-card"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { ShareButton } from "@/components/results/share-button"
import { useGiftTaxStore } from "@/hooks/stores/use-gift-tax-store"
import { useWizardStore } from "@/hooks/stores/use-wizard-store"
import type { GiftTaxInput } from "@/lib/calculators/types"

const RELATIONSHIP_LABELS: { value: GiftTaxInput["relationship"]; label: string; deduction: string }[] = [
  { value: "배우자", label: "배우자", deduction: "6억 공제" },
  { value: "직계존속", label: "직계존속 (부모→자녀)", deduction: "5천만 공제" },
  { value: "직계비속", label: "직계비속 (자녀→부모)", deduction: "5천만 공제" },
  { value: "기타친족", label: "기타 친족", deduction: "1천만 공제" },
]

export default function GiftTaxPage() {
  const { input, result, setInput, calculate, reset } = useGiftTaxStore()
  const wizard = useWizardStore()

  useEffect(() => {
    if (wizard.propertyPrice > 0) setInput({ giftValue: wizard.propertyPrice })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CalculatorShell
      title="증여세 계산기"
      description="부동산 증여 시 수증자가 납부하는 증여세를 계산합니다. 10년 합산 증여재산공제 포함."
      onReset={reset}
      result={result && (
        <div className="space-y-4">
          <ResultSummaryCard
            totalTax={result.totalTax}
            subItems={[
              { label: "산출세액", amount: result.calculatedTax },
              { label: "신고세액공제 (3%)", amount: -result.filingDiscount },
              ...(result.surtax > 0 ? [{ label: "세대생략 할증", amount: result.surtax }] : []),
            ]}
          />
          <TaxBreakdownTable rows={result.breakdown} />
          <ShareButton params={input} />
        </div>
      )}
    >
      <div className="space-y-5">
        <KoreanNumberInput
          label="증여재산가액 (시가)"
          value={input.giftValue}
          onChange={(v) => setInput({ giftValue: v })}
          required
        />

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">증여자와의 관계</label>
          <div className="space-y-2">
            {RELATIONSHIP_LABELS.map((r) => (
              <button
                key={r.value}
                onClick={() => setInput({ relationship: r.value })}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm border transition-colors ${
                  input.relationship === r.value
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span>{r.label}</span>
                <span className="text-xs text-gray-400">{r.deduction}</span>
              </button>
            ))}
          </div>
        </div>

        {input.relationship === "직계존속" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={input.isMinor}
                onChange={(e) => setInput({ isMinor: e.target.checked, isMarriageOrBirth: false })}
                className="w-4 h-4 text-orange-600"
              />
              <span className="text-sm text-gray-700">수증자가 미성년자 (공제 2천만원으로 감소)</span>
            </label>
            {!input.isMinor && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.isMarriageOrBirth}
                  onChange={(e) => setInput({ isMarriageOrBirth: e.target.checked })}
                  className="w-4 h-4 text-orange-600 mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  혼인·출산 증여재산 추가공제 적용 (+1억원)
                  <span className="block text-xs text-gray-400 mt-0.5">
                    혼인 전후 2년 이내 또는 자녀 출생일로부터 2년 이내 직계존속 증여 (2024.1.1~)
                  </span>
                </span>
              </label>
            )}
          </div>
        )}

        <KoreanNumberInput
          label="10년 내 기증여액 (동일인 기준)"
          value={input.priorGifts10Y}
          onChange={(v) => setInput({ priorGifts10Y: v })}
          helpText="과거 10년 내 같은 증여자로부터 받은 금액 (이미 공제 한도 소진 시 반영)"
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={input.isGenerationSkip}
            onChange={(e) => setInput({ isGenerationSkip: e.target.checked })}
            className="w-4 h-4 text-orange-600"
          />
          <span className="text-sm text-gray-700">세대생략 증여 (자녀 건너뛰고 손자녀에게 직접 증여, 30% 할증)</span>
        </label>

        <button
          onClick={calculate}
          disabled={input.giftValue === 0}
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          증여세 계산하기
        </button>
      </div>
      <ScreenIdBadge id="SCR-X4" />
    </CalculatorShell>
  )
}
