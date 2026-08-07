import { expect, test } from "@playwright/test";

const caseStudyPages = [
  "/projects/vegaspaulyc.html",
  "/projects/duuduu-mattress.html",
  "/projects/all-in-brownie.html",
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const sharedStyleTargets = {
  hero: [".case-hero-inner", ["gridTemplateColumns", "columnGap", "rowGap"]],
  year: [".case-year", ["fontSize", "fontWeight", "lineHeight"]],
  title: [".case-title", ["fontSize", "fontWeight", "lineHeight", "maxWidth"]],
  subtitle: [".case-subtitle", ["fontSize", "fontWeight", "lineHeight", "maxWidth"]],
  details: [".case-hero-details", ["gridColumn", "gridRow", "paddingTop", "borderTopWidth"]],
};

async function collectSharedStyles(page, path, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(path, { waitUntil: "domcontentloaded" });

  return page.evaluate((targets) => {
    return Object.fromEntries(
      Object.entries(targets).map(([name, [selector, properties]]) => {
        const element = document.querySelector(selector);
        const styles = getComputedStyle(element);
        return [
          name,
          Object.fromEntries(properties.map((property) => [property, styles[property]])),
        ];
      }),
    );
  }, sharedStyleTargets);
}

for (const viewport of viewports) {
  test(`case-study foundations stay visually standardized on ${viewport.name}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.context().route(
      /https:\/\/fonts\.(googleapis|gstatic)\.com\//,
      (route) => route.abort(),
    );

    const [baselineStyles, ...comparisonStyles] = await Promise.all(
      caseStudyPages.map(async (path) => {
        const isolatedPage = await page.context().newPage();
        const styles = await collectSharedStyles(
          isolatedPage,
          path,
          { width: viewport.width, height: viewport.height },
        );
        await isolatedPage.close();
        return styles;
      }),
    );

    comparisonStyles.forEach((styles) => {
      expect(styles).toEqual(baselineStyles);
    });
  });
}
