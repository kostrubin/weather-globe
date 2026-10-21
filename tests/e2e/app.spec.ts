import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function demo(page: import("@playwright/test").Page) {
  await page.goto("/?demo=1");
  await page.waitForFunction(() => window.__weather?.ready);
  await expect(page.locator("canvas")).toBeVisible();
}
test("globe selects the visible point, rotates without accidental click and zooms both ways", async ({
  page,
}) => {
  await demo(page);
  await page.waitForTimeout(500);
  const box = await page.locator(".globe-stage").boundingBox();
  const x = box!.x + box!.width / 2,
    y = box!.y + box!.height / 2;
  await page.mouse.click(x, y);
  await expect(page.locator(".place-heading p")).toContainText("-34.60");
  const before = await page.locator(".place-heading p").innerText();
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 70, y + 10, { steps: 8 });
  await page.mouse.up();
  expect(await page.locator(".place-heading p").innerText()).toBe(before);
  await page.getByRole("button", { name: "Приблизить", exact: true }).click();
  await page.waitForTimeout(100);
  const close = await page.evaluate(
    () => window.__weather.cameraDistance as number,
  );
  await page.getByRole("button", { name: "Отдалить", exact: true }).click();
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => window.__weather.cameraDistance as number),
  ).toBeGreaterThan(close);
});
test("all nine displayed tuples, pollen coverage and actual available time navigation", async ({
  page,
}) => {
  await demo(page);
  for (const l of [
    "temperature",
    "precipitation",
    "wind",
    "uv",
    "pollen",
    "pm25",
    "cloud",
    "humidity",
    "pressure",
  ]) {
    await page.locator(`[data-layer=${l}]`).click();
    await page.waitForFunction((l) => window.__weather.frame?.layer === l, l);
  }
  await page.locator("[data-layer=pollen]").click();
  await expect(page.locator(".coverage-callout")).toContainText("Нет покрытия");
  await page
    .getByRole("button", { name: "Показать регион покрытия", exact: false })
    .click();
  await expect(page.locator(".place-heading h2")).toHaveText("Buenos Aires");
  const time = await page.evaluate(() => window.__weather.frame?.validTime);
  await page.getByRole("button", { name: "Следующий кадр" }).click();
  await page.waitForFunction(
    (t) => window.__weather.frame?.validTime !== t,
    time,
  );
  await page.getByRole("button", { name: "Предыдущий кадр" }).click();
  await page.waitForFunction(
    (t) => window.__weather.frame?.validTime === t,
    time,
  );
});
test("favorites, coordinate search, language, units and share survive reload", async ({
  page,
}) => {
  await demo(page);
  const input = page.getByRole("combobox", { name: "Город или координаты" });
  await input.fill("52.52, 13.405");
  await page.getByRole("option").first().click();
  await expect(page.locator(".place-heading p")).toContainText("52.52");
  await page.getByRole("button", { name: "В избранное", exact: true }).click();
  await page.getByRole("button", { name: "Настройки", exact: true }).click();
  await page.getByLabel("Температура", { exact: true }).selectOption("f");
  await page
    .getByRole("dialog")
    .getByLabel("Язык", { exact: true })
    .selectOption("en");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await page.waitForFunction(() => window.__weather?.ready);
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page).toHaveURL(/lat=52.5200/);
  expect(new URL(page.url()).searchParams.get("temp")).toBe("f");
  expect(new URL(page.url()).searchParams.has("time")).toBe(true);
});
test("DOM forecast controls work when WebGL2 is absent and storage denied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl2") return null;
      return (original as any).call(this, type, ...args);
    } as any;
    Object.defineProperty(window, "localStorage", {
      get() {
        throw Error("Storage denied");
      },
    });
  });
  await page.goto("/?demo=1");
  await expect(page.locator(".no-webgl")).toContainText("3D недоступно");
  await page.locator("[data-layer=humidity]").click();
  await page.waitForFunction(
    () => window.__weather.frame?.layer === "humidity",
  );
  await expect(
    page.getByRole("button", { name: "В избранное", exact: true }),
  ).toBeVisible();
});
test("reduced motion, modal focus and accessibility", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await demo(page);
  await expect(
    page.getByRole("button", { name: "Воспроизвести", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Настройки", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
test("mobile, tablet, short landscape and zoom layouts do not overflow", async ({
  page,
}) => {
  await demo(page);
  for (const v of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
    { width: 720, height: 450 },
  ]) {
    await page.setViewportSize(v);
    await page.waitForTimeout(100);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Сейчас", exact: true }),
    ).toBeEnabled();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Развернуть прогноз", exact: true })
    .click();
  await expect(page.locator(".sheet-content")).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("provider failures, empty search and denied geolocation remain usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let calls = 0;
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition(_ok: unknown, fail: (e: unknown) => void) {
          calls++;
          (window as any).__geoCalls = calls;
          fail({ code: 1 });
        },
      },
    });
  });
  await page.route("**/latest.json", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({
      status: 429,
      headers: { "Retry-After": "60" },
      body: "Limited",
    }),
  );
  await page.route("https://air-quality-api.open-meteo.com/**", (route) =>
    route.fulfill({
      status: 429,
      headers: { "Retry-After": "60" },
      body: "Limited",
    }),
  );
  await page.route("https://geocoding-api.open-meteo.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"results":[]}',
    }),
  );
  await page.goto("/");
  expect(await page.evaluate(() => (window as any).__geoCalls ?? 0)).toBe(0);
  await page
    .getByRole("button", { name: "Моё местоположение", exact: true })
    .click();
  await expect(page.locator(".toast")).toContainText("Доступ к геопозиции");
  await page
    .getByRole("combobox", { name: "Город или координаты" })
    .fill("Unknown place");
  await expect(page.locator(".search-results")).toContainText(
    "Ничего не найдено",
  );
  await page.locator("[data-layer=pressure]").click();
  await expect(page.locator(".field-status")).toContainText(
    "Данные недоступны",
  );
  await expect(
    page.getByRole("button", { name: "Настройки", exact: true }),
  ).toBeEnabled();
});
