// SCREEN ID: SCR-S0 ~ SCR-S7
// SCR-S0: 자산 유형 선택 (주택 / 분양권 / 조합원입주권)
// SCR-S1: 취득가액
// SCR-S2: 양도가액
// SCR-S3: 필요경비
// SCR-S4: 취득일·양도일
// SCR-S5: 거주기간 (주택만)
// SCR-S6: 조정대상지역
// SCR-S7: 보유 주택·분양권 수

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepShell } from "@/components/flow/step-shell"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { useCapitalGainsFlowStore } from "@/hooks/stores/use-capital-gains-flow-store"
import type { CapGainsPropertyType } from "@/hooks/stores/use-capital-gains-flow-store"
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

type RawStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

function visibleSteps(pt: CapGainsPropertyType): RawStep[] {
  return pt === "주택"
    ? [0, 1, 2, 3, 4, 5, 6, 7]
    : [0, 1, 2, 3, 4, 6, 7]
}

const PROPERTY_TYPES: { v: CapGainsPropertyType; label: string; desc: string }[] = [
  { v: "주택", label: "주택", desc: "아파트, 단독주택, 빌라, 주거용 오피스텔 포함" },
  { v: "분양권", label: "분양권", desc: "주택 분양 계약 권리 (청약당첨·승계취득) · 오피스텔 분양권은 세율 체계가 달라 제외" },
  { v: "조합원입주권", label: "조합원입주권", desc: "재건축·재개발 조합원 지위로 취득한 입주권" },
]

const ADJ_OPTIONS = [
  { v: true as boolean | null, label: "네, 조정대상지역이에요" },
  { v: false as boolean | null, label: "아니오, 조정대상지역이 아니에요" },
]

