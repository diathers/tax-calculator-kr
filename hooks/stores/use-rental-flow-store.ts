import { create } from "zustand"

export type RentalType = "월세" | "전세" | "혼합"

interface RentalFlowState {
  rentalType: RentalType
  deposit: number
  monthlyRent: number
  chonsaDeposit: number
  homeCount: 1 | 2 | 3
  hasOtherIncome: boolean
}

interface RentalFlowStore extends RentalFlowState {
  set: (u: Partial<RentalFlowState>) => void
  reset: () => void
}

const init: RentalFlowState = {
  rentalType: "월세",
  deposit: 0,
  monthlyRent: 0,
  chonsaDeposit: 0,
  homeCount: 1,
  hasOtherIncome: false,
}

export const useRentalFlowStore = create<RentalFlowStore>((s) => ({
  ...init,
  set: (u) => s((prev) => ({ ...prev, ...u })),
  reset: () => s(init),
}))
