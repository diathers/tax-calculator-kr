// SCREEN ID: SCR-X5
// SCREEN NAME: 상속세 계산기 (전문가용)

"use client"

import { CalculatorShell } from "@/components/layout/calculator-shell"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { ResultSummaryCard } from "@/components/results/result-summary-card"
import { TaxBreakdownTable } from "@/components/results/tax-breakdown-table"
import { ShareButton } from "@/components/results/share-button"
import { useInheritanceTaxStore } from "@/hooks/stores/use-inheritance-tax-store"
import { formatKoreanAmount } from "@/lib/utils"

export default function InheritanceTaxPage() {
  const { input, result, setInput, calculate, reset } = useInheritanceTaxStore()

  function handleMinorChildCount(count: number) {
    const ages = Array(count).fill(10)
    setInput({ minorChildCount: count, minorChildAges: ages })
  }

  function handleMinorAge(idx: number, age: number) {
    const newAges = [...input.minorChildAges]
    newAges[idx] = age
    setInput({ minorChildAges: newAges })
  }

  return (
    <CalculatorShell
      title="상속세 계산기"
      description="상속 재산에 부과되는 상속세를 계산합니다. 일괄공제(5억) vs 인적공제 자동 비교, 배우자공제 포함."
      onReset={reset}
      result={result && (
        <div className="space-y-4">
          <ResultSummaryCard
            totalTax={result.totalTax}
            subItems={[
              { label: "상속세 과세가액", amount: result.taxableEstate },
              { label: "총 공제액", amount: -result.totalDeduction },
              { label: "과세표준", amount: result.taxableBase },
              { label: "산출세액", amount: result.calculatedTax },
              { label: "신고세액공제 (3%)", amount: -result.filingDiscount },
            ]}
          />
          <TaxBreakdownTable rows={result.breakdown} />
          <ShareButton params={input} />
        </div>
      )}
    >
      <div className="space-y-5">
        <KoreanNumberInput
          label="상속재산 총액"
          value={input.totalEstate}
          onChange={(v) => setInput({ totalEstate: v })}
          required
        />
        <KoreanNumberInput
          label="금융재산 (예금·주식 등)"
          value={input.financialAssets}
          onChange={(v) => setInput({ financialAssets: v })}
          helpText="금융재산의 20% 공제 (최대 2억원)"
        />
        <KoreanNumberInput
          label="채무 (대출·보증채무 등)"
          value={input.debts}
          onChange={(v) => setInput({ debts: v })}
        />

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            장례비용 (최대 {formatKoreanAmount(15000000)})
          </label>
          <KoreanNumberInput
            label=""
            value={input.funeralCost}
            onChange={(v) => setInput({ funeralCost: Math.min(v, 15000000) })}
          />
        </div>

        <div className="space-y-4 p-4 bg-red-50 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={input.spouseAlive}
              onChange={(e) => setInput({ spouseAlive: e.target.checked })}
              className="w-4 h-4 text-red-600"
            />
            <span className="text-sm font-medium text-gray-700">배우자 생존</span>
          </label>
          {input.spouseAlive && (
            <KoreanNumberInput
              label="배우자 실제 상속분"
              value={input.spouseInheritance}
              onChange={(v) => setInput({ spouseInheritance: v })}
              helpText="배우자 법정상속분 또는 실제 상속액 (최소 5억~최대 30억 공제)"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">자녀 수</label>
            <input
              type="number" min="0" max="20"
              value={input.childCount}
              onChange={(e) => setInput({ childCount: Number(e.target.value) })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">미성년 자녀 수</label>
            <input
              type="number" min="0" max={input.childCount}
              value={input.minorChildCount}
              onChange={(e) => handleMinorChildCount(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        {input.minorChildAges.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">미성년 자녀 나이 (19세 미만)</label>
            {input.minorChildAges.map((age, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-12">자녀 {i + 1}</span>
                <input
                  type="number" min="0" max="18"
                  value={age}
                  onChange={(e) => handleMinorAge(i, Number(e.target.value))}
                  className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                />
                <span className="text-sm text-gray-400">세 → {Math.max(0, 19 - age)}년 공제</span>
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={input.applyResidenceDeduction}
            onChange={(e) => setInput({ applyResidenceDeduction: e.target.checked })}
            className="w-4 h-4 text-red-600"
          />
          <span className="text-sm text-gray-700">동거주택 공제 (피상속인과 10년 이상 동거, 최대 6억)</span>
        </label>
        {input.applyResidenceDeduction && (
          <KoreanNumberInput
            label="동거주택 가액"
            value={input.residenceValue}
            onChange={(v) => setInput({ residenceValue: v })}
          />
        )}

        <button
          onClick={calculate}
          disabled={input.totalEstate === 0}
          className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          상속세 계산하기
        </button>
      </div>
      <ScreenIdBadge id="SCR-X5" />
    </CalculatorShell>
  )
}
