"use client"

import { formatTaxAmount } from "@/lib/utils"

interface ResultSummaryCardProps {
  totalTax: number
  label?: string
  subItems?: { label: string; amount: number }[]
  isExempt?: boolean
  exemptReason?: string
}

export function ResultSummaryCard({
  totalTax, label = "최종 납부세액", subItems, isExempt, exemptReason,
}: ResultSummaryCardProps) {
  if (isExempt) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <p className="text-sm text-green-700 mb-1">{exemptReason}</p>
        <p className="text-3xl font-bold text-green-600">비과세</p>
        <p className="text-sm text-green-600 mt-1">납부세액 없음</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-blue-50 border border-blue-200 p-6">
      <p className="text-sm text-blue-700 text-center mb-1">{label}</p>
      <p className="text-3xl font-bold text-blue-900 text-center tabular-nums">
        {formatTaxAmount(totalTax)}
      </p>
      {subItems && subItems.length > 0 && (
        <div className="mt-4 space-y-1 border-t border-blue-200 pt-3">
          {subItems.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-blue-800">
              <span>{item.label}</span>
              <span className="tabular-nums">{formatTaxAmount(item.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
