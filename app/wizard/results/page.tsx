// SCREEN ID: SCR-H7
// SCREEN NAME: 마법사 결과
// FLOW: 공통 마법사 > 결과

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { useWizardStore } from "@/hooks/stores/use-wizard-store"
import type { TaxType, Situation, HomeCount } from "@/hooks/stores/use-wizard-store"
import { calculateAcquisitionTax } from "@/lib/calculators/acquisition-tax"
import { calculatePropertyTax } from "@/lib/calculators/property-tax"
import { calculateGiftTax } from "@/lib/calculators/gift-tax"
import { calculateInheritanceTax } from "@/lib/calculators/inheritance-tax"
import { formatTaxAmount, formatKoreanAmount } from "@/lib/utils"

// 법인·null 처리
function toHomeCountAfter(hc: HomeCount | null): 1 | 2 | 3 {
  if (!hc || hc === "법인") return 3
  return hc
}

function toIsAdj(v: boolean | null): boolean {
  return v ?? true
}

// ── 세목별 계산 ────────────────────────────────────────────────
type TaxCardData =
  | { status: "computed"; tax: number; subtax?: { label: string; amount: number }[]; rate?: string; note?: string }
  | { status: "needs-input"; href: string; reason: string }
  | { status: "not-implemented" }

function computeTax(
  type: TaxType,
  store: ReturnType<typeof useWizardStore.getState>,
): TaxCardData {
  const hc = toHomeCountAfter(store.homeCount)
  const adj = toIsAdj(store.isAdjustmentArea)
  const area = store.exclusiveArea > 0 ? store.exclusiveArea : 85

  switch (type) {
    case "취득세": {
      const r = calculateAcquisitionTax({
        acquisitionType: "매매",
        acquisitionPrice: store.propertyPrice,
        homeCountAfter: hc,
        isAdjustmentArea: adj,
        exclusiveArea: area,
      })
      return {
        status: "computed",
        tax: r.totalTax,
        subtax: [
          { label: `취득세 본세 (${(r.appliedRate * 100).toFixed(1)}%)`, amount: r.acquisitionTax },
          ...(r.ruralSpecialTax > 0 ? [{ label: "농어촌특별세", amount: r.ruralSpecialTax }] : []),
          { label: "지방교육세", amount: r.localEducationTax },
          ...(r.discount > 0 ? [{ label: r.discountReason, amount: -r.discount }] : []),
        ],
        rate: r.summaryLabel,
        note: store.isAdjustmentArea === null ? "※ 조정대상지역 기준으로 계산 (보수적)" : undefined,
      }
    }

    case "재산세":
    case "종합부동산세": {
      if (store.officialPrice === 0) {
        return { status: "needs-input", href: "/property-tax", reason: "공시가격(기준시가)을 입력해야 정확한 계산이 가능합니다" }
      }
      const r = calculatePropertyTax({
        officialPrice: store.officialPrice,
        homeCount: hc,
        is1H1H: hc === 1,
        isAdjustmentArea: adj,
        ownerAge: 50,
        holdingYears: 5,
      })
      if (type === "재산세") return {
        status: "computed",
        tax: r.propertyTaxTotal,
        subtax: [
          { label: "재산세", amount: r.propertyTax },
          { label: "지방교육세", amount: r.localEducationTax },
        ],
        note: "나이 50세, 보유 5년 기준 · 세부 조정은 보유세 계산기에서",
      }
      return {
        status: "computed",
        tax: r.compreTaxTotal,
        subtax: r.compreTaxTotal > 0
          ? [
              { label: "종합부동산세", amount: r.compreTax },
              { label: "농어촌특별세", amount: r.ruralSpecialTax },
            ]
          : [],
        note: r.compreTaxBase === 0
          ? `공시가 ${(store.officialPrice / 100000000).toFixed(1)}억으로 종부세 비과세`
          : "나이 50세, 보유 5년 기준",
      }
    }

    case "증여세": {
      const r = calculateGiftTax({
        giftValue: store.propertyPrice,
        relationship: "직계존속",
        isMinor: false,
        priorGifts10Y: 0,
        isGenerationSkip: false,
        isMarriageOrBirth: false,
      })
      return {
        status: "computed",
        tax: r.totalTax,
        subtax: [
          { label: "공제 후 과세표준", amount: r.taxableBase },
          { label: "산출세액", amount: r.calculatedTax },
          ...(r.filingDiscount > 0 ? [{ label: "신고세액공제", amount: -r.filingDiscount }] : []),
          ...(r.surtax > 0 ? [{ label: "세대생략 할증", amount: r.surtax }] : []),
        ],
        note: "직계존속 증여, 10년 내 기증여 없음 기준",
      }
    }

    case "상속세": {
      const r = calculateInheritanceTax({
        totalEstate: store.propertyPrice,
        financialAssets: 0,
        debts: 0,
        funeralCost: 5000000,
        spouseAlive: true,
        spouseInheritance: 0,
        childCount: 2,
        minorChildCount: 0,
        minorChildAges: [],
        applyResidenceDeduction: false,
        residenceValue: 0,
      })
      return {
        status: "computed",
        tax: r.totalTax,
        subtax: [
          { label: "과세표준", amount: r.taxableBase },
          { label: "산출세액", amount: r.calculatedTax },
          ...(r.filingDiscount > 0 ? [{ label: "신고세액공제", amount: -r.filingDiscount }] : []),
        ],
        note: "배우자 생존, 자녀 2명, 장례비 500만원, 상속세 기준",
      }
    }

    case "양도소득세":
      return { status: "needs-input", href: "/capital-gains-tax", reason: "취득가액, 취득일, 거주기간 등 추가 입력이 필요합니다" }

    case "부담부증여":
      return { status: "needs-input", href: "/encumbered-gift", reason: "채무액, 취득가액 등 추가 입력이 필요합니다" }

    case "주택임대소득세":
      return { status: "not-implemented" }

    default:
      return { status: "not-implemented" }
  }
}

