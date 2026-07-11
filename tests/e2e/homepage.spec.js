import { expect, test } from "@playwright/test";

const mobileViewport = { width: 390, height: 844 };
const desktopViewport = { width: 1440, height: 900 };

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

async function installEntranceMonitor(page) {
  await page.addInitScript(() => {
    window.__portfolioTest = {
      events: [],
      heroPlayCalls: [],
    };

    window.addEventListener("preloader:complete", () => {
      window.__portfolioTest.events.push({
        name: "preloader:complete",
        time: performance.now(),
      });
    });

    window.addEventListener("homepage:revealed", () => {
      window.__portfolioTest.events.push({
        name: "homepage:revealed",
        time: performance.now(),
      });
    });

    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      if (this.classList?.contains("hero-video")) {
        window.__portfolioTest.heroPlayCalls.push({
          time: performance.now(),
          introPresent: Boolean(document.querySelector(".home-intro")),
        });
      }

      return originalPlay.apply(this, args);
    };
  });
}

async function waitForHomepageReveal(page) {
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          window.__portfolioTest?.events.some(
            (event) => event.name === "homepage:revealed",
          ),
        ),
      { timeout: 10_000 },
    )
    .toBe(true);
}

async function expectHeroVideoToAdvance(page, minimumAdvance = 0.12) {
  const heroVideo = page.locator(".hero-video");
  const startingTime = await heroVideo.evaluate((video) => video.currentTime);

  await expect
    .poll(
      () => heroVideo.evaluate((video) => video.currentTime),
      { timeout: 4_000 },
    )
    .toBeGreaterThan(startingTime + minimumAdvance);
}

test("the loader finishes before the hero video and reveal begin", async ({
  page,
}) => {
  const browserErrors = collectBrowserErrors(page);
  await installEntranceMonitor(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });

  const intro = page.locator(".home-intro");
  const heroVideo = page.locator(".hero-video");

  await expect(intro).toBeVisible();
  await expect(heroVideo).toBeAttached();

  const initialPlayback = await heroVideo.evaluate((video) => ({
    paused: video.paused,
    currentTime: video.currentTime,
  }));

  expect(initialPlayback.paused).toBe(true);
  expect(initialPlayback.currentTime).toBeLessThan(0.1);

  await expect(intro).toHaveClass(/is-complete/, { timeout: 6_000 });
  expect(
    await page.evaluate(
      () => window.__portfolioTest?.heroPlayCalls.length ?? 0,
    ),
  ).toBe(0);

  await waitForHomepageReveal(page);
  await expect(intro).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveClass(/intro-active/);

  const entranceState = await page.evaluate(() => window.__portfolioTest);
  const preloaderComplete = entranceState.events.find(
    (event) => event.name === "preloader:complete",
  );
  const homepageRevealed = entranceState.events.find(
    (event) => event.name === "homepage:revealed",
  );
  const firstHeroPlay = entranceState.heroPlayCalls[0];

  expect(preloaderComplete).toBeTruthy();
  expect(firstHeroPlay).toBeTruthy();
  expect(homepageRevealed).toBeTruthy();
  expect(firstHeroPlay.introPresent).toBe(false);
  expect(firstHeroPlay.time).toBeGreaterThanOrEqual(preloaderComplete.time);
  expect(homepageRevealed.time).toBeGreaterThanOrEqual(firstHeroPlay.time);

  await expect(page.locator(".nav .logo")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero-word")).toHaveCSS("opacity", "1");
  await expect(page.locator(".video-preview")).toHaveCSS("opacity", "1");
  await expectHeroVideoToAdvance(page);

  expect(browserErrors).toEqual([]);
});

test("the hero video survives mobile to desktop to mobile resizing", async ({
  page,
}) => {
  const browserErrors = collectBrowserErrors(page);
  await page.setViewportSize(mobileViewport);
  await installEntranceMonitor(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForHomepageReveal(page);

  const videoContainer = page.locator(".video-container");
  const videoPreview = page.locator(".video-preview");
  const scrollHint = page.locator(".hero-copy > p:last-child");

  await expect(scrollHint).toBeHidden();
  await expectHeroVideoToAdvance(page);

  await page.setViewportSize(desktopViewport);
  await expect(scrollHint).toBeVisible();
  await expect
    .poll(
      () => videoContainer.evaluate((element) => element.style.transform),
      { timeout: 3_000 },
    )
    .not.toBe("");
  await expectHeroVideoToAdvance(page);

  await page.setViewportSize(mobileViewport);
  await expect(scrollHint).toBeHidden();
  await expect
    .poll(
      () =>
        videoContainer.evaluate((element) => ({
          transform: getComputedStyle(element).transform,
          inlineTransform: element.style.transform,
          inlineGap: element.style.gap,
          titleFontSizes: Array.from(
            element.querySelectorAll(".video-title p"),
            (title) => title.style.fontSize,
          ),
        })),
      { timeout: 3_000 },
    )
    .toEqual({
      transform: "none",
      inlineTransform: "",
      inlineGap: "",
      titleFontSizes: ["", ""],
    });

  const mobileVideoBox = await videoPreview.boundingBox();
  expect(mobileVideoBox).not.toBeNull();
  expect(mobileVideoBox.height).toBeGreaterThan(100);
  expect(mobileVideoBox.width / mobileVideoBox.height).toBeGreaterThan(1.7);
  expect(mobileVideoBox.width / mobileVideoBox.height).toBeLessThan(1.85);

  await expectHeroVideoToAdvance(page);
  expect(browserErrors).toEqual([]);
});

test("mobile keeps the location but hides the scroll prompt", async ({ page }) => {
  await page.setViewportSize(mobileViewport);
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Based in Vancouver, BC.")).toBeVisible();
  await expect(page.getByText("Scroll to explore")).toBeHidden();
});
