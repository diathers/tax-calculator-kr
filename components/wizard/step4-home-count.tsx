"use client"

import type { Situation, HomeCount } from "@/hooks/stores/use-wizard-store"

const OPTIONS: { value: HomeCount; label: string }[] = [
  { value: 1, label: "1주택" },
  { value: 2, label: "2주택" },
  { value: 3, label: "3주택 이상" },
  { value: "법인", label: "법인" },
]

interface Props {
  value: HomeCount | null
  situation: Situation | null
  onChange: (v: HomeCount) => void
  onNext: () => void
  onBack: () => void
}

export function Step4HomeCount({ value, situation, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">현재 1세대 기준 보유 주택은 몇 채인가요?</h2>

      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 space-y-1">
        <p>본인과 배우자, 같은 세대 가족이 보유한 주택 수를 모두 합산해주세요.</p>
        <p>분양권·입주권도 주택 수에 포함될 수 있습니다.</p>
      </div>

      {situation === "취득" && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
          취득 후 주택 수를 기준으로 세율이 결정됩니다. 이 주택을 취득하면 총 몇 채가 되는지 선택해주세요.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`py-3.5 rounded-xl border-2 font-medium text-sm transition-all ${
              value === opt.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value === "법인" && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
          법인 취득세는 12%로 계산됩니다. 정확한 법인세 계산은 법인양도소득세 계산기를 이용하세요.
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={value === null}
          className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 transition-colors hover:bg-blue-700"
        >
          다음
        </button>
      </div>
    </div>
  )
}
