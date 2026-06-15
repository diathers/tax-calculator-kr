"use client"

import { KoreanNumberInput } from "@/components/inputs/korean-number-input"

const sqmToPyeong = (sqm: number) => (sqm / 3.3058).toFixed(1)

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
        <div className="relative">
          <input
            type="number"
            value={exclusiveArea || ""}
            onChange={(e) => onChange({ exclusiveArea: Number(e.target.value) })}
            placeholder="예) 84"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute right-3 top-2.5 text-sm text-gray-400">㎡</span>
        </div>
        {exclusiveArea > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {exclusiveArea}㎡ ≈ {sqmToPyeong(exclusiveArea)}평
          </p>
        )}
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
