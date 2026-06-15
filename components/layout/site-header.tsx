import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-900 text-lg">
          부동산 세금 계산기
        </Link>
        <span className="text-xs text-gray-400">2025년 세법 기준</span>
      </div>
    </header>
  )
}
