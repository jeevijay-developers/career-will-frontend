import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ClientLayout } from "../components/ClientLayout";

export const metadata: Metadata = {
  title: "Career will - Staff panel",
  description: "Admin panel to manage students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/logo/logo.png" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
