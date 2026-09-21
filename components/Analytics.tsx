"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { SITE } from "@/lib/site";

/**
 * GA4 / GTM loaders + SPA page-view tracking.
 * Renders nothing when no measurement IDs are configured.
 */
export function Analytics() {
  const pathname = usePathname();
  const { gaId, gtmId } = SITE;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "page_view", page_path: pathname });
  }, [pathname]);

  if (!gaId && !gtmId) return null;

  return (
    <>
      {gtmId && (
        <>
          <Script
            id="gtm-loader"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              alt=""
            />
          </noscript>
        </>
      )}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false});`,
            }}
          />
        </>
      )}
    </>
  );
}