// ── 상황별 하단 안내 ──────────────────────────────────────────
const BOTTOM_NOTICE: Record<Situation, { text: string; linkLabel?: string; linkHref?: string }> = {
  취득: {
    text: "취득 후에는 매년 재산세(6월·9월)와 종합부동산세(12월)가 부과될 수 있습니다.",
    linkLabel: "보유세 계산하기",
    linkHref: "/property-tax",
  },
  양도: {
    text: "비과세 요건(2년 보유·거주)을 충족하면 양도소득세가 면제될 수 있습니다.",
    linkLabel: "양도소득세 계산기에서 확인",
    linkHref: "/capital-gains-tax",
  },
  증여: {
    text: "증여 시 수증자도 취득세를 납부해야 합니다.",
    linkLabel: "취득세 계산하기",
    linkHref: "/acquisition-tax",
  },
  상속: {
    text: "상속 취득 시 취득세(2.8%)도 함께 납부해야 합니다.",
    linkLabel: "취득세 계산하기",
    linkHref: "/acquisition-tax",
  },
  보유: {
    text: "공시가격이 높아지면 종합부동산세 과세 대상이 될 수 있습니다.",
    linkLabel: "보유세 상세 계산",
    linkHref: "/property-tax",
  },
  임대: {
    text: "연간 임대수입 2천만원 초과 시 종합소득세 신고 대상입니다.",
  },
}

const TAX_LABELS: Record<TaxType, string> = {
  취득세: "취득세",
  양도소득세: "양도소득세",
  재산세: "재산세",
  종합부동산세: "종합부동산세",
  증여세: "증여세",
  상속세: "상속세",
  부담부증여: "부담부증여",
  주택임대소득세: "주택임대소득세",
}

