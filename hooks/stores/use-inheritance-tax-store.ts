import { create } from "zustand"
import { calculateInheritanceTax } from "@/lib/calculators/inheritance-tax"
import type { InheritanceTaxInput, InheritanceTaxResult } from "@/lib/calculators/types"

const defaultInput: InheritanceTaxInput = {
  totalEstate: 0,
  financialAssets: 0,
  debts: 0,
  funeralCost: 15000000,
  spouseAlive: false,
  spouseInheritance: 0,
  childCount: 1,
  minorChildCount: 0,
  minorChildAges: [],
  applyResidenceDeduction: false,
  residenceValue: 0,
}

interface Store {
  input: InheritanceTaxInput
  result: InheritanceTaxResult | null
  setInput: (p: Partial<InheritanceTaxInput>) => void
  calculate: () => void
  reset: () => void
}

export const useInheritanceTaxStore = create<Store>((set, get) => ({
  input: defaultInput,
  result: null,
  setInput: (p) => set((s) => ({ input: { ...s.input, ...p } })),
  calculate: () => set({ result: calculateInheritanceTax(get().input) }),
  reset: () => set({ input: defaultInput, result: null }),
}))
