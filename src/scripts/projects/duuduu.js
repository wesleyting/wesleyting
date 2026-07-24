import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const growthLoop = document.querySelector("[data-duuduu-loop]");
  const loopItems = growthLoop ? [...growthLoop.children] : [];

  if (!growthLoop || !loopItems.length) return;

  if (reduceMotion) {
    growthLoop.style.setProperty("--loop-progress", "1");
    loopItems.forEach((item) => {
      item.style.setProperty("--segment-progress", "1");
      item.classList.add("is-active");
    });
    return;
  }

  gsap.set(loopItems, { autoAlpha: 0.52 });

  const duration = 1.5;
  const activationPoints = [0.12, 0.4, 0.68, 0.9];
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: growthLoop,
      start: "top 80%",
      once: true,
    },
  });

  timeline.to(
    growthLoop,
    {
      "--loop-progress": 1,
      duration,
      ease: "power1.inOut",
    },
    0,
  );

  loopItems.slice(0, -1).forEach((item, index) => {
    timeline.to(
      item,
      {
        "--segment-progress": 1,
        duration: 0.44,
        ease: "power1.inOut",
      },
      index * 0.44,
    );
  });

  loopItems.forEach((item, index) => {
    timeline.to(
      item,
      {
        autoAlpha: 1,
        duration: 0.28,
        ease: "power2.out",
        onStart: () => item.classList.add("is-active"),
      },
      duration * activationPoints[index],
    );
  });
});
