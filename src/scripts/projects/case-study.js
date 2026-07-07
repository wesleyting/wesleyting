import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const revealItems = gsap.utils.toArray("[data-reveal]");
  const revealGroups = gsap.utils.toArray("[data-reveal-group]");

  revealItems.forEach((item) => {
    gsap.from(item, {
      autoAlpha: 0,
      y: 26,
      duration: 0.75,
      ease: "power2.out",
      scrollTrigger: {
        trigger: item,
        start: "top 86%",
        once: true,
      },
    });
  });

  revealGroups.forEach((group) => {
    const children = gsap.utils.toArray(group.children);
    if (!children.length) return;

    gsap.from(children, {
      autoAlpha: 0,
      y: 24,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: group,
        start: "top 86%",
        once: true,
      },
    });
  });
});
