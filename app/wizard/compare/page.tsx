// SCREEN ID: SCR-H8
// SCREEN NAME: 절세 방법 비교
// FLOW: 공통 마법사 > 절세 비교

"use client"

import { useState } from "react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { useWizardStore } from "@/hooks/stores/use-wizard-store"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { calculateGiftTax } from "@/lib/calculators/gift-tax"
import { calculateCapitalGainsTax } from "@/lib/calculators/capital-gains-tax"
import { calculateAcquisitionTax } from "@/lib/calculators/acquisition-tax"
import { calculateEncumberedGift } from "@/lib/calculators/encumbered-gift"
import { formatTaxAmount } from "@/lib/utils"

function toAdj(v: boolean | null) { return v ?? true }
function toHC(v: ReturnType<typeof useWizardStore.getState>["homeCount"]): 1 | 2 | 3 {
  if (!v || v === "법인") return 3
  return v
}

interface ExtraInput {
  donorAcquisitionPrice: number
  donorAcquisitionDate: string
  donorResidenceYears: number
  debtAssumed: number
}

const BAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b"]

export default function ComparePage() {
  const store = useWizardStore()
  const { situation, propertyPrice, exclusiveArea, isAdjustmentArea, homeCount } = store

  const [extra, setExtra] = useState<ExtraInput>({
    donorAcquisitionPrice: 0,
    donorAcquisitionDate: "2020-01-01",
    donorResidenceYears: 0,
    debtAssumed: 0,
  })
  const [computed, setComputed] = useState(false)

  const adj = toAdj(isAdjustmentArea)
  const hc = toHC(homeCount)
  const area = exclusiveArea > 0 ? exclusiveArea : 85
  const today = new Date().toISOString().split("T")[0]

  // ── 시나리오 계산 ─────────────────────────────────────────
  const computeScenarios = () => {
    // 수증자 취득세 (증여 취득)
    const recipientAcqTax = calculateAcquisitionTax({
      acquisitionType: "증여",
      acquisitionPrice: propertyPrice,
      homeCountAfter: hc,
      isAdjustmentArea: adj,
      exclusiveArea: area,
    }).totalTax

    // 일반 증여세
    const giftResult = calculateGiftTax({
      giftValue: propertyPrice,
      relationship: "직계존속",
      isMinor: false,
      priorGifts10Y: 0,
      isGenerationSkip: false,
      isMarriageOrBirth: false,
    })
    const plainGiftTotal = giftResult.totalTax + recipientAcqTax

    // 부담부증여
    const encResult = extra.donorAcquisitionPrice > 0 && extra.debtAssumed > 0
      ? calculateEncumberedGift({
          propertyValue: propertyPrice,
          debtAssumed: extra.debtAssumed,
          donorAcquisitionPrice: extra.donorAcquisitionPrice,
          donorAcquisitionDate: extra.donorAcquisitionDate,
          giftDate: today,
          donorResidencePeriodYears: extra.donorResidenceYears,
          relationship: "직계존속",
          isAdjustmentArea: adj,
          isMinor: false,
        })
      : null

    const encGiftBase = encResult
      ? encResult.giftTax + encResult.capitalGainsTax
      : null

    // 수증자 취득세 (부담부증여 시 채무 차감 후 증여분 기준)
    const encAcqBase = extra.debtAssumed > 0 ? propertyPrice - extra.debtAssumed : propertyPrice
    const encRecipientAcqTax = encResult
      ? calculateAcquisitionTax({
          acquisitionType: "증여",
          acquisitionPrice: encAcqBase,
          homeCountAfter: hc,
          isAdjustmentArea: adj,
          exclusiveArea: area,
          isFirstTimeEver: false,
          isNewlywed: false,
        }).totalTax
      : null

    const encTotal = encGiftBase !== null && encRecipientAcqTax !== null
      ? encGiftBase + encRecipientAcqTax
      : null

    // 양도 시나리오 (양도 situation일 때만)
    let saleTotal: number | null = null
    if (situation === "양도" && extra.donorAcquisitionPrice > 0) {
      const capGains = calculateCapitalGainsTax({
        acquisitionPrice: extra.donorAcquisitionPrice,
        salePrice: propertyPrice,
        necessaryExpenses: 0,
        acquisitionDate: extra.donorAcquisitionDate,
        saleDate: today,
        residencePeriodYears: extra.donorResidenceYears,
        homeCountAtSale: hc,
        isAdjustmentArea: adj,
      })
      saleTotal = capGains.totalTax
    }

    return { plainGiftTotal, encTotal, saleTotal, recipientAcqTax, giftResult, encResult, encRecipientAcqTax }
  }

  const results = computed ? computeScenarios() : null
  const scenarios = results ? [
    ...(situation === "양도" && results.saleTotal !== null
      ? [{ name: "양도", total: results.saleTotal, color: BAR_COLORS[0] }]
      : []),
    { name: "일반증여", total: results.plainGiftTotal, color: BAR_COLORS[1] },
    ...(results.encTotal !== null
      ? [{ name: "부담부증여", total: results.encTotal, color: BAR_COLORS[2] }]
      : []),
  ] : []

  const bestIdx = scenarios.length > 0
    ? scenarios.reduce((mi, s, i) => s.total < scenarios[mi].total ? i : mi, 0)
    : -1

  const needsAcqPrice = situation === "양도" || extra.debtAssumed > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <Link href="/wizard/results" className="text-sm text-gray-500 hover:text-gray-700">← 결과로</Link>
          <h1 className="text-base font-bold text-gray-900">절세 방법 비교</h1>
          <div className="w-16" />
        </div>

        {/* 추가 입력 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <p className="text-sm font-semibold text-gray-700">추가 정보 입력</p>

          <KoreanNumberInput
            label="증여자 취득가액 (취득 당시 매입 금액)"
            value={extra.donorAcquisitionPrice}
            onChange={(v) => setExtra((p) => ({ ...p, donorAcquisitionPrice: v }))}
            required
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">증여자 취득일</label>
            <input
              type="date"
              value={extra.donorAcquisitionDate}
              onChange={(e) => setExtra((p) => ({ ...p, donorAcquisitionDate: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">거주기간 (년)</label>
            <input
              type="number"
              value={extra.donorResidenceYears || ""}
              onChange={(e) => setExtra((p) => ({ ...p, donorResidenceYears: Number(e.target.value) }))}
              placeholder="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <KoreanNumberInput
            label="승계할 채무액 (전세보증금·담보대출)"
            value={extra.debtAssumed}
            onChange={(v) => setExtra((p) => ({ ...p, debtAssumed: v }))}
            helpText="부담부증여 계산에 사용됩니다. 0이면 부담부증여 미포함"
          />

          <button
            onClick={() => setComputed(true)}
            disabled={extra.donorAcquisitionPrice === 0}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            비교 계산하기
          </button>
        </div>

        {/* 결과 */}
        {computed && results && scenarios.length > 0 && (
          <>
            {/* 막대 차트 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-4">총 세부담 비교</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scenarios} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${Math.round(v / 10000)}만`}
                    tick={{ fontSize: 11 }}
                    width={55}
                  />
                  <Tooltip
                    formatter={(v) => [formatTaxAmount(Number(v ?? 0)), "총 세액"]}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {scenarios.map((s, i) => (
                      <Cell key={s.name} fill={i === bestIdx ? "#10b981" : "#cbd5e1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 비교 테이블 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">방법</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">총 세부담</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scenarios.map((s, i) => (
                    <tr key={s.name} className={i === bestIdx ? "bg-emerald-50" : ""}>
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-900">
                        {formatTaxAmount(s.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {i === bestIdx && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            절세 추천
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 세목별 상세 */}
            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">일반증여 상세</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>증여세 (수증자)</span>
                    <span>{formatTaxAmount(results.giftResult.totalTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>취득세 (수증자)</span>
                    <span>{formatTaxAmount(results.recipientAcqTax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                    <span>합계</span>
                    <span>{formatTaxAmount(results.plainGiftTotal)}</span>
                  </div>
                </div>
              </div>

              {results.encResult && results.encTotal !== null && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">부담부증여 상세</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>증여세 (수증자, 채무 차감 후)</span>
                      <span>{formatTaxAmount(results.encResult.giftTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>양도소득세 (증여자, 채무 부분)</span>
                      <span>{formatTaxAmount(results.encResult.capitalGainsTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>취득세 (수증자)</span>
                      <span>{formatTaxAmount(results.encRecipientAcqTax ?? 0)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                      <span>합계</span>
                      <span>{formatTaxAmount(results.encTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* 면책 문구 */}
        <p className="text-xs text-gray-400 text-center pb-4">
          위 계산은 참고용이며, 실제 세액은 개인 상황에 따라 달라질 수 있습니다.
          정확한 절세 전략은 세무사 상담을 권장합니다.
        </p>
      </div>
      <ScreenIdBadge id="SCR-H8" />
    </div>
  )
}
