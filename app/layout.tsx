import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: "Standard Chartered — Modern Banking",
  description: "A secure, modern banking experience",
};

import { prisma } from "@/lib/prisma";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let currency = "USD";
  try {
    const config = await prisma.appConfig.findUnique({ where: { id: "global" } });
    if (config) currency = config.currency;
  } catch (e) {
    console.error("Failed to fetch global config", e);
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${syne.variable} font-sans bg-dark-900 text-white antialiased`}>
        <GoogleTranslate />
        <Providers currency={currency}>{children}</Providers>
        
        {/* Smartsupp Live Chat script */}
        <Script id="smartsupp-chat" strategy="afterInteractive">
          {`
            var _smartsupp = _smartsupp || {};
            _smartsupp.key = '4296580f2931136866a6b5b0a86b2d963c4b1f83';
            window.smartsupp||(function(d) {
              var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
              s=d.getElementsByTagName('script')[0];c=d.createElement('script');
              c.type='text/javascript';c.charset='utf-8';c.async=true;
              c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
            })(document);
          `}
        </Script>
      </body>
    </html>
  );
}
