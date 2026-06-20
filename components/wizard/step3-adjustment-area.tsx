"use client"

type AreaChoice = true | false | null

interface Props {
  value: boolean | null
  onChange: (v: AreaChoice) => void
  onNext: () => void
  onBack: () => void
}

const OPTIONS: { value: AreaChoice; label: string; desc: string }[] = [
  { value: true, label: "네, 조정대상지역이에요", desc: "서울 전역, 과천, 성남분당 등 고시 지역" },
  { value: false, label: "아니오, 조정대상지역이 아니에요", desc: "조정대상지역 외 지역" },
]

export function Step3AdjustmentArea({ value, onChange, onNext, onBack }: Props) {
  const canProceed = value !== undefined && value !== undefined  // always true once rendered, but null is also a valid selection
  const selected = value !== undefined

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">주택 소재지를 확인해주세요</h2>
      <p className="text-sm text-gray-500">조정대상지역 여부는 세율에 큰 영향을 미칩니다.</p>

      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
              value === opt.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="font-medium text-gray-900">{opt.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={value === undefined}
          className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 transition-colors hover:bg-blue-700"
        >
          다음
        </button>
      </div>
    </div>
  )
}
