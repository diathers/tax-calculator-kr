"use client"

type AreaChoice = true | false | null

interface Props {
  value: boolean | null
  onChange: (v: AreaChoice) => void
  onNext: () => void
  onBack: () => void
}

const OPTIONS: { value: AreaChoice; label: string; desc: string }[] = [
  { value: true, label: "조정대상지역", desc: "서울 전역, 과천, 성남분당 등 고시 지역" },
  { value: false, label: "비조정대상지역", desc: "조정대상지역 외 지역" },
  { value: null, label: "모르겠어요", desc: "조정대상지역 기준으로 계산 (보수적 기준)" },
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

      {value === null && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 space-y-2">
          <p>
            조정대상지역은 세율에 큰 영향을 미칩니다. 국토교통부 실거래가 공개시스템에서 확인할 수 있어요.
          </p>
          <p className="text-xs text-amber-600">
            ※ 모르겠어요 선택 시 조정대상지역 기준(보수적)으로 계산하며, 결과 화면에 안내 문구가 표시됩니다.
          </p>
          <a
            href="https://www.molit.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-medium text-blue-600 underline hover:text-blue-800"
          >
            국토교통부 조정대상지역 고시 확인하기 →
          </a>
        </div>
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
          disabled={value === undefined}
          className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 transition-colors hover:bg-blue-700"
        >
          다음
        </button>
      </div>
    </div>
  )
}
