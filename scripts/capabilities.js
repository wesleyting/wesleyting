import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const intro = document.querySelector(".capabilities-intro");
  const cards = gsap.utils.toArray(".capability-card");

  if (!intro || !cards.length) return;

  gsap.fromTo(
    intro,
    { autoAlpha: 0, y: 32 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: intro,
        start: "top 82%",
        toggleActions: "restart reverse restart reverse",
      },
    },
  );

  cards.forEach((card) => {
    gsap.fromTo(
      card,
      { autoAlpha: 0, y: 48 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 86%",
          toggleActions: "restart reverse restart reverse",
        },
      },
    );
  });
});
