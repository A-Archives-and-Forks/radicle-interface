import {
  aliceMainCommitCount,
  aliceMainHead,
  aliceRemote,
  expect,
  sourceBrowsingUrl,
  test,
} from "@tests/support/fixtures.js";
import { createRepo } from "@tests/support/repo";
import {
  expectBackAndForwardNavigationWorks,
  expectUrlPersistsReload,
} from "@tests/support/router.js";

test("navigate between landing and repo page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/");

  await page.getByText("source-browsing").click();
  await expect(page).toHaveURL(sourceBrowsingUrl);

  await expectBackAndForwardNavigationWorks("/", page);
  await expectUrlPersistsReload(page);
});

test("navigation between node and repo pages", async ({ page }) => {
  await page.goto("/nodes/radicle.local");

  const repo = page
    .locator(".repo-card", { hasText: "source-browsing" })
    .nth(0);
  await repo.click();
  await expect(page).toHaveURL(sourceBrowsingUrl);

  await expectBackAndForwardNavigationWorks("/nodes/radicle.local", page);
  await expectUrlPersistsReload(page);

  await page.getByRole("link", { name: "Local Node" }).click();
  await expect(page).toHaveURL("/nodes/127.0.0.1");
});

test.describe("repo page navigation", () => {
  test("navigation between commit history and single commit", async ({
    page,
  }) => {
    const repoHistoryURL = `${sourceBrowsingUrl}/history/${aliceMainHead}`;
    await page.goto(repoHistoryURL);

    await page.getByText("Add README.md").click();
    await expect(page).toHaveURL(
      `${sourceBrowsingUrl}/commits/${aliceMainHead}`,
    );

    await expectBackAndForwardNavigationWorks(repoHistoryURL, page);
    await expectUrlPersistsReload(page);
  });

  test("navigate between tree and commit history", async ({ page }) => {
    const repoTreeURL = `${sourceBrowsingUrl}/tree/${aliceMainHead}`;

    await page.goto(repoTreeURL);
    await page
      .getByRole("progressbar", { name: "Page loading" })
      .waitFor({ state: "hidden" });
    await expect(page).toHaveURL(repoTreeURL);

    await page
      .getByRole("link", { name: `Commits ${aliceMainCommitCount}` })
      .click();

    await expect(page).toHaveURL(
      `${sourceBrowsingUrl}/history/${aliceMainHead}`,
    );

    await expectBackAndForwardNavigationWorks(repoTreeURL, page);
    await expectUrlPersistsReload(page);
  });

  test("navigate between tree and commit history while a file is selected", async ({
    page,
  }) => {
    const repoTreeURL = `${sourceBrowsingUrl}`;

    await page.goto(repoTreeURL);
    await page
      .getByRole("progressbar", { name: "Page loading" })
      .waitFor({ state: "hidden" });
    await expect(page).toHaveURL(repoTreeURL);

    await page.getByText(".hidden").click();
    await expect(page).toHaveURL(`${repoTreeURL}/tree/.hidden`);

    await page
      .getByRole("link", { name: `Commits ${aliceMainCommitCount}` })
      .click();
    await expect(page).toHaveURL(`${sourceBrowsingUrl}/history`);
  });

  test("navigate repo paths", async ({ page }) => {
    const repoTreeURL = `${sourceBrowsingUrl}/tree/${aliceMainHead}`;

    await page.goto(repoTreeURL);
    await expect(page).toHaveURL(repoTreeURL);

    await page.getByText(".hidden").click();
    await expect(page).toHaveURL(`${repoTreeURL}/.hidden`);

    await page.getByText("bin").click();
    await page.getByText("true").click();
    await expect(page).toHaveURL(`${repoTreeURL}/bin/true`);

    await expectBackAndForwardNavigationWorks(`${repoTreeURL}/.hidden`, page);
    await expectUrlPersistsReload(page);
  });

  test("page title", async ({ page }) => {
    await page.goto(sourceBrowsingUrl, {
      waitUntil: "networkidle",
    });
    const title = await page.title();
    expect(title).toBe(
      "source-browsing · Git repository for source browsing tests",
    );
  });

  test("page title on repo with empty description", async ({ page, peer }) => {
    const { rid } = await createRepo(peer, {
      name: "RepoWithNoDescription",
    });
    await page.goto(peer.ridUrl(rid), {
      waitUntil: "networkidle",
    });
    const title = await page.title();
    expect(title).toBe("RepoWithNoDescription");
  });

  test("navigate repo paths with an explicitly selected peer", async ({
    page,
  }) => {
    // If a branch isn't explicitly specified, the code assumes the repo
    // default branch is selected. We omit showing the default branch in the URL.

    const repoTreeURL = `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(
      8,
    )}`;

    await page.goto(repoTreeURL);
    await expect(page).toHaveURL(repoTreeURL);

    await page.getByText(".hidden").click();
    await expect(page).toHaveURL(`${repoTreeURL}/tree/.hidden`);

    await page.getByText("bin").click();
    await page.getByText("true").click();
    await expect(page).toHaveURL(`${repoTreeURL}/tree/bin/true`);

    await expectBackAndForwardNavigationWorks(
      `${repoTreeURL}/tree/.hidden`,
      page,
    );
    await expectUrlPersistsReload(page);
  });

  test("navigate repo paths with an explicitly selected peer and branch", async ({
    page,
  }) => {
    const repoTreeURL = `${sourceBrowsingUrl}/remotes/${aliceRemote.substring(
      8,
    )}/tree/main`;

    await page.goto(repoTreeURL);
    await expect(page).toHaveURL(repoTreeURL);

    await page.getByText(".hidden").click();
    await expect(page).toHaveURL(`${repoTreeURL}/.hidden`);

    await page.getByText("bin").click();
    await page.getByText("true").click();
    await expect(page).toHaveURL(`${repoTreeURL}/bin/true`);

    await expectBackAndForwardNavigationWorks(`${repoTreeURL}/.hidden`, page);
    await expectUrlPersistsReload(page);
  });
});
