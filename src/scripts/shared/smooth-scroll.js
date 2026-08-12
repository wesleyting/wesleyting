import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const mobileViewport = window.matchMedia("(max-width: 1000px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let lenis = null;
let lenisRaf = null;
let resizeFrame = 0;

const hasNativeScrollOverride = () =>
  document.documentElement.hasAttribute("data-native-scroll") ||
  document.body.hasAttribute("data-native-scroll");

const isCaseStudy = () => document.body.dataset.scrollProfile === "case-study";

const shouldUseLenis = () => {
  if (hasNativeScrollOverride()) return false;
  if (document.body.classList.contains("home-page") && mobileViewport.matches) return false;
  if (isCaseStudy() && reducedMotion.matches) return false;
  return true;
};

const isScrollLocked = () =>
  document.body.classList.contains("menu-is-open") ||
  document.body.classList.contains("showreel-open");

const getOptions = () => {
  if (isCaseStudy()) {
    return {
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      syncTouch: false,
    };
  }

  return {
    duration: mobileViewport.matches ? 1 : 1.2,
    lerp: mobileViewport.matches ? 0.09 : 0.1,
    smoothWheel: true,
    syncTouch: true,
    syncTouchLerp: mobileViewport.matches ? 0.08 : 0.075,
    touchMultiplier: mobileViewport.matches ? 2.2 : 2,
  };
};

const destroyLenis = () => {
  if (!lenis) return;

  if (lenisRaf) {
    gsap.ticker.remove(lenisRaf);
    lenisRaf = null;
  }

  lenis.destroy();
  lenis = null;
  window.lenis = null;
};

const createLenis = () => {
  if (lenis || !shouldUseLenis()) return;

  lenis = new Lenis(getOptions());
  const instance = lenis;

  instance.on("scroll", ScrollTrigger.update);
  lenisRaf = (time) => instance.raf(time * 1000);
  gsap.ticker.add(lenisRaf);
  gsap.ticker.lagSmoothing(0);

  window.lenis = instance;

  if (isScrollLocked()) {
    instance.stop();
  }
};

const reconcileLenis = () => {
  if (shouldUseLenis()) {
    createLenis();
    lenis?.resize();
    if (!isScrollLocked()) lenis?.start();
    return;
  }

  destroyLenis();
};

const queueResize = () => {
  window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(() => {
    reconcileLenis();
  });
};

const handlePageShow = () => {
  reconcileLenis();
};

const initialize = () => {
  reconcileLenis();

  mobileViewport.addEventListener("change", reconcileLenis);
  reducedMotion.addEventListener("change", reconcileLenis);
  window.addEventListener("resize", queueResize);
  window.addEventListener("pageshow", handlePageShow);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.cancelAnimationFrame(resizeFrame);
    document.removeEventListener("DOMContentLoaded", initialize);
    mobileViewport.removeEventListener("change", reconcileLenis);
    reducedMotion.removeEventListener("change", reconcileLenis);
    window.removeEventListener("resize", queueResize);
    window.removeEventListener("pageshow", handlePageShow);
    destroyLenis();
  });
}

export { lenis };
