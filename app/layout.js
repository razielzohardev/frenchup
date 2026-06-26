export const metadata = {
  title: "FrenchUp — תרגול צרפתית",
  description: "אתגר יומי לשיפור צרפתית ברמת B2/C1, עם קול נוירוני",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
