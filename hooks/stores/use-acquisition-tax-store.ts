import { create } from "zustand"
import { calculateAcquisitionTax } from "@/lib/calculators/acquisition-tax"
import type { AcquisitionTaxInput, AcquisitionTaxResult } from "@/lib/calculators/types"

const defaultInput: AcquisitionTaxInput = {
  acquisitionType: "매매",
  acquisitionPrice: 0,
  officialPrice: 0,
  homeCountAfter: 1,
  isAdjustmentArea: true,
  exclusiveArea: 85,
  isCorporation: false,
  isTemporary2House: false,
  isFirstTimeBuyer: false,
  isBirthRelated: false,
  isDivorceSplit: false,
  isInheritanceSpecial: false,
  acquisitionDate: "",
}

interface Store {
  input: AcquisitionTaxInput
  result: AcquisitionTaxResult | null
  setInput: (p: Partial<AcquisitionTaxInput>) => void
  calculate: () => void
  reset: () => void
}

export const useAcquisitionTaxStore = create<Store>((set, get) => ({
  input: defaultInput,
  result: null,
  setInput: (p) => set((s) => ({ input: { ...s.input, ...p } })),
  calculate: () => set({ result: calculateAcquisitionTax(get().input) }),
  reset: () => set({ input: defaultInput, result: null }),
}))
