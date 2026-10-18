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
  // Click a card to get its quick actions, then move it.
  await page.getByRole("button", { name: "Actions for Rohan Mehta" }).click();
  await page.getByRole("menuitem", { name: "Hired" }).click();
  // Hiring opens the deal setup; close it for this test.
  await expect(
    page.getByRole("heading", { name: "Set up the deal with Rohan Mehta" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
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

test("verification badges reflect each poster's actual status", async ({
  page,
}) => {
  await page.goto("/agency/roam-local");
  await expect(page.getByText("Verification pending")).toBeVisible();
  await expect(page.getByText("Verified partner")).toHaveCount(0);
  await page.goto("/campaigns/offbeat-india");
  await expect(
    page.locator(".detail-main .poster-label svg.lucide-badge-check"),
  ).toHaveCount(0);
  await page.goto("/agency/kurta-kraft");
  await expect(page.getByText("Verified partner")).toBeVisible();
});

test("dashboard activity only shows the viewer's own applications", async ({
  page,
}) => {
  await page.goto("/c/dashboard");
  await page.getByLabel("Viewing role").selectOption("Creator");
  const creatorActivity = page
    .locator(".panel")
    .filter({ hasText: "Your application updates" });
  await expect(creatorActivity.locator(".activity-row")).toHaveCount(2);
  await expect(creatorActivity).not.toContainText(
    "Your style. Our festive collection.",
  );
  await page.goto("/a/dashboard");
  await page.getByLabel("Viewing role").selectOption("Brand-Agency");
  const brandActivity = page
    .locator(".panel")
    .filter({ hasText: "Latest activity" });
  await expect(brandActivity.getByText("Rohan Mehta")).toBeVisible();
  await expect(brandActivity).not.toContainText("Make everyday skincare");
});

test("homepage track-record card matches the agency's profile data", async ({
  page,
}) => {
  await page.goto("/agency/social-sutra");
  const posted = await page
    .locator(".poster-stats > div")
    .first()
    .locator("strong")
    .innerText();
  await page.goto("/");
  const card = page.locator(".transparency-demo");
  await expect(card.locator(".transparency-stats strong").first()).toHaveText(
    posted,
  );
  await expect(card).toContainText("sample reviews");
});

test("hero makes no barter denial or unbacked star rating", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("NO BARTER")).toHaveCount(0);
  await expect(page.locator(".hero-proof .stars")).toHaveCount(0);
});

test("campaign value display is type-aware and consistent", async ({
  page,
}) => {
  for (const [type, prefix] of [
    ["Affiliate", "Up to ₹"],
    ["Barter", "Worth ₹"],
  ]) {
    await page.goto(`/campaigns?type=${type}`);
    const card = page.locator(".card-bottom").first();
    const amount = await card.locator("strong").innerText();
    expect(amount.startsWith(prefix)).toBe(true);
    await card.locator(".circle-link").click();
    await expect(page.locator(".budget-panel h2")).toHaveText(amount);
    await expect(page.locator(".poster-panel")).toContainText(
      "Illustrative demo metric",
    );
  }
});

test("notifications are scoped to the viewer's role", async ({ page }) => {
  await page.goto("/notifications");
  await page.getByLabel("Viewing role").selectOption("Creator");
  await expect(page.getByText("You made the shortlist!")).toBeVisible();
  await page.getByLabel("Viewing role").selectOption("Brand-Agency");
  await page.goto("/notifications");
  await expect(page.getByText("You made the shortlist!")).toHaveCount(0);
  await expect(page.getByText("Nothing new yet.")).toBeVisible();
});

test("platforms are multi-select and limited to Instagram, YouTube and LinkedIn", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Platform: All platforms" }).click();
  const list = page.getByRole("listbox", { name: "Platform" });
  await expect(list.getByRole("option")).toHaveText([
    "All platforms",
    "Instagram",
    "YouTube",
    "LinkedIn",
  ]);
  // "All" ticks every checkbox.
  for (const o of await list.getByRole("option").all())
    await expect(o).toHaveAttribute("aria-selected", "true");
  // Unticking one keeps the others.
  await list.getByRole("option", { name: "YouTube" }).click();
  await expect(list.getByRole("option", { name: "YouTube" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
  await expect(
    list.getByRole("option", { name: "All platforms" }),
  ).toHaveAttribute("aria-selected", "false");
  // Re-ticking "All" ticks everything again; then narrow back down.
  await list.getByRole("option", { name: "All platforms" }).click();
  await expect(list.getByRole("option", { name: "YouTube" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await list.getByRole("option", { name: "YouTube" }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Platform: Instagram, LinkedIn" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Find campaigns/ }).click();
  await expect(page).toHaveURL(/platform=Instagram%2CLinkedIn/);
  await expect(page.locator(".campaign-card").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Platform: Instagram, LinkedIn" }),
  ).toBeVisible();
  const metas = await page.locator(".campaign-card .card-meta").allInnerTexts();
  expect(metas.length).toBeGreaterThan(0);
  expect(metas.some((m) => m.includes("LinkedIn"))).toBe(true);
  expect(metas.some((m) => m.includes("YouTube"))).toBe(false);
});

test("long dropdowns can be searched", async ({ page }) => {
  await page.goto("/campaigns");
  await expect(page.locator(".campaign-card").first()).toBeVisible();
  await page.getByRole("button", { name: /^City:/ }).click();
  const search = page.getByRole("combobox", { name: "Search city" });
  await expect(search).toBeFocused();
  await search.fill("pun");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveText([
    "Pune",
  ]);
  await search.press("Enter");
  await expect(page.getByRole("button", { name: "City: Pune" })).toBeVisible();
  await page.getByRole("button", { name: "City: Pune" }).click();
  await page.getByRole("combobox", { name: "Search city" }).fill("zzz");
  await expect(page.getByText("No matches for “zzz”")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("how-it-works card switches between brand and creator track records", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator(".how-section");
  const card = section.locator(".transparency-demo");
  await expect(card).toContainText("Campaigns posted");
  await section.getByRole("button", { name: "For brands" }).click();
  await expect(card).toContainText("Followers");
  await expect(card).toContainText("Sample brand review");
  await expect(card).not.toContainText("Campaigns posted");
  const followers = await card
    .locator(".transparency-stats strong")
    .first()
    .innerText();
  await card.getByRole("link", { name: /full media kit/ }).click();
  await expect(page).toHaveURL(/\/creator\//);
  await expect(page.getByText(followers).first()).toBeVisible();
});
test("campaign builder uploads images and previews the brand's own details", async ({
  page,
}) => {
  await page.goto("/a/campaigns/new");
  await page.getByLabel("Viewing role").selectOption("Brand-Agency");
  await page.getByLabel("Brand name").fill("Chai Collective");
  // 1x1 PNG picked "from the gallery".
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  await page
    .getByLabel("Cover image", { exact: true })
    .setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: png });
  await expect(page.getByAltText("Cover image preview")).toBeVisible();
  await expect(
    page.getByText("Recommended: 1200 × 675 px (16:9)"),
  ).toBeVisible();
  await expect(page.locator(".image-upload-meta").first()).toContainText(
    "1 × 1 px",
  );
  await expect(page.getByText(/Low resolution/)).toBeVisible();
  const card = page.locator(".campaign-card");
  await expect(card.getByText("Chai Collective")).toBeVisible();
  await expect(card.getByText("Kurta Kraft")).toHaveCount(0);
  await expect(card.locator(".card-cover img")).toHaveAttribute(
    "src",
    /^data:image\//,
  );
});

test("campaign builder supports multiple platforms, per-platform deliverables and paid usage rights", async ({
  page,
}) => {
  await page.goto("/a/campaigns/new");
  await page.getByLabel("Viewing role").selectOption("Brand-Agency");
  await page.getByLabel("Campaign title").fill("Festive edit across platforms");
  await page.getByLabel("Brand name").fill("Chai Collective");
  await page
    .getByLabel("The creative brief")
    .fill(
      "Show how our festive range fits into your celebrations, in your own voice and style, for an Indian audience.",
    );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  // Second platform gets its own deliverables block.
  await page.getByRole("button", { name: "YouTube", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "YouTube", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "More Long video on YouTube" })
    .click();
  const yt = page.locator(".platform-block").filter({ hasText: "YouTube" });
  await yt.locator(".quick-add").getByRole("button", { name: "Short" }).click();
  await expect(yt.locator(".platform-block-head small")).toHaveText(
    "2 Long videos (3-5 min), 1 Short (Up to 60 sec)",
  );
  // Extra usage needs a duration and who pays.
  await page.getByLabel("Paid ads from your brand account").check();
  const ads = page
    .locator(".usage-option")
    .filter({ hasText: "Paid ads from your brand" });
  await ads.getByRole("radio", { name: "Fixed extra amount" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    ads.getByText("Enter the extra amount per creator."),
  ).toBeVisible();
  await ads.getByLabel("Extra per creator (₹)").fill("5000");
  await ads.getByLabel("For how long").selectOption("90");
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByText(
      "Paid ads from your brand account for 90 days (+₹5,000 per creator)",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Publish campaign" }).click();
  await expect(page).toHaveURL(/\/a\/campaigns$/);
  await page.goto("/campaigns?q=Festive+edit+across");
  await page
    .getByRole("heading", { name: "Festive edit across platforms" })
    .click();
  await expect(
    page.getByRole("cell", { name: "YouTube Long video (3-5 min)" }),
  ).toBeVisible();
  await expect(
    page.getByText("Paid ads from your brand account for 90 days"),
  ).toBeVisible();
  await expect(page.locator(".detail-metadata")).toContainText("YouTube");
});

test("brief do's and don'ts, custom location and engagement minimum reach creators", async ({
  page,
}) => {
  await page.goto("/a/campaigns/new");
  await page.getByLabel("Viewing role").selectOption("Brand-Agency");
  await page.getByLabel("Campaign title").fill("Red and white festive story");
  await page.getByLabel("Brand name").fill("Chai Collective");
  await page
    .getByLabel("The creative brief")
    .fill(
      "Tell a warm festive story with our chai, filmed in your own home with the people you celebrate with.",
    );
  await page
    .getByLabel("Add to do’s")
    .fill("Shoot with a red and white background");
  await page.keyboard.press("Enter");
  await page
    .locator(".list-input.dont .quick-add")
    .getByRole("button", { name: "No competitor brands in frame" })
    .click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Minimum engagement rate (%)").fill("3.5");
  await page.getByRole("button", { name: /^Locations:/ }).click();
  await page.getByLabel("Search locations").fill("Shillong");
  await page.getByRole("option", { name: "Use “Shillong”" }).click();
  // The list stays open so a second city can be ticked.
  await page.getByLabel("Search locations").fill("Pune");
  await page.getByRole("option", { name: "Pune" }).click();
  // A typed-in city shows as a ticked row, so it can be removed again.
  await page.getByLabel("Search locations").fill("Ooty");
  await page.getByRole("option", { name: "Use “Ooty”" }).click();
  await page.getByRole("option", { name: "Ooty" }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Locations: Shillong, Pune" }),
  ).toBeVisible();
  await expect(page.getByText("Campaign closing date")).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Publish campaign" }).click();
  await expect(page).toHaveURL(/\/a\/campaigns$/);
  await page.goto("/campaigns?q=Red+and+white+festive");
  await page
    .getByRole("heading", { name: "Red and white festive story" })
    .click();
  const rules = page.locator(".dos-donts");
  await expect(
    rules.getByText("Shoot with a red and white background"),
  ).toBeVisible();
  await expect(rules.getByText("No competitor brands in frame")).toBeVisible();
  await expect(page.getByText("3.5%+ engagement")).toBeVisible();
  await expect(page.locator(".detail-metadata")).toContainText(
    "Shillong, Pune",
  );
});

test("hiring sets up a deal, both sides sign the contract, and payments are tracked", async ({
  page,
}) => {
  await page.goto("/a/campaigns/ca-2/applicants");
  await page.getByLabel("Viewing role").selectOption("Brand-Agency");
  await page.getByRole("button", { name: "Actions for Aanya Sharma" }).click();
  const menu = page.getByRole("menu", { name: "Actions for Aanya Sharma" });
  await expect(menu.getByRole("menuitem")).toHaveCount(5);
  await menu.getByRole("menuitem", { name: "Hired" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Agreed creator fee (₹)").fill("50000");
  await dialog.getByRole("button", { name: "Create deal & contract" }).click();
  const board = page.getByRole("region", { name: "Budget and payments" });
  await expect(board.getByText("₹15,000 of ₹50,000 paid")).toHaveCount(0);
  await expect(board.getByText("₹0 of ₹50,000 paid")).toBeVisible();
  // Brand signs.
  await board.getByRole("button", { name: "Contract", exact: true }).click();
  await expect(page.getByText("4. Fees and payment")).toBeVisible();
  await page.getByLabel("Type your full name to sign").fill("Riya Mehta");
  await page.getByLabel(/I’ve read these terms/).check();
  await page.getByRole("button", { name: "Sign agreement" }).click();
  await expect(
    page.getByText("Signed by").or(page.locator(".signature.done")),
  ).toHaveCount(1);
  await page.keyboard.press("Escape");
  // Record the 30% advance.
  await board.getByRole("button", { name: "Pay ₹15,000" }).click();
  await page.getByLabel("UTR / reference (optional)").fill("UTR123");
  await page.getByRole("button", { name: "Mark as paid" }).click();
  await expect(board.getByText("₹15,000 of ₹50,000 paid")).toBeVisible();
  // Creator sees the deal and signs.
  await page.getByLabel("Viewing role").selectOption("Creator");
  await page.goto("/c/work/ca-2");
  await expect(page.getByText("Ref UTR123")).toBeVisible();
  await page.getByRole("button", { name: "Review & sign contract" }).click();
  await page.getByLabel("Type your full name to sign").fill("Aanya Sharma");
  await page.getByLabel(/I’ve read these terms/).check();
  await page.getByRole("button", { name: "Sign agreement" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Contract signed")).toBeVisible();
  // The brand's payments page covers its own campaigns.
  await page.getByLabel("Viewing role").selectOption("Brand-Agency");
  await page.goto("/a/campaigns/ca-1/applicants");
  await page.getByRole("button", { name: "Actions for Rohan Mehta" }).click();
  await page.getByRole("menuitem", { name: "Hired" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Agreed creator fee (₹)")
    .fill("20000");
  await page.getByRole("button", { name: "Create deal & contract" }).click();
  await page.goto("/a/payments");
  await expect(
    page.getByRole("heading", { name: "Payments & contracts" }),
  ).toBeVisible();
  const ledger = page.locator(".data-table").last();
  await expect(ledger).toContainText("Rohan Mehta");
  await expect(ledger).toContainText("₹6,000");
  await expect(ledger).not.toContainText("Aanya Sharma");
});

test("media kit shows per-platform insights, playable work links and labelled brand collabs", async ({
  page,
}) => {
  await page.goto("/creator/rohan.mehta");
  // Opens on the creator's main platform.
  const about = page
    .locator(".panel")
    .filter({ hasText: "A little about me." });
  await expect(about).toContainText("Subscribers");
  await about.getByRole("tab", { name: /LinkedIn/ }).click();
  await expect(about).toContainText("Avg. impressions");
  // Every section follows the selected platform.
  await expect(
    page.getByText("LinkedIn posts my community loved."),
  ).toBeVisible();
  await expect(
    page.getByText(/India-based audience on LinkedIn/),
  ).toBeVisible();
  await expect(page.getByText("Shared by creator").first()).toBeVisible();
  await expect(page.getByText("@rohan.mehta")).toBeVisible();
  await expect(page.getByText("English, English")).toHaveCount(0);

  // The demo creator adds a real YouTube link and a past collab.
  await page.goto("/c/profile");
  await page
    .getByLabel("Link to the post or video")
    .fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  await expect(page.getByLabel("Platform").first()).toHaveValue("YouTube");
  await page.getByLabel("Title", { exact: true }).fill("My festive vlog");
  await page.getByRole("button", { name: "Add to my media kit" }).click();
  await page.getByLabel("Brand", { exact: true }).fill("Chai Collective");
  await page.getByLabel("What you made").fill("2 Reels + 3 Stories");
  await page
    .getByLabel("What you achieved together")
    .fill("Their most-saved post this year");
  await page.getByRole("button", { name: "Add collab" }).click();

  await page.goto("/creator/aanya.sharma");
  await page
    .locator(".profile-section")
    .first()
    .getByRole("tab", { name: "YouTube" })
    .click();
  await page.getByRole("button", { name: "Preview My festive vlog" }).click();
  await expect(page.locator(".embed-frame iframe")).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
  await page.keyboard.press("Escape");
  const collab = page
    .locator(".collab-card")
    .filter({ hasText: "Chai Collective" });
  await expect(collab).toContainText("Shared by creator");
  await expect(collab).toContainText("Their most-saved post this year");
});
