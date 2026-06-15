import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKoreanAmount(n: number): string {
  if (n === 0) return "0원"
  const abs = Math.abs(n)
  const sign = n < 0 ? "-" : ""
  const eok = Math.floor(abs / 100000000)
  const man = Math.floor((abs % 100000000) / 10000)
  const won = abs % 10000

  const parts: string[] = []
  if (eok > 0) parts.push(`${eok.toLocaleString()}억`)
  if (man > 0) parts.push(`${man.toLocaleString()}만`)
  if (won > 0) parts.push(`${won.toLocaleString()}`)
  return sign + parts.join(" ") + "원"
}

export function formatTaxAmount(n: number): string {
  if (n === 0) return "0원"
  const abs = Math.abs(n)
  const sign = n < 0 ? "-" : ""
  const eok = Math.floor(abs / 100000000)
  const man = Math.floor((abs % 100000000) / 10000)
  const remainder = abs % 10000

  if (eok > 0) {
    const manStr = man > 0 ? ` ${man.toLocaleString()}만` : ""
    const remStr = remainder > 0 ? ` ${remainder.toLocaleString()}` : ""
    return `${sign}${eok.toLocaleString()}억${manStr}${remStr}원`
  }
  if (man > 0) {
    const remStr = remainder > 0 ? ` ${remainder.toLocaleString()}` : ""
    return `${sign}${man.toLocaleString()}만${remStr}원`
  }
  return `${sign}${remainder.toLocaleString()}원`
}

export function parseKoreanInput(raw: string): number {
  const s = raw.replace(/,/g, "").trim()
  if (!s) return 0

  let total = 0
  const eokMatch = s.match(/(\d+(?:\.\d+)?)\s*억/)
  const cheonmanMatch = s.match(/(\d+(?:\.\d+)?)\s*천만/)
  const manMatch = s.match(/(\d+(?:\.\d+)?)\s*만/)
  const cheonMatch = s.match(/(\d+(?:\.\d+)?)\s*천/)
  const pureNumber = s.match(/^(\d+)$/)

  if (eokMatch) total += parseFloat(eokMatch[1]) * 100000000
  if (cheonmanMatch) {
    total += parseFloat(cheonmanMatch[1]) * 10000000
  } else if (manMatch) {
    total += parseFloat(manMatch[1]) * 10000
  }
  if (cheonMatch && !cheonmanMatch && !manMatch) total += parseFloat(cheonMatch[1]) * 1000
  if (!eokMatch && !cheonmanMatch && !manMatch && !cheonMatch && pureNumber) {
    total = parseInt(pureNumber[1], 10)
  }

  return Math.round(total)
}

export function formatInputDisplay(n: number): string {
  if (n === 0) return ""
  const eok = Math.floor(n / 100000000)
  const man = Math.floor((n % 100000000) / 10000)
  const won = n % 10000
  const parts: string[] = []
  if (eok > 0) parts.push(`${eok.toLocaleString()}억`)
  if (man > 0) parts.push(`${man.toLocaleString()}만`)
  if (won > 0) parts.push(`${won.toLocaleString()}`)
  return parts.join(" ")
}

export function applyProgressiveRate(
  amount: number,
  brackets: { 과표이하?: number | null; 세율: number; 누진공제: number }[]
): number {
  if (amount <= 0) return 0
  for (const b of brackets) {
    if (b.과표이하 === null || b.과표이하 === undefined || amount <= b.과표이하) {
      return Math.floor(amount * b.세율 - b.누진공제)
    }
  }
  const last = brackets[brackets.length - 1]
  return Math.floor(amount * last.세율 - last.누진공제)
}
