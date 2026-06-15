"use client"

import type { Situation, TaxType } from "@/hooks/stores/use-wizard-store"
import { RECOMMENDED_TAXES } from "@/hooks/stores/use-wizard-store"

interface TaxDef {
  value: TaxType
  label: string
  desc: string
}

const ALL_TAXES: TaxDef[] = [
  { value: "취득세", label: "취득세", desc: "주택 취득 시 납부" },
  { value: "양도소득세", label: "양도소득세", desc: "양도 시 발생하는 소득세" },
  { value: "재산세", label: "재산세", desc: "매년 6월·9월 부과" },
  { value: "종합부동산세", label: "종합부동산세", desc: "12월 부과, 재산세와 통합 계산" },
  { value: "증여세", label: "증여세", desc: "증여 시 수증자 납부" },
  { value: "상속세", label: "상속세", desc: "상속 재산에 부과" },
  { value: "부담부증여", label: "부담부증여", desc: "증여세 + 양도세 통합 계산" },
  { value: "주택임대소득세", label: "주택임대소득세", desc: "임대소득에 부과" },
]

const SITUATION_NOTES: Partial<Record<Situation, string>> = {
  취득: "취득 후에는 재산세·종부세가 발생하고, 향후 양도소득세도 고려하세요.",
  양도: "양도 vs 증여 vs 부담부증여 중 절세 방법을 비교할 수 있어요.",
  증여: "수증자도 취득세를 납부해야 합니다. 일반증여 vs 부담부증여도 비교해보세요.",
  상속: "상속 취득 시 취득세도 함께 계산해보세요.",
  임대: "연간 임대수입 2천만원 초과 시 종합소득세 신고 대상입니다.",
}

interface Props {
  situation: Situation | null
  selected: TaxType[]
  onChange: (taxes: TaxType[]) => void
  onNext: () => void
  onBack: () => void
}

export function Step5TaxSelect({ situation, selected, onChange, onNext, onBack }: Props) {
  const recommended = situation ? RECOMMENDED_TAXES[situation] : []

  const toggle = (tax: TaxType) => {
    onChange(selected.includes(tax) ? selected.filter((t) => t !== tax) : [...selected, tax])
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">어떤 세금이 궁금하신가요?</h2>

      {situation && recommended.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">추천 세목</p>
          <div className="space-y-1.5">
            {ALL_TAXES.filter((t) => recommended.includes(t.value)).map((t) => (
              <button
                key={t.value}
                onClick={() => toggle(t.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selected.includes(t.value)
                    ? "border-blue-500 bg-blue-50"
                    : "border-blue-200 hover:border-blue-300 bg-blue-50/30"
                }`}
              >
                <span className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                  selected.includes(t.value) ? "border-blue-500 bg-blue-500" : "border-gray-300"
                }`}>
                  {selected.includes(t.value) && <span className="text-white text-xs">✓</span>}
                </span>
                <div>
                  <span className="font-medium text-gray-900">{t.label}</span>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">추천</span>
                  <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">전체 세목</p>
        <div className="space-y-1.5">
          {ALL_TAXES.filter((t) => !recommended.includes(t.value)).map((t) => (
            <button
              key={t.value}
              onClick={() => toggle(t.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                selected.includes(t.value)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                selected.includes(t.value) ? "border-blue-500 bg-blue-500" : "border-gray-300"
              }`}>
                {selected.includes(t.value) && <span className="text-white text-xs">✓</span>}
              </span>
              <div>
                <span className="font-medium text-gray-900">{t.label}</span>
                <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {situation && SITUATION_NOTES[situation] && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          {SITUATION_NOTES[situation]}
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
          disabled={selected.length === 0}
          className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 transition-colors hover:bg-blue-700"
        >
          결과 보기
        </button>
      </div>
    </div>
  )
}
