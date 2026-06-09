"use client";
import { SessionProvider } from "next-auth/react";
import { CurrencyProvider } from "@/components/CurrencyProvider";

export function Providers({ currency, children }: { currency: string, children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CurrencyProvider currency={currency}>
        {children}
      </CurrencyProvider>
    </SessionProvider>
  );
}
