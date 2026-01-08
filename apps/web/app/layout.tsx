import "./globals.css";

export const metadata = {
  title: "OmniLytix",
  description: "Calm by default. Powerful by design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
