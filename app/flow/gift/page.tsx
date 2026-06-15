// SCREEN ID: SCR-G1 ~ SCR-G6
// SCREEN NAME: 증여세 플로우 Step 1~6
// SCR-G1: Step 1 증여 관계 선택
// SCR-G2: Step 2 증여재산 가액 입력
// SCR-G3: Step 3 채무 승계 여부
// SCR-G4: Step 4 조정대상지역
// SCR-G5: Step 5 수증자 주택 수
// SCR-G6: Step 6 이전 증여 이력

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepShell } from "@/components/flow/step-shell"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { useGiftFlowStore, type GiftRelationship } from "@/hooks/stores/use-gift-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"

const RELATIONSHIPS: { value: GiftRelationship; label: string; deduction: string }[] = [
  { value: "배우자", label: "배우자", deduction: "6억 공제" },
  { value: "직계존속", label: "직계존속 (부모→자녀)", deduction: "5천만 공제" },
  { value: "직계비속", label: "직계비속 (자녀→부모)", deduction: "5천만 공제" },
  { value: "기타친족", label: "기타 친족", deduction: "1천만 공제" },
  { value: "타인", label: "타인 (남남)", deduction: "공제 없음" },
]

const RECIPIENT_HOME_COUNTS: { value: 0 | 1 | 2; label: string }[] = [
  { value: 0, label: "없음 (무주택)" },
  { value: 1, label: "1주택" },
  { value: 2, label: "2주택 이상" },
]

export default function GiftFlowPage() {
  const router = useRouter()
  const store = useGiftFlowStore()
  const [step, setStep] = useState(1)
  const TOTAL = 6

  function next() { if (step < TOTAL) setStep(step + 1); else router.push("/flow/gift/result") }
  function prev() { if (step === 1) router.push("/"); else setStep(step - 1) }

  // SCR-G1: 관계
  if (step === 1) return (
    <>
      <StepShell step={1} total={TOTAL} title="누구에게 증여하시나요?"
        hint="관계에 따라 공제 금액이 달라집니다"
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="space-y-2">
          {RELATIONSHIPS.map(({ value, label, deduction }) => (
            <button key={value} onClick={() => store.set({ relationship: value })}
              className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                store.relationship === value
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="font-semibold text-gray-900 text-sm">{label}</span>
              <span className="text-xs text-gray-400">{deduction}</span>
            </button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-G1" />
    </>
  )

  // SCR-G2: 증여재산 가액
  if (step === 2) return (
    <>
      <StepShell step={2} total={TOTAL} title="증여하는 주택의 가액은 얼마인가요?"
        hint="시가를 알 수 없는 경우 공시가격(기준시가)을 입력해도 됩니다"
        canNext={store.propertyValue > 0} onNext={next} onPrev={prev}
      >
        <KoreanNumberInput label="증여재산 가액 (시가 기준)" value={store.propertyValue}
          onChange={(v) => store.set({ propertyValue: v })} required />
      </StepShell>
      <ScreenIdBadge id="SCR-G2" />
    </>
  )

  // SCR-G3: 채무 승계 여부
  if (step === 3) return (
    <>
      <StepShell step={3} total={TOTAL} title="이 주택에 전세보증금이나 대출이 있나요?"
        hint="채무를 함께 넘기는 '부담부증여'는 증여세와 양도소득세가 함께 발생합니다"
        canNext={!store.hasDebt || store.debtAmount > 0}
        onNext={next} onPrev={prev}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => store.set({ hasDebt: false })}
              className={`flex-1 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                !store.hasDebt ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >없어요</button>
            <button onClick={() => store.set({ hasDebt: true })}
              className={`flex-1 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                store.hasDebt ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >있어요 (부담부증여)</button>
          </div>
          {store.hasDebt && (
            <div className="space-y-4 pt-2">
              <KoreanNumberInput label="승계할 채무액 (전세보증금 또는 담보대출 잔액)"
                value={store.debtAmount} onChange={(v) => store.set({ debtAmount: v })} required />
              <KoreanNumberInput label="증여자 취득가액 (양도세 계산용)"
                value={store.donorAcquisitionPrice} onChange={(v) => store.set({ donorAcquisitionPrice: v })} />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">증여자 취득일</label>
                <input type="date" value={store.donorAcquisitionDate}
                  onChange={(e) => store.set({ donorAcquisitionDate: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400" />
              </div>
            </div>
          )}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-G3" />
    </>
  )

  // SCR-G4: 조정대상지역
  if (step === 4) return (
    <>
      <StepShell step={4} total={TOTAL} title="이 주택이 있는 곳은 조정대상지역인가요?"
        hint="조정대상지역이면 수증자의 주택 수에 따라 취득세율이 달라집니다"
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="space-y-2">
          {[
            { v: true as boolean | null, label: "네, 조정대상지역이에요" },
            { v: false as boolean | null, label: "아니요, 해당 없어요" },
            { v: null, label: "잘 모르겠어요 (조정대상지역으로 계산)" },
          ].map(({ v, label }) => (
            <button key={String(v)} onClick={() => store.set({ isAdjustmentArea: v })}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left font-medium text-sm transition-all ${
                store.isAdjustmentArea === v
                  ? "border-orange-400 bg-orange-50 text-orange-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >{label}</button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-G4" />
    </>
  )

  // SCR-G5: 수증자 주택 수
  if (step === 5) return (
    <>
      <StepShell step={5} total={TOTAL} title="증여받는 분이 현재 주택을 몇 채 보유하고 있나요?"
        hint="수증자의 주택 수와 조정대상지역 여부에 따라 취득세율이 달라집니다"
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="space-y-2">
          {RECIPIENT_HOME_COUNTS.map(({ value, label }) => (
            <button key={value} onClick={() => store.set({ recipientHomeCount: value })}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left font-semibold text-sm transition-all ${
                store.recipientHomeCount === value
                  ? "border-orange-400 bg-orange-50 text-orange-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >{label}</button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-G5" />
    </>
  )

  // SCR-G6: 이전 증여 이력
  return (
    <>
      <StepShell step={6} total={TOTAL} title="최근 10년 안에 같은 분에게 증여받은 적 있나요?"
        hint="10년 이내 동일인에게 받은 증여는 합산해서 세금을 계산합니다"
        canNext={true} onNext={next} onPrev={prev} nextLabel="계산하기"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => store.set({ hasPriorGifts: false, priorGifts10Y: 0 })}
              className={`flex-1 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                !store.hasPriorGifts ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >없어요</button>
            <button onClick={() => store.set({ hasPriorGifts: true })}
              className={`flex-1 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                store.hasPriorGifts ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >있어요</button>
          </div>
          {store.hasPriorGifts && (
            <KoreanNumberInput label="과거 증여재산 합산액"
              value={store.priorGifts10Y} onChange={(v) => store.set({ priorGifts10Y: v })} required />
          )}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-G6" />
    </>
  )
}
