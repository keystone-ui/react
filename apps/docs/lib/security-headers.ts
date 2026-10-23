/**
 * Response headers for every HTML and API route.
 *
 * Applied through `headers()` in next.config.ts. OpenNext applies these in
 * its routing layer, so prerendered pages served through cache interception
 * get them too. Files under /_next/static and /public bypass the Worker
 * entirely; their caching lives in `public/_headers`.
 *
 * Framing is limited to the site itself: block previews embed
 * `/preview/<name>` in a same-origin iframe, which `SAMEORIGIN` and
 * `frame-ancestors 'self'` both permit.
 */
export function securityHeaders() {
  return [
    {
      source: "/:path*",
      headers: [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
      ],
    },
  ];
}
