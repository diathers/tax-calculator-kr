import type { AcquisitionTaxInput, AcquisitionTaxResult, BreakdownRow } from "./types"

// ── 세율 포맷 ───────────────────────────────────────────────────
function fmtRate(r: number): string {
  const pct = Math.round(r * 100 * 100) / 100
  if (pct === Math.floor(pct)) return `${pct.toFixed(0)}%`
  return `${pct.toFixed(2).replace(/\.?0+$/, "")}%`
}

// ── 매매 누진세율 (6억~9억 슬라이딩) ────────────────────────────
function getProgressiveRate(price: number): number {
  if (price <= 600_000_000) return 0.01
  if (price > 900_000_000) return 0.03
  return (price * 2 / 300_000_000 - 3) / 100
}

function getSaleMainRate(
  price: number,
  homeCount: number,
  isAdj: boolean,
  isTemp2: boolean,
  isCorp: boolean,
): number {
  if (isCorp || homeCount >= 4) return 0.12
  if (homeCount === 3) return isAdj ? 0.12 : 0.08
  if (homeCount === 2) {
    if (isAdj && !isTemp2) return 0.08
    return getProgressiveRate(price)
  }
  return getProgressiveRate(price)
}

// ── 지방교육세율 ─────────────────────────────────────────────────
// 상속·신축: 2.8% → 0.16%, 0.8% → 0.08%
// 매매·증여: 1~3%(슬라이딩) → rate×0.1, 3.5% → 0.3%, 8% → 0.4%, 12% → 0.4%
function getEduRate(mainRate: number, acqType: string): number {
  if (acqType === "상속" || acqType === "신축") {
    return mainRate < 0.01 ? mainRate * 0.1 : 0.0016
  }
  if (mainRate >= 0.12 - 1e-9) return 0.004
  if (mainRate >= 0.08 - 1e-9) return 0.004
  if (mainRate >= 0.035 - 1e-9) return 0.003
  return mainRate * 0.1
}

// ── 신고납부 기한 ─────────────────────────────────────────────────
function calcDeadline(acqDate: string | undefined, type: string): string {
  if (!acqDate) return ""
  const d = new Date(acqDate)
  if (isNaN(d.getTime())) return ""
  if (type === "매매" || type === "신축") {
    const dl = new Date(d)
    dl.setDate(dl.getDate() + 60)
    return dl.toISOString().split("T")[0]
  }
  if (type === "증여") {
    const eom = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    eom.setMonth(eom.getMonth() + 3)
    return eom.toISOString().split("T")[0]
  }
  if (type === "상속") {
    const eom = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    eom.setMonth(eom.getMonth() + 6)
    return eom.toISOString().split("T")[0]
  }
  return ""
}

