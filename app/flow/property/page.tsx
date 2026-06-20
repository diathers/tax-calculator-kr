// SCREEN ID: SCR-O1 ~ SCR-O3
// SCREEN NAME: 보유세 플로우 Step 1~3
// SCR-O1: Step 1 공시가격 입력
// SCR-O2: Step 2 주택 보유 수
// SCR-O3: Step 3 조정대상지역

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepShell } from "@/components/flow/step-shell"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { usePropertyFlowStore } from "@/hooks/stores/use-property-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"

export default function PropertyFlowPage() {
  const router = useRouter()
  const store = usePropertyFlowStore()
  const [step, setStep] = useState(1)
  const TOTAL = 3

  function next() { if (step < TOTAL) setStep(step + 1); else router.push("/flow/property/result") }
  function prev() { if (step === 1) router.push("/"); else setStep(step - 1) }

  // SCR-O1: 공시가격
  if (step === 1) return (
    <>
      <StepShell step={1} total={TOTAL}
        title="이 주택의 공시가격은 얼마인가요?"
        hint="공시가격은 부동산공시가격알리미(www.realtyprice.kr)에서 확인할 수 있어요"
        canNext={store.officialPrice > 0} onNext={next} onPrev={prev}
      >
        <div className="space-y-4">
          <KoreanNumberInput
            label="공시가격 (공동주택가격 또는 개별주택가격)"
            value={store.officialPrice}
            onChange={(v) => store.set({ officialPrice: v })}
            required
          />
          <a href="https://www.realtyprice.kr" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <span>🔍</span>
            <span>부동산공시가격알리미에서 확인하기 →</span>
          </a>
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-O1" />
    </>
  )

  // SCR-O2: 주택 보유 수
  if (step === 2) return (
    <>
      <StepShell step={2} total={TOTAL}
        title="1세대 기준으로 주택을 몇 채 보유하고 있나요?"
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 1, label: "1주택" },
            { value: 2, label: "2주택" },
            { value: 3, label: "3주택 이상" },
            { value: "법인", label: "법인" },
          ] as const).map(({ value, label }) => (
            <button key={String(value)} onClick={() => store.set({ homeCount: value })}
              className={`py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                store.homeCount === value
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >{label}</button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-O2" />
    </>
  )

  // SCR-O3: 조정대상지역
  return (
    <>
      <StepShell step={3} total={TOTAL}
        title="이 주택이 있는 곳은 조정대상지역인가요?"
        canNext={true} onNext={next} onPrev={prev} nextLabel="계산하기"
      >
        <div className="flex gap-2">
          {[
            { v: true, label: "네, 조정대상지역이에요" },
            { v: false, label: "아니오, 조정대상지역이 아니에요" },
          ].map(({ v, label }) => (
            <button key={String(v)} onClick={() => store.set({ isAdjustmentArea: v })}
              className={`flex-1 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                store.isAdjustmentArea === v
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >{label}</button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-O3" />
    </>
  )
}
