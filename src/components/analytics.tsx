'use client';

import Script from 'next/script';

// Replace these IDs with real values before going live
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX';
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-XXXXXXXXXX';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '0000000000000';

// ── Event tracking utility (callable from any component) ──────────────────
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  // GTM dataLayer push
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: eventName, ...params });
  // GA4 gtag
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, params);
  }
  // Meta Pixel
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', eventName === 'cta_click' ? 'Lead' : 'ViewContent', params);
  }
}

// Standard events to use:
// trackEvent('cta_click', { button_label: 'Quero ver funcionando' })
// trackEvent('signup_start')
// trackEvent('signup_complete')
// trackEvent('whatsapp_click')
// trackEvent('calculator_use', { vehicles: 40, ticket: 350 })

export default function Analytics() {
  if (process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      {/* Google Tag Manager */}
      <Script id="gtm" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>

      {/* GA4 */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}', { send_page_view: true });
        `}
      </Script>

      {/* Meta Pixel */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
    </>
  );
}
