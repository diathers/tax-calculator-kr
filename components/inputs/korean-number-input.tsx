"use client"

import { useState, useRef } from "react"
import { cn, parseKoreanInput, formatInputDisplay } from "@/lib/utils"

function formatLive(raw: string): string {
  if (!raw.trim()) return ""
  const n = parseKoreanInput(raw)
  if (n <= 0) return ""
  const abs = n
  const eok = Math.floor(abs / 100000000)
  const man = Math.floor((abs % 100000000) / 10000)
  const won = abs % 10000
  const parts: string[] = []
  if (eok > 0) parts.push(`${eok.toLocaleString()}억`)
  if (man > 0) parts.push(`${man.toLocaleString()}만`)
  if (won > 0) parts.push(`${won.toLocaleString()}`)
  return parts.length ? parts.join(" ") + "원" : ""
}

interface KoreanNumberInputProps {
  value: number
  onChange: (v: number) => void
  label: string
  placeholder?: string
  helpText?: string
  className?: string
  required?: boolean
}

export function KoreanNumberInput({
  value, onChange, label, placeholder = "예: 3억 5천만, 350000000",
  helpText, className, required,
}: KoreanNumberInputProps) {
  const [focused, setFocused] = useState(false)
  const [raw, setRaw] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const displayValue = focused ? raw : (value > 0 ? formatInputDisplay(value) : "")

  function handleFocus() {
    setRaw(value > 0 ? String(value) : "")
    setFocused(true)
  }

  function handleBlur() {
    const parsed = parseKoreanInput(raw)
    onChange(parsed)
    setFocused(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRaw(e.target.value)
  }

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      {focused && raw && formatLive(raw) && (
        <p className="text-xs font-medium text-blue-500">{formatLive(raw)}</p>
      )}
      {!focused && value > 0 && (
        <p className="text-xs text-gray-400">= {value.toLocaleString()}원</p>
      )}
      {helpText && <p className="text-xs text-gray-400">{helpText}</p>}
    </div>
  )
}
