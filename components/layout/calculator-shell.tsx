"use client"

import Link from "next/link"

interface CalculatorShellProps {
  title: string
  description: string
  children: React.ReactNode
  result?: React.ReactNode
  onReset?: () => void
}

export function CalculatorShell({ title, description, children, result, onReset }: CalculatorShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline">← 전체 계산기</Link>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:sticky lg:top-6 lg:self-start">
            {children}
            {onReset && (
              <button
                onClick={onReset}
                className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600"
              >
                초기화
              </button>
            )}
          </div>
          <div id="result" className="space-y-4">
            {result ?? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
                <p className="text-sm">입력 후 계산하기를 누르세요</p>
              </div>
            )}
            <p className="text-xs text-gray-400 text-center px-4">
              ※ 본 계산기는 참고용이며, 실제 세액은 개별 상황에 따라 달라질 수 있습니다.
              정확한 세액은 세무사 또는 국세청 홈택스를 통해 확인하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
