import LZString from "lz-string"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function encodeCalcParams(state: Record<string, any>): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(state))
}

export function decodeCalcParams(param: string): Record<string, unknown> | null {
  try {
    const raw = LZString.decompressFromEncodedURIComponent(param)
    if (!raw) return null
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}
