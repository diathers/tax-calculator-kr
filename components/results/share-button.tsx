"use client"

import { useState } from "react"
import { encodeCalcParams } from "@/lib/url-params"

interface ShareButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>
}

export function ShareButton({ params }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const encoded = encodeCalcParams(params)
    const url = `${window.location.origin}${window.location.pathname}?d=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
    >
      {copied ? "✓ URL 복사 완료" : "계산 결과 URL 공유"}
    </button>
  )
}
