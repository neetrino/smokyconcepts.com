import { NextRequest, NextResponse } from 'next/server';

/**
 * Idram may load SUCCESS_URL / FAIL_URL inside an iframe on banking.idram.am.
 * A server 302 to localhost is blocked cross-origin; this HTML forces top-level navigation.
 */
export function buildTopLevelRedirectHtml(targetUrl: string): string {
  const encodedTarget = targetUrl
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
  const serializedTarget = JSON.stringify(targetUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting</title>
</head>
<body>
  <p>Redirecting…</p>
  <script>
    (function () {
      var target = ${serializedTarget};
      var topWindow = window.top || window;
      topWindow.location.replace(target);
    })();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${encodedTarget}">
    <p><a href="${encodedTarget}">Continue to the store</a></p>
  </noscript>
</body>
</html>`;
}

/**
 * Returns to the store without an extra hard navigation when already top-level.
 * Uses HTML breakout only when the payment provider loaded this URL in an iframe.
 */
export function createPaymentReturnResponse(req: NextRequest, targetUrl: string): NextResponse {
  const isIframe = req.headers.get('sec-fetch-dest') === 'iframe';
  if (isIframe) {
    return new NextResponse(buildTopLevelRedirectHtml(targetUrl), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.redirect(targetUrl);
}