export default function CapitalGainsFlowPage() {
  const router = useRouter()
  const store = useCapitalGainsFlowStore()
  const [step, setStep] = useState<RawStep>(0)

  const pt = store.propertyType
  const visible = visibleSteps(pt)
  const visIdx = visible.indexOf(step)
  const total = visible.length
  const stepNum = visIdx + 1

  function next() {
    const nxt = visible[visIdx + 1]
    if (nxt !== undefined) setStep(nxt)
    else router.push("/flow/capital-gains/result")
  }
  function prev() {
    const prv = visible[visIdx - 1]
    if (prv !== undefined) setStep(prv)
    else router.push("/")
  }

  const holdingMonths = monthsDiff(store.acquisitionDate, store.saleDate)
  const residenceMonths = store.noResidence ? 0 : monthsDiff(store.residenceStartDate, store.residenceEndDate)

  // SCR-S0: 자산 유형 선택
  if (step === 0) return (
    <>
      <StepShell step={stepNum} total={total} title="무엇을 파시나요?"
        hint="자산 유형에 따라 세금 계산 방식이 달라집니다"
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="space-y-2">
          {PROPERTY_TYPES.map(({ v, label, desc }) => (
            <button key={v} onClick={() => store.set({ propertyType: v })}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                store.propertyType === v
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <p className="font-semibold text-sm text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-S0" />
    </>
  )

  // SCR-S1: 취득가액
  if (step === 1) {
    const titles: Record<CapGainsPropertyType, string> = {
      주택: "이 주택을 얼마에 사셨나요?",
      분양권: "이 분양권을 얼마에 취득하셨나요?",
      조합원입주권: "이 조합원입주권을 얼마에 취득하셨나요?",
    }
    const hints: Record<CapGainsPropertyType, string> = {
      주택: "계약서상 매매가액을 입력해주세요. 상속·증여로 취득한 경우 취득 당시 평가액을 입력해주세요",
      분양권: "청약당첨은 분양가액(계약금+중도금+잔금)을, 승계취득은 분양가액에 웃돈(프리미엄)을 더한 금액을 입력해주세요",
      조합원입주권: "조합원 지위를 취득할 때 지급한 금액을 입력해주세요 (프리미엄 포함)",
    }
    const labels: Record<CapGainsPropertyType, string> = {
      주택: "취득가액 (산 가격)",
      분양권: "취득가액 (분양가액 또는 분양가 + 프리미엄)",
      조합원입주권: "취득가액 (프리미엄 포함)",
    }
    return (
      <>
        <StepShell step={stepNum} total={total} title={titles[pt]}
          hint={hints[pt]}
          canNext={store.acquisitionPrice > 0} onNext={next} onPrev={prev}
        >
          <KoreanNumberInput label={labels[pt]} value={store.acquisitionPrice}
            onChange={(v) => store.set({ acquisitionPrice: v })} required />
        </StepShell>
        <ScreenIdBadge id="SCR-S1" />
      </>
    )
  }

  // SCR-S2: 양도가액
  if (step === 2) {
    const titles: Record<CapGainsPropertyType, string> = {
      주택: "이 주택을 얼마에 파시나요?",
      분양권: "이 분양권을 얼마에 파시나요?",
      조합원입주권: "이 조합원입주권을 얼마에 파시나요?",
    }
    return (
      <>
        <StepShell step={stepNum} total={total} title={titles[pt]}
          hint="실제 거래 계약서상 금액을 입력해주세요"
          canNext={store.salePrice > 0} onNext={next} onPrev={prev}
        >
          <KoreanNumberInput label="양도가액 (파는 가격)" value={store.salePrice}
            onChange={(v) => store.set({ salePrice: v })} required />
        </StepShell>
        <ScreenIdBadge id="SCR-S2" />
      </>
    )
  }

  // SCR-S3: 필요경비
  if (step === 3) {
    const hints: Record<CapGainsPropertyType, string> = {
      주택: "취득세, 법무사 비용, 중개수수료, 인테리어·수선비 등 영수증이 있는 비용을 합산해서 입력해주세요. 없으면 0으로 두고 넘어가셔도 됩니다",
      분양권: "중개수수료, 분양 관련 수수료 등 영수증이 있는 비용을 합산해서 입력해주세요. 없으면 0으로 두고 넘어가셔도 됩니다",
      조합원입주권: "중개수수료, 취득 관련 세금 등 영수증이 있는 비용을 합산해서 입력해주세요. 없으면 0으로 두고 넘어가셔도 됩니다",
    }
    return (
      <>
        <StepShell step={stepNum} total={total} title="취득·양도 과정에서 지출한 비용이 있나요?"
          hint={hints[pt]}
          canNext={true} onNext={next} onPrev={prev}
        >
          <KoreanNumberInput label="필요경비 (선택 입력)" value={store.necessaryExpenses}
            onChange={(v) => store.set({ necessaryExpenses: v })}
            helpText="0으로 두고 계속 진행할 수 있습니다" />
        </StepShell>
        <ScreenIdBadge id="SCR-S3" />
      </>
    )
  }

  // SCR-S4: 취득일·양도일
  if (step === 4) {
    const titles: Record<CapGainsPropertyType, string> = {
      주택: "언제 사셨고 언제 파시나요?",
      분양권: "분양권을 언제 취득하고 언제 양도하시나요?",
      조합원입주권: "조합원입주권을 언제 취득하고 언제 양도하시나요?",
    }
    const hints: Record<CapGainsPropertyType, string> = {
      주택: "계약일이 아닌 잔금 지급일(또는 등기접수일 중 빠른 날)을 입력해주세요",
      분양권: "취득일: 청약당첨일(일반청약) 또는 잔금청산일(승계취득) · 양도일: 매수자로부터 잔금을 받은 날(계약일 아님)",
      조합원입주권: "입주권을 취득·양도한 날짜(잔금일 기준)를 입력해주세요",
    }
    const acqLabel: Record<CapGainsPropertyType, string> = {
      주택: "취득일 (산 날)",
      분양권: "분양권 취득일 (청약당첨일 또는 잔금청산일)",
      조합원입주권: "입주권 취득일",
    }
    const saleLabel: Record<CapGainsPropertyType, string> = {
      주택: "양도일 (파는 날)",
      분양권: "분양권 양도일 (잔금청산일)",
      조합원입주권: "입주권 양도일",
    }
    return (
      <>
        <StepShell step={stepNum} total={total} title={titles[pt]}
          hint={hints[pt]}
          canNext={!!store.acquisitionDate && !!store.saleDate && store.saleDate > store.acquisitionDate}
          onNext={next} onPrev={prev}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{acqLabel[pt]}</label>
              <input type="date" value={store.acquisitionDate}
                onChange={(e) => store.set({ acquisitionDate: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{saleLabel[pt]}</label>
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
  }

  // SCR-S5: 거주기간 (주택만 — 분양권·조합원입주권은 visibleSteps에서 제외)
  if (step === 5) return (
    <>
      <StepShell step={stepNum} total={total} title="이 주택에 실제로 거주한 기간은 얼마나 되나요?"
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

  // SCR-S6: 조정대상지역
  if (step === 6) {
    const acqQ: Record<CapGainsPropertyType, string> = {
      주택: "이 주택을 살 때, 조정대상지역이었나요?",
      분양권: "이 분양권을 취득할 때, 조정대상지역이었나요?",
      조합원입주권: "이 조합원입주권을 취득할 때, 조정대상지역이었나요?",
    }
    const saleQ: Record<CapGainsPropertyType, string> = {
      주택: "이 주택을 팔 때, 조정대상지역인가요?",
      분양권: "이 분양권을 양도할 때, 조정대상지역인가요?",
      조합원입주권: "이 조합원입주권을 양도할 때, 조정대상지역인가요?",
    }
    return (
      <>
        <StepShell step={stepNum} total={total}
          title="조정대상지역 여부"
          hint="취득 시점과 양도 시점의 조정대상지역 여부가 각각 세금에 영향을 줍니다"
          canNext={store.isAdjAtAcquisition !== undefined && store.isAdjAtSale !== undefined}
          onNext={next} onPrev={prev}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">{acqQ[pt]}</p>
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
              <p className="text-sm font-semibold text-gray-700">{saleQ[pt]}</p>
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
  }

  // SCR-S7: 보유 수
  const countQ: Record<CapGainsPropertyType, string> = {
    주택: "파는 시점에 이 주택 외에 다른 주택이 있나요?",
    분양권: "파는 시점에 이 분양권 외에 다른 주택·분양권이 있나요?",
    조합원입주권: "파는 시점에 이 입주권 외에 다른 주택·입주권이 있나요?",
  }
  const countHint: Record<CapGainsPropertyType, string> = {
    주택: "1세대 1주택이면 일정 요건 충족 시 양도소득세가 비과세될 수 있어요",
    분양권: "2021.1.1 이후 취득한 분양권은 주택 수에 포함됩니다. 단, 수도권·광역시·세종시 외 지역 공급가격 3억원 이하 분양권은 다주택 중과 판단 시에는 제외돼요",
    조합원입주권: "입주권도 주택 수에 포함될 수 있습니다. 보유 수에 따라 세율이 달라질 수 있어요",
  }
  const noOtherLabel: Record<CapGainsPropertyType, string> = {
    주택: "없어요 (1세대 1주택)",
    분양권: "없어요 (이 분양권만 보유)",
    조합원입주권: "없어요 (이 입주권만 보유)",
  }
  return (
    <>
      <StepShell step={stepNum} total={total} title={countQ[pt]}
        hint={countHint[pt]}
        canNext={true} onNext={next} onPrev={prev} nextLabel="계산하기"
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <button onClick={() => store.set({ is1H1H: true, homeCount: 1 })}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left font-semibold text-sm transition-all ${
                store.is1H1H ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >{noOtherLabel[pt]}</button>
            <button onClick={() => store.set({ is1H1H: false })}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left font-semibold text-sm transition-all ${
                !store.is1H1H ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >있어요</button>
          </div>
          {!store.is1H1H && (
            <div className="space-y-2 pt-2">
              <p className="text-sm text-gray-600">지금 총 몇 채(건)를 보유하고 있나요?</p>
              <div className="flex gap-2">
                {([2, 3] as const).map((n) => (
                  <button key={n} onClick={() => store.set({ homeCount: n })}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      store.homeCount === n
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >{n === 2 ? "2채" : "3채 이상"}</button>
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
