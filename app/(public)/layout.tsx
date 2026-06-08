import "@/app/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standard Chartered | Next-Gen Banking",
  description: "Modern, secure, and instant banking for everyone.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-900 text-white selection:bg-primary-500/30 selection:text-white">
      {children}
    </div>
  );
}
