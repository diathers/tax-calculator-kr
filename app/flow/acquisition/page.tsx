// SCREEN ID: SCR-A1 ~ SCR-A7
// SCREEN NAME: 살 때 플로우 Step 1~7
// FLOW: 살 때 (취득세)
// SCR-A1: Step 1 취득유형 선택
// SCR-A2: Step 2 주택 수 선택
// SCR-A3: Step 3 조정대상지역
// SCR-A4: Step 4 취득가액 입력
// SCR-A5: Step 5 공시가격 입력
// SCR-A6: Step 6 전용면적 입력
// SCR-A7: Step 7 추가정보 (감면·특례·취득일)

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepShell } from "@/components/flow/step-shell"
import { KoreanNumberInput } from "@/components/inputs/korean-number-input"
import { useAcquisitionFlowStore, type AcqType, type AcqHomeCount, type DonorHomeCount } from "@/hooks/stores/use-acquisition-flow-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"

const ACQ_TYPES: { value: AcqType; label: string; desc: string }[] = [
  { value: "매매", label: "매매", desc: "일반 부동산 매입" },
  { value: "상속", label: "상속", desc: "사망에 의한 취득" },
  { value: "증여", label: "증여", desc: "무상으로 받는 경우" },
  { value: "신축", label: "신축 (원시취득)", desc: "직접 지어서 취득" },
]

const HOME_COUNTS: { value: AcqHomeCount; label: string }[] = [
  { value: 1, label: "1주택" },
  { value: 2, label: "2주택" },
  { value: 3, label: "3주택" },
  { value: 4, label: "4주택 이상" },
  { value: "법인", label: "법인" },
]

// step 번호: 1~8
// 8 = 증여자 주택 수 (조정대상지역 + 3억 이상일 때만 노출)
// 증여 경로: 1(유형)→3(조정)→4(가격)→[8(증여자주택수)]→6(면적)→7(추가)
// 매매 경로: 1→2(수증자주택수)→3(조정)→4(가격)→6(면적)→7(추가)
// 상속/신축은 단순 경로
type RawStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

function visibleSteps(type: AcqType, hc: AcqHomeCount, isAdj: boolean | null, price: number = 0): RawStep[] {
  if (type === "상속") return [1, 4, 6, 7]
  if (type === "신축") return [1, 4, 6]
  if (type === "증여") {
    // 조정대상지역이면서 3억 이상이면 증여자 주택 수 질문 추가
    const needsDonorCount = isAdj === true && price >= 300_000_000
    return needsDonorCount ? [1, 3, 4, 8, 6, 7] : [1, 3, 4, 6, 7]
  }
  // 매매
  return [1, 2, 3, 4, 6, 7]
}

