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
