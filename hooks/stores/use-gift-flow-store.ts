import { create } from "zustand"

export type GiftRelationship = "배우자" | "직계존속" | "직계비속" | "기타친족" | "타인"

interface GiftFlowState {
  relationship: GiftRelationship
  propertyValue: number
  hasDebt: boolean
  debtAmount: number
  donorAcquisitionPrice: number
  donorAcquisitionDate: string
  donorResidenceYears: number
  isAdjustmentArea: boolean | null
  recipientHomeCount: 0 | 1 | 2
  isMinor: boolean
  isGenerationSkip: boolean
  hasPriorGifts: boolean
  priorGifts10Y: number
}

interface GiftFlowStore extends GiftFlowState {
  set: (u: Partial<GiftFlowState>) => void
  reset: () => void
}

const init: GiftFlowState = {
  relationship: "직계존속",
  propertyValue: 0,
  hasDebt: false,
  debtAmount: 0,
  donorAcquisitionPrice: 0,
  donorAcquisitionDate: "2015-01-01",
  donorResidenceYears: 0,
  isAdjustmentArea: null,
  recipientHomeCount: 0,
  isMinor: false,
  isGenerationSkip: false,
  hasPriorGifts: false,
  priorGifts10Y: 0,
}

export const useGiftFlowStore = create<GiftFlowStore>((s) => ({
  ...init,
  set: (u) => s((prev) => ({ ...prev, ...u })),
  reset: () => s(init),
}))
