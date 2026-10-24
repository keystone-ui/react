/**
 * `/r/demos/[name]` is prerendered for every demo name. The cached read
 * behind it must never run for a name that was not prerendered: on the
 * Worker the static-assets cache is read-only and `demos/` does not exist,
 * so the request would recompute and fail instead of answering 404. The
 * handler therefore gates on the build-time name list before touching the
 * cached function; outside Next's runtime that function throws, which is
 * what makes this test fail when the gate is missing.
 */
import { describe, expect, it } from "vitest";

import { GET } from "@/app/r/demos/[name]/route";

function call(name: string): Promise<Response> {
  return GET(new Request(`http://localhost/r/demos/${name}`), {
    params: Promise.resolve({ name }),
  });
}

describe("GET /r/demos/[name]", () => {
  it("answers 404 for a well-formed name that is not a demo", async () => {
    const res = await call("not-a-demo-name");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "Demo not found",
      name: "not-a-demo-name",
    });
  });

  it("answers 400 for a malformed name", async () => {
    const res = await call("..%2F..%2Fetc");
    expect(res.status).toBe(400);
  });
});
