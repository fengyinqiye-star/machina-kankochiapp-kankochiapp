import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'おすすめ観光スポット | 周遊ルートアプリ',
  description:
    'エリア名を入力するだけで、周辺のおすすめ観光スポットと最適な周遊ルートが見つかる旅行計画アプリ。',
  openGraph: {
    title: 'おすすめ観光スポット | 周遊ルートアプリ',
    description:
      'エリア名を入力するだけで、周辺のおすすめ観光スポットと最適な周遊ルートが見つかります。',
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased leading-relaxed">{children}</body>
    </html>
  );
}
