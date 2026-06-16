import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "부동산 세금 계산기",
  description: "취득세, 양도소득세, 보유세, 증여세, 상속세 등 부동산 관련 세금 계산기. 2025년 세법 기준.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "세금계산기",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${notoSansKR.className} min-h-full bg-gray-50`}>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
