import { create } from "zustand"
import { calculateCorporateGainsTax } from "@/lib/calculators/corporate-gains-tax"
import type { CorporateGainsTaxInput, CorporateGainsTaxResult } from "@/lib/calculators/types"

const today = new Date().toISOString().slice(0, 10)
const defaultInput: CorporateGainsTaxInput = {
  acquisitionPrice: 0,
  salePrice: 0,
  necessaryExpenses: 0,
  acquisitionDate: "2020-01-01",
  saleDate: today,
  corporateType: "일반법인",
  isNonBusinessLand: false,
  isUnregistered: false,
}

interface Store {
  input: CorporateGainsTaxInput
  result: CorporateGainsTaxResult | null
  setInput: (p: Partial<CorporateGainsTaxInput>) => void
  calculate: () => void
  reset: () => void
}

export const useCorporateGainsTaxStore = create<Store>((set, get) => ({
  input: defaultInput,
  result: null,
  setInput: (p) => set((s) => ({ input: { ...s.input, ...p } })),
  calculate: () => set({ result: calculateCorporateGainsTax(get().input) }),
  reset: () => set({ input: defaultInput, result: null }),
}))
