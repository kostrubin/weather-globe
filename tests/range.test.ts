import { afterEach, describe, expect, it, vi } from "vitest";
import { RangeBackend } from "../src/data/range";
import { getManifest } from "../src/data/network";
afterEach(() => vi.unstubAllGlobals());
const header = {
  status: 200,
  headers: { "Content-Length": "1000", ETag: '"version1"' },
};
describe("bounded HTTP boundary", () => {
  it("rejects ignored ranges before reading the oversized body", async () => {
    let reads = 0;
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, header))
        .mockResolvedValueOnce(
          new Response(
            new ReadableStream({
              pull(c) {
                reads++;
                c.enqueue(new Uint8Array(4));
                c.close();
              },
            }),
            { status: 200 },
          ),
        ),
    );
    const b = new RangeBackend("https://test", new AbortController().signal);
    await expect(b.getBytes(0, 4)).rejects.toThrow("Invalid range");
    expect(reads).toBeLessThanOrEqual(1);
    expect(b.bytes).toBe(0);
  });
  it("checks exact content range and immutable version", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, header))
        .mockResolvedValueOnce(
          new Response(new Uint8Array([1, 2, 3, 4]), {
            status: 206,
            headers: { "Content-Range": "bytes 0-3/1000", ETag: '"version2"' },
          }),
        ),
    );
    await expect(
      new RangeBackend("https://test", new AbortController().signal).getBytes(
        0,
        4,
      ),
    ).rejects.toThrow("version");
  });
  it("accepts exact bounded byte streams", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, header))
        .mockResolvedValueOnce(
          new Response(new Uint8Array([1, 2, 3, 4]), {
            status: 206,
            headers: { "Content-Range": "bytes 0-3/1000", ETag: '"version1"' },
          }),
        ),
    );
    const b = new RangeBackend("https://test", new AbortController().signal);
    expect(await b.getBytes(0, 4)).toEqual(new Uint8Array([1, 2, 3, 4]));
    expect(b.verified).toBe(true);
  });
  it("rejects incomplete external manifests", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ completed: false }))),
    );
    await expect(getManifest("cams_global")).rejects.toThrow();
  });
});
