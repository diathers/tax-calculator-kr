// SCREEN ID: SCR-R1 ~ SCR-R4
// SCREEN NAME: 임대소득세 플로우 Step 1~4
// SCR-R1: Step 1 임대 유형 선택
// SCR-R2: Step 2 임대 조건 입력
// SCR-R3: Step 3 주택 보유 수
// SCR-R4: Step 4 다른 소득 여부

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepShell } from "@/components/flow/step-shell"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { useRentalFlowStore, type RentalType } from "@/hooks/stores/use-rental-flow-store"
import { formatTaxAmount } from "@/lib/utils"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"

const RENTAL_TYPES: { value: RentalType; label: string; desc: string }[] = [
  { value: "월세", label: "월세", desc: "보증금 없이 월세만" },
  { value: "전세", label: "전세", desc: "전세보증금만 있는 경우" },
  { value: "혼합", label: "월세 + 보증금 혼합", desc: "보증금 + 월세 함께" },
]

export default function RentalFlowPage() {
  const router = useRouter()
  const store = useRentalFlowStore()
  const [step, setStep] = useState(1)
  const TOTAL = 4

  function next() { if (step < TOTAL) setStep(step + 1); else router.push("/flow/rental/result") }
  function prev() { if (step === 1) router.push("/"); else setStep(step - 1) }

  const annualRent = store.rentalType === "전세"
    ? Math.floor(store.chonsaDeposit * 0.04)
    : store.monthlyRent * 12

  // SCR-R1: 임대 유형
  if (step === 1) return (
    <>
      <StepShell step={1} total={TOTAL} title="어떤 형태로 임대하고 있나요?"
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="space-y-2">
          {RENTAL_TYPES.map(({ value, label, desc }) => (
            <button key={value} onClick={() => store.set({ rentalType: value })}
              className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                store.rentalType === value
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="font-semibold text-gray-900 text-sm">{label}</span>
              <span className="text-xs text-gray-400">{desc}</span>
            </button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-R1" />
    </>
  )

  // SCR-R2: 임대 조건
  if (step === 2) {
    const canNext = store.rentalType === "전세"
      ? store.chonsaDeposit > 0
      : store.monthlyRent > 0

    return (
      <>
        <StepShell step={2} total={TOTAL} title="임대 조건을 입력해주세요"
          canNext={canNext} onNext={next} onPrev={prev}
        >
          <div className="space-y-4">
            {store.rentalType === "전세" ? (
              <>
                <KoreanNumberInput label="전세보증금" value={store.chonsaDeposit}
                  onChange={(v) => store.set({ chonsaDeposit: v })} required
                  helpText="전세는 간주임대료 과세 대상일 수 있어요" />
                {store.chonsaDeposit > 0 && (
                  <div className="rounded-xl bg-teal-50 border border-teal-100 px-3 py-2 text-sm text-teal-700">
                    간주임대료 (4% 기준): 연 {formatTaxAmount(Math.floor(store.chonsaDeposit * 0.04))}
                  </div>
                )}
              </>
            ) : (
              <>
                {store.rentalType === "혼합" && (
                  <KoreanNumberInput label="보증금" value={store.deposit}
                    onChange={(v) => store.set({ deposit: v })} />
                )}
                <KoreanNumberInput label="월세" value={store.monthlyRent}
                  onChange={(v) => store.set({ monthlyRent: v })} required />
                {annualRent > 0 && (
                  <div className="rounded-xl bg-teal-50 border border-teal-100 px-3 py-2 text-sm text-teal-700">
                    연간 임대수입: {formatTaxAmount(annualRent)}
                  </div>
                )}
              </>
            )}
          </div>
        </StepShell>
        <ScreenIdBadge id="SCR-R2" />
      </>
    )
  }

  // SCR-R3: 주택 보유 수
  if (step === 3) return (
    <>
      <StepShell step={3} total={TOTAL} title="주택을 몇 채 보유하고 있나요?"
        hint={`1주택자: 기준시가 12억 이하 임대 시 비과세\n2주택자: 월세 과세, 전세 비과세\n3주택 이상: 월세·전세 모두 과세 대상`}
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="space-y-2">
          {([1, 2, 3] as const).map((n) => (
            <button key={n} onClick={() => store.set({ homeCount: n })}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left font-semibold text-sm transition-all ${
                store.homeCount === n
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >{n === 3 ? "3주택 이상" : `${n}주택`}</button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-R3" />
    </>
  )

  // SCR-R4: 다른 소득 여부
  return (
    <>
      <StepShell step={4} total={TOTAL} title="임대소득 외에 다른 소득이 있나요?"
        hint="다른 소득과 합산 여부에 따라 세율이 달라질 수 있어요"
        canNext={true} onNext={next} onPrev={prev} nextLabel="계산하기"
      >
        <div className="flex gap-2">
          <button onClick={() => store.set({ hasOtherIncome: false })}
            className={`flex-1 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
              !store.hasOtherIncome ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >없어요</button>
          <button onClick={() => store.set({ hasOtherIncome: true })}
            className={`flex-1 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
              store.hasOtherIncome ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >있어요 (근로·사업소득 등)</button>
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-R4" />
    </>
  )
}
