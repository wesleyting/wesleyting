import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const services = document.querySelector(".services");
  const headerGroup = document.querySelector(".services-headers");
  const headers = gsap.utils.toArray(".services-header");
  const copy = document.querySelector(".services-copy");
  const copyText = document.querySelector(".services-copy .animate-text");
  const mobileLayout = window.matchMedia("(max-width: 1000px)");

  if (!services || !headerGroup || headers.length !== 3 || !copy || !copyText) return;

  copyText.setAttribute("data-text", copyText.textContent.trim());

  gsap.set(headers[0], { xPercent: 100, yPercent: -155 });
  gsap.set(headers[1], { xPercent: -100, yPercent: -50 });
  gsap.set(headers[2], { xPercent: 100, yPercent: 55 });
  gsap.set(headers, {
    scale: 1,
    transformOrigin: "50% 50%",
    force3D: true,
  });
  gsap.set(copy, { autoAlpha: 0, y: "6vh" });
  gsap.set(copyText, { "--clip-value": "100%" });

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: services,
      start: "top top",
      end: () => `+=${window.innerHeight * (mobileLayout.matches ? 2.15 : 4.25)}`,
      pin: true,
      pinSpacing: true,
      // Keep the sequence tied directly to the user's scroll position.
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 10,
    },
  });

  timeline
    .to(headers, { xPercent: 0, duration: 1 })
    .to(headers, { yPercent: -50, duration: 1 })
    .to(headers, {
      scale: () => (mobileLayout.matches ? 0.3 : 0.1),
      y: () => -window.innerHeight * 0.28,
      duration: 1,
    })
    .to(copy, { autoAlpha: 1, y: 0, duration: 0.85, ease: "power2.out" }, 2.55)
    .to(copyText, { "--clip-value": "0%", duration: 1.35, ease: "power2.inOut" }, 2.75)
    .to({}, { duration: 0.55 })
    .to([headerGroup, copy], {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power1.out",
    });

  window.addEventListener("preloader:complete", () => {
    requestAnimationFrame(() => ScrollTrigger.refresh(true));
  });
});
