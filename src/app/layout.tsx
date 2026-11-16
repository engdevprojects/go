import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/nunito-sans";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { PRODUCT_DESCRIPTOR, PRODUCT_NAME, PRODUCT_SUBLINE } from "@/lib/config/product";

const DESCRIPTION = `A demonstration of ${PRODUCT_NAME} (${PRODUCT_SUBLINE}): a 30-day RWF wallet concept for international visitors to Rwanda. All rates, balances and payments are sample data.`;

/** Site-wide metadata. Favicons come from src/app/icon.png and apple-icon.png (the GO logo). */
export const metadata: Metadata = {
  title: { default: `${PRODUCT_NAME} — ${PRODUCT_DESCRIPTOR.toLowerCase()} (demo)`, template: `%s · ${PRODUCT_NAME}` },
  description: DESCRIPTION,
  applicationName: PRODUCT_NAME,
  openGraph: {
    type: "website",
    siteName: PRODUCT_NAME,
    title: `${PRODUCT_NAME} — ${PRODUCT_DESCRIPTOR} (demo)`,
    description: DESCRIPTION,
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

/** Root layout: fonts (self-hosted via Fontsource), global styles, client providers. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
