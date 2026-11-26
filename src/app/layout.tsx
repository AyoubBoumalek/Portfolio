import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QA Automation Engineer Portfolio",
  description: "QA Automation Engineer portfolio and project showcase.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
