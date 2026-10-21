import { describe, it, expect } from "vitest";
import {
  sample,
  precipitationRate,
  position,
  advanceWind,
  windFrom,
  toTemperature,
  toWind,
  palette,
  layerById,
  horizon,
  Lru,
  nearestTime,
  inEurope,
} from "../src/data/model";
import { demoFrame, demoManifest, demoTime } from "../src/data/demo";
import { coordinates, dailyCalendarDate, safeZone } from "../src/data/point";
import { fileUrl } from "../src/data/network";
describe("scientific coordinates and masks", () => {
  it("places known meridians on documented axes", () => {
    expect(position(0, 0)).toEqual([1, 0, -0]);
    expect(position(90, 120)[1]).toBeCloseTo(1);
    expect(position(0, 90)[2]).toBeCloseTo(-1);
    expect(position(-34.6, -58.38)[1]).toBeLessThan(0);
    expect(position(35.7, 139.7)[2]).toBeLessThan(0);
  });
  it("bilinearly samples with a periodic antimeridian and preserves zero", () => {
    const f = demoFrame("temperature", "grass", demoTime);
    f.width = 4;
    f.height = 2;
    f.values = new Float32Array([0, 10, 20, 30, 0, 10, 20, 30]);
    expect(sample(f, 0, -180)).toBe(0);
    expect(sample(f, 0, -135)).toBe(5);
    expect(sample(f, 0, 179.9)).toBeCloseTo(sample(f, 0, -180.1)!);
    f.values[0] = NaN;
    expect(sample(f, 0, -180)).toBeNull();
  });
  it("never extends regional pollen into South America or across the seam", () => {
    const f = demoFrame("pollen", "grass", demoTime);
    expect(sample(f, -34.6, -58.38)).toBeNull();
    expect(sample(f, 52.5, 13.4)).toBe(0);
    expect(sample(f, 50, 179)).toBeNull();
    expect(inEurope(52, 13)).toBe(true);
    expect(inEurope(-35, -58)).toBe(false);
  });
});
describe("physical semantics", () => {
  it("preserves accumulation intervals and invalid artifacts", () => {
    expect(precipitationRate(0.1, 3)).toBeCloseTo(0.0333333);
    expect(precipitationRate(0, 3)).toBe(0);
    expect(precipitationRate(-0.1, 3)).toBeNaN();
    expect(precipitationRate(1, null)).toBeNaN();
  });
  it("converts normalized units once", () => {
    expect(toTemperature(0, true)).toBe(32);
    expect(toTemperature(20, false)).toBe(20);
    expect(toWind(5, true)).toBe(18);
  });
  it("advects with transport direction and reports bearing FROM", () => {
    expect(windFrom(10, 0)).toBe(270);
    expect(windFrom(0, 10)).toBe(180);
    expect(advanceWind(0, 0, 10, 0, 60)[1]).toBeGreaterThan(0);
    expect(advanceWind(0, 0, 0, -10, 60)[0]).toBeLessThan(0);
    expect(advanceWind(0, 179.999, 50, 0, 600)[1]).toBeLessThan(-179);
    expect(advanceWind(89.999, 0, 10, 10, 100).every(Number.isFinite)).toBe(
      true,
    );
  });
  it("retains fixed physical palette endpoints and true zero UVI", () => {
    const l = layerById("uv");
    expect(palette(0, l)).toEqual([32, 63, 76]);
    expect(palette(12, l)).toEqual([149, 96, 171]);
    expect(palette(100, l)).toEqual(palette(12, l));
  });
  it("omits initial precipitation interval and clips metadata horizon", () => {
    const m = demoManifest("precipitation");
    const t = horizon(m, Date.parse(demoTime), "precipitation");
    expect(t).not.toContain(demoTime);
    expect(t[0]).toContain("03:00");
    expect(t.length).toBe(24);
    expect(nearestTime(t, Date.parse(demoTime))).toBe(t[0]);
  });
});
describe("bounded state", () => {
  it("keeps daily calendar dates unique across Berlin DST without shifting hourly instants", () => {
    const times = [
      1792533600, 1792620000, 1792706400, 1792792800, 1792879200, 1792965600,
      1793052000,
    ];
    expect(times.map((t) => dailyCalendarDate(t, 7200))).toEqual([
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
      "2026-10-26",
      "2026-10-27",
    ]);
    expect(safeZone("bad/zone")).toBe("UTC");
  });
  it("evicts least-recent cache and uses full run keys", () => {
    const c = new Lru<string, number>(2);
    c.set("run1/temp", 1);
    c.set("run2/temp", 2);
    expect(c.get("run1/temp")).toBe(1);
    c.set("run3/temp", 3);
    expect(c.get("run2/temp")).toBeUndefined();
    expect(c.size).toBe(2);
  });
  it("validates coordinates and constructs UTC immutable URLs", () => {
    expect(coordinates("−34, −58")).toBeNull();
    expect(coordinates("-34.6, -58.38")?.latitude).toBe(-34.6);
    expect(coordinates("91,0")).toBeNull();
    expect(
      fileUrl("cams_global", "2026-10-20T12:00:00Z", "2026-10-21T01:00Z"),
    ).toBe(
      "https://openmeteo.s3.amazonaws.com/data_spatial/cams_global/2026/10/20/1200Z/2026-10-21T0100.om",
    );
  });
});
