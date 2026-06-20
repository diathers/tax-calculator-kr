// SCREEN ID: SCR-S1 ~ SCR-S7
// SCREEN NAME: 팔 때 플로우 Step 1~7
// FLOW: 팔 때 (양도소득세)
// SCR-S1: Step 1 취득가액
// SCR-S2: Step 2 양도가액
// SCR-S3: Step 3 필요경비
// SCR-S4: Step 4 취득일·양도일
// SCR-S5: Step 5 거주기간
// SCR-S6: Step 6 조정대상지역
// SCR-S7: Step 7 주택 수

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepShell } from "@/components/flow/step-shell"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { useCapitalGainsFlowStore } from "@/hooks/stores/use-capital-gains-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"

function monthsDiff(a: string, b: string) {
  const da = new Date(a), db = new Date(b)
  const m = (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth())
  return Math.max(0, m)
}
function formatPeriod(months: number) {
  const y = Math.floor(months / 12), m = months % 12
  if (y === 0) return `${m}개월`
  return m === 0 ? `${y}년` : `${y}년 ${m}개월`
}

const ADJ_OPTIONS = [
  { v: true as boolean | null, label: "네, 조정대상지역이에요" },
  { v: false as boolean | null, label: "아니오, 조정대상지역이 아니에요" },
]

