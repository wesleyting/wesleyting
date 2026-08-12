import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", title: /Wesley Ting \| Frontend & Ecommerce Developer/ },
  { path: "/about.html", title: /About Wesley Ting/ },
  { path: "/contact.html", title: /Contact Wesley Ting/ },
  { path: "/success.html", title: /Message Sent/ },
  { path: "/projects/all-in-brownie.html", title: /All-In Brownie/ },
  { path: "/projects/duuduu-mattress.html", title: /DuuDuu Mattress/ },
  { path: "/projects/vegaspaulyc.html", title: /VegasPaulyC/ },
];

const seoPages = [
  { path: "/", canonical: "https://wesleyting.com/" },
  { path: "/about.html", canonical: "https://wesleyting.com/about.html" },
  { path: "/contact.html", canonical: "https://wesleyting.com/contact.html" },
  {
    path: "/projects/all-in-brownie.html",
    canonical: "https://wesleyting.com/projects/all-in-brownie.html",
  },
  {
    path: "/projects/duuduu-mattress.html",
    canonical: "https://wesleyting.com/projects/duuduu-mattress.html",
  },
  {
    path: "/projects/vegaspaulyc.html",
    canonical: "https://wesleyting.com/projects/vegaspaulyc.html",
  },
];

test("the contact page presents a concise Netlify-ready inquiry form", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact.html", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tell me what");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("building.");

  const form = page.locator('form[name="contact"]');
  await expect(form).toHaveAttribute("action", "/success.html");
  await expect(form).toHaveAttribute("method", "POST");
  await expect(form).toHaveAttribute("data-netlify", "true");
  await expect(form).toHaveAttribute("data-netlify-honeypot", "bot-field");
  await expect(form.locator('input[name="form-name"]')).toHaveValue("contact");
  await expect(form.locator("[required]")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "wesleytingdev@gmail.com" })).toHaveAttribute(
    "href",
    "mailto:wesleytingdev@gmail.com",
  );
});

function collectBrowserErrors(page) {
  const errors = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    const text = message.text();
    const isSandboxedExternalResource =
      text.includes("Failed to load resource") && text.includes("ERR_NETWORK_ACCESS_DENIED");

    if (message.type() === "error" && !isSandboxedExternalResource) {
      errors.push(`console: ${text}`);
    }
  });

  return errors;
}

for (const pageDetails of seoPages) {
  test(`${pageDetails.path} exposes production sharing metadata`, async ({ page }) => {
    await page.goto(pageDetails.path, { waitUntil: "domcontentloaded" });

    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      pageDetails.canonical,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      pageDetails.canonical,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://wesleyting.com/og.png",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      "https://wesleyting.com/og.png",
    );
  });
}

test("the launch support files describe the production site", async ({ request, page }) => {
  const [robotsResponse, sitemapResponse, manifestResponse] = await Promise.all([
    request.get("/robots.txt"),
    request.get("/sitemap.xml"),
    request.get("/favicon/site.webmanifest"),
  ]);

  expect(robotsResponse.ok()).toBe(true);
  expect(await robotsResponse.text()).toContain(
    "Sitemap: https://wesleyting.com/sitemap.xml",
  );

  expect(sitemapResponse.ok()).toBe(true);
  const sitemap = await sitemapResponse.text();
  for (const pageDetails of seoPages) {
    expect(sitemap).toContain(`<loc>${pageDetails.canonical}</loc>`);
  }
  expect(sitemap).not.toContain("token-studio");
  expect(sitemap).not.toContain("clearbooks-tech");

  expect(manifestResponse.ok()).toBe(true);
  expect(await manifestResponse.json()).toMatchObject({
    name: "Wesley Ting | Frontend & Ecommerce Developer",
    short_name: "Wesley Ting",
    start_url: "/",
  });

  await page.goto("/404.html", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle("Page Not Found | Wesley Ting");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "This page doesn’t exist.",
  );
});

for (const pageDetails of pages) {
  test(`${pageDetails.path} loads without browser errors`, async ({ page }) => {
    const browserErrors = collectBrowserErrors(page);
    await page.emulateMedia({ reducedMotion: "reduce" });

    const response = await page.goto(pageDetails.path, {
      waitUntil: "domcontentloaded",
    });

    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle(pageDetails.title);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#000000");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    expect(browserErrors).toEqual([]);
  });
}

test("the About page stays focused and exposes an accessible album carousel", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.goto("/about.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator(".about-hero-title")).toContainText(
    "I build digital experiences for the way businesses actually work.",
  );
  await expect(page.locator(".about-personal")).toContainText(
    "Outside the browser, music is where I keep sharpening my taste.",
  );
  await expect(
    page.locator(".about-capabilities, .about-process, .about-proof, .about-principles, .about-note, .about-contact, .about-return"),
  ).toHaveCount(0);

  const carousel = page.getByRole("region", { name: "Album artwork carousel" });
  await expect(carousel.locator(".listening-set")).toHaveCount(2);
  await expect(carousel.locator(".listening-card")).toHaveCount(20);
  await expect(carousel.locator(".listening-card--cover")).toHaveCount(4);
  await expect(carousel.locator(".listening-card--mockup")).toHaveCount(8);
  await expect(carousel.locator(".listening-card--padded")).toHaveCount(8);
  await expect(carousel.locator(".listening-set--duplicate")).toHaveAttribute("aria-hidden", "true");
  const originalCards = carousel.locator("[data-listening-set] .listening-card");
  await expect(originalCards).toHaveCount(10);
  await expect(carousel.locator(".listening-card[href], .listening-card[data-cursor-label]")).toHaveCount(0);
  await expect(
    page.locator("[data-listening-toggle], #listening-instructions, .listening-controls"),
  ).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});

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

