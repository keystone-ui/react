/**
 * Response headers applied by `next.config.ts` `headers()`. OpenNext applies
 * them in its routing layer, so they reach prerendered HTML served through
 * cache interception as well as dynamic routes. Static assets under
 * `/_next/static` and `/public` bypass the Worker and are covered by
 * `public/_headers` instead.
 */

import { describe, expect, it } from "vitest";

import { securityHeaders } from "../lib/security-headers";

const TWO_YEARS = /max-age=63072000/;

function headerMap(source: string): Record<string, string> {
  const rule = securityHeaders().find((r) => r.source === source);
  if (!rule) {
    throw new Error(`no header rule for ${source}`);
  }
  return Object.fromEntries(
    rule.headers.map((h) => [h.key.toLowerCase(), h.value])
  );
}

describe("securityHeaders", () => {
  const all = headerMap("/:path*");

  it("enables HSTS for two years including subdomains", () => {
    expect(all["strict-transport-security"]).toMatch(TWO_YEARS);
    expect(all["strict-transport-security"]).toContain("includeSubDomains");
  });

  it("stops MIME sniffing and limits referrer leakage", () => {
    expect(all["x-content-type-options"]).toBe("nosniff");
    expect(all["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  it("denies powerful browser features the docs never use", () => {
    expect(all["permissions-policy"]).toContain("camera=()");
    expect(all["permissions-policy"]).toContain("microphone=()");
    expect(all["permissions-policy"]).toContain("geolocation=()");
  });

  it("allows framing only by the site itself, so /preview iframes keep working", () => {
    // Block previews render /preview/<name> in a same-origin iframe.
    expect(all["x-frame-options"]).toBe("SAMEORIGIN");
    expect(all["content-security-policy"]).toContain("frame-ancestors 'self'");
  });

  it("covers every route with a single catch-all rule", () => {
    expect(securityHeaders().map((r) => r.source)).toEqual(["/:path*"]);
  });
});
