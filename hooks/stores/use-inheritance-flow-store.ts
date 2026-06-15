import { create } from "zustand"

interface InheritanceFlowState {
  propertyValue: number
  spouseAlive: boolean
  childCount: number
  minorChildCount: number
  hasDisabledHeir: boolean
  otherEstateValue: number
  recipientHomeCount: 0 | 1 | 2
  isInheritanceSpecial: boolean
}

interface InheritanceFlowStore extends InheritanceFlowState {
  set: (u: Partial<InheritanceFlowState>) => void
  reset: () => void
}

const init: InheritanceFlowState = {
  propertyValue: 0,
  spouseAlive: true,
  childCount: 1,
  minorChildCount: 0,
  hasDisabledHeir: false,
  otherEstateValue: 0,
  recipientHomeCount: 0,
  isInheritanceSpecial: false,
}

export const useInheritanceFlowStore = create<InheritanceFlowStore>((s) => ({
  ...init,
  set: (u) => s((prev) => ({ ...prev, ...u })),
  reset: () => s(init),
}))
