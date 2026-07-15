import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", title: /Wesley Ting \| Frontend and Ecommerce Developer/ },
  { path: "/about.html", title: /About Wesley Ting/ },
  { path: "/projects/duuduu-mattress.html", title: /DuuDuu Mattress/ },
  { path: "/projects/vegaspaulyc.html", title: /VegasPaulyC/ },
  { path: "/projects/token-studio.html", title: /Token Studio/ },
  { path: "/projects/clearbooks-tech.html", title: /Clearbooks Tech/ },
];

function collectBrowserErrors(page) {
  const errors = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });

  return errors;
}

for (const pageDetails of pages) {
  test(`${pageDetails.path} loads without browser errors`, async ({ page }) => {
    const browserErrors = collectBrowserErrors(page);
    await page.emulateMedia({ reducedMotion: "reduce" });

    const response = await page.goto(pageDetails.path, {
      waitUntil: "domcontentloaded",
    });

    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle(pageDetails.title);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    expect(browserErrors).toEqual([]);
  });
}

test("the shared menu opens and closes with the keyboard", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);

  const menuButton = page.locator(".menu-toggle-btn");
  const menu = page.locator("#site-menu");

  await expect(menuButton).toHaveAttribute("aria-label", "Open menu");
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(menuButton).toHaveAttribute("aria-label", "Close menu");
  await expect(menu).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator("body")).toHaveClass(/menu-is-open/);

  await page.keyboard.press("Escape");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton).toHaveAttribute("aria-label", "Open menu");
  await expect(menu).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("body")).not.toHaveClass(/menu-is-open/);

  expect(browserErrors).toEqual([]);
});

test("browser back restores the home page after a transition", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.locator("#project-card-1").click();
  await page.waitForURL("**/projects/duuduu-mattress.html");
  await expect(page.locator("body")).not.toHaveClass(/transition-active/);

  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-page-transition-departure]")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveClass(/transition-active/);
  expect(browserErrors).toEqual([]);
});

test("project screenshots open in the image viewer", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/vegaspaulyc.html", { waitUntil: "domcontentloaded" });

  const lightbox = page.locator(".project-lightbox");
  await expect(lightbox).toHaveCount(1);
  await page.locator(".commerce-card--product .commerce-card-content").dispatchEvent("click");
  await expect(lightbox).toHaveClass(/is-open/);
  await expect(lightbox.locator(".project-lightbox-image")).toHaveAttribute("src", /product-page-variants\.png/);

  await page.keyboard.press("ArrowRight");
  await expect(lightbox.locator(".project-lightbox-image")).toHaveAttribute("src", /printful-shopify-sync\.png/);
  await page.keyboard.press("Escape");
  await expect(lightbox).not.toHaveClass(/is-open/);
  expect(browserErrors).toEqual([]);
});
