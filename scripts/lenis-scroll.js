import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenis = null;

// initialization
document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.innerWidth <= 1000;

  lenis = new Lenis({
    duration: isMobile ? 0.8 : 1.2,
    lerp: isMobile ? 0.075 : 0.1,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: isMobile ? 1.5 : 2,
  });

  // integrate with gsap and scrolltrigger
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window.lenis = lenis;

  const scrollbar = document.createElement("div");
  const thumb = document.createElement("div");

  scrollbar.className = "site-scrollbar is-hidden";
  thumb.className = "site-scrollbar-thumb";
  scrollbar.appendChild(thumb);
  document.body.appendChild(scrollbar);

  const updateScrollbar = () => {
    const viewportHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollRange = Math.max(0, scrollHeight - viewportHeight);

    if (scrollRange <= 1) {
      scrollbar.classList.add("is-hidden");
      return;
    }

    scrollbar.classList.remove("is-hidden");

    const trackHeight = scrollbar.clientHeight;
    const thumbHeight = Math.max(32, trackHeight * (viewportHeight / scrollHeight));
    const maxThumbTravel = trackHeight - thumbHeight;
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${maxThumbTravel * progress}px)`;
  };

  let dragStartY = 0;
  let dragStartScroll = 0;

  thumb.addEventListener("pointerdown", (event) => {
    dragStartY = event.clientY;
    dragStartScroll = window.scrollY;
    thumb.setPointerCapture(event.pointerId);
  });

  thumb.addEventListener("pointermove", (event) => {
    if (!thumb.hasPointerCapture(event.pointerId)) return;

    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const thumbTravel = scrollbar.clientHeight - thumb.offsetHeight;
    if (scrollRange <= 0 || thumbTravel <= 0) return;

    const nextScroll =
      dragStartScroll + ((event.clientY - dragStartY) / thumbTravel) * scrollRange;

    lenis.scrollTo(nextScroll, { immediate: true });
  });

  thumb.addEventListener("pointerup", (event) => {
    thumb.releasePointerCapture(event.pointerId);
  });

  lenis.on("scroll", updateScrollbar);
  window.addEventListener("resize", updateScrollbar);
  new ResizeObserver(updateScrollbar).observe(document.body);
  requestAnimationFrame(updateScrollbar);
});

export { lenis };
