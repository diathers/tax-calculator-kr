import { create } from "zustand"
import { calculatePropertyTax } from "@/lib/calculators/property-tax"
import type { PropertyTaxInput, PropertyTaxResult } from "@/lib/calculators/types"

const defaultInput: PropertyTaxInput = {
  officialPrice: 0,
  homeCount: 1,
  is1H1H: true,
  isAdjustmentArea: false,
  ownerAge: 50,
  holdingYears: 0,
}

interface Store {
  input: PropertyTaxInput
  result: PropertyTaxResult | null
  setInput: (p: Partial<PropertyTaxInput>) => void
  calculate: () => void
  reset: () => void
}

export const usePropertyTaxStore = create<Store>((set, get) => ({
  input: defaultInput,
  result: null,
  setInput: (p) => set((s) => ({ input: { ...s.input, ...p } })),
  calculate: () => set({ result: calculatePropertyTax(get().input) }),
  reset: () => set({ input: defaultInput, result: null }),
}))
