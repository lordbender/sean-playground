import { expect, test } from "@playwright/test";

const username = process.env.E2E_USERNAME ?? "user";
const password = process.env.E2E_PASSWORD ?? "playground";

test("authenticated user can view Sean's Background", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /sign in with keycloak/i }).click();

  await expect(page).toHaveURL(/\/realms\/seans-playground\/protocol\/openid-connect\/auth/);
  await page.getByLabel(/username or email/i).fill(username);
  await page.getByRole("textbox", { name: /^password$/i }).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page.getByRole("button", { name: /sean's background/i })).toBeVisible();

  const backgroundResponse = page.waitForResponse(
    (response) => response.url().includes("/api/background/sean") && response.status() === 200
  );

  await page.getByRole("button", { name: /sean's background/i }).click();
  await backgroundResponse;

  await expect(page.getByRole("heading", { name: "Sean Willison" })).toBeVisible();
  await expect(page.getByText("linkedin.com/in/swillison")).toBeVisible();
  await expect(page.getByText("facebook.com/sean.willison.1")).toBeVisible();
  await expect(page.getByText("lordbender/sean-playground")).toBeVisible();
  await expect(page.getByText("Users")).toBeVisible();
});
