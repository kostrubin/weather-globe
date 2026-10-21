import type { OmFileReaderBackend } from "@openmeteo/file-reader";
export class RangeBackend implements OmFileReaderBackend {
  private size = 0;
  private etag: string | null = null;
  private modified: string | null = null;
  bytes = 0;
  requests = 0;
  verified = false;
  constructor(
    readonly url: string,
    readonly signal: AbortSignal,
  ) {}
  private signalFor(s?: AbortSignal) {
    return AbortSignal.any([
      this.signal,
      s ?? this.signal,
      AbortSignal.timeout(25000),
    ]);
  }
  async count(signal?: AbortSignal) {
    if (this.size) return this.size;
    const r = await fetch(this.url, {
      method: "HEAD",
      signal: this.signalFor(signal),
    });
    this.requests++;
    if (!r.ok) throw Error(`Spatial HEAD ${r.status}`);
    const size = Number(r.headers.get("Content-Length"));
    if (!Number.isSafeInteger(size) || size <= 0 || size > 256 * 1024 * 1024)
      throw Error("Invalid spatial length");
    this.size = size;
    this.etag = r.headers.get("ETag");
    this.modified = r.headers.get("Last-Modified");
    return size;
  }
  get version() {
    return this.etag;
  }
  async getBytes(offset: number, size: number, signal?: AbortSignal) {
    await this.count(signal);
    if (
      !Number.isSafeInteger(offset) ||
      !Number.isSafeInteger(size) ||
      offset < 0 ||
      size <= 0 ||
      size > 2 * 1024 * 1024 ||
      offset + size > this.size
    )
      throw Error("Unsafe byte range");
    const headers: Record<string, string> = {
      Range: `bytes=${offset}-${offset + size - 1}`,
    };
    if (this.etag) headers["If-Match"] = this.etag;
    else if (this.modified) headers["If-Unmodified-Since"] = this.modified;
    const r = await fetch(this.url, {
      headers,
      signal: this.signalFor(signal),
    });
    this.requests++;
    const expected = `bytes ${offset}-${offset + size - 1}/${this.size}`;
    if (
      r.status !== 206 ||
      r.headers.get("Content-Range") !== expected ||
      (this.etag && r.headers.get("ETag") !== this.etag)
    ) {
      await r.body?.cancel();
      throw Error(`Invalid range/version: ${r.status}`);
    }
    const reader = r.body!.getReader(),
      result = new Uint8Array(size);
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (received + value.length > size) {
        await reader.cancel();
        throw Error("Oversized range");
      }
      result.set(value, received);
      received += value.length;
    }
    if (received !== size) throw Error("Truncated range");
    this.bytes += received;
    this.verified = true;
    return result;
  }
  async close() {}
}
