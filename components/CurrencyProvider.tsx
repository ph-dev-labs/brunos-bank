"use client";
import { createContext, useContext } from "react";
import { formatCurrency as utilFormatCurrency } from "@/lib/utils";

type CurrencyContextType = {
  currency: string;
  formatCurrency: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  formatCurrency: (amount: number) => utilFormatCurrency(amount, "USD"),
});

export function CurrencyProvider({ currency, children }: { currency: string; children: React.ReactNode }) {
  const formatCurrency = (amount: number) => utilFormatCurrency(amount, currency);

  return (
    <CurrencyContext.Provider value={{ currency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
