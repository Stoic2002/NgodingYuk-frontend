import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NgodingYuk — Learn to Code",
  description:
    "Interactive coding learning platform. Master Go and SQL through hands-on lessons, exercises, and quizzes.",
  keywords: ["coding", "learn", "go", "golang", "sql", "programming"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased text-text-primary min-h-screen text-slate-900 bg-[#f4f3ee]" style={{
        backgroundImage: "radial-gradient(#b1ada1 0.5px, transparent 0.5px)",
        backgroundSize: "24px 24px"
      }}>{children}</body>
    </html>
  );
}
