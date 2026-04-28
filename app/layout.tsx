import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import PostHogProvider from "@/components/analytics/posthog-provider";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://souzoku-navi.app"),
  title: {
    default: "相続手続きナビ | 相続手続きをわかりやすく",
    template: "%s | 相続手続きナビ",
  },
  description:
    "親が亡くなった後の相続手続きを、あなたの状況に合わせてナビゲート。期限付きタスク管理・AI相談・LINE通知で、複雑な手続きをサポートします。",
  keywords: [
    "相続手続き",
    "相続",
    "相続放棄",
    "相続税",
    "遺産分割",
    "相続登記",
    "準確定申告",
    "相続手続き代行",
    "相続手続きナビ",
  ],
  authors: [{ name: "堀田昂佑" }],
  creator: "堀田昂佑",
  openGraph: {
    title: "相続手続きナビ | 相続手続きをわかりやすく",
    description:
      "親が亡くなった後の相続手続きを、あなたの状況に合わせてナビゲート。期限付きタスク管理・AI相談・LINE通知で複雑な手続きをサポート。",
    url: "https://souzoku-navi.app",
    siteName: "相続手続きナビ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "相続手続きナビ | 相続手続きをわかりやすく",
    description:
      "親が亡くなった後の相続手続きを、あなたの状況に合わせてナビゲート。期限付きタスク管理・AI相談・LINE通知で複雑な手続きをサポート。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://souzoku-navi.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
