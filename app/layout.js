import "../src/styles/GlobalStyles.css";
import { UIProvider } from "@/context/UIContext";
import { FrameworkProvider } from "@/context/FrameworkContex";
import { LayoutProvider } from "@/context/LayoutContext";
import { SessionProvider } from "@/context/SessionContext";
import SidebarWrapper from "@/components/SidebarWrapper";
import MainContentWrapper from "@/components/MainContentWrapper";
import { getPageMetadata } from "@/utils/getPageMetadata";

export async function generateMetadata() {
  return getPageMetadata("/", {
    title: {
      default: "CalVant | ISO Compliance & Risk Management Platform",
      template: "%s | CalVant",
    },
    description: "Empower your organization with CalVant compliance platform.",
    verification: { google: "41e5318870c428ec" },
    icons: {
      icon: [
        { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
        { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
      ],
      apple: "/favicon-light.png",
    },
  });
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CalVant",
  url: "https://calvant.com",
  description:
    "AI-powered compliance and risk management platform for ISO 27001, ISO 27701, ISO 42001, SOC 2, GDPR and KSA PDPL.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },                                                           
  publisher: {
    "@type": "Organization",
    name: "CalVant",
    url: "https://calvant.com",
    logo: {
      "@type": "ImageObject",
      url: "https://calvant.com/icon-light.png", // use light version as the canonical logo
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <UIProvider>
          <SessionProvider>
            <FrameworkProvider>
              <LayoutProvider>
                <SidebarWrapper />
                <MainContentWrapper>{children}</MainContentWrapper>
              </LayoutProvider>
            </FrameworkProvider>
          </SessionProvider>
        </UIProvider>
      </body>
    </html>
  );
}
