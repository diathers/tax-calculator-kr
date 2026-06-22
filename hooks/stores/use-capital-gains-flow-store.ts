import { create } from "zustand"

export type CapGainsPropertyType = "주택" | "분양권" | "조합원입주권"

interface CapitalGainsFlowState {
  propertyType: CapGainsPropertyType
  acquisitionPrice: number
  salePrice: number
  necessaryExpenses: number
  acquisitionDate: string
  saleDate: string
  noResidence: boolean
  residenceStartDate: string
  residenceEndDate: string
  isAdjAtAcquisition: boolean | null
  isAdjAtSale: boolean | null
  is1H1H: boolean
  homeCount: 1 | 2 | 3
}

interface CapitalGainsFlowStore extends CapitalGainsFlowState {
  set: (u: Partial<CapitalGainsFlowState>) => void
  reset: () => void
}

const today = new Date().toISOString().split("T")[0]

const init: CapitalGainsFlowState = {
  propertyType: "주택",
  acquisitionPrice: 0,
  salePrice: 0,
  necessaryExpenses: 0,
  acquisitionDate: "2020-01-01",
  saleDate: today,
  noResidence: false,
  residenceStartDate: "2020-01-01",
  residenceEndDate: today,
  isAdjAtAcquisition: null,
  isAdjAtSale: null,
  is1H1H: true,
  homeCount: 1,
}

export const useCapitalGainsFlowStore = create<CapitalGainsFlowStore>((s) => ({
  ...init,
  set: (u) => s((prev) => ({ ...prev, ...u })),
  reset: () => s(init),
}))
