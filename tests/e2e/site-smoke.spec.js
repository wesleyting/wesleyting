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

test("the DuuDuu hero presents the project scope and live store", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/duuduu-mattress.html", {
    waitUntil: "domcontentloaded",
  });

  await expect(page.locator(".case-subtitle")).toHaveText(
    "Building the storefront, search, and campaign systems behind DuuDuu’s ecommerce growth.",
  );

  const details = page.locator(".case-hero-details");
  await expect(details.locator("dt")).toHaveText([
    "Role",
    "Tech Stack",
    "Live Store",
  ]);
  await expect(details.locator("dd")).toHaveText([
    "Shopify Developer / Ecommerce Growth",
    "Shopify / Liquid / CSS / JavaScript",
    "Visit duuduu.com.au ↗",
  ]);

  const liveStore = details.getByRole("link", {
    name: "Visit duuduu.com.au ↗",
  });
  await expect(liveStore).toHaveAttribute("href", "https://duuduu.com.au/");
  await expect(liveStore).toHaveAttribute("target", "_blank");
  await expect(liveStore).toHaveAttribute("rel", /noopener/);

  const proof = page.locator(".duuduu-proof-grid");
  await expect(proof.locator("article")).toHaveCount(3);
  await expect(proof.locator("h3")).toHaveText([
    "Search Growth",
    "Customer Trust",
    "Campaign Performance",
  ]);
  await expect(proof).toContainText("+316%");
  await expect(proof).toContainText("5 out of 5");
  await expect(proof).toContainText("56 current customer reviews.");
  await expect(proof).toContainText("+60%");
  await expect(proof).toContainText("ProductReview.com.au");
  await expect(proof.locator(".case-kpi-count")).toHaveText(["316", "5.0", "60"]);

  const role = page.locator(".duuduu-role");
  const roleStatement = role.getByRole("heading", { level: 2 });
  await expect(roleStatement).toContainText("campaigns and landing pages");
  await expect(role.locator(".duuduu-role-media img")).toHaveAttribute(
    "src",
    "/projects/duuduu/duuduu-mattress-room.png",
  );

  const foundation = page.locator(".duuduu-foundation");
  await expect(foundation.getByRole("heading", { level: 2 })).toHaveText(
    "Built for a Considered Purchase",
  );
  await expect(foundation.locator("h3")).toHaveText([
    "Buyer Confidence",
    "Campaign Agility",
    "Search + Learning",
  ]);
  await expect(page.locator(".duuduu-brand-break, .duuduu-loop-section")).toHaveCount(0);

  const work = page.locator(".duuduu-work");
  await expect(work.getByRole("heading", { level: 2 })).toHaveText(
    "The Work Behind the Growth",
  );
  await expect(work.locator("h3")).toHaveText([
    "Storefront Experience",
    "Product Storytelling",
    "Search + Structure",
    "Campaign Delivery",
    "Brand + Comfort Content",
  ]);
  await expect(work.locator("video source").nth(0)).toHaveAttribute(
    "src",
    "/projects/duuduu/duuduu-landing-page-walkthrough.mp4",
  );
  await expect(work.locator("video source").nth(1)).toHaveAttribute(
    "src",
    "/projects/duuduu/duuduu-brand-comfort.mp4",
  );
  await expect(work.locator("img").nth(0)).toHaveAttribute("src", "/projects/duuduu/duuduu-product-page.png");
  await expect(work.locator("img").nth(1)).toHaveAttribute("src", "/projects/duuduu/duuduu-search-pageviews.png");
  await expect(work.locator("img").nth(2)).toHaveAttribute("src", "/projects/duuduu/duuduu-campaign-collage.webp");

  const outcome = page.locator(".duuduu-outcome");
  await expect(outcome.getByRole("heading", { level: 2 })).toHaveText(
    "A Store Built to Keep Improving",
  );
  await expect(outcome.locator(".outcome-count")).toHaveText(["+316%", "5/5"]);
  await expect(outcome).toContainText("56 customer reviews");
  await expect(outcome.getByRole("link", { name: /Visit Live Store/ })).toHaveAttribute(
    "href",
    "https://duuduu.com.au/",
  );
});

test("case study headers identify the client location", async ({ page }) => {
  const projects = [
    {
      path: "/projects/vegaspaulyc.html",
      year: "2024–Present",
      location: "Las Vegas, USA",
    },
    {
      path: "/projects/duuduu-mattress.html",
      year: "2025–Present",
      location: "Australia",
    },
  ];

  for (const project of projects) {
    await page.goto(project.path, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".case-year")).toContainText(project.year);
    await expect(page.locator(".case-location")).toHaveText(project.location);
  }
});

test("the homepage features projects in the intended order", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const cards = page.locator(".sticky-cards .project-card");
  await expect(cards).toHaveCount(4);
  await expect(cards.locator("h3")).toHaveText([
    "VegasPaulyC",
    "DuuDuu Mattress",
    "All-In Brownie",
    "Token Studio",
  ]);
  await expect(cards.nth(0)).toHaveAttribute("href", "/projects/vegaspaulyc.html");
  await expect(cards.nth(0).locator(".project-card-shot img").first()).toHaveAttribute(
    "src",
    "/home/project-vegaspaulyc-gallery-01.webp",
  );
  await expect(cards.nth(1)).toHaveAttribute("href", "/projects/duuduu-mattress.html");
  await expect(cards.nth(2)).not.toHaveAttribute("href", /.+/);
  const tokenStudioCard = cards.nth(3);
  await expect(tokenStudioCard).toHaveAttribute("href", "https://tokenstoy.com/");
  await expect(tokenStudioCard).toHaveAttribute("target", "_blank");
  await expect(tokenStudioCard).toHaveAttribute("rel", /noopener/);
  await expect(tokenStudioCard).toHaveAttribute("data-cursor-label", "View Website");
  await expect(tokenStudioCard.locator(".project-card-cta")).toContainText("View website");
  const sourceGallery = tokenStudioCard.locator(
    ".project-card-marquee-group:not(.project-card-marquee-group--duplicate)",
  );
  await expect(sourceGallery.locator(".project-card-shot")).toHaveCount(3);
  expect(await sourceGallery.locator(".project-card-shot img").evaluateAll((images) =>
    images.map((image) => image.getAttribute("src")),
  )).toEqual([
    "/home/token-studio-cabin-character.webp",
    "/home/token-studio-space-character.webp",
    "/home/token-studio-brand-mark.webp",
  ]);
});

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
  await page.waitForURL("**/projects/vegaspaulyc.html");
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
