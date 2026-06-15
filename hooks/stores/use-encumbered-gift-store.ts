import { create } from "zustand"
import { calculateEncumberedGift } from "@/lib/calculators/encumbered-gift"
import type { EncumberedGiftInput, EncumberedGiftResult } from "@/lib/calculators/types"

const today = new Date().toISOString().slice(0, 10)
const defaultInput: EncumberedGiftInput = {
  propertyValue: 0,
  debtAssumed: 0,
  donorAcquisitionPrice: 0,
  donorAcquisitionDate: "2015-01-01",
  giftDate: today,
  donorResidencePeriodYears: 0,
  relationship: "직계존속",
  isAdjustmentArea: false,
  isMinor: false,
}

interface Store {
  input: EncumberedGiftInput
  result: EncumberedGiftResult | null
  setInput: (p: Partial<EncumberedGiftInput>) => void
  calculate: () => void
  reset: () => void
}

export const useEncumberedGiftStore = create<Store>((set, get) => ({
  input: defaultInput,
  result: null,
  setInput: (p) => set((s) => ({ input: { ...s.input, ...p } })),
  calculate: () => set({ result: calculateEncumberedGift(get().input) }),
  reset: () => set({ input: defaultInput, result: null }),
}))
