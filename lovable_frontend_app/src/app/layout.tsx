import type { Metadata } from "next";
import "./globals.css";

/**
 * Application root layout providing global styles and metadata.
 */
export const metadata: Metadata = {
  title: "Lovable App Builder",
  description: "Generate, preview, and deploy fullstack applications.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
