import { create } from "zustand"

export type Situation = "취득" | "양도" | "증여" | "상속" | "보유" | "임대"
export type HomeCount = 1 | 2 | 3 | "법인"
export type TaxType =
  | "취득세"
  | "양도소득세"
  | "재산세"
  | "종합부동산세"
  | "증여세"
  | "상속세"
  | "부담부증여"
  | "주택임대소득세"

interface WizardState {
  currentStep: number
  situation: Situation | null
  propertyPrice: number
  officialPrice: number
  exclusiveArea: number
  isAdjustmentArea: boolean | null  // null = 모르겠어요 → 계산 시 true로 처리
  homeCount: HomeCount | null
  selectedTaxes: TaxType[]
}

interface WizardStore extends WizardState {
  setField: (updates: Partial<WizardState>) => void
  setStep: (step: number) => void
  reset: () => void
}

const initial: WizardState = {
  currentStep: 1,
  situation: null,
  propertyPrice: 0,
  officialPrice: 0,
  exclusiveArea: 0,
  isAdjustmentArea: null,
  homeCount: null,
  selectedTaxes: [],
}

export const useWizardStore = create<WizardStore>((set) => ({
  ...initial,
  setField: (updates) => set((s) => ({ ...s, ...updates })),
  setStep: (step) => set({ currentStep: step }),
  reset: () => set(initial),
}))

// 상황별 추천 세목
export const RECOMMENDED_TAXES: Record<Situation, TaxType[]> = {
  취득: ["취득세"],
  양도: ["양도소득세"],
  증여: ["증여세", "취득세"],
  상속: ["상속세", "취득세"],
  보유: ["재산세", "종합부동산세"],
  임대: ["주택임대소득세"],
}
