import { test, cobUrl, expect } from "@tests/support/fixtures.js";
import { createRepo } from "@tests/support/project";

test("navigate issue listing", async ({ page }) => {
  await page.goto(cobUrl);
  await page.getByRole("link", { name: "Issues 1" }).click();
  await expect(page).toHaveURL(`${cobUrl}/issues`);

  await page.getByRole("button", { name: "filter-dropdown" }).first().click();
  await page.getByRole("link", { name: "Closed 2" }).click();
  await expect(page).toHaveURL(`${cobUrl}/issues?status=closed`);
});

test("issue counters", async ({ page, peer }) => {
  const { rid, repoFolder } = await createRepo(peer, {
    name: "issue-counters",
  });
  await peer.rad(
    [
      "issue",
      "open",
      "--title",
      "First issue to test counters",
      "--description",
      "Let's see",
    ],
    { cwd: repoFolder },
  );
  await page.goto(`${peer.uiUrl()}/${rid}/issues`);
  await peer.rad(
    [
      "issue",
      "open",
      "--title",
      "Second issue to test counters",
      "--description",
      "Let's see",
    ],
    { cwd: repoFolder },
  );
  await page.getByRole("button", { name: "filter-dropdown" }).first().click();
  await page.locator(".dropdown-item").getByText("Open 1").click();
  await expect(page.getByRole("button", { name: "Issues 2" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "filter-dropdown" }).first(),
  ).toHaveText("Open 2");
  await expect(page.locator(".issue-teaser")).toHaveCount(2);

  await page
    .getByRole("link", { name: "First issue to test counters" })
    .click();
});