export default function AcquisitionFlowPage() {
  const router = useRouter()
  const store = useAcquisitionFlowStore()
  const [rawStep, setRawStep] = useState<RawStep>(1)

  const visible = visibleSteps(store.acquisitionType, store.homeCount, store.isAdjustmentArea, store.acquisitionPrice)
  const visIdx = visible.indexOf(rawStep)
  const displayStep = visIdx + 1
  const displayTotal = visible.length

  function next() {
    const nextIdx = visIdx + 1
    if (nextIdx < visible.length) setRawStep(visible[nextIdx] as RawStep)
    else router.push("/flow/acquisition/result")
  }
  function prev() {
    if (visIdx === 0) router.push("/")
    else setRawStep(visible[visIdx - 1] as RawStep)
  }

  const priceMeta: Record<AcqType, { label: string; hint: string }> = {
    매매: { label: "거래 금액 (매매가)", hint: "계약서상 매매가액을 입력해주세요" },
    증여: { label: "공시가격 (기준시가)", hint: "공시가격을 입력하세요. 조정대상지역 + 공시가 3억 이상 여부를 판단하는 기준입니다." },
    상속: { label: "취득가액 (시가 또는 공시가격)", hint: "시가를 모를 경우 공시가격을 입력하셔도 됩니다" },
    신축: { label: "시가표준액 (과세표준)", hint: "사용승인일 당시 시가표준액을 입력해주세요" },
  }

  // SCR-A1: 취득유형 선택
  if (rawStep === 1) return (
    <>
      <StepShell step={displayStep} total={displayTotal}
        title="어떻게 취득하시나요?" hint="취득 방법에 따라 세율이 달라집니다"
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="space-y-2">
          {ACQ_TYPES.map(({ value, label, desc }) => (
            <button key={value} onClick={() => store.set({ acquisitionType: value })}
              className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                store.acquisitionType === value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="font-semibold text-gray-900">{label}</span>
              <span className="text-sm text-gray-400">{desc}</span>
            </button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-A1" />
    </>
  )

  // SCR-A2: 주택 수 선택
  if (rawStep === 2) return (
    <>
      <StepShell step={displayStep} total={displayTotal}
        title="이 주택을 취득하면 몇 채가 되나요?"
        hint={`취득 후 1세대(본인·배우자·같은 세대원) 주택 수 기준입니다.\n분양권·조합원입주권도 포함될 수 있어요.`}
        canNext={true} onNext={next} onPrev={prev}
      >
        <div className="grid grid-cols-2 gap-2">
          {HOME_COUNTS.map(({ value, label }) => (
            <button key={String(value)} onClick={() => store.set({ homeCount: value, isTemporary2House: value !== 2 ? false : store.isTemporary2House })}
              className={`py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                store.homeCount === value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-A2" />
    </>
  )

  // SCR-A3: 조정대상지역
  if (rawStep === 3) return (
    <>
    <StepShell step={displayStep} total={displayTotal}
      title="이 주택이 있는 곳은 조정대상지역인가요?"
      canNext={true} onNext={next} onPrev={prev}
    >
      <div className="space-y-2">
        {[
          { v: true, label: "네, 조정대상지역이에요" },
          { v: false, label: "아니오, 조정대상지역이 아니에요" },
        ].map(({ v, label }) => (
          <button key={String(v)} onClick={() => store.set({ isAdjustmentArea: v })}
            className={`w-full rounded-xl border-2 px-4 py-3.5 text-left font-medium text-sm transition-all ${
              store.isAdjustmentArea === v
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
        {/* 일시적 2주택 (매매 2주택+조정) */}
        {store.acquisitionType === "매매" && store.homeCount === 2 && (store.isAdjustmentArea === true) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox"
                checked={store.isTemporary2House}
                onChange={(e) => store.set({ isTemporary2House: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-blue-600"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">일시적 2주택 해당</p>
                <p className="text-xs text-gray-500">3년 이내 종전 주택 처분 예정 → 일반세율 적용</p>
              </div>
            </label>
          </div>
        )}
      </div>
    </StepShell>
    <ScreenIdBadge id="SCR-A3" />
    </>
  )

  // SCR-A4: 취득가액 입력
  if (rawStep === 4) return (
    <>
      <StepShell step={displayStep} total={displayTotal}
        title="취득 가격이 얼마인가요?"
        hint={priceMeta[store.acquisitionType].hint}
        canNext={store.acquisitionPrice > 0} onNext={next} onPrev={prev}
      >
        <KoreanNumberInput
          label={priceMeta[store.acquisitionType].label}
          value={store.acquisitionPrice}
          onChange={(v) => store.set({ acquisitionPrice: v })}
          required
        />
      </StepShell>
      <ScreenIdBadge id="SCR-A4" />
    </>
  )

  // 증여 조건부: 증여자 주택 수 (조정대상지역 + 공시가 3억 이상일 때만 노출)
  if (rawStep === 8) return (
    <>
      <StepShell step={displayStep} total={displayTotal}
        title="증여자(부모, 조부모, 배우자)가 보유한 주택은 몇 채인가요?"
        canNext={store.donorHomeCount !== null} onNext={next} onPrev={prev}
      >
        <p className="text-sm text-gray-500 -mt-1 mb-3">
          증여대상 주택을 포함하여 증여자가 속한 1세대의 주택 수 기준입니다. 분양권, 조합원입주권도 포함될 수 있어요.
        </p>
        <div className="space-y-2">
          {([
            { v: "1주택" as DonorHomeCount, label: "1주택", desc: "증여자 기준 1세대가 1주택 보유 → 3.5% 적용" },
            { v: "2주택이상" as DonorHomeCount, label: "2주택 이상", desc: "증여자 기준 1세대가 2주택 이상 보유 → 12% 중과 적용" },
          ] as { v: DonorHomeCount; label: string; desc: string }[]).map(({ v, label, desc }) => (
            <button key={v} onClick={() => store.set({ donorHomeCount: v })}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                store.donorHomeCount === v
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
      <ScreenIdBadge id="SCR-A8-gift" />
    </>
  )

  // SCR-A5: 공시가격 입력 (증여: 중과 판단)
  if (rawStep === 5) return (
    <>
      <StepShell step={displayStep} total={displayTotal}
        title="공시가격(기준시가)을 아시나요?"
        hint="부동산공시가격알리미(realtyprice.kr)에서 확인할 수 있어요.\n증여 취득세 중과 여부 판단에 사용됩니다 (조정대상지역 + 공시가 3억 이상 → 12%)."
        canNext={true} onNext={next} onPrev={prev}
      >
        <KoreanNumberInput
          label="공시가격 (기준시가)"
          value={store.officialPrice}
          onChange={(v) => store.set({ officialPrice: v })}
          helpText="입력하지 않으면 취득가액 기준으로 판단합니다"
        />
        {store.isAdjustmentArea !== false && (store.officialPrice || store.acquisitionPrice) >= 300_000_000 && (
          <div className="mt-2 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-xs text-orange-700">
            ⚠️ 조정대상지역 + 공시가 3억 이상 → 증여 취득세 12% 중과 적용 예정
          </div>
        )}
      </StepShell>
      <ScreenIdBadge id="SCR-A5" />
    </>
  )

  // SCR-A6: 전용면적 입력
  if (rawStep === 6) return (
    <>
      <StepShell step={displayStep} total={displayTotal}
        title="전용면적은 얼마인가요?"
        hint="농어촌특별세 계산에 사용됩니다. 85㎡ 초과 시 0.2% 추가됩니다."
        canNext={true} onNext={next} onPrev={prev}
        nextLabel={store.acquisitionType === "신축" ? "계산하기" : "다음"}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">전용면적 (㎡)</label>
          <input
            type="number"
            value={store.exclusiveArea || ""}
            onChange={(e) => store.set({ exclusiveArea: Number(e.target.value) })}
            placeholder="예: 84"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {store.exclusiveArea > 0 && (
            <p className="text-xs text-gray-400">
              = {(store.exclusiveArea / 3.3058).toFixed(1)}평
              {store.exclusiveArea > 85 ? " · 85㎡ 초과 → 농어촌특별세 0.2% 추가" : " · 85㎡ 이하 → 농어촌특별세 없음"}
            </p>
          )}
        </div>
      </StepShell>
      <ScreenIdBadge id="SCR-A6" />
    </>
  )

  // SCR-A7: 추가정보 (감면·특례·취득일)
  return (
    <>
    <StepShell step={displayStep} total={displayTotal}
      title="추가 정보 (선택사항)"
      hint="해당하는 항목을 선택하면 더 정확한 계산이 가능해요."
      canNext={true} onNext={next} onPrev={prev}
      nextLabel="계산하기"
    >
      <div className="space-y-3">

        {/* 취득일 */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">취득일 (선택)</label>
          <input
            type="date"
            value={store.acquisitionDate}
            onChange={(e) => store.set({ acquisitionDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">입력 시 신고납부 기한을 알려드려요</p>
        </div>

        {/* 상속 특례 */}
        {store.acquisitionType === "상속" && (
          <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5">
            <input type="checkbox"
              checked={store.isInheritanceSpecial}
              onChange={(e) => store.set({ isInheritanceSpecial: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-blue-600"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">1가구1주택 특례</p>
              <p className="text-xs text-gray-500">상속으로 1가구1주택이 되는 경우 → 0.8% 적용</p>
            </div>
          </label>
        )}

        {/* 이혼재산분할 (증여) */}
        {store.acquisitionType === "증여" && (
          <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5">
            <input type="checkbox"
              checked={store.isDivorceSplit}
              onChange={(e) => store.set({ isDivorceSplit: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-blue-600"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">이혼 재산분할 취득</p>
              <p className="text-xs text-gray-500">이혼 재산분할에 의한 취득 → 1.5% 적용</p>
            </div>
          </label>
        )}

        {/* 생애최초 (매매 1주택) */}
        {store.acquisitionType === "매매" && store.homeCount === 1 && (
          <>
            <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5">
              <input type="checkbox"
                checked={store.isFirstTimeBuyer}
                onChange={(e) => {
                  store.set({ isFirstTimeBuyer: e.target.checked })
                  if (e.target.checked) store.set({ isBirthRelated: false })
                }}
                className="mt-0.5 w-4 h-4 accent-blue-600"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">생애최초 주택 취득</p>
                <p className="text-xs text-gray-500">취득가 제한 없음 · 최대 200만원 감면</p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5">
              <input type="checkbox"
                checked={store.isBirthRelated}
                onChange={(e) => {
                  store.set({ isBirthRelated: e.target.checked })
                  if (e.target.checked) store.set({ isFirstTimeBuyer: false })
                }}
                className="mt-0.5 w-4 h-4 accent-blue-600"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">출산·양육 주택 취득</p>
                <p className="text-xs text-gray-500">자녀 출산·양육 목적 취득 · 최대 500만원 감면</p>
              </div>
            </label>
          </>
        )}

        {/* 출산양육 (매매 2주택 이상도 가능) */}
        {store.acquisitionType === "매매" && store.homeCount !== 1 && (
          <label className="flex items-start gap-2.5 cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5">
            <input type="checkbox"
              checked={store.isBirthRelated}
              onChange={(e) => store.set({ isBirthRelated: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-blue-600"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">출산·양육 주택 취득</p>
              <p className="text-xs text-gray-500">자녀 출산·양육 목적 취득 · 최대 500만원 감면</p>
            </div>
          </label>
        )}

      </div>
    </StepShell>
    <ScreenIdBadge id="SCR-A7" />
    </>
  )
}
