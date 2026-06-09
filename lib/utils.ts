export function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function maskCardNumber(cardNumber: string) {
  return "**** **** **** " + cardNumber.slice(-4);
}

export function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export function generateCardNumber() {
  return "4" + Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join("");
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
