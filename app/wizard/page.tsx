// SCREEN ID: SCR-H2 ~ SCR-H6
// SCREEN NAME: 공통 마법사 Step 1~5
// FLOW: 공통 마법사
// SCR-H2: Step 1 상황 선택
// SCR-H3: Step 2 부동산 정보
// SCR-H4: Step 3 조정대상지역
// SCR-H5: Step 4 주택 수
// SCR-H6: Step 5 세목 선택

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useWizardStore } from "@/hooks/stores/use-wizard-store"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"
import { Step1Situation } from "@/components/wizard/step1-situation"
import { Step2PropertyInfo } from "@/components/wizard/step2-property-info"
import { Step3AdjustmentArea } from "@/components/wizard/step3-adjustment-area"
import { Step4HomeCount } from "@/components/wizard/step4-home-count"
import { Step5TaxSelect } from "@/components/wizard/step5-tax-select"

const TOTAL_STEPS = 5

export default function WizardPage() {
  const router = useRouter()
  const store = useWizardStore()
  const {
    currentStep, setStep, setField,
    situation, propertyPrice, officialPrice, exclusiveArea,
    isAdjustmentArea, homeCount, selectedTaxes,
  } = store

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setStep(currentStep + 1)
    } else {
      router.push("/wizard/results")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setStep(currentStep - 1)
    else router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            ← 이전
          </button>
          <span className="text-sm text-gray-500 font-medium">
            {currentStep} / {TOTAL_STEPS}
          </span>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            처음으로
          </Link>
        </div>

        {/* 진행 바 */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step 콘텐츠 */}
        {currentStep === 1 && (
          <Step1Situation
            value={situation}
            onChange={(v) => setField({ situation: v })}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <Step2PropertyInfo
            propertyPrice={propertyPrice}
            officialPrice={officialPrice}
            exclusiveArea={exclusiveArea}
            onChange={(u) => setField(u)}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <Step3AdjustmentArea
            value={isAdjustmentArea}
            onChange={(v) => setField({ isAdjustmentArea: v })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <Step4HomeCount
            value={homeCount}
            situation={situation}
            onChange={(v) => setField({ homeCount: v })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 5 && (
          <Step5TaxSelect
            situation={situation}
            selected={selectedTaxes}
            onChange={(taxes) => setField({ selectedTaxes: taxes })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
      </div>
      <ScreenIdBadge id={`SCR-H${currentStep + 1}`} />
    </div>
  )
}