export default function CapitalGainsFlowPage() {
  const router = useRouter()
  const store = useCapitalGainsFlowStore()
  const [step, setStep] = useState(1)
  const TOTAL = 7

  function next() { if (step < TOTAL) setStep(step + 1); else router.push("/flow/capital-gains/result") }
  function prev() { if (step === 1) router.push("/"); else setStep(step - 1) }

  const holdingMonths = monthsDiff(store.acquisitionDate, store.saleDate)
  const residenceMonths = store.noResidence ? 0 : monthsDiff(store.residenceStartDate, store.residenceEndDate)

  // SCR-S1: 취득가액
  if (step === 1) return (
    <>
      <StepShell step={1} total={TOTAL} title="이 주택을 얼마에 사셨나요?"
        hint="계약서상 매매가액을 입력해주세요. 상속·증여로 취득한 경우 취득 당시 평가액을 입력해주세요"
        canNext={store.acquisitionPrice > 0} onNext={next} onPrev={prev}
      >
        <KoreanNumberInput label="취득가액 (산 가격)" value={store.acquisitionPrice}
          onChange={(v) => store.set({ acquisitionPrice: v })} required />
      </StepShell>
      <ScreenIdBadge id="SCR-S1" />
    </>
  )

  // SCR-S2: 양도가액
  if (step === 2) return (
    <>
      <StepShell step={2} total={TOTAL} title="이 주택을 얼마에 파시나요?"
      hint="실제 거래 계약서상 금액을 입력해주세요"
      canNext={store.salePrice > 0} onNext={next} onPrev={prev}
    >
      <KoreanNumberInput label="양도가액 (파는 가격)" value={store.salePrice}
        onChange={(v) => store.set({ salePrice: v })} required />
    </StepShell>
    <ScreenIdBadge id="SCR-S2" />
    </>
  )

  // SCR-S3: 필요경비
  if (step === 3) return (
    <>
      <StepShell step={3} total={TOTAL} title="취득·보유·양도 과정에서 지출한 비용이 있나요?"
      hint="취득세, 법무사 비용, 중개수수료, 인테리어·수선비 등 영수증이 있는 비용을 합산해서 입력해주세요. 없으면 0으로 두고 넘어가셔도 됩니다"
      canNext={true} onNext={next} onPrev={prev}
    >
      <KoreanNumberInput label="필요경비 (선택 입력)" value={store.necessaryExpenses}
        onChange={(v) => store.set({ necessaryExpenses: v })}
        helpText="0으로 두고 계속 진행할 수 있습니다" />
    </StepShell>
    <ScreenIdBadge id="SCR-S3" />
    </>
  )

  // SCR-S4: 취득일·양도일
  if (step === 4) return (
    <>
      <StepShell step={4} total={TOTAL} title="언제 사셨고 언제 파시나요?"
      hint="계약일이 아닌 잔금 지급일(또는 등기접수일 중 빠른 날)을 입력해주세요"
      canNext={!!store.acquisitionDate && !!store.saleDate && store.saleDate > store.acquisitionDate}
      onNext={next} onPrev={prev}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">취득일 (산 날)</label>
          <input type="date" value={store.acquisitionDate}
            onChange={(e) => store.set({ acquisitionDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">양도일 (파는 날)</label>
          <input type="date" value={store.saleDate}
            onChange={(e) => store.set({ saleDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        {holdingMonths > 0 && (
          <p className="text-sm text-blue-600 font-medium bg-blue-50 rounded-lg px-3 py-2">
            보유기간 {formatPeriod(holdingMonths)}
          </p>
        )}
      </div>
    </StepShell>
    <ScreenIdBadge id="SCR-S4" />
    </>
  )

  // SCR-S5: 거주기간
  if (step === 5) return (
    <>
      <StepShell step={5} total={TOTAL} title="이 주택에 실제로 거주한 기간은 얼마나 되나요?"
      hint="1세대 1주택 비과세를 받으려면 보유기간 중 2년 이상 거주가 필요한 경우가 있어요 (조정대상지역 취득 시 적용)"
      canNext={true} onNext={next} onPrev={prev}
    >
      <div className="space-y-4">
        {!store.noResidence && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">거주 시작일</label>
              <input type="date" value={store.residenceStartDate}
                onChange={(e) => store.set({ residenceStartDate: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">거주 종료일</label>
              <input type="date" value={store.residenceEndDate}
                onChange={(e) => store.set({ residenceEndDate: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            {residenceMonths > 0 && (
              <p className="text-sm text-blue-600 font-medium bg-blue-50 rounded-lg px-3 py-2">
                거주기간 {formatPeriod(residenceMonths)}
              </p>
            )}
          </>
        )}
        <button onClick={() => store.set({ noResidence: !store.noResidence })}
          className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
            store.noResidence
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          {store.noResidence ? "✓ " : ""}거주한 적 없어요
        </button>
      </div>
    </StepShell>
    <ScreenIdBadge id="SCR-S5" />
    </>
  )

  // SCR-S6: 조정대상지역 (취득시·양도시)
  if (step === 6) return (
    <>
      <StepShell step={6} total={TOTAL}
      title="조정대상지역 여부"
      hint="취득 시점과 양도 시점의 조정대상지역 여부가 각각 세금에 영향을 줍니다"
      canNext={store.isAdjAtAcquisition !== undefined && store.isAdjAtSale !== undefined}
      onNext={next} onPrev={prev}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">이 주택을 살 때, 조정대상지역이었나요?</p>
          {ADJ_OPTIONS.map(({ v, label }) => (
            <button key={String(v)} onClick={() => store.set({ isAdjAtAcquisition: v })}
              className={`w-full rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition-all ${
                store.isAdjAtAcquisition === v
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >{label}</button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">이 주택을 팔 때, 조정대상지역인가요?</p>
          {ADJ_OPTIONS.map(({ v, label }) => (
            <button key={String(v)} onClick={() => store.set({ isAdjAtSale: v })}
              className={`w-full rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition-all ${
                store.isAdjAtSale === v
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >{label}</button>
          ))}
        </div>
      </div>
    </StepShell>
    <ScreenIdBadge id="SCR-S6" />
    </>
  )

  // SCR-S7: 주택 수
  return (
    <>
      <StepShell step={7} total={TOTAL} title="파는 시점에 이 주택 외에 다른 주택이 있나요?"
      hint="1세대 1주택이면 일정 요건 충족 시 양도소득세가 비과세될 수 있어요"
      canNext={true} onNext={next} onPrev={prev} nextLabel="계산하기"
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <button onClick={() => store.set({ is1H1H: true, homeCount: 1 })}
            className={`w-full rounded-xl border-2 px-4 py-3.5 text-left font-semibold text-sm transition-all ${
              store.is1H1H ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >없어요 (1세대 1주택)</button>
          <button onClick={() => store.set({ is1H1H: false })}
            className={`w-full rounded-xl border-2 px-4 py-3.5 text-left font-semibold text-sm transition-all ${
              !store.is1H1H ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >있어요 (다주택)</button>
        </div>
        {!store.is1H1H && (
          <div className="space-y-2 pt-2">
            <p className="text-sm text-gray-600">지금 총 몇 채를 보유하고 있나요?</p>
            <div className="flex gap-2">
              {([2, 3] as const).map((n) => (
                <button key={n} onClick={() => store.set({ homeCount: n })}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    store.homeCount === n
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >{n === 2 ? "2주택" : "3주택 이상"}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </StepShell>
    <ScreenIdBadge id="SCR-S7" />
    </>
  )
}
