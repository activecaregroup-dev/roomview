import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoomView — ACG",
  description: "Active Care Group Room Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;600;700&family=Nunito:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-dark min-h-screen antialiased">{children}</body>
    </html>
  );
}
