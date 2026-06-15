// SCREEN ID: SCR-I1 ~ SCR-I4
// SCREEN NAME: 상속세 플로우 Step 1~4
// SCR-I1: Step 1 상속재산 가액 입력
// SCR-I2: Step 2 상속인 구성
// SCR-I3: Step 3 다른 상속재산 여부
// SCR-I4: Step 4 상속인 주택 수

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepShell } from "@/components/flow/step-shell"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { useInheritanceFlowStore } from "@/hooks/stores/use-inheritance-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"

export default function InheritanceFlowPage() {
  const router = useRouter()
  const store = useInheritanceFlowStore()
  const [step, setStep] = useState(1)
  const TOTAL = 4

  function next() { if (step < TOTAL) setStep(step + 1); else router.push("/flow/inheritance/result") }
  function prev() { if (step === 1) router.push("/"); else setStep(step - 1) }

  // SCR-I1: 상속재산 가액
  if (step === 1) return (
    <>
      <StepShell step={1} total={TOTAL} title="상속받는 주택의 가액은 얼마인가요?"
        hint="시가를 알 수 없는 경우 공시가격(기준시가)을 입력해도 됩니다"
        canNext={store.propertyValue > 0} onNext={next} onPrev={prev}
      >
        <KoreanNumberInput label="상속재산 가액 (시가 기준)" value={store.propertyValue}
          onChange={(v) => store.set({ propertyValue: v })} required />
      </StepShell>
      <ScreenIdBadge id="SCR-I1" />
    </>
  )

  // SCR-I2: 상속인 구성
  if (step === 2) return (
    <>
      <StepShell step={2} total={TOTAL} title="상속인이 어떻게 되나요?"
        hint="상속인 구성에 따라 공제 금액이 달라집니다"
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="space-y-4">
          <button onClick={() => store.set({ spouseAlive: !store.spouseAlive })}
            className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
              store.spouseAlive ? "border-red-400 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span className="font-semibold text-gray-900 text-sm">배우자 있음</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${store.spouseAlive ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
              {store.spouseAlive ? "선택됨" : "선택 안 됨"}
            </span>
          </button>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">자녀 수</label>
            <div className="flex items-center gap-3">
              <button onClick={() => store.set({ childCount: Math.max(0, store.childCount - 1) })}
                className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors">−</button>
              <span className="flex-1 text-center font-bold text-xl text-gray-900">{store.childCount}명</span>
              <button onClick={() => store.set({ childCount: store.childCount + 1 })}
                className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors">+</button>
            </div>
          </div>

          {store.childCount > 0 && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">미성년 자녀 수 (선택)</label>
              <div className="flex items-center gap-3">
                <button onClick={() => store.set({ minorChildCount: Math.max(0, store.minorChildCount - 1) })}
                  className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors">−</button>
                <span className="flex-1 text-center font-bold text-xl text-gray-900">{store.minorChildCount}명</span>
                <button onClick={() => store.set({ minorChildCount: Math.min(store.childCount, store.minorChildCount + 1) })}
                  className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors">+</button>
              </div>
            </div>
          )}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-I2" />
    </>
  )

  // SCR-I3: 다른 상속재산
  if (step === 3) return (
    <>
      <StepShell step={3} total={TOTAL} title="주택 외에 다른 상속재산도 있나요?"
        hint="전체 상속재산을 합산해야 정확한 상속세를 계산할 수 있어요"
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => store.set({ otherEstateValue: 0 })}
              className={`flex-1 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                store.otherEstateValue === 0 ? "border-red-400 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >이 주택이 전부예요</button>
            <button onClick={() => store.set({ otherEstateValue: store.otherEstateValue || 100000000 })}
              className={`flex-1 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                store.otherEstateValue > 0 ? "border-red-400 bg-red-50 text-red-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >다른 재산도 있어요</button>
          </div>
          {store.otherEstateValue > 0 && (
            <KoreanNumberInput label="다른 상속재산 합산액 (선택)"
              value={store.otherEstateValue} onChange={(v) => store.set({ otherEstateValue: v })}
              helpText="금융재산, 기타 부동산 등을 합산해 입력해주세요" />
          )}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-I3" />
    </>
  )

  // SCR-I4: 상속인 주택 수
  return (
    <>
      <StepShell step={4} total={TOTAL} title="상속받는 분이 현재 주택을 몇 채 보유하고 있나요?"
        hint="상속으로 인한 주택은 5년간 주택 수 산정에서 제외될 수 있습니다"
        canNext={true} onNext={next} onPrev={prev} nextLabel="계산하기"
      >
        <div className="space-y-2">
          {([
            { value: 0, label: "없음 (무주택)" },
            { value: 1, label: "1주택" },
            { value: 2, label: "2주택 이상" },
          ] as const).map(({ value, label }) => (
            <button key={value} onClick={() => store.set({ recipientHomeCount: value })}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left font-semibold text-sm transition-all ${
                store.recipientHomeCount === value
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >{label}</button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-I4" />
    </>
  )
}
