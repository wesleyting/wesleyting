import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenis = null;

// initialization
document.addEventListener("DOMContentLoaded", () => {
  if (
    document.documentElement.hasAttribute("data-native-scroll") ||
    document.body.hasAttribute("data-native-scroll")
  ) {
    return;
  }

  const isMobile = window.innerWidth <= 1000;
  const usesNativeHomeScroll = isMobile && document.body.classList.contains("home-page");

  if (usesNativeHomeScroll) {
    return;
  }

  const scrollProfile = document.body.dataset.scrollProfile;
  const isCaseStudy = scrollProfile === "case-study";
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (isCaseStudy && prefersReducedMotion) {
    return;
  }

  const options = isCaseStudy
    ? {
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.82,
        syncTouch: false,
      }
    : {
        duration: isMobile ? 1 : 1.2,
        lerp: isMobile ? 0.09 : 0.1,
        smoothWheel: true,
        syncTouch: true,
        syncTouchLerp: isMobile ? 0.08 : 0.075,
        touchMultiplier: isMobile ? 2.2 : 2,
      };

  lenis = new Lenis(options);

  // integrate with gsap and scrolltrigger
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window.lenis = lenis;
});

export { lenis };
