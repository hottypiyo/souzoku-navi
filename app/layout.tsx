import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "相続手続きナビ",
    template: "%s | 相続手続きナビ",
  },
  description: "親が亡くなった後の手続きを、あなたの状況に合わせてナビゲート。締切付きタスクを一覧管理。",
  openGraph: {
    title: "相続手続きナビ",
    description: "親が亡くなった後の手続きを、あなたの状況に合わせてナビゲート。",
    locale: "ja_JP",
    type: "website",
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
        {children}
      </body>
    </html>
  );
}
