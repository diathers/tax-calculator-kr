// SCREEN ID: SCR-H1
// SCREEN NAME: 홈 (상황 선택)
// FLOW: 공통

import Link from "next/link"
import { ScreenIdBadge } from "@/components/dev/screen-id-badge"

const situations = [
  { emoji: "🏠", label: "살 때", sub: "주택 취득", href: "/flow/acquisition", color: "blue" },
  { emoji: "💰", label: "팔 때", sub: "주택 양도", href: "/flow/capital-gains", color: "green" },
  { emoji: "🎁", label: "증여할 때 / 받을 때", sub: "증여세 + 취득세", href: "/flow/gift", color: "orange" },
  { emoji: "👪", label: "상속할 때 / 받을 때", sub: "상속세 + 취득세", href: "/flow/inheritance", color: "red" },
  { emoji: "📋", label: "갖고 있을 때", sub: "재산세 + 종부세", href: "/flow/property", color: "purple" },
  { emoji: "🏘️", label: "임대할 때", sub: "주택임대소득세", href: "/flow/rental", color: "teal" },
]

const cardColor: Record<string, string> = {
  blue:   "border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100",
  green:  "border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100",
  orange: "border-orange-200 bg-orange-50 hover:border-orange-400 hover:bg-orange-100",
  red:    "border-red-200 bg-red-50 hover:border-red-400 hover:bg-red-100",
  purple: "border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100",
  teal:   "border-teal-200 bg-teal-50 hover:border-teal-400 hover:bg-teal-100",
}
const subColor: Record<string, string> = {
  blue: "text-blue-500", green: "text-green-500", orange: "text-orange-500",
  red: "text-red-500", purple: "text-purple-500", teal: "text-teal-500",
}

const calculators = [
  { title: "취득세", href: "/acquisition-tax", desc: "주택 매입 시 납부하는 취득세" },
  { title: "양도소득세", href: "/capital-gains-tax", desc: "부동산 매도 시 발생하는 양도소득세" },
  { title: "보유세", href: "/property-tax", desc: "재산세 + 종합부동산세 통합 계산" },
  { title: "증여세", href: "/gift-tax", desc: "부동산 증여 시 수증자가 납부하는 세금" },
  { title: "상속세", href: "/inheritance-tax", desc: "상속 재산에 부과되는 세금" },
  { title: "법인 양도소득세", href: "/corporate-gains-tax", desc: "법인이 부동산을 양도할 때 부과되는 세금" },
  { title: "부담부증여", href: "/encumbered-gift", desc: "전세보증금 등 채무를 포함한 증여" },
]

export default function Home() {
  return (
    <main className="max-w-lg mx-auto px-4 py-10 space-y-10">
      {/* 타이틀 */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">부동산 세금 계산기</h1>
        <p className="text-sm text-gray-500">2025년 현행 세법 기준</p>
      </div>

      {/* 상황 선택 */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">어떤 상황인가요?</p>
        <div className="grid grid-cols-2 gap-3">
          {situations.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`group flex flex-col gap-1 rounded-2xl border-2 p-4 transition-all ${cardColor[s.color]}`}
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="font-semibold text-gray-900 text-sm leading-tight">{s.label}</span>
              <span className={`text-xs ${subColor[s.color]}`}>{s.sub}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 세목 직접 선택 */}
      <div id="direct" className="scroll-mt-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">세목 직접 선택 (전문가용)</p>
        <div className="grid grid-cols-1 gap-2">
          {calculators.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 hover:bg-gray-50 transition-all group"
            >
              <div>
                <span className="text-sm font-semibold text-gray-800">{c.title}</span>
                <span className="text-xs text-gray-400 ml-2">{c.desc}</span>
              </div>
              <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">
        ※ 본 계산기는 참고용입니다. 정확한 세액은 세무사 또는 국세청 홈택스를 통해 확인하세요.
      </p>
      <ScreenIdBadge id="SCR-H1" />
    </main>
  )
}