// ── 메인 계산 함수 ────────────────────────────────────────────────
export function calculateAcquisitionTax(input: AcquisitionTaxInput): AcquisitionTaxResult {
  const {
    acquisitionType,
    acquisitionPrice,
    officialPrice = 0,
    homeCountAfter,
    isAdjustmentArea,
    exclusiveArea = 0,
    isCorporation = false,
    isTemporary2House = false,
    isFirstTimeBuyer = false,
    isBirthRelated = false,
    isDivorceSplit = false,
    isInheritanceSpecial = false,
    acquisitionDate,
    isFirstTimeEver = false,
  } = input

  const firstTime = isFirstTimeBuyer || isFirstTimeEver
  const taxBase = acquisitionPrice

  // ── 본세율 결정 ──────────────────────────────────────────────────
  let mainRate: number
  let rateLabel: string

  if (acquisitionType === "상속") {
    mainRate = isInheritanceSpecial ? 0.008 : 0.028
    rateLabel = isInheritanceSpecial
      ? "상속 1가구1주택 특례 0.8%"
      : "상속 일반 2.8%"
  } else if (acquisitionType === "증여") {
    if (isDivorceSplit) {
      mainRate = 0.015
      rateLabel = "이혼 재산분할 1.5%"
    } else {
      const refPrice = officialPrice > 0 ? officialPrice : acquisitionPrice
      const isHeavy = isAdjustmentArea && refPrice >= 300_000_000
      mainRate = isHeavy ? 0.12 : 0.035
      rateLabel = isHeavy
        ? "증여 중과 12% (조정대상지역·공시가 3억↑)"
        : "증여 일반 3.5%"
    }
  } else if (acquisitionType === "신축") {
    mainRate = 0.028
    rateLabel = "신축(원시취득) 2.8%"
  } else {
    mainRate = getSaleMainRate(
      acquisitionPrice,
      homeCountAfter,
      isAdjustmentArea,
      isTemporary2House,
      isCorporation,
    )
    if (isCorporation) {
      rateLabel = "법인 12%"
    } else if (homeCountAfter >= 4) {
      rateLabel = "매매 4주택이상 12%"
    } else if (homeCountAfter === 3) {
      rateLabel = `매매 3주택 ${isAdjustmentArea ? "조정 12%" : "비조정 8%"}`
    } else if (homeCountAfter === 2) {
      if (isAdjustmentArea && !isTemporary2House) {
        rateLabel = "매매 2주택 조정대상지역 8%"
      } else if (isTemporary2House) {
        rateLabel = `매매 일시적2주택 ${fmtRate(mainRate)} (일반세율 적용)`
      } else {
        rateLabel = `매매 2주택 비조정 ${fmtRate(mainRate)}`
      }
    } else {
      rateLabel = `매매 1주택 ${fmtRate(mainRate)}`
    }
  }

  // ── 세액 계산 ────────────────────────────────────────────────────
  const acquisitionTax = Math.floor(taxBase * mainRate)
  const eduRate = getEduRate(mainRate, acquisitionType)
  const localEducationTax = Math.floor(taxBase * eduRate)

  // 농어촌특별세 (면적 기준)
  const area = exclusiveArea > 0 ? exclusiveArea : 0
  const ruralAreaTax = area > 85 ? Math.floor(taxBase * 0.002) : 0

  // ── 감면 ────────────────────────────────────────────────────────
  let discount = 0
  let discountReason = ""
  let discountRuralTax = 0

  if (firstTime && acquisitionType === "매매" && homeCountAfter === 1) {
    discount = Math.min(acquisitionTax, 2_000_000)
    discountReason = "생애최초 주택 취득 감면"
    discountRuralTax = Math.floor(discount * 0.2)
  } else if (isBirthRelated && acquisitionType === "매매") {
    discount = Math.min(acquisitionTax, 5_000_000)
    discountReason = "출산·양육 주택 취득 감면"
    discountRuralTax = Math.floor(discount * 0.2)
  }

  const ruralSpecialTax = ruralAreaTax + discountRuralTax
  const totalTax = acquisitionTax - discount + localEducationTax + ruralSpecialTax

  // ── 요약 라벨 ────────────────────────────────────────────────────
  const summaryLabel = rateLabel

  // ── 신고납부 기한 ─────────────────────────────────────────────────
  const deadlineDate = calcDeadline(acquisitionDate, acquisitionType)

  // ── 상세 근거 테이블 ──────────────────────────────────────────────
  const breakdown: BreakdownRow[] = [
    { label: "과세표준", amount: taxBase, type: "base", highlight: true },
    {
      label: `취득세 본세 (${fmtRate(mainRate)}, ${rateLabel})`,
      amount: acquisitionTax,
      type: "tax",
    },
    {
      label: `지방교육세 (${fmtRate(eduRate)})`,
      amount: localEducationTax,
      type: "tax",
      indent: true,
    },
  ]

  if (area > 85) {
    breakdown.push({ label: "농어촌특별세 (0.2%, 전용 85㎡ 초과)", amount: ruralAreaTax, type: "tax", indent: true })
  } else if (area > 0) {
    breakdown.push({ label: `농어촌특별세 비과세 (전용 ${area}㎡ ≤ 85㎡)`, amount: 0, type: "info" })
  } else {
    breakdown.push({ label: "농어촌특별세: 전용면적 미입력 (85㎡ 초과 시 0.2%)", amount: 0, type: "info" })
  }

  if (discount > 0) {
    breakdown.push({ label: discountReason, amount: -discount, type: "deduction" })
    if (discountRuralTax > 0) {
      breakdown.push({ label: "농어촌특별세 (감면세액 20%)", amount: discountRuralTax, type: "tax", indent: true })
    }
  }

  breakdown.push({ label: "최종 납부세액", amount: totalTax, type: "total", highlight: true })

  return {
    taxBase,
    mainRate,
    acquisitionTax,
    eduRate,
    localEducationTax,
    ruralSpecialTax,
    discount,
    discountReason,
    totalTax,
    appliedRate: mainRate,
    summaryLabel,
    acquisitionType,
    breakdown,
    deadlineDate,
  }
}
