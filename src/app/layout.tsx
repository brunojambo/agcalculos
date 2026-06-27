import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AG Cálculos Base",
  description: "Sistema base para gestão de cálculos judiciais"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
