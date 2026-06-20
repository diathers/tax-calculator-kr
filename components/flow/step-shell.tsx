"use client"

import Link from "next/link"

interface StepShellProps {
  step: number
  total: number
  title: string
  hint?: string
  canNext: boolean
  onNext: () => void
  onPrev?: () => void
  nextLabel?: string
  children: React.ReactNode
}

export function StepShell({
  step, total, title, hint, canNext, onNext, onPrev, nextLabel = "다음", children,
}: StepShellProps) {
  const pct = Math.round((step / total) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        {onPrev ? (
          <button onClick={onPrev} className="text-gray-400 hover:text-gray-600 text-lg leading-none">←</button>
        ) : (
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-lg leading-none">←</Link>
        )}
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{step} / {total}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 콘텐츠 — pb-28로 하단 고정 버튼에 가려지지 않도록 여백 확보 */}
      <div className="max-w-lg mx-auto w-full px-4 py-8 pb-28">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {hint && <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{hint}</p>}
        </div>
        {children}
      </div>

      {/* 다음 버튼 — 화면 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto">
          <button
            onClick={onNext}
            disabled={!canNext}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
