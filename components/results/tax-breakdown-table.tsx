"use client"

import { cn, formatTaxAmount } from "@/lib/utils"
import type { BreakdownRow } from "@/lib/calculators/types"

interface TaxBreakdownTableProps {
  rows: BreakdownRow[]
}

export function TaxBreakdownTable({ rows }: TaxBreakdownTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => {
            if (row.label === "" && row.amount === 0) {
              return <tr key={i}><td colSpan={2} className="h-2 bg-gray-50" /></tr>
            }
            if (row.type === "info" && row.amount === 0) {
              return (
                <tr key={i} className="bg-blue-50">
                  <td colSpan={2} className="px-4 py-2 text-blue-700 text-xs">{row.label}</td>
                </tr>
              )
            }
            return (
              <tr
                key={i}
                className={cn(
                  "border-t border-gray-100",
                  row.type === "total" && "bg-gray-50 font-semibold border-t-2 border-gray-300",
                  row.highlight && row.type !== "total" && "bg-yellow-50",
                  row.indent && "pl-8",
                )}
              >
                <td className={cn("px-4 py-2.5 text-gray-600", row.indent && "pl-8")}>
                  {row.label}
                </td>
                <td className={cn(
                  "px-4 py-2.5 text-right tabular-nums",
                  row.type === "deduction" && "text-red-600",
                  row.type === "total" && "text-gray-900 text-base",
                  row.type === "surcharge" && "text-orange-600",
                  row.type === "tax" && "text-gray-800",
                )}>
                  {row.type === "info" ? formatTaxAmount(row.amount) : (
                    row.amount < 0
                      ? `- ${formatTaxAmount(Math.abs(row.amount))}`
                      : formatTaxAmount(row.amount)
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
