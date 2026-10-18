import { test, expect } from "@playwright/test";

// Fake microphone so voice notes can be recorded headlessly.
test.use({
  permissions: ["microphone"],
  launchOptions: {
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
  },
});
test("brand can schedule a call and send a voice note", async ({ page }) => {
  await page.goto("/messages");
  await page.getByLabel("Viewing role").selectOption("Brand-Agency");
  await page.getByRole("button", { name: "Schedule a call" }).click();
  const dialog = page.getByRole("dialog");
  // Phone stays locked before hire so numbers stay private.
  await expect(dialog.getByRole("radio", { name: "Phone" })).toBeDisabled();
  await dialog.getByLabel("What’s it about?").fill("Brief walkthrough");
  await dialog
    .getByLabel("Meeting link (optional)")
    .fill("https://meet.google.com/abc-defg-hij");
  await dialog.getByRole("button", { name: "Send invite" }).click();
  const card = page.locator(".call-card").last();
  await expect(card).toContainText("Brief walkthrough");
  await expect(card).toContainText("Confirmed");
  await expect(card.getByRole("link", { name: "Join call" })).toBeVisible();
  await expect(
    card.getByRole("button", { name: "Add to calendar" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Record a voice note" }).click();
  await expect(page.getByText(/Recording 0:0/)).toBeVisible();
  await page.waitForTimeout(1300);
  await page.getByRole("button", { name: "Stop and send voice note" }).click();
  await expect(
    page.getByRole("button", { name: "Play voice note" }).last(),
  ).toBeVisible();
  await expect(
    page.locator(".chat-messages").getByText("Thanks for the voice note!"),
  ).toBeVisible();
});