export default function WizardResultsPage() {
  const router = useRouter()
  const store = useWizardStore()
  const { situation, propertyPrice, officialPrice, exclusiveArea, isAdjustmentArea, homeCount, selectedTaxes, setStep } = store

  if (selectedTaxes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">입력 정보가 없습니다.</p>
          <Link href="/wizard" className="text-blue-600 underline">다시 시작하기</Link>
        </div>
      </div>
    )
  }

  const homeCountLabel = homeCount === "법인" ? "법인" : homeCount ? `${homeCount}주택` : ""
  const adjLabel = isAdjustmentArea === null ? "조정대상지역(추정)" : isAdjustmentArea ? "조정대상지역" : "비조정대상지역"
  const situationLabel = situation ?? ""

  const showCompare = situation === "양도" || situation === "증여"

  const goEdit = (step: number) => {
    setStep(step)
    router.push("/wizard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 상단 네비 */}
        <div className="flex items-center justify-between">
          <Link href="/wizard" className="text-sm text-gray-500 hover:text-gray-700">← 수정하기</Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">처음으로</Link>
        </div>

        {/* 입력 요약 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">입력 정보 요약</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
              {formatKoreanAmount(propertyPrice)}
            </span>
            {officialPrice > 0 && (
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                공시가 {formatKoreanAmount(officialPrice)}
              </span>
            )}
            {exclusiveArea > 0 && (
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                {exclusiveArea > 85 ? "85㎡ 초과" : "85㎡ 이하"}
              </span>
            )}
            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{adjLabel}</span>
            {homeCountLabel && (
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{homeCountLabel}</span>
            )}
            {situationLabel && (
              <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">{situationLabel} 상황</span>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            {[
              { label: "가격 수정", step: 2 },
              { label: "지역 수정", step: 3 },
              { label: "주택수 수정", step: 4 },
            ].map(({ label, step }) => (
              <button
                key={step}
                onClick={() => goEdit(step)}
                className="text-xs text-blue-600 hover:underline"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isAdjustmentArea === null && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700">
            ※ 조정대상지역 여부를 선택하지 않아 조정대상지역 기준(보수적)으로 계산되었습니다.
          </div>
        )}

        {/* 세목별 결과 카드 */}
        <div className="space-y-4">
          {selectedTaxes.map((taxType) => {
            const result = computeTax(taxType, store)

            return (
              <div key={taxType} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-900">{TAX_LABELS[taxType]}</span>
                </div>

                {result.status === "computed" && (
                  <div className="p-4 space-y-3">
                    <div className="text-2xl font-bold text-blue-900 tabular-nums">
                      {formatTaxAmount(result.tax)}
                    </div>
                    {result.rate && (
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {result.rate}
                      </span>
                    )}
                    {result.subtax && result.subtax.length > 0 && (
                      <div className="space-y-1 border-t border-gray-100 pt-2">
                        {result.subtax.map((s, i) => (
                          <div key={i} className="flex justify-between text-sm text-gray-600">
                            <span>{s.label}</span>
                            <span className="tabular-nums">{formatTaxAmount(s.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {result.note && (
                      <p className="text-xs text-gray-400">{result.note}</p>
                    )}
                  </div>
                )}

                {result.status === "needs-input" && (
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-500">{result.reason}</p>
                    <Link
                      href={result.href}
                      className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      계산하러 가기 →
                    </Link>
                  </div>
                )}

                {result.status === "not-implemented" && (
                  <div className="p-4">
                    <p className="text-sm text-gray-400">준비 중입니다.</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 절세 비교 버튼 */}
        {showCompare && (
          <Link
            href="/wizard/compare"
            className="block w-full py-3 rounded-xl bg-emerald-600 text-white text-center font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            절세 방법 비교하기 →
          </Link>
        )}

        {/* 함께 확인하면 좋은 세금 */}
        {situation && BOTTOM_NOTICE[situation] && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">함께 확인하면 좋은 세금</p>
            <p className="text-sm text-gray-700">{BOTTOM_NOTICE[situation].text}</p>
            {BOTTOM_NOTICE[situation].linkLabel && BOTTOM_NOTICE[situation].linkHref && (
              <Link
                href={BOTTOM_NOTICE[situation].linkHref!}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                {BOTTOM_NOTICE[situation].linkLabel} →
              </Link>
            )}
          </div>
        )}

        {/* 면책 문구 */}
        <p className="text-xs text-gray-400 text-center pb-4">
          ※ 본 계산은 참고용이며 실제 세액은 개인 상황에 따라 달라질 수 있습니다.
          정확한 세액은 세무사 또는 국세청 홈택스를 통해 확인하세요.
        </p>
      </div>
      <ScreenIdBadge id="SCR-H7" />
    </div>
  )
}
