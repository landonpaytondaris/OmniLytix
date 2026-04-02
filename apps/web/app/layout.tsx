import "./globals.css";
import AmbientFieldBackground from "../src/components/AmbientFieldBackground";

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
    <html lang="en" className="h-full">
      <body className="h-full min-h-screen relative bg-black text-white overflow-hidden">
        <AmbientFieldBackground />
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>

    </html>
  );
}
