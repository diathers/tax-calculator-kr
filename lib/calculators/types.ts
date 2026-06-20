export interface BreakdownRow {
  label: string
  amount: number
  type: "base" | "deduction" | "tax" | "surcharge" | "total" | "info"
  indent?: boolean
  tooltip?: string
  highlight?: boolean
}

export type AcquisitionType = "매매" | "상속" | "증여" | "신축"

export interface AcquisitionTaxInput {
  acquisitionType: AcquisitionType
  acquisitionPrice: number
  officialPrice?: number         // 공시가격 (증여: 중과 판단용; 상속: 과세표준)
  homeCountAfter: 1 | 2 | 3 | 4 // 취득 후 주택 수 (4 = 4주택 이상)
  isAdjustmentArea: boolean
  exclusiveArea?: number         // 전용면적 (㎡)
  isCorporation?: boolean        // 법인 취득
  isTemporary2House?: boolean    // 일시적 2주택 특례
  isFirstTimeBuyer?: boolean     // 생애최초 주택 취득 (한도 200만원)
  isBirthRelated?: boolean       // 출산·양육 주택 취득 (한도 500만원)
  isDivorceSplit?: boolean       // 이혼 재산분할 취득
  isInheritanceSpecial?: boolean // 상속 1가구1주택 특례 (0.8%)
  acquisitionDate?: string       // 취득일 (신고납부 기한 계산)
  donorHomeCount?: "1주택" | "2주택이상" // 증여자 주택 수 (조정+3억 이상 시 중과 판단)
  // 하위 호환
  isFirstTimeEver?: boolean
  isNewlywed?: boolean
}

export interface AcquisitionTaxResult {
  taxBase: number
  mainRate: number
  acquisitionTax: number
  eduRate: number
  localEducationTax: number
  ruralSpecialTax: number
  discount: number
  discountReason: string
  totalTax: number
  appliedRate: number
  summaryLabel: string
  acquisitionType: AcquisitionType
  breakdown: BreakdownRow[]
  deadlineDate: string
}

export interface CapitalGainsTaxInput {
  acquisitionPrice: number
  salePrice: number
  necessaryExpenses: number
  acquisitionDate: string
  saleDate: string
  residencePeriodYears: number
  homeCountAtSale: 1 | 2 | 3
  isAdjustmentArea: boolean
}

export interface CapitalGainsTaxResult {
  realizedGain: number
  lthdRate: number
  lthdAmount: number
  taxableIncome: number
  taxRate: number
  calculatedTax: number
  localIncomeTax: number
  totalTax: number
  isExempt: boolean
  exemptReason: string
  isShortTerm: boolean
  isSurtax: boolean
  breakdown: BreakdownRow[]
}

export interface PropertyTaxInput {
  officialPrice: number
  homeCount: 1 | 2 | 3
  is1H1H: boolean
  isAdjustmentArea: boolean
  ownerAge: number
  holdingYears: number
}

export interface PropertyTaxResult {
  propertyTaxBase: number
  propertyTax: number
  localEducationTax: number
  propertyTaxTotal: number
  compreTaxBase: number
  compreTax: number
  seniorDiscount: number
  longHoldDiscount: number
  ruralSpecialTax: number
  compreTaxTotal: number
  grandTotal: number
  breakdown: BreakdownRow[]
}

export interface GiftTaxInput {
  giftValue: number
  relationship: "배우자" | "직계존속" | "직계비속" | "기타친족"
  isMinor: boolean
  priorGifts10Y: number
  isGenerationSkip: boolean
  isMarriageOrBirth: boolean
}

export interface GiftTaxResult {
  deduction: number
  taxableBase: number
  calculatedTax: number
  filingDiscount: number
  surtax: number
  totalTax: number
  breakdown: BreakdownRow[]
}

export interface InheritanceTaxInput {
  totalEstate: number
  financialAssets: number
  debts: number
  funeralCost: number
  spouseAlive: boolean
  spouseInheritance: number
  childCount: number
  minorChildCount: number
  minorChildAges: number[]
  applyResidenceDeduction: boolean
  residenceValue: number
}

export interface InheritanceTaxResult {
  taxableEstate: number
  financialDeduction: number
  personalDeduction: number
  lumpSumDeduction: number
  appliedDeduction: number
  spouseDeduction: number
  residenceDeduction: number
  totalDeduction: number
  taxableBase: number
  calculatedTax: number
  filingDiscount: number
  totalTax: number
  breakdown: BreakdownRow[]
}

export interface CorporateGainsTaxInput {
  acquisitionPrice: number
  salePrice: number
  necessaryExpenses: number
  acquisitionDate: string
  saleDate: string
  corporateType: "일반법인" | "중소기업" | "부동산법인"
  isNonBusinessLand: boolean
  isUnregistered: boolean
}

export interface CorporateGainsTaxResult {
  gain: number
  baseRate: number
  additionalRate: number
  totalRate: number
  estimatedTax: number
  breakdown: BreakdownRow[]
}

export interface EncumberedGiftInput {
  propertyValue: number
  debtAssumed: number
  donorAcquisitionPrice: number
  donorAcquisitionDate: string
  giftDate: string
  donorResidencePeriodYears: number
  relationship: "배우자" | "직계존속" | "직계비속" | "기타친족"
  isAdjustmentArea: boolean
  isMinor: boolean
}

export interface EncumberedGiftResult {
  giftPortion: number
  giftTax: number
  capitalGainsPortion: number
  capitalGainsTax: number
  totalTax: number
  simpleGiftTax: number
  comparison: number
  breakdown: BreakdownRow[]
}
