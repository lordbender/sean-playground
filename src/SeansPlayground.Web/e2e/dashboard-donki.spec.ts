import { expect, test } from "@playwright/test";

const username = process.env.E2E_USERNAME ?? "user";
const password = process.env.E2E_PASSWORD ?? "playground";

test("authenticated user can zoom DONKI charts and open drilldown detail", async ({ page }) => {
  await page.goto("/");

  const dashboardResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/nasa/dashboard") && response.status() === 200
  );

  await page.getByRole("button", { name: /sign in with keycloak/i }).click();
  await expect(page).toHaveURL(/\/realms\/seans-playground\/protocol\/openid-connect\/auth/);
  await page.getByLabel(/username or email/i).fill(username);
  await page.getByRole("textbox", { name: /^password$/i }).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  const dashboard = await (await dashboardResponsePromise).json();
  const series = dashboard.donkiSeries.find((item: { totalCount: number }) => item.totalCount > 0) ?? dashboard.donkiSeries[0];

  await expect(page.getByRole("heading", { name: /NASA space weather/i })).toBeVisible();
  await expect(page.getByText(series.displayName).first()).toBeVisible();

  const chart = page.locator(".trendChart");
  await chart.scrollIntoViewIfNeeded();
  const box = await chart.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    const y = box.y + 28;
    await page.mouse.move(box.x + box.width * 0.2, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.58, y, { steps: 8 });
    await page.mouse.up();
  }

  await expect(page.getByRole("button", { name: /^reset$/i }).first()).toBeVisible();
  await page.getByRole("button", { name: /^reset$/i }).first().click();
  await expect(page.getByRole("button", { name: /^reset$/i }).first()).toBeHidden();

  const detailResponsePromise = page.waitForResponse(
    (response) => response.url().includes(`/api/nasa/donki/${series.eventType}/events`) && response.status() === 200
  );

  await page.locator(".donkiCard").filter({ hasText: series.displayName }).click();
  const detail = await (await detailResponsePromise).json();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText(series.displayName).last()).toBeVisible();

  if (detail.events.length > 0) {
    await expect(page.getByText("Raw NASA payload").first()).toBeVisible();
    await expect(page.locator(".donkiRawPayload").first()).toContainText(series.eventType.toLowerCase(), { ignoreCase: true });
  } else {
    await expect(page.getByText(/No stored DONKI events/i)).toBeVisible();
  }
});
