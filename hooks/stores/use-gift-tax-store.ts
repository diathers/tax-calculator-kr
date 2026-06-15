import { create } from "zustand"
import { calculateGiftTax } from "@/lib/calculators/gift-tax"
import type { GiftTaxInput, GiftTaxResult } from "@/lib/calculators/types"

const defaultInput: GiftTaxInput = {
  giftValue: 0,
  relationship: "직계존속",
  isMinor: false,
  priorGifts10Y: 0,
  isGenerationSkip: false,
  isMarriageOrBirth: false,
}

interface Store {
  input: GiftTaxInput
  result: GiftTaxResult | null
  setInput: (p: Partial<GiftTaxInput>) => void
  calculate: () => void
  reset: () => void
}

export const useGiftTaxStore = create<Store>((set, get) => ({
  input: defaultInput,
  result: null,
  setInput: (p) => set((s) => ({ input: { ...s.input, ...p } })),
  calculate: () => set({ result: calculateGiftTax(get().input) }),
  reset: () => set({ input: defaultInput, result: null }),
}))
