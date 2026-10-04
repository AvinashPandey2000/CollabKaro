import { test, expect } from "@playwright/test";
test("creator can apply, track and persist an application", async ({
  page,
}) => {
  await page.goto("/campaigns/festive-fashion-edit");
  await page.getByLabel("Viewing role").selectOption("Creator");
  await page.getByRole("button", { name: "Apply to this campaign" }).click();
  await page
    .getByLabel("Your creative pitch")
    .fill(
      "I will create three festive styling ideas for my community, with a natural story and a clear focus on your collection.",
    );
  await page.getByLabel("Your quote").fill("12500");
  await page.getByRole("button", { name: "Send application" }).click();
  await expect(
    page.getByRole("button", { name: "Applied", exact: true }).first(),
  ).toBeVisible();
  await page.goto("/c/applications");
  await expect(
    page.getByRole("heading", { name: "Your style. Our festive collection." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("I will create three festive styling ideas"),
  ).toBeVisible();
});
test("brand can publish a campaign and manage applicant status", async ({
  page,
}) => {
  await page.goto("/a/campaigns/new");
  await page.getByLabel("Viewing role").selectOption("Brand-Agency");
  await page
    .getByLabel("Campaign title")
    .fill("A new festive storytelling campaign");
  await page.getByLabel("Brand name").fill("My Indian Brand");
  await page
    .getByLabel("The creative brief")
    .fill(
      "We are looking for authentic fashion creators to share a fresh festive story with their community. Show our products in your own original creative style.",
    );
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Publish campaign" }).click();
  await expect(page).toHaveURL(/\/a\/campaigns$/);
  await expect(
    page.getByRole("heading", { name: "A new festive storytelling campaign" }),
  ).toBeVisible();
  await page.goto("/campaigns?q=A+new+festive+storytelling");
  await expect(
    page.getByRole("heading", { name: "A new festive storytelling campaign" }),
  ).toBeVisible();
  await page.goto("/a/campaigns/ca-1/applicants");
  await page
    .getByLabel("Application status for Rohan Mehta")
    .selectOption("Hired");
  await expect(
    page
      .locator(".kanban-column")
      .filter({ has: page.getByRole("heading", { name: "Hired" }) })
      .getByText("Rohan Mehta"),
  ).toBeVisible();
});
test("chat masks contacts before hire and permits them after hire", async ({
  page,
}) => {
  await page.goto("/messages");
  await page.getByLabel("Viewing role").selectOption("Creator");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Call 9876543221 or email hello@example.com");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page
      .locator(".chat-messages")
      .getByText("Call 98******21 or email he***@***"),
  ).toBeVisible();
  await page.getByRole("button", { name: /BoltFit/ }).click();
  await page.getByLabel("Message", { exact: true }).fill("Call 9876543221");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.locator(".chat-messages").getByText("Call 9876543221"),
  ).toBeVisible();
});
test("mobile routes fit the viewport and dark theme persists", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of [
    "/",
    "/campaigns",
    "/creator/aanya.sharma",
    "/a/dashboard",
    "/pricing",
    "/login",
    "/tools/engagement",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const width = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(width, `overflow on ${path}`).toBeLessThanOrEqual(375);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({ path: "docs/home-dark.png", fullPage: true });
});
test("filters, save, tools, and command search work", async ({ page }) => {
  await page.goto("/campaigns?niche=Tech");
  await expect(page.locator(".campaign-card")).toHaveCount(4);
  await page.getByRole("button", { name: "Save campaign" }).first().click();
  await page.goto("/c/saved");
  await expect(page.locator(".campaign-card")).toHaveCount(1);
  await page.goto("/tools/engagement");
  await expect(page.getByText("7.75%", { exact: true })).toBeVisible();
  await page.getByLabel("Followers", { exact: true }).fill("20000");
  await expect(page.getByText("3.88%", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Search website" }).click();
  await page.getByPlaceholder("Search anything…").fill("Aanya");
  await page.getByRole("option", { name: /Aanya Sharma/ }).click();
  await expect(page).toHaveURL(/creator\/aanya.sharma/);
});

test("draft campaigns can be reopened, edited, and published", async ({
  page,
}) => {
  await page.goto("/a/campaigns/new");
  await page.getByLabel("Viewing role").selectOption("Brand-Agency");
  await page.getByLabel("Campaign title").fill("A thoughtful draft campaign");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/a\/campaigns$/);
  const row = page
    .locator(".management-row")
    .filter({ hasText: "A thoughtful draft campaign" });
  await expect(
    row.locator(".badge").filter({ hasText: /^Draft$/ }),
  ).toBeVisible();
  await row.getByRole("link", { name: "Edit", exact: true }).click();
  await expect(page).toHaveURL(/\/a\/campaigns\/new\?edit=/);
  await page.reload();
  await expect(page.getByLabel("Campaign title")).toHaveValue(
    "A thoughtful draft campaign",
  );
  await page.getByLabel("Brand name").fill("Draft Studio");
  await page
    .getByLabel("The creative brief")
    .fill(
      "We are looking for creators to bring their authentic voice to our collection, with a thoughtful visual story that resonates with an Indian audience.",
    );
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Publish campaign" }).click();
  await expect(page).toHaveURL(/\/a\/campaigns$/);
  await expect(
    page
      .locator(".management-row")
      .filter({ hasText: "A thoughtful draft campaign" }),
  ).toHaveCount(1);
  await expect(
    page
      .locator(".management-row")
      .filter({ hasText: "A thoughtful draft campaign" })
      .locator(".badge")
      .filter({ hasText: /^Live$/ }),
  ).toBeVisible();
});