test("the All-In Brownie case study exposes the launch system and media template", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/all-in-brownie.html", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("All-In Brownie");
  await expect(page.locator(".case-subtitle")).toHaveText(
    "A naming competition and two distinct brownie storefronts.",
  );

  const details = page.locator(".case-hero-details");
  await expect(details.locator("dt")).toHaveText(["Role", "Tech Stack", "Scope"]);
  await expect(details).toContainText("Frontend Development / Ecommerce");
  await expect(details).toContainText("Next.js / GSAP / Shopify");
  await expect(details).toContainText("Competition Site / Storefront / Multi-Brand");

  const metrics = page.locator(".all-in-kpis");
  await expect(metrics).toContainText("2025 Sales");
  await expect(metrics).toContainText("$24K+ USD");
  await expect(metrics).toContainText("677 units");
  await expect(metrics).toContainText("31.9K sessions");
  await expect(page.getByRole("heading", { name: "The US$10,000 Naming Competition" })).toBeVisible();

  const performance = page.locator(".all-in-trust");
  await expect(performance).toContainText("June 1");
  await expect(performance).toContainText("July 31, 2025");
  await expect(performance).toContainText("USD sales snapshot");
  await expect(performance).toContainText("$14.3K");
  await expect(performance).toContainText("$12.7K");
  await expect(performance).toContainText("$61.18");
  await expect(page.locator(".all-in-extension")).toContainText("BMF Brownie");
  await expect(page.locator(".all-in-outcome-route li")).toHaveText([
    "01$10K naming competition",
    "02All-In Shopify storefront",
    "03BMF Brownie storefront",
  ]);

  const carousel = page.locator("[data-story-carousel]");
  await expect(carousel.locator("[data-story-slide]")).toHaveCount(3);
  await expect(carousel.locator('[data-story-slide][aria-current="true"]')).toHaveCount(1);
  await expect(carousel.locator("[data-story-status]")).toHaveText("01 / 03");
  await carousel.locator("[data-story-next]").click();
  await expect(carousel.locator("[data-story-status]")).toHaveText("02 / 03");
});

test("the homepage features projects in the intended order", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const cards = page.locator(".sticky-cards .project-card");
  await expect(cards).toHaveCount(4);
  await expect(cards.locator("h3")).toHaveText([
    "VegasPaulyC",
    "All-In Brownie",
    "DuuDuu Mattress",
    "Token Studio",
  ]);
  await expect(cards.nth(0)).toHaveAttribute("href", "/projects/vegaspaulyc.html");
  await expect(cards.nth(0).locator(".project-card-shot img").first()).toHaveAttribute(
    "src",
    "/home/project-vegaspaulyc-gallery-01.webp",
  );
  const allInCard = cards.nth(1);
  await expect(allInCard).toHaveAttribute("href", "/projects/all-in-brownie.html");
  await expect(allInCard).toHaveAttribute("data-cursor-label", "View Case Study");
  await expect(allInCard).toContainText("rooted in poker circles");
  await expect(allInCard.locator(".project-card-pills li")).toHaveText([
    "Competition Site",
    "Global Market",
    "Multi-Brand",
  ]);
  await expect(allInCard).toContainText("Next.js");
  await expect(allInCard).toContainText("Shopify");
  const allInSourceGallery = allInCard.locator(
    ".project-card-marquee-group:not(.project-card-marquee-group--duplicate)",
  );
  await expect(allInSourceGallery.locator(".project-card-shot")).toHaveCount(3);
  expect(await allInSourceGallery.locator(".project-card-shot img").evaluateAll((images) =>
    images.map((image) => image.getAttribute("src")),
  )).toEqual([
    "/projects/all-in-brownie/frankie-c-brownie-promotion.webp",
    "/projects/all-in-brownie/all-in-brownie-product-stack.webp",
    "/projects/all-in-brownie/bmf-brownie-package-design.webp",
  ]);
  await expect(cards.nth(2)).toHaveAttribute("href", "/projects/duuduu-mattress.html");
  await expect(cards.nth(2)).toContainText("Shopify Development");
  await expect(cards.nth(2)).not.toContainText("Full-Stack Development");
  const tokenStudioCard = cards.nth(3);
  await expect(tokenStudioCard).toHaveAttribute("href", "https://tokenstoy.com/");
  await expect(tokenStudioCard).toHaveAttribute("target", "_blank");
  await expect(tokenStudioCard).toHaveAttribute("rel", /noopener/);
  await expect(tokenStudioCard).toHaveAttribute("data-cursor-label", "View Website");
  await expect(tokenStudioCard).toContainText("four locations across Western Canada");
  await expect(tokenStudioCard).toContainText("Instagram");
  await expect(tokenStudioCard).toContainText("Facebook");
  await expect(tokenStudioCard.locator(".project-card-pills li")).toHaveText([
    "Ecommerce",
    "Digital Marketing",
    "Retail UX",
  ]);
  await expect(tokenStudioCard.locator('img[src="/icons/instagram.svg"]')).toHaveCount(1);
  await expect(tokenStudioCard.locator('img[src="/icons/facebook.svg"]')).toHaveCount(1);
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
  const linkedIn = menu.getByRole("link", { name: "LinkedIn" });
  await expect(linkedIn).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/wesleytingdev/",
  );
  await expect(linkedIn).toHaveAttribute("target", "_blank");
  await expect(linkedIn).toHaveAttribute("rel", /noopener/);

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
