"use client"

import type { Situation } from "@/hooks/stores/use-wizard-store"

const SITUATIONS: { value: Situation; label: string; sub: string }[] = [
  { value: "취득", label: "주택을 취득하려고 해요", sub: "매매·분양·신축·상속·증여" },
  { value: "양도", label: "주택을 양도(매도)하려고 해요", sub: "" },
  { value: "증여", label: "주택을 증여하거나 받으려고 해요", sub: "" },
  { value: "상속", label: "주택을 상속하거나 받으려고 해요", sub: "" },
  { value: "보유", label: "주택을 보유 중인데 궁금한 게 있어요", sub: "재산세·종부세 등" },
  { value: "임대", label: "주택을 임대 중인데 궁금한 게 있어요", sub: "임대소득세·간주임대료 등" },
]

interface Props {
  value: Situation | null
  onChange: (v: Situation) => void
  onNext: () => void
}

export function Step1Situation({ value, onChange, onNext }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">어떤 상황이신가요?</h2>
      <div className="space-y-2">
        {SITUATIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
              value === s.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="font-medium text-gray-900">{s.label}</div>
            {s.sub && <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>}
          </button>
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={!value}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 transition-colors hover:bg-blue-700"
      >
        다음
      </button>
    </div>
  )
}
