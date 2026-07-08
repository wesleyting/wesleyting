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

  lenis = new Lenis({
    duration: isMobile ? 1 : 1.2,
    lerp: isMobile ? 0.09 : 0.1,
    smoothWheel: true,
    syncTouch: true,
    syncTouchLerp: isMobile ? 0.08 : 0.075,
    touchMultiplier: isMobile ? 2.2 : 2,
  });

  // integrate with gsap and scrolltrigger
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window.lenis = lenis;
});

export { lenis };
