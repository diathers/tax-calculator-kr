import { create } from "zustand"

export type AcqType = "매매" | "상속" | "증여" | "신축"
export type AcqHomeCount = 1 | 2 | 3 | 4 | "법인"
export type DonorHomeCount = "1주택" | "2주택이상"
export type InheritanceHomeCount = "1주택" | "2주택이상"

interface AcquisitionFlowState {
  acquisitionType: AcqType
  homeCount: AcqHomeCount
  isAdjustmentArea: boolean | null
  isTemporary2House: boolean
  acquisitionPrice: number
  officialPrice: number
  exclusiveArea: number
  isFirstTimeBuyer: boolean
  isBirthRelated: boolean
  isInheritanceSpecial: boolean
  isDivorceSplit: boolean
  acquisitionDate: string
  donorHomeCount: DonorHomeCount | null
  inheritanceHomeCount: InheritanceHomeCount | null
}

interface AcquisitionFlowStore extends AcquisitionFlowState {
  set: (u: Partial<AcquisitionFlowState>) => void
  reset: () => void
}

const init: AcquisitionFlowState = {
  acquisitionType: "매매",
  homeCount: 1,
  isAdjustmentArea: null,
  isTemporary2House: false,
  acquisitionPrice: 0,
  officialPrice: 0,
  exclusiveArea: 0,
  isFirstTimeBuyer: false,
  isBirthRelated: false,
  isInheritanceSpecial: false,
  isDivorceSplit: false,
  acquisitionDate: "",
  donorHomeCount: null,
  inheritanceHomeCount: null,
}

export const useAcquisitionFlowStore = create<AcquisitionFlowStore>((s) => ({
  ...init,
  set: (u) => s((prev) => ({ ...prev, ...u })),
  reset: () => s(init),
}))
