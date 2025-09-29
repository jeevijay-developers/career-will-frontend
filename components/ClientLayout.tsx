"use client";

import { AppInitializer } from "./AppInitializer";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <AppInitializer />
      {children}
    </>
  );
}
