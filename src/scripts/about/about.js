import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function revealPage() {
  const titleLines = gsap.utils.toArray(".about-title-line > span");
  const heroDetails = gsap.utils.toArray("[data-hero-reveal]");

  if (reduceMotion) {
    gsap.set([...titleLines, ...heroDetails], { clearProps: "all" });
    return;
  }

  gsap.set(titleLines, { yPercent: 112, rotate: 1.5 });
  gsap.set(heroDetails, { autoAlpha: 0, y: 16 });

  const delay = window.__arrivedViaTransition ? 0.28 : 0.12;
  const timeline = gsap.timeline({ delay });

  timeline
    .to(titleLines, {
      yPercent: 0,
      rotate: 0,
      duration: 1.05,
      ease: "power4.out",
      stagger: 0.085,
    })
    .to(
      heroDetails,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
      },
      "-=0.58",
    );
}

function createScrollReveals() {
  if (reduceMotion) return;

  gsap.utils.toArray("[data-reveal]").forEach((item) => {
    gsap.from(item, {
      autoAlpha: 0,
      y: 28,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 86%",
        once: true,
      },
    });
  });

  gsap.utils.toArray("[data-reveal-group]").forEach((group) => {
    const children = gsap.utils.toArray(group.children);
    if (!children.length) return;

    gsap.from(children, {
      autoAlpha: 0,
      y: 26,
      duration: 0.76,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: {
        trigger: group,
        start: "top 84%",
        once: true,
      },
    });
  });
}

function createProofInteraction() {
  const proof = document.querySelector(".about-proof");
  const mark = document.querySelector("[data-parallax-mark]");
  const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!proof || !mark || reduceMotion || !precisePointer) return;

  const moveX = gsap.quickTo(mark, "x", { duration: 0.7, ease: "power3.out" });
  const moveY = gsap.quickTo(mark, "y", { duration: 0.7, ease: "power3.out" });
  const rotate = gsap.quickTo(mark, "rotation", { duration: 0.9, ease: "power3.out" });

  proof.addEventListener("pointermove", (event) => {
    const bounds = proof.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    moveX(x * 24);
    moveY(y * 18);
    rotate(x * 2.5);
  });

  proof.addEventListener("pointerleave", () => {
    moveX(0);
    moveY(0);
    rotate(0);
  });
}

function setupAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target || !window.lenis) return;

      event.preventDefault();
      window.lenis.scrollTo(target, {
        offset: 0,
        duration: reduceMotion ? 0 : 1.1,
      });
      history.replaceState(null, "", link.getAttribute("href"));
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.fonts.ready.then(() => {
    revealPage();
    createScrollReveals();
    createProofInteraction();
    setupAnchorScroll();
    requestAnimationFrame(() => ScrollTrigger.refresh(true));
  });
});
