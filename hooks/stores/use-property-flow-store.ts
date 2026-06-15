import { create } from "zustand"

interface PropertyFlowState {
  officialPrice: number
  homeCount: 1 | 2 | 3 | "법인"
  isAdjustmentArea: boolean
}

interface PropertyFlowStore extends PropertyFlowState {
  set: (u: Partial<PropertyFlowState>) => void
  reset: () => void
}

const init: PropertyFlowState = {
  officialPrice: 0,
  homeCount: 1,
  isAdjustmentArea: false,
}

export const usePropertyFlowStore = create<PropertyFlowStore>((s) => ({
  ...init,
  set: (u) => s((prev) => ({ ...prev, ...u })),
  reset: () => s(init),
}))
