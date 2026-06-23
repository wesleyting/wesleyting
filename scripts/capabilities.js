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
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
    },
  );

  gsap.fromTo(
    cards,
    { autoAlpha: 0, y: 30 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: cards[0],
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
    },
  );
});
