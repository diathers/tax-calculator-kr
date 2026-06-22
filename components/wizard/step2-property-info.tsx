"use client"

import { KoreanNumberInput } from "@/components/inputs/korean-number-input"

interface Props {
  propertyPrice: number
  officialPrice: number
  exclusiveArea: number
  onChange: (updates: Partial<{ propertyPrice: number; officialPrice: number; exclusiveArea: number }>) => void
  onNext: () => void
  onBack: () => void
}

export function Step2PropertyInfo({ propertyPrice, officialPrice, exclusiveArea, onChange, onNext, onBack }: Props) {
  const canProceed = propertyPrice > 0 && exclusiveArea > 0

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">주택 정보를 입력해주세요</h2>

      <KoreanNumberInput
        label="주택 가격 (거래가액 또는 시가)"
        value={propertyPrice}
        onChange={(v) => onChange({ propertyPrice: v })}
        required
        placeholder="예) 500,000,000"
      />

      <div>
        <KoreanNumberInput
          label="기준시가 (공시가격)"
          value={officialPrice}
          onChange={(v) => onChange({ officialPrice: v })}
          placeholder="예) 300,000,000"
        />
        <p className="text-xs text-gray-400 mt-1">선택 입력 · 입력 시 재산세·종부세 계산 정확도가 높아집니다</p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          전용면적 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { v: 85, label: "85㎡ 이하", desc: "농어촌특별세 없음" },
            { v: 86, label: "85㎡ 초과", desc: "농어촌특별세 0.2% 추가" },
          ] as { v: number; label: string; desc: string }[]).map(({ v, label, desc }) => (
            <button key={v} type="button" onClick={() => onChange({ exclusiveArea: v })}
              className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                exclusiveArea === v
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <p className="font-semibold text-sm text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
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
          disabled={!canProceed}
          className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 transition-colors hover:bg-blue-700"
        >
          다음
        </button>
      </div>
    </div>
  )
}
