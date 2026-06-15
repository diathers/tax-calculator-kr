import { create } from "zustand"
import { calculateCapitalGainsTax } from "@/lib/calculators/capital-gains-tax"
import type { CapitalGainsTaxInput, CapitalGainsTaxResult } from "@/lib/calculators/types"

const today = new Date().toISOString().slice(0, 10)
const defaultInput: CapitalGainsTaxInput = {
  acquisitionPrice: 0,
  salePrice: 0,
  necessaryExpenses: 0,
  acquisitionDate: "2020-01-01",
  saleDate: today,
  residencePeriodYears: 0,
  homeCountAtSale: 1,
  isAdjustmentArea: false,
}

interface Store {
  input: CapitalGainsTaxInput
  result: CapitalGainsTaxResult | null
  setInput: (p: Partial<CapitalGainsTaxInput>) => void
  calculate: () => void
  reset: () => void
}

export const useCapitalGainsTaxStore = create<Store>((set, get) => ({
  input: defaultInput,
  result: null,
  setInput: (p) => set((s) => ({ input: { ...s.input, ...p } })),
  calculate: () => set({ result: calculateCapitalGainsTax(get().input) }),
  reset: () => set({ input: defaultInput, result: null }),
}))
